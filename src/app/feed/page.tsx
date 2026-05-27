'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, CurrentUser } from '@/lib/getCurrentUser'
import DecorativeFloralBackground from '@/components/DecorativeFloralBackground'
import { useSpotifyPlayer } from '@/components/SpotifyPlayerProvider'

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
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const canEdit = Boolean(currentUser?.can_edit)

  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editGenre, setEditGenre] = useState('')
  const [editYear, setEditYear] = useState('')
  const [editMood, setEditMood] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)

  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const { setActiveTrack } = useSpotifyPlayer()

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)

      const user = await getCurrentUser()
      setCurrentUser(user)

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        setErrorMessage('Could not load posts.')
        setLoading(false)
        return
      }

      setPosts(data || [])
      setLoading(false)
    }

    fetchPosts()
  }, [])

  const filtered = posts.filter((post) => {
    const query = search.toLowerCase()

    return (
      post.title?.toLowerCase().includes(query) ||
      post.artist?.toLowerCase().includes(query) ||
      post.album?.toLowerCase().includes(query) ||
      post.genre?.toLowerCase().includes(query) ||
      post.year?.toString().includes(query)
    )
  })

  const getUploadedImage = (post: Post) => {
    return post.image_url || ''
  }

  const editImagePreview = useMemo(() => {
    if (removeImage) return ''

    if (editImageFile) {
      return URL.createObjectURL(editImageFile)
    }

    return editImageUrl
  }, [editImageFile, editImageUrl, removeImage])

  useEffect(() => {
    return () => {
      if (editImagePreview && editImageFile) {
        URL.revokeObjectURL(editImagePreview)
      }
    }
  }, [editImagePreview, editImageFile])

  const playPost = (post: Post) => {
    if (!post.song_id) return

    setActiveTrack({
      id: post.song_id,
      title: post.title,
      artist: post.artist,
      albumArt: post.album_art,
    })
  }

  const openPost = (post: Post) => {
    setSelectedPost(post)
  }

  const closePost = () => {
    setSelectedPost(null)
  }

  const startEditing = (post: Post) => {
    if (!canEdit) return

    setEditingPostId(post.id)
    setEditGenre(post.genre || '')
    setEditYear(post.year ? String(post.year) : '')
    setEditMood(post.mood_tags?.join(', ') || '')
    setEditCaption(post.caption || '')
    setEditImageUrl(getUploadedImage(post))
    setEditImageFile(null)
    setRemoveImage(false)
    setErrorMessage('')
  }

  const cancelEditing = () => {
    setEditingPostId(null)
    setEditGenre('')
    setEditYear('')
    setEditMood('')
    setEditCaption('')
    setEditImageUrl('')
    setEditImageFile(null)
    setRemoveImage(false)
    setSavingEdit(false)
    setErrorMessage('')
  }

  const uploadEditedImage = async (postId: string) => {
    if (removeImage) {
      return null
    }

    if (!editImageFile) {
      return editImageUrl || null
    }

    const safeFileName = editImageFile.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')

    const filePath = `post-images/${postId}-${Date.now()}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(filePath, editImageFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[browser] Edit image upload error:', uploadError)
      throw new Error(uploadError.message || 'Could not upload image.')
    }

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const saveEdit = async (postId: string) => {
    if (!canEdit) return

    setErrorMessage('')

    const parsedYear = editYear ? Number(editYear) : null

    if (
      parsedYear !== null &&
      (Number.isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100)
    ) {
      setErrorMessage('Please enter a valid year.')
      return
    }

    try {
      setSavingEdit(true)

      const imageUrl = await uploadEditedImage(postId)

      const updatedPost = {
        genre: editGenre,
        year: parsedYear,
        caption: editCaption,
        mood_tags: editMood
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        image_url: imageUrl,
      }

      const response = await fetch('/api/posts/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          post_id: postId,
          ...updatedPost,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('[browser] Update post API error:', result)
        setErrorMessage(result.error || 'Could not update post.')
        setSavingEdit(false)
        return
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId ? result.post : post
        )
      )

      if (selectedPost?.id === postId) {
        setSelectedPost(result.post)
      }

      cancelEditing()
    } catch (error) {
      console.error('[browser] Save edit error:', error)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while updating the post.'
      )
      setSavingEdit(false)
    }
  }

  const deletePost = async (postId: string) => {
    if (!canEdit) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This cannot be undone.'
    )

    if (!confirmed) return

    setErrorMessage('')

    try {
      setDeletingPostId(postId)

      const response = await fetch('/api/posts/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          post_id: postId,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        console.error('[browser] Delete post API error:', result)
        setErrorMessage(result.error || 'Could not delete post.')
        setDeletingPostId(null)
        return
      }

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      )

      if (editingPostId === postId) {
        cancelEditing()
      }

      if (selectedPost?.id === postId) {
        closePost()
      }

      setDeletingPostId(null)
    } catch (error) {
      console.error('[browser] Delete post error:', error)
      setErrorMessage('Something went wrong while deleting the post.')
      setDeletingPostId(null)
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
        <div className="absolute inset-0 bg-black/16 pointer-events-none" />

        <div className="relative z-10 px-4 py-8 pb-48">
          <h1
            className="text-3xl font-bold text-center mb-6 text-white"
            style={{
              textShadow:
                '0 4px 18px rgba(0,0,0,0.95), 0 0 2px rgba(255,255,255,0.55)',
            }}
          >
            Music Feed
          </h1>

          {errorMessage && (
            <div className="w-full max-w-2xl mx-auto mb-6 rounded-xl bg-red-500/10 border border-red-400/20 text-red-200 p-3 text-sm backdrop-blur-md">
              {errorMessage}
            </div>
          )}

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs, artists, albums, genres, or years..."
            className="w-full max-w-2xl mx-auto block p-3 mb-8 outline-none border border-white/10 bg-black/35 text-white placeholder-white/60 focus:ring-2 backdrop-blur-md"
            style={{
              borderRadius: 'var(--site-radius)',
            }}
          />

          {loading && (
            <div
              className="text-center text-white/90 border border-white/10 p-6 max-w-2xl mx-auto backdrop-blur-md"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: 'var(--site-radius)',
              }}
            >
              Loading posts...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div
              className="text-center text-white/90 border border-white/10 p-6 max-w-2xl mx-auto backdrop-blur-md"
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: 'var(--site-radius)',
              }}
            >
              No posts found.
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {filtered.map((post) => (
                <div
                  key={post.id}
                  onClick={() => openPost(post)}
                  className="border border-white/10 p-4 shadow-lg flex flex-col cursor-pointer transition hover:-translate-y-1 backdrop-blur-sm"
                  style={{
                    background:
                      'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.35))',
                    borderRadius: 'var(--site-radius)',
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      playPost(post)
                    }}
                    className="relative group block w-full"
                    aria-label={`Play ${post.title} by ${post.artist} on Spotify`}
                  >
                    {post.album_art ? (
                      <img
                        src={post.album_art}
                        alt={`${post.title} album cover`}
                        className="w-full aspect-square object-cover"
                        style={{
                          borderRadius: 'var(--site-radius)',
                        }}
                      />
                    ) : (
                      <div
                        className="w-full aspect-square bg-white/10 flex items-center justify-center opacity-70"
                        style={{
                          borderRadius: 'var(--site-radius)',
                        }}
                      >
                        No album art
                      </div>
                    )}

                    <div
                      className="absolute inset-0 bg-black/0 transition group-hover:bg-black/35"
                      style={{
                        borderRadius: 'var(--site-radius)',
                      }}
                    />

                    <div className="absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-lg text-white shadow-lg backdrop-blur-md transition group-hover:scale-110 group-hover:bg-black/85 sm:h-14 sm:w-14 sm:text-xl">
                      ▶
                    </div>

                    <div className="absolute bottom-3 left-3 max-w-[calc(100%-4.5rem)] rounded-lg bg-black/60 px-3 py-2 text-left text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100 sm:text-sm">
                      Play
                    </div>
                  </button>

                  <div className="mt-4 flex-1 min-w-0">
                    <h2 className="text-xl font-bold line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="mt-1 line-clamp-1 opacity-80">
                      {post.artist}
                    </p>

                    <p className="text-sm line-clamp-1 opacity-60">
                      {post.album}
                    </p>

                    {editingPostId === post.id && canEdit ? (
                      <div
                        className="mt-4 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div>
                          <label className="block text-sm opacity-70 mb-1">
                            Year
                          </label>
                          <input
                            type="number"
                            min="1900"
                            max="2100"
                            value={editYear}
                            onChange={(e) => setEditYear(e.target.value)}
                            className="w-full p-2 rounded-lg bg-white/10 text-white outline-none focus:ring-2 border border-white/10"
                            placeholder="2024"
                          />
                        </div>

                        <div>
                          <label className="block text-sm opacity-70 mb-1">
                            Genre
                          </label>
                          <input
                            value={editGenre}
                            onChange={(e) => setEditGenre(e.target.value)}
                            className="w-full p-2 rounded-lg bg-white/10 text-white outline-none focus:ring-2 border border-white/10"
                            placeholder="Pop, Rap, Indie..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm opacity-70 mb-1">
                            Mood Tags
                          </label>
                          <input
                            value={editMood}
                            onChange={(e) => setEditMood(e.target.value)}
                            className="w-full p-2 rounded-lg bg-white/10 text-white outline-none focus:ring-2 border border-white/10"
                            placeholder="happy, chill, late night"
                          />
                        </div>

                        <div>
                          <label className="block text-sm opacity-70 mb-1">
                            Caption
                          </label>
                          <textarea
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            className="w-full p-2 rounded-lg bg-white/10 text-white h-24 outline-none focus:ring-2 border border-white/10"
                            placeholder="Write something..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm opacity-70 mb-1">
                            Custom Post Photo
                          </label>

                          {editImagePreview ? (
                            <div className="mb-3 overflow-hidden border border-white/10 rounded-lg">
                              <img
                                src={editImagePreview}
                                alt="Current post upload preview"
                                className="w-full max-h-56 object-cover"
                              />
                            </div>
                          ) : (
                            <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/55">
                              No custom post photo selected.
                            </div>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              setEditImageFile(file)
                              setRemoveImage(false)
                            }}
                            className="w-full rounded-lg border border-white/10 bg-white/10 p-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/15 file:px-3 file:py-1.5 file:text-white"
                          />

                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditImageFile(null)
                                setEditImageUrl('')
                                setRemoveImage(true)
                              }}
                              className="flex-1 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100 transition hover:bg-red-500/20"
                            >
                              Remove Photo
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditImageFile(null)
                                setRemoveImage(false)
                                setEditImageUrl(getUploadedImage(post))
                              }}
                              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                            >
                              Reset Photo
                            </button>
                          </div>

                          <p className="mt-2 text-xs text-white/45">
                            This only changes the custom uploaded post photo.
                            The Spotify album cover stays the same.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(post.id)}
                            disabled={savingEdit}
                            className="flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingEdit ? 'Saving...' : 'Save'}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={savingEdit}
                            className="flex-1 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm opacity-80 transition hover:bg-white/5 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.genre && (
                            <span
                              className="border px-3 py-1 rounded-full text-sm"
                              style={{
                                borderColor: 'var(--site-accent)',
                                color: 'var(--site-accent)',
                                background:
                                  'color-mix(in srgb, var(--site-accent) 15%, transparent)',
                              }}
                            >
                              {post.genre}
                            </span>
                          )}

                          {post.year && (
                            <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-full text-sm opacity-90">
                              {post.year}
                            </span>
                          )}

                          {post.mood_tags?.map((tag) => (
                            <span
                              key={tag}
                              className="bg-white/10 border border-white/10 px-3 py-1 rounded-full text-sm opacity-90"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {post.caption && (
                          <p className="mt-4 line-clamp-3 break-words opacity-90">
                            {post.caption}
                          </p>
                        )}

                        {getUploadedImage(post) && (
                          <div className="mt-4 overflow-hidden border border-white/10 rounded-lg">
                            <img
                              src={getUploadedImage(post)}
                              alt={`${post.title} custom uploaded post photo`}
                              className="w-full max-h-48 object-cover"
                            />
                          </div>
                        )}

                        {post.created_at && (
                          <p className="opacity-50 text-xs mt-4">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        )}

                        {canEdit && (
                          <div
                            className="flex gap-2 mt-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => startEditing(post)}
                              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm opacity-90 transition hover:bg-white/10 hover:opacity-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deletePost(post.id)}
                              disabled={deletingPostId === post.id}
                              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm opacity-80 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingPostId === post.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedPost && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePost}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden border border-white/10 shadow-2xl"
            style={{
              background: 'var(--site-bg)',
              color: 'var(--site-text)',
              borderRadius: 'var(--site-radius)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePost}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
              aria-label="Close post"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 sm:p-6 min-w-0">
              <div className="min-w-0">
                {selectedPost.album_art ? (
                  <button
                    type="button"
                    onClick={() => playPost(selectedPost)}
                    className="relative block w-full group"
                  >
                    <img
                      src={selectedPost.album_art}
                      alt={`${selectedPost.title} album cover`}
                      className="w-full aspect-square object-cover"
                      style={{
                        borderRadius: 'var(--site-radius)',
                      }}
                    />

                    <div
                      className="absolute inset-0 bg-black/0 transition group-hover:bg-black/35"
                      style={{
                        borderRadius: 'var(--site-radius)',
                      }}
                    />

                    <div className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/70 text-xl text-white shadow-lg backdrop-blur-md transition group-hover:scale-110 group-hover:bg-black/85">
                      ▶
                    </div>
                  </button>
                ) : (
                  <div
                    className="w-full aspect-square bg-white/10 flex items-center justify-center opacity-70"
                    style={{
                      borderRadius: 'var(--site-radius)',
                    }}
                  >
                    No album art
                  </div>
                )}

                {selectedPost.song_id && (
                  <button
                    type="button"
                    onClick={() => playPost(selectedPost)}
                    className="mt-4 w-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    style={{
                      borderRadius: 'var(--site-radius)',
                    }}
                  >
                    Play in site player
                  </button>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <p
                  className="text-sm uppercase tracking-[0.2em] mb-3"
                  style={{
                    color: 'var(--site-accent)',
                  }}
                >
                  Featured Post
                </p>

                <h2 className="text-3xl sm:text-4xl font-bold leading-tight break-words [overflow-wrap:anywhere]">
                  {selectedPost.title}
                </h2>

                <p className="text-xl mt-2 opacity-80 break-words [overflow-wrap:anywhere]">
                  {selectedPost.artist}
                </p>

                <p className="mt-1 opacity-60 break-words [overflow-wrap:anywhere]">
                  {selectedPost.album}
                </p>

                <div className="flex flex-wrap gap-2 mt-5 min-w-0">
                  {selectedPost.genre && (
                    <span
                      className="border px-3 py-1 rounded-full text-sm break-words"
                      style={{
                        borderColor: 'var(--site-accent)',
                        color: 'var(--site-accent)',
                        background:
                          'color-mix(in srgb, var(--site-accent) 15%, transparent)',
                      }}
                    >
                      {selectedPost.genre}
                    </span>
                  )}

                  {selectedPost.year && (
                    <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-full text-sm">
                      {selectedPost.year}
                    </span>
                  )}

                  {selectedPost.mood_tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/10 border border-white/10 px-3 py-1 rounded-full text-sm break-words"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {getUploadedImage(selectedPost) && (
                  <div className="mt-6 min-w-0">
                    <h3 className="text-sm uppercase tracking-[0.2em] opacity-60 mb-2">
                      Uploaded Image
                    </h3>

                    <img
                      src={getUploadedImage(selectedPost)}
                      alt={`${selectedPost.title} uploaded image`}
                      className="w-full border border-white/10 object-cover"
                      style={{
                        borderRadius: 'var(--site-radius)',
                      }}
                    />
                  </div>
                )}

                <div className="mt-6 min-w-0">
                  <h3 className="text-sm uppercase tracking-[0.2em] opacity-60 mb-2">
                    Description
                  </h3>

                  {selectedPost.caption ? (
                    <p className="leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-w-full opacity-95">
                      {selectedPost.caption}
                    </p>
                  ) : (
                    <p className="opacity-50 italic">No description added.</p>
                  )}
                </div>

                {selectedPost.created_at && (
                  <p className="opacity-50 text-xs mt-6">
                    Posted{' '}
                    {new Date(selectedPost.created_at).toLocaleDateString()}
                  </p>
                )}

                {canEdit && (
                  <div className="flex gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        startEditing(selectedPost)
                        closePost()
                      }}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm opacity-90 transition hover:bg-white/10 hover:opacity-100"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(selectedPost.id)}
                      disabled={deletingPostId === selectedPost.id}
                      className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm opacity-80 transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingPostId === selectedPost.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}