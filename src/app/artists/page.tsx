'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ArtistFloralBackground from '@/components/DecorativeFloralBackground'

interface Post {
  id: string
  artist: string | null
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
    const artistMap = new Map<string, { name: string; count: number }>()

    posts.forEach((post) => {
      const artist = post.artist?.trim()
      if (!artist) return

      const normalizedArtist = artist.toLowerCase()

      const existing = artistMap.get(normalizedArtist)

      if (existing) {
        existing.count += 1
      } else {
        artistMap.set(normalizedArtist, {
          name: artist,
          count: 1,
        })
      }
    })

    return Array.from(artistMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [posts])

  const filteredArtists = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) return artists

    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(query)
    )
  }, [artists, search])

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pt-[118px] sm:pt-[78px]"
      style={{
        background: 'var(--site-bg)',
        color: 'var(--site-text)',
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ArtistFloralBackground />
      </div>

      <main className="relative z-10 min-h-screen">
        <div className="absolute inset-0 bg-black/22 pointer-events-none" />

        <div className="relative z-10 px-4 py-10 sm:px-8 md:px-10">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search artists..."
            className="mx-auto mb-10 block w-full max-w-xl border border-white/15 bg-black/35 px-4 py-3 text-center text-white placeholder-white/60 outline-none backdrop-blur-md focus:ring-2"
            style={{
              borderRadius: 'var(--site-radius)',
            }}
          />

          {errorMessage && (
            <p
              className="mb-8 text-red-100 text-lg font-semibold"
              style={{
                textShadow: '0 3px 12px rgba(0,0,0,0.95)',
              }}
            >
              {errorMessage}
            </p>
          )}

          {loading && (
            <p
              className="text-white/90 text-xl font-medium"
              style={{
                textShadow: '0 3px 12px rgba(0,0,0,0.95)',
              }}
            >
              Loading artists...
            </p>
          )}

          {!loading && artists.length === 0 && (
            <p
              className="text-white/90 text-xl font-medium"
              style={{
                textShadow: '0 3px 12px rgba(0,0,0,0.95)',
              }}
            >
              No artists found yet.
            </p>
          )}

          {!loading && artists.length > 0 && filteredArtists.length === 0 && (
            <p
              className="text-white/90 text-xl font-medium"
              style={{
                textShadow: '0 3px 12px rgba(0,0,0,0.95)',
              }}
            >
              No artists match your search.
            </p>
          )}

          {!loading && filteredArtists.length > 0 && (
            <div className="flex flex-wrap gap-x-8 gap-y-6 sm:gap-x-10 sm:gap-y-8 pb-16">
              {filteredArtists.map((artist) => (
                <Link
                  key={artist.name.toLowerCase()}
                  href={`/artists/${encodeURIComponent(artist.name)}`}
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-white transition hover:scale-105 hover:text-orange-200"
                  style={{
                    textShadow:
                      '0 5px 18px rgba(0,0,0,1), 0 0 2px rgba(255,255,255,0.75)',
                    WebkitTextStroke: '0.5px rgba(0,0,0,0.55)',
                  }}
                >
                  {artist.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}