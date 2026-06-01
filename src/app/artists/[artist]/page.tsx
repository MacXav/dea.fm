'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DecorativeFloralBackground from '@/components/DecorativeFloralBackground'
import { useSpotifyPlayer } from '@/components/SpotifyPlayerProvider'

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
}

export default function ArtistDetailPage() {
  const params = useParams()
  const rawArtist = params.artist

  const artist = useMemo(() => {
    const value = Array.isArray(rawArtist) ? rawArtist[0] : rawArtist
    return decodeURIComponent(value || '').trim()
  }, [rawArtist])

  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const { setActiveTrack } = useSpotifyPlayer()

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching artist posts:', error)
        setErrorMessage('Could not load songs for this artist.')
        setLoading(false)
        return
      }

      setAllPosts(data || [])
      setLoading(false)
    }

    fetchPosts()
  }, [artist])

  const posts = useMemo(() => {
    const selectedArtist = artist.toLowerCase().trim()

    return allPosts.filter((post) => {
      const postArtist = post.artist?.toLowerCase().trim()
      return postArtist === selectedArtist
    })
  }, [allPosts, artist])

  const playPost = (post: Post) => {
    if (!post.song_id) return

    setActiveTrack({
      id: post.song_id,
      title: post.title,
      artist: post.artist,
      albumArt: post.album_art,
    })
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
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <Link
                href="/artists"
                className="text-sm text-white/65 transition hover:text-white"
              >
                ← Back to artists
              </Link>

              <div className="mt-6 text-center">
                <h1
                  className="break-words text-4xl font-black text-white sm:text-5xl"
                  style={{
                    textShadow:
                      '0 4px 18px rgba(0,0,0,0.95), 0 0 2px rgba(255,255,255,0.55)',
                  }}
                >
                  {artist}
                </h1>

                <p
                  className="mt-3 text-white/70"
                  style={{
                    textShadow: '0 3px 12px rgba(0,0,0,0.95)',
                  }}
                >
                  {loading
                    ? 'Loading songs...'
                    : `${posts.length} ${
                        posts.length === 1 ? 'post' : 'posts'
                      } by this artist.`}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200 backdrop-blur-md">
                {errorMessage}
              </div>
            )}

            {loading && (
              <div
                className="border border-white/10 p-6 text-center text-white/90 backdrop-blur-md"
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: 'var(--site-radius)',
                }}
              >
                Loading songs...
              </div>
            )}

            {!loading && posts.length === 0 && (
              <div
                className="border border-white/10 p-6 text-center text-white/90 backdrop-blur-md"
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: 'var(--site-radius)',
                }}
              >
                No posts found for this artist.
              </div>
            )}

            {!loading && posts.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-white/10 p-4 shadow-lg backdrop-blur-sm transition hover:-translate-y-1"
                    style={{
                      background:
                        'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.35))',
                      borderRadius: 'var(--site-radius)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => playPost(post)}
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
                          className="flex w-full aspect-square items-center justify-center bg-white/10 text-white/60"
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

                    <div className="mt-4 min-w-0">
                      <h2 className="line-clamp-2 text-xl font-bold text-white">
                        {post.title}
                      </h2>

                      <p className="mt-1 line-clamp-1 text-white/80">
                        {post.artist}
                      </p>

                      <p className="line-clamp-1 text-sm text-white/60">
                        {post.album}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.genre && (
                          <Link
                            href={`/genres/${encodeURIComponent(post.genre)}`}
                            className="rounded-full border px-3 py-1 text-sm transition hover:bg-white/10"
                            style={{
                              borderColor: 'var(--site-accent)',
                              color: 'var(--site-accent)',
                              background:
                                'color-mix(in srgb, var(--site-accent) 15%, transparent)',
                            }}
                          >
                            {post.genre}
                          </Link>
                        )}

                        {post.year && (
                          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/90">
                            {post.year}
                          </span>
                        )}

                        {post.mood_tags?.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/90"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {post.caption && (
                        <p className="mt-4 line-clamp-3 break-words text-white/90">
                          {post.caption}
                        </p>
                      )}

                      {post.image_url && (
                        <div className="mt-4 overflow-hidden border border-white/10 rounded-lg">
                          <img
                            src={post.image_url}
                            alt={`${post.title} custom uploaded post photo`}
                            className="w-full max-h-48 object-cover"
                          />
                        </div>
                      )}

                      {post.created_at && (
                        <p className="mt-4 text-xs text-white/50">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}