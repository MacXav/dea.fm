'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import GenreFloralBackground from '@/components/DecorativeFloralBackground'

interface Post {
  id: string
  genre: string | null
}

export default function GenresPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchGenres = async () => {
      setLoading(true)
      setErrorMessage('')

      const { data, error } = await supabase
        .from('posts')
        .select('id, genre')
        .order('genre', { ascending: true })

      if (error) {
        console.error('Error fetching genres:', error)
        setErrorMessage('Could not load genres.')
        setLoading(false)
        return
      }

      setPosts(data || [])
      setLoading(false)
    }

    fetchGenres()
  }, [])

  const genres = useMemo(() => {
    const genreMap = new Map<string, number>()

    posts.forEach((post) => {
      const genre = post.genre?.trim()
      if (!genre) return

      genreMap.set(genre, (genreMap.get(genre) || 0) + 1)
    })

    return Array.from(genreMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [posts])

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pt-[118px] sm:pt-[78px]"
      style={{
        background: 'var(--site-bg)',
        color: 'var(--site-text)',
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GenreFloralBackground />
      </div>

      <main className="relative z-10 min-h-screen">
        <div className="absolute inset-0 bg-black/22 pointer-events-none" />

        <div className="relative z-10 px-4 py-10 sm:px-8 md:px-10">

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
              Loading genres...
            </p>
          )}

          {!loading && genres.length === 0 && (
            <p
              className="text-white/90 text-xl font-medium"
              style={{
                textShadow: '0 3px 12px rgba(0,0,0,0.95)',
              }}
            >
              No genres found yet.
            </p>
          )}

          {!loading && genres.length > 0 && (
            <div className="flex flex-wrap gap-x-8 gap-y-6 sm:gap-x-10 sm:gap-y-8 pb-16">
              {genres.map((genre) => (
                <Link
                  key={genre.name}
                  href={`/genres/${encodeURIComponent(genre.name)}`}
                  className="text-3xl sm:text-4xl md:text-5xl font-black text-white transition hover:scale-105 hover:text-orange-200"
                  style={{
                    textShadow:
                      '0 5px 18px rgba(0,0,0,1), 0 0 2px rgba(255,255,255,0.75)',
                    WebkitTextStroke: '0.5px rgba(0,0,0,0.55)',
                  }}
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}