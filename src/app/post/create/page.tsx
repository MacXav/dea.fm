'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, CurrentUser } from '@/lib/getCurrentUser'
import DecorativeFloralBackground from '@/components/DecorativeFloralBackground'

interface Track {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
    release_date?: string
  }
}

export default function CreatePost() {
  const [search, setSearch] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

  const [year, setYear] = useState('')
  const [genre, setGenre] = useState('')
  const [mood, setMood] = useState('')
  const [caption, setCaption] = useState('')

  const [postImage, setPostImage] = useState<File | null>(null)
  const [postImagePreview, setPostImagePreview] = useState('')

  const [userId, setUserId] = useState('')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  const [checkingPermission, setCheckingPermission] = useState(true)
  const [searching, setSearching] = useState(false)
  const [posting, setPosting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      setCheckingPermission(true)
      setErrorMessage('')

      try {
        const current = await getCurrentUser()
        setCurrentUser(current)

        if (!current?.can_edit) {
          setCheckingPermission(false)
          return
        }

        const foundUserId = document.cookie
          .split('; ')
          .find((row) => row.startsWith('user_id='))
          ?.split('=')[1]

        if (!foundUserId) {
          setErrorMessage(
            'You are not logged in. Use Admin login to connect Spotify again.'
          )
          setCheckingPermission(false)
          return
        }

        setUserId(foundUserId)
        setCheckingPermission(false)
      } catch (error) {
        console.error('User loading error:', error)
        setErrorMessage('Something went wrong while checking your account.')
        setCheckingPermission(false)
      }
    }

    loadUser()
  }, [])

  const handleSearch = async () => {
    setErrorMessage('')

    if (!currentUser?.can_edit) {
      setErrorMessage('Only Dea and Xavier can search songs for new posts.')
      return
    }

    if (!search.trim()) {
      setErrorMessage('Please enter a song name.')
      return
    }

    try {
      setSearching(true)
      setTracks([])
      setSelectedTrack(null)

      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(search.trim())}`
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.error || 'Spotify search failed. Try logging in again.'
        )
        return
      }

      const foundTracks = data.tracks || []

      if (foundTracks.length === 0) {
        setErrorMessage('No songs found. Try a different search.')
      }

      setTracks(foundTracks)
    } catch (error) {
      console.error('Spotify search error:', error)
      setErrorMessage('Search failed. Check the browser console for details.')
    } finally {
      setSearching(false)
    }
  }

  const handleSelectTrack = (track: Track) => {
    setSelectedTrack(track)

    const spotifyYear = track.album.release_date
      ? track.album.release_date.slice(0, 4)
      : ''

    if (spotifyYear) {
      setYear(spotifyYear)
    }
  }

  const handleImageChange = (file: File | null) => {
    setErrorMessage('')

    if (!file) {
      setPostImage(null)
      setPostImagePreview('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file.')
      return
    }

    const maxSizeInMB = 5
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024

    if (file.size > maxSizeInBytes) {
      setErrorMessage(`Image must be smaller than ${maxSizeInMB}MB.`)
      return
    }

    setPostImage(file)
    setPostImagePreview(URL.createObjectURL(file))
  }

  const uploadPostImage = async () => {
    if (!postImage || !userId) return ''

    const fileExt = postImage.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, postImage, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      throw new Error('Could not upload image.')
    }

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!currentUser?.can_edit) {
      setErrorMessage('Only Dea and Xavier can create posts.')
      return
    }

    if (!selectedTrack) {
      if (search.trim()) {
        await handleSearch()
        return
      }

      setErrorMessage('Please search for and select a song first.')
      return
    }

    if (!userId) {
      setErrorMessage('No user ID found. Try logging in again.')
      return
    }

    const parsedYear = year ? Number(year) : null

    if (
      parsedYear !== null &&
      (Number.isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100)
    ) {
      setErrorMessage('Please enter a valid year.')
      return
    }

    try {
      setPosting(true)

      let imageUrl = ''

      if (postImage) {
        imageUrl = await uploadPostImage()
      }

      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          song_id: selectedTrack.id,
          title: selectedTrack.name,
          artist: selectedTrack.artists[0]?.name || 'Unknown Artist',
          album: selectedTrack.album.name,
          album_art: selectedTrack.album.images[0]?.url || '',
          genre,
          year: parsedYear,
          caption,
          mood_tags: mood
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean),
          image_url: imageUrl || null,
          is_public: true,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('[browser] Post create API error:', result)
        setErrorMessage(result.error || 'Could not create post.')
        setPosting(false)
        return
      }

      router.push('/feed')
    } catch (error) {
      console.error('Submit error:', error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while creating the post.'
      )
      setPosting(false)
    }
  }

  if (checkingPermission) {
    return (
      <div
        className="relative min-h-screen overflow-x-hidden pt-[118px] sm:pt-[78px]"
        style={{
          background: 'var(--site-bg)',
          color: 'var(--site-text)',
        }}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <DecorativeFloralBackground />
        </div>

        <main className="relative z-10 mx-auto max-w-xl px-4 py-16 text-center">
          <div
            className="border border-white/10 p-6 backdrop-blur-md"
            style={{
              background:
                'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.35))',
              borderRadius: 'var(--site-radius)',
            }}
          >
            <p className="opacity-75">Checking permissions...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!currentUser?.can_edit) {
    return (
      <div
        className="relative min-h-screen overflow-x-hidden pt-[118px] sm:pt-[78px]"
        style={{
          background: 'var(--site-bg)',
          color: 'var(--site-text)',
        }}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <DecorativeFloralBackground />
        </div>

        <main className="relative z-10 mx-auto max-w-xl px-4 py-16 text-center">
          <div
            className="border border-white/10 p-6 backdrop-blur-md"
            style={{
              background:
                'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.35))',
              borderRadius: 'var(--site-radius)',
            }}
          >
            <p
              className="text-sm uppercase tracking-[0.25em] mb-3"
              style={{ color: 'var(--site-accent)' }}
            >
              Admin only
            </p>

            <h1 className="text-3xl font-bold mb-3">
              Only Dea and Xavier can create posts.
            </h1>

            <p className="opacity-70 mb-5">
              Everyone can view the music archive, but creating posts is locked
              to approved Spotify accounts.
            </p>

            <button
              type="button"
              onClick={() => router.push('/feed')}
              className="border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              style={{
                borderRadius: 'var(--site-radius)',
              }}
            >
              Back to feed
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pt-[118px] sm:pt-[78px]"
      style={{
        background: 'var(--site-bg)',
        color: 'var(--site-text)',
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DecorativeFloralBackground />
      </div>

      <main className="relative z-10 min-h-screen">
        <div className="absolute inset-0 bg-black/16 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
          <h1
            className="mb-8 text-3xl font-bold text-white"
            style={{
              textShadow:
                '0 4px 18px rgba(0,0,0,0.95), 0 0 2px rgba(255,255,255,0.55)',
            }}
          >
            Create Music Post
          </h1>

          {errorMessage && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-400/20 text-red-200 p-3 text-sm">
              {errorMessage}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 border border-white/10 p-5 backdrop-blur-md"
            style={{
              background:
                'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.35))',
              borderRadius: 'var(--site-radius)',
            }}
          >
            <div>
              <label className="block mb-2 opacity-80">Search Song</label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  autoComplete="off"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSearch()
                    }
                  }}
                  className="min-w-0 flex-1 p-3 bg-white/10 placeholder-white/40 outline-none border border-white/10 focus:ring-2 text-base"
                  style={{
                    borderRadius: 'var(--site-radius)',
                  }}
                  placeholder="Enter song name"
                />

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching}
                  className="w-full border border-white/10 bg-white/10 px-4 py-3 text-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  style={{
                    borderRadius: 'var(--site-radius)',
                  }}
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              <p className="mt-2 text-xs opacity-55">
                On mobile, tap Search or press the keyboard search/enter button.
              </p>

              <div className="mt-4 space-y-2 max-h-72 overflow-y-auto overscroll-contain">
                {tracks.map((track) => {
                  const isSelected = selectedTrack?.id === track.id

                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleSelectTrack(track)}
                      className="w-full p-3 cursor-pointer flex items-center gap-3 transition border text-left"
                      style={{
                        background: isSelected
                          ? 'color-mix(in srgb, var(--site-accent) 22%, transparent)'
                          : 'rgba(255, 255, 255, 0.05)',
                        borderColor: isSelected
                          ? 'var(--site-accent)'
                          : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 'var(--site-radius)',
                      }}
                    >
                      {track.album.images[0]?.url && (
                        <img
                          src={track.album.images[0].url}
                          alt={track.album.name}
                          className="w-12 h-12 shrink-0 object-cover"
                          style={{
                            borderRadius: 'calc(var(--site-radius) * 0.7)',
                          }}
                        />
                      )}

                      <div className="min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-sm opacity-75 truncate">
                          {track.artists
                            .map((artist) => artist.name)
                            .join(', ')}
                        </p>
                        <p className="text-xs opacity-55 truncate">
                          {track.album.name}
                          {track.album.release_date
                            ? ` • ${track.album.release_date.slice(0, 4)}`
                            : ''}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedTrack && (
                <div
                  className="mt-4 border p-3"
                  style={{
                    borderColor: 'var(--site-accent)',
                    background:
                      'color-mix(in srgb, var(--site-accent) 12%, transparent)',
                    borderRadius: 'var(--site-radius)',
                  }}
                >
                  Selected: <strong>{selectedTrack.name}</strong> by{' '}
                  {selectedTrack.artists
                    .map((artist) => artist.name)
                    .join(', ')}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 opacity-80">Year</label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="p-3 bg-white/10 w-full outline-none border border-white/10 focus:ring-2 text-base"
                style={{
                  borderRadius: 'var(--site-radius)',
                }}
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block mb-2 opacity-80">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="p-3 bg-white/10 w-full outline-none border border-white/10 focus:ring-2 text-base"
                style={{
                  borderRadius: 'var(--site-radius)',
                }}
                placeholder="Pop, Rap, Indie, R&B..."
              />
            </div>

            <div>
              <label className="block mb-2 opacity-80">
                Mood Tags <span className="opacity-50">(comma separated)</span>
              </label>
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="p-3 bg-white/10 w-full outline-none border border-white/10 focus:ring-2 text-base"
                style={{
                  borderRadius: 'var(--site-radius)',
                }}
                placeholder="happy, sad, chill, late night"
              />
            </div>

            <div>
              <label className="block mb-2 opacity-80">
                Caption / Description
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="p-3 bg-white/10 w-full h-28 outline-none border border-white/10 focus:ring-2 text-base"
                style={{
                  borderRadius: 'var(--site-radius)',
                }}
                placeholder="Write something about this song..."
              />
            </div>

            <div>
              <label className="block mb-2 opacity-80">
                Upload Photo <span className="opacity-50">(optional)</span>
              </label>

              <div
                className="border border-white/10 bg-white/5 p-4"
                style={{
                  borderRadius: 'var(--site-radius)',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e.target.files ? e.target.files[0] : null)
                  }
                  className="block w-full text-sm opacity-80 file:mr-4 file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/15"
                />

                {postImagePreview && (
                  <div className="mt-4">
                    <p className="text-sm opacity-70 mb-2">Preview</p>

                    <img
                      src={postImagePreview}
                      alt="Uploaded preview"
                      className="w-full max-h-80 object-cover border border-white/10"
                      style={{
                        borderRadius: 'var(--site-radius)',
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => handleImageChange(null)}
                      className="mt-3 border border-white/10 bg-white/5 px-3 py-2 text-sm opacity-80 transition hover:bg-white/10 hover:opacity-100"
                      style={{
                        borderRadius: 'var(--site-radius)',
                      }}
                    >
                      Remove photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={posting}
              className="border border-white/10 px-6 py-3 w-full transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--site-accent)',
                color: '#ffffff',
                borderRadius: 'var(--site-radius)',
              }}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}