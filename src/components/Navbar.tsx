'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCurrentUser, CurrentUser } from '@/lib/getCurrentUser'

export default function Navbar() {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
      setLoadingUser(false)
    }

    loadUser()
  }, [])

  const canEdit = Boolean(currentUser?.can_edit)

  const isActive = (href: string) => {
    if (href === '/genres') {
      return pathname === '/genres' || pathname.startsWith('/genres/')
    }

    return pathname === href
  }

  const linkClass = (href: string) =>
    `transition ${
      isActive(href) ? 'text-white' : 'text-white/70 hover:text-white'
    }`

  const loginWithSpotify = () => {
    window.location.href = '/api/auth/login'
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    localStorage.removeItem('user_id')
    localStorage.removeItem('access_token')
    localStorage.removeItem('can_edit')
    localStorage.removeItem('spotify_auth_state')
    sessionStorage.clear()

    document.cookie = 'user_id=; path=/; max-age=0'

    window.location.href = '/feed'
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-[9999] border-b border-white/10 bg-black/20 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
      <div className="mx-auto px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.7)]"
          >
            Dea's audio archives
          </Link>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/feed" className={linkClass('/feed')}>
              Feed
            </Link>

            <Link href="/genres" className={linkClass('/genres')}>
              Genres
            </Link>

            <Link href="/profile" className={linkClass('/profile')}>
              Profile
            </Link>

            {canEdit && (
              <Link href="/post/create" className={linkClass('/post/create')}>
                Create
              </Link>
            )}

            {!loadingUser && !canEdit && (
              <button
                type="button"
                onClick={loginWithSpotify}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Admin login
              </button>
            )}

            {!loadingUser && canEdit && (
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}