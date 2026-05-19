'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

interface Post {
  id: string
  song_id: string
  title: string
  artist: string
  album: string
  album_art: string
  genre: string | null
  year: number | null
  caption: string
  mood_tags: string[]
  created_at: string
  image_url?: string | null
  uploaded_image_url?: string | null
  post_image_url?: string | null
}

export default function GenreDetailPage() {
  const params = useParams()
  const rawGenre = params.genre

  const genre = useMemo(() => {
    const value = Array.isArray(rawGenre) ? rawGenre[0] : rawGenre
    return decodeURIComponent(value || '').trim()
  }, [rawGenre])

  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching genre posts:', error)
        setErrorMessage('Could not load songs for this genre.')
        setLoading(false)
        return
      }

      console.log('Selected genre from URL:', genre)
      console.log('All posts from Supabase:', data)

      setAllPosts(data || [])
      setLoading(false)
    }

    fetchPosts()
  }, [genre])

  const posts = useMemo(() => {
    const selectedGenre = genre.toLowerCase().trim()

    return allPosts.filter((post) => {
      const postGenre = post.genre?.toLowerCase().trim()
      return postGenre === selectedGenre
    })
  }, [allPosts, genre])

  const togglePlayer = (postId: string) => {
    setActivePlayerId((currentId) => (currentId === postId ? null : postId))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <Navbar />

      <div className="pointer-events-none absolute left-4 top-20 text-5xl opacity-30">
        ❀
      </div>

      <div className="pointer-events-none absolute right-6 top-28 text-4xl opacity-30">
        ✿
      </div>

      <div className="pointer-events-none absolute bottom-8 left-8 text-4xl opacity-20">
        ✾
      </div>

      <div className="pointer-events-none absolute bottom-10 right-10 text-5xl opacity-20">
        ❁
      </div>

      <div className="container mx-auto px-4 py-10 relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/genres"
              className="text-sm text-gray-400 hover:text-white transition"
            >
              ← Back to genres
            </Link>

            <div className="text-center mt-6">

              <h1 className="text-4xl sm:text-5xl font-bold break-words">
                {genre}
              </h1>

              <p className="text-gray-400 mt-3">
                {loading
                  ? 'Loading songs...'
                  : `${posts.length} ${
                      posts.length === 1 ? 'song' : 'songs'
                    } in this genre.`}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-400/20 text-red-200 p-3 text-sm">
              {errorMessage}
            </div>
          )}

          {loading && (
            <div className="text-center text-gray-300 bg-white/5 rounded-2xl p-6">
              Loading songs...
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center text-gray-300 bg-white/5 rounded-2xl p-6">
              No songs found for this genre.
            </div>
          )}

          {!loading && posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/10 border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() => togglePlayer(post.id)}
                    className="relative group block w-full"
                    aria-label={`Play ${post.title} by ${post.artist} on Spotify`}
                  >
                    {post.album_art ? (
                      <img
                        src={post.album_art}
                        alt={`${post.title} album cover`}
                        className="w-full aspect-square object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-xl bg-white/10 flex items-center justify-center text-gray-400">
                        No album art
                      </div>
                    )}

                    <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg">
                        ▶
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 bg-black/60 text-white text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition">
                      {activePlayerId === post.id
                        ? 'Hide Spotify player'
                        : 'Click to play on Spotify'}
                    </div>
                  </button>

                  <div className="mt-4 flex-1 min-w-0">
                    <h2 className="text-xl font-bold line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-gray-300 mt-1 line-clamp-1">
                      {post.artist}
                    </p>

                    <p className="text-gray-400 text-sm line-clamp-1">
                      {post.album}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.genre && (
                        <span className="bg-purple-500/20 border border-purple-400/20 text-purple-200 px-3 py-1 rounded-full text-sm">
                          {post.genre}
                        </span>
                      )}

                      {post.year && (
                        <span className="bg-yellow-500/20 border border-yellow-400/20 text-yellow-200 px-3 py-1 rounded-full text-sm">
                          {post.year}
                        </span>
                      )}

                      {post.mood_tags?.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-500/20 border border-blue-400/20 text-blue-200 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {post.caption && (
                      <p className="text-gray-200 mt-4 line-clamp-3 break-words">
                        {post.caption}
                      </p>
                    )}

                    {post.created_at && (
                      <p className="text-gray-500 text-xs mt-4">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {activePlayerId === post.id && post.song_id && (
                    <div className="mt-4">
                      <iframe
                        src={`https://open.spotify.com/embed/track/${post.song_id}?utm_source=generator`}
                        width="100%"
                        height="152"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="rounded-xl"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}