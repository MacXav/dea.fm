'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import DecorativeFloralBackground from '@/components/DecorativeFloralBackground'

interface Post {
  id: string
  artist: string
}

interface ArtistSummary {
  name: string
  count: number
}

export default function ArtistsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('posts')
        .select('id, artist')
        .order('artist', { ascending: true })

      if (error) {
        console.error('Error fetching artists:', error)
        setErrorMessage('Could not load artists.')
        setLoading(false)
        return
      }

      setPosts(data || [])
      setLoading(false)
    }

    fetchArtists()
  }, [])

  const artists = useMemo(() => {
    const artistMap = new Map<string, ArtistSummary>()

    posts.forEach((post) => {
      const artistName = post.artist?.trim()

      if (!artistName) return

      const normalized = artistName.toLowerCase()

      const existing = artistMap.get(normalized)

      if (existing) {
        existing.count += 1
      } else {
        artistMap.set(normalized, {
          name: artistName,
          count: 1,
        })
      }
    })

    return Array.from(artistMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [posts])

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(search.toLowerCase().trim())
  )

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
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-8">
              <h1
                className="text-3xl sm:text-5xl font-bold text-white"
                style={{
                  textShadow:
                    '0 4px 18px rgba(0,0,0,0.95), 0 0 2px rgba(255,255,255,0.55)',
                }}
              >
                Artists
              </h1>

              <p
                className="mt-3 text-white/70"
                style={{
                  textShadow: '0 3px 12px rgba(0,0,0,0.95)',
                }}
              >
                Browse every artist posted in Dea&apos;s audio archives.
              </p>
            </div>

            {errorMessage && (
              <div className="w-full max-w-2xl mx-auto mb-6 rounded-xl bg-red-500/10 border border-red-400/20 text-red-200 p-3 text-sm backdrop-blur-md">
                {errorMessage}
              </div>
            )}

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search artists..."
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
                Loading artists...
              </div>
            )}

            {!loading && filteredArtists.length === 0 && (
              <div
                className="text-center text-white/90 border border-white/10 p-6 max-w-2xl mx-auto backdrop-blur-md"
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: 'var(--site-radius)',
                }}
              >
                No artists found.
              </div>
            )}

            {!loading && filteredArtists.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArtists.map((artist) => (
                  <Link
                    key={artist.name.toLowerCase()}
                    href={`/artists/${encodeURIComponent(artist.name)}`}
                    className="group border border-white/10 p-5 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/10"
                    style={{
                      background:
                        'color-mix(in srgb, var(--site-card) 74%, rgba(0,0,0,0.35))',
                      borderRadius: 'var(--site-radius)',
                    }}
                  >
                    <h2 className="text-xl font-bold text-white break-words group-hover:underline">
                      {artist.name}
                    </h2>

                    <p className="mt-2 text-sm text-white/60">
                      {artist.count} {artist.count === 1 ? 'post' : 'posts'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}