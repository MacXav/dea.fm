'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, CurrentUser } from '@/lib/getCurrentUser'
import DecorativeFloralBackground from '@/components/DecorativeFloralBackground'

const DEA_SPOTIFY_ID = 'dea.gouel5'
const DEA_SPOTIFY_URL = `https://open.spotify.com/user/${DEA_SPOTIFY_ID}`

interface DeaProfile {
  id: string
  spotify_id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  can_edit: boolean | null
  song_of_day_post_id: string | null
}

interface Post {
  id: string
  song_id: string
  title: string
  artist: string
  album: string
  album_art: string
  genre: string
  year: number | null
  caption: string
  mood_tags: string[]
  created_at: string

  image_url?: string | null
  uploaded_image_url?: string | null
  post_image_url?: string | null
}

export default function ProfilePage() {
  const [deaProfile, setDeaProfile] = useState<DeaProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [settingSongOfDayId, setSettingSongOfDayId] = useState<string | null>(
    null
  )
  const [editingProfile, setEditingProfile] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [editDisplayName, setEditDisplayName] = useState('')
  const [editAvatarUrl, setEditAvatarUrl] = useState('')
  const [editSongOfDayPostId, setEditSongOfDayPostId] = useState('')

  const canEdit = Boolean(
    currentUser?.can_edit ||
      currentUser?.spotify_id === DEA_SPOTIFY_ID ||
      currentUser?.email === 'dea.gouel5@gmail.com'
  )

  useEffect(() => {
    const fetchProfilePage = async () => {
      setLoading(true)
      setErrorMessage('')
      setSuccessMessage('')

      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select(
            'id, spotify_id, display_name, email, avatar_url, can_edit, song_of_day_post_id'
          )
          .eq('spotify_id', DEA_SPOTIFY_ID)
          .maybeSingle()

        if (profileError) {
          console.error('Error loading Dea profile:', profileError)
          setErrorMessage('Could not load Dea’s profile.')
        }

        setDeaProfile(profileData)
        setEditDisplayName(profileData?.display_name || 'Dea')
        setEditAvatarUrl(profileData?.avatar_url || '')
        setEditSongOfDayPostId(profileData?.song_of_day_post_id || '')

        let postsQuery = supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })

        if (profileData?.id) {
          postsQuery = postsQuery.eq('user_id', profileData.id)
        }

        const { data: postsData, error: postsError } = await postsQuery

        if (postsError) {
          console.error('Error loading profile posts:', postsError)
          setErrorMessage('Could not load profile songs.')
          setLoading(false)
          return
        }

        setPosts(postsData || [])
        setLoading(false)
      } catch (error) {
        console.error('Profile page crash:', error)
        setErrorMessage('Something went wrong while loading the profile.')
        setLoading(false)
      }
    }

    fetchProfilePage()
  }, [])

  const songOfTheDay =
    posts.find((post) => post.id === deaProfile?.song_of_day_post_id) ||
    posts[0] ||
    null

  const topGenres = useMemo(() => {
    const genreMap = new Map<string, number>()

    posts.forEach((post) => {
      const genre = post.genre?.trim()
      if (!genre) return

      genreMap.set(genre, (genreMap.get(genre) || 0) + 1)
    })

    return Array.from(genreMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [posts])

  const recentSongs = posts.slice(0, 6)

  const totalGenres = useMemo(() => {
    const uniqueGenres = new Set<string>()

    posts.forEach((post) => {
      const genre = post.genre?.trim()
      if (genre) uniqueGenres.add(genre)
    })

    return uniqueGenres.size
  }, [posts])

  const getDisplayName = () => {
    return deaProfile?.display_name || 'Dea'
  }

  const getAvatarLetter = () => {
    return getDisplayName().charAt(0).toUpperCase()
  }

  const startEditingProfile = () => {
    if (!canEdit) return

    setEditDisplayName(deaProfile?.display_name || 'Dea')
    setEditAvatarUrl(deaProfile?.avatar_url || '')
    setEditSongOfDayPostId(deaProfile?.song_of_day_post_id || '')
    setErrorMessage('')
    setSuccessMessage('')
    setEditingProfile(true)
  }

  const cancelEditingProfile = () => {
    setEditDisplayName(deaProfile?.display_name || 'Dea')
    setEditAvatarUrl(deaProfile?.avatar_url || '')
    setEditSongOfDayPostId(deaProfile?.song_of_day_post_id || '')
    setErrorMessage('')
    setSuccessMessage('')
    setEditingProfile(false)
  }

  const saveProfile = async () => {
    if (!canEdit) return

    const cleanDisplayName = editDisplayName.trim()
    const cleanAvatarUrl = editAvatarUrl.trim()

    if (!cleanDisplayName) {
      setErrorMessage('Display name cannot be empty.')
      return
    }

    setSavingProfile(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          spotify_id: DEA_SPOTIFY_ID,
          display_name: cleanDisplayName,
          avatar_url: cleanAvatarUrl || null,
          song_of_day_post_id: editSongOfDayPostId || null,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('[browser] Update profile API error:', result)
        setErrorMessage(result.error || 'Could not update profile.')
        setSavingProfile(false)
        return
      }

      setDeaProfile(result.profile)
      setEditDisplayName(result.profile.display_name || 'Dea')
      setEditAvatarUrl(result.profile.avatar_url || '')
      setEditSongOfDayPostId(result.profile.song_of_day_post_id || '')
      setEditingProfile(false)
      setSuccessMessage('Profile updated.')
      setSavingProfile(false)
    } catch (error) {
      console.error('[browser] Save profile error:', error)
      setErrorMessage('Something went wrong while updating the profile.')
      setSavingProfile(false)
    }
  }

  const setSongOfTheDay = async (postId: string) => {
    if (!canEdit) return

    setSettingSongOfDayId(postId)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          spotify_id: DEA_SPOTIFY_ID,
          song_of_day_post_id: postId,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('[browser] Set song of the day API error:', result)
        setErrorMessage(result.error || 'Could not update Song of the Day.')
        setSettingSongOfDayId(null)
        return
      }

      setDeaProfile(result.profile)
      setEditSongOfDayPostId(result.profile.song_of_day_post_id || '')
      setSuccessMessage('Song of the Day updated.')
      setSettingSongOfDayId(null)
    } catch (error) {
      console.error('[browser] Set song of the day error:', error)
      setErrorMessage('Something went wrong while updating Song of the Day.')
      setSettingSongOfDayId(null)
    }
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
        <div className="absolute inset-0 bg-black/18 pointer-events-none" />

        <div className="relative z-10 px-4 py-8">
          <div className="mx-auto max-w-6xl">
            <section
              className="overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md"
              style={{
                background:
                  'color-mix(in srgb, var(--site-card) 72%, rgba(0,0,0,0.42))',
                borderRadius: 'var(--site-radius)',
              }}
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  {deaProfile?.avatar_url ? (
                    <img
                      src={deaProfile.avatar_url}
                      alt={`${getDisplayName()} profile picture`}
                      className="h-32 w-32 rounded-full border border-white/15 object-cover shadow-xl"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/15 bg-white/10 text-5xl font-black text-white shadow-xl">
                      {getAvatarLetter()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h1
                          className="break-words text-5xl font-black tracking-tight text-white sm:text-6xl"
                          style={{
                            textShadow:
                              '0 4px 18px rgba(0,0,0,0.95), 0 0 2px rgba(255,255,255,0.6)',
                          }}
                        >
                          {getDisplayName()}
                        </h1>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <a
                          href={DEA_SPOTIFY_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                          style={{
                            borderRadius: 'var(--site-radius)',
                          }}
                        >
                          View Dea&apos;s Spotify
                        </a>

                        {canEdit && !editingProfile && (
                          <button
                            type="button"
                            onClick={startEditingProfile}
                            className="w-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
                            style={{
                              borderRadius: 'var(--site-radius)',
                            }}
                          >
                            Edit Profile
                          </button>
                        )}
                      </div>
                    </div>

                    <p
                      className="mt-3 max-w-2xl text-lg leading-relaxed text-white/80"
                      style={{
                        textShadow: '0 3px 12px rgba(0,0,0,0.95)',
                      }}
                    >
                      A little music world for Dea’s favorite songs, genres,
                      moods, memories, and daily discoveries.
                    </p>
                  </div>
                </div>

                {editingProfile && (
                  <div
                    className="mt-8 border border-white/10 bg-black/25 p-4 backdrop-blur-md"
                    style={{
                      borderRadius: 'var(--site-radius)',
                    }}
                  >
                    <h2 className="mb-4 text-xl font-bold text-white">
                      Edit Profile
                    </h2>

                    <div className="grid gap-4">
                      <div>
                        <label className="mb-2 block text-sm text-white/75">
                          Display Name
                        </label>

                        <input
                          value={editDisplayName}
                          onChange={(e) => setEditDisplayName(e.target.value)}
                          className="w-full border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-white/40 focus:ring-2"
                          style={{
                            borderRadius: 'var(--site-radius)',
                          }}
                          placeholder="Dea"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-white/75">
                          Profile Picture URL
                        </label>

                        <input
                          value={editAvatarUrl}
                          onChange={(e) => setEditAvatarUrl(e.target.value)}
                          className="w-full border border-white/10 bg-white/10 p-3 text-white outline-none placeholder:text-white/40 focus:ring-2"
                          style={{
                            borderRadius: 'var(--site-radius)',
                          }}
                          placeholder="https://example.com/photo.jpg"
                        />

                        <p className="mt-2 text-xs text-white/50">
                          Use a direct image URL for now.
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-white/75">
                          Song of the Day
                        </label>

                        <select
                          value={editSongOfDayPostId}
                          onChange={(e) =>
                            setEditSongOfDayPostId(e.target.value)
                          }
                          className="w-full border border-white/10 bg-black/70 p-3 text-white outline-none focus:ring-2"
                          style={{
                            borderRadius: 'var(--site-radius)',
                          }}
                        >
                          <option value="">
                            Use latest post automatically
                          </option>

                          {posts.map((post) => (
                            <option key={post.id} value={post.id}>
                              {post.title} — {post.artist}
                            </option>
                          ))}
                        </select>

                        <p className="mt-2 text-xs text-white/50">
                          Pick any posted song, or leave it automatic.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={saveProfile}
                          disabled={savingProfile}
                          className="border border-white/10 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            background: 'var(--site-accent)',
                            borderRadius: 'var(--site-radius)',
                          }}
                        >
                          {savingProfile ? 'Saving...' : 'Save Profile'}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditingProfile}
                          disabled={savingProfile}
                          className="border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            borderRadius: 'var(--site-radius)',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <p className="mt-5 rounded-xl border border-green-400/20 bg-green-500/10 p-3 text-sm text-green-100">
                    {successMessage}
                  </p>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <StatCard label="Songs" value={posts.length.toString()} />
                  <StatCard label="Genres" value={totalGenres.toString()} />
                  <StatCard
                    label="Song of Day"
                    value={songOfTheDay?.title || 'None yet'}
                  />
                </div>
              </div>
            </section>

            {errorMessage && (
              <p
                className="mt-6 text-lg font-semibold text-red-100"
                style={{
                  textShadow: '0 3px 12px rgba(0,0,0,0.95)',
                }}
              >
                {errorMessage}
              </p>
            )}

            {loading && (
              <div
                className="mt-6 border border-white/10 p-6 text-white/80 backdrop-blur-md"
                style={{
                  background:
                    'color-mix(in srgb, var(--site-card) 72%, rgba(0,0,0,0.42))',
                  borderRadius: 'var(--site-radius)',
                }}
              >
                Loading Dea’s profile...
              </div>
            )}

            {!loading && songOfTheDay && (
              <section className="mt-8">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p
                      className="mb-2 text-sm font-semibold uppercase tracking-[0.3em]"
                      style={{ color: 'var(--site-accent)' }}
                    >
                      Featured
                    </p>

                    <h2
                      className="text-3xl font-black text-white sm:text-4xl"
                      style={{
                        textShadow: '0 4px 18px rgba(0,0,0,0.95)',
                      }}
                    >
                      Song of the Day
                    </h2>
                  </div>

                  <Link
                    href="/feed"
                    className="hidden text-sm font-semibold text-white/70 transition hover:text-white sm:block"
                  >
                    View feed
                  </Link>
                </div>

                <div
                  className="grid gap-6 border border-white/10 p-5 shadow-xl backdrop-blur-md lg:grid-cols-[280px_1fr]"
                  style={{
                    background:
                      'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.42))',
                    borderRadius: 'var(--site-radius)',
                  }}
                >
                  {songOfTheDay.album_art ? (
                    <img
                      src={songOfTheDay.album_art}
                      alt={`${songOfTheDay.title} album art`}
                      className="aspect-square w-full object-cover shadow-lg"
                      style={{
                        borderRadius: 'var(--site-radius)',
                      }}
                    />
                  ) : (
                    <div
                      className="flex aspect-square w-full items-center justify-center bg-white/10 text-white/60"
                      style={{
                        borderRadius: 'var(--site-radius)',
                      }}
                    >
                      No album art
                    </div>
                  )}

                  <div className="min-w-0">
                    <h3 className="break-words text-3xl font-black text-white sm:text-4xl">
                      {songOfTheDay.title}
                    </h3>

                    <p className="mt-2 break-words text-xl text-white/80">
                      {songOfTheDay.artist}
                    </p>

                    <p className="mt-1 break-words text-white/55">
                      {songOfTheDay.album}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {songOfTheDay.genre && (
                        <span
                          className="rounded-full border px-3 py-1 text-sm"
                          style={{
                            borderColor: 'var(--site-accent)',
                            color: 'var(--site-accent)',
                            background:
                              'color-mix(in srgb, var(--site-accent) 15%, transparent)',
                          }}
                        >
                          {songOfTheDay.genre}
                        </span>
                      )}

                      {songOfTheDay.year && (
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/85">
                          {songOfTheDay.year}
                        </span>
                      )}

                      {songOfTheDay.mood_tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/85"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {songOfTheDay.caption && (
                      <p className="mt-5 whitespace-pre-wrap break-words leading-relaxed text-white/85">
                        {songOfTheDay.caption}
                      </p>
                    )}

                    {songOfTheDay.song_id && (
                      <div className="mt-5">
                        <iframe
                          src={`https://open.spotify.com/embed/track/${songOfTheDay.song_id}?utm_source=generator`}
                          width="100%"
                          height="152"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {!loading && (
              <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
                <div>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <h2
                      className="text-3xl font-black text-white"
                      style={{
                        textShadow: '0 4px 18px rgba(0,0,0,0.95)',
                      }}
                    >
                      Dea’s Songs
                    </h2>

                    <Link
                      href="/feed"
                      className="text-sm font-semibold text-white/70 transition hover:text-white"
                    >
                      See all
                    </Link>
                  </div>

                  {recentSongs.length > 0 ? (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {recentSongs.map((post) => {
                        const isSongOfDay =
                          songOfTheDay?.id === post.id ||
                          deaProfile?.song_of_day_post_id === post.id

                        return (
                          <Link
                            key={post.id}
                            href="/feed"
                            className="group border border-white/10 p-4 shadow-lg backdrop-blur-md transition hover:-translate-y-1"
                            style={{
                              background:
                                'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.42))',
                              borderRadius: 'var(--site-radius)',
                            }}
                          >
                            <div className="flex gap-4">
                              {post.album_art ? (
                                <img
                                  src={post.album_art}
                                  alt={`${post.title} album art`}
                                  className="h-20 w-20 shrink-0 object-cover"
                                  style={{
                                    borderRadius: 'var(--site-radius)',
                                  }}
                                />
                              ) : (
                                <div
                                  className="flex h-20 w-20 shrink-0 items-center justify-center bg-white/10 text-xs text-white/50"
                                  style={{
                                    borderRadius: 'var(--site-radius)',
                                  }}
                                >
                                  No art
                                </div>
                              )}

                              <div className="min-w-0">
                                <h3 className="line-clamp-2 font-bold text-white group-hover:text-orange-200">
                                  {post.title}
                                </h3>

                                <p className="mt-1 line-clamp-1 text-sm text-white/75">
                                  {post.artist}
                                </p>

                                {post.genre && (
                                  <p
                                    className="mt-2 text-sm"
                                    style={{ color: 'var(--site-accent)' }}
                                  >
                                    {post.genre}
                                  </p>
                                )}
                              </div>
                            </div>

                            {canEdit && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setSongOfTheDay(post.id)
                                }}
                                disabled={settingSongOfDayId === post.id}
                                className="mt-4 w-full border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                  borderRadius: 'var(--site-radius)',
                                }}
                              >
                                {settingSongOfDayId === post.id
                                  ? 'Updating...'
                                  : isSongOfDay
                                    ? 'Song of the Day'
                                    : 'Set as Song of the Day'}
                              </button>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div
                      className="border border-white/10 p-6 text-white/75 backdrop-blur-md"
                      style={{
                        background:
                          'color-mix(in srgb, var(--site-card) 72%, rgba(0,0,0,0.42))',
                        borderRadius: 'var(--site-radius)',
                      }}
                    >
                      No songs posted yet.
                    </div>
                  )}
                </div>

                <aside>
                  <h2
                    className="mb-4 text-3xl font-black text-white"
                    style={{
                      textShadow: '0 4px 18px rgba(0,0,0,0.95)',
                    }}
                  >
                    Top Genres
                  </h2>

                  <div
                    className="border border-white/10 p-5 backdrop-blur-md"
                    style={{
                      background:
                        'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.42))',
                      borderRadius: 'var(--site-radius)',
                    }}
                  >
                    {topGenres.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {topGenres.map((genre) => (
                          <Link
                            key={genre.name}
                            href={`/genres/${encodeURIComponent(genre.name)}`}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white/85 transition hover:bg-white/15 hover:text-white"
                          >
                            {genre.name} · {genre.count}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/70">No genres yet.</p>
                    )}
                  </div>
                </aside>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-md">
      <p className="text-sm uppercase tracking-[0.25em] text-white/50">
        {label}
      </p>

      <p className="mt-2 break-words text-3xl font-black text-white">
        {value}
      </p>
    </div>
  )
}