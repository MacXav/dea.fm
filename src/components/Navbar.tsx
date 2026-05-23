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
    [
      'rounded-md border px-3 py-1.5 text-sm font-black uppercase tracking-[0.12em] shadow-md transition',
      'text-white',
      'hover:-translate-y-0.5 hover:brightness-110',
      isActive(href)
        ? 'border-white/50 bg-[#ff66cc] shadow-[0_0_16px_rgba(255,102,204,0.45)]'
        : 'border-white/25 bg-black/25 hover:bg-white/10',
    ].join(' ')

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
    <nav className="fixed left-0 right-0 top-0 z-[9999] border-b-2 border-white/25 bg-[#13003d]/90 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="border-b border-white/10 bg-gradient-to-r from-[#ff66cc] via-[#7c3aed] to-[#00d5ff] px-3 py-1 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-inner">
        <span className="drop-shadow-[1px_1px_0_#000]">
          ✦ welcome to dea&apos;s audio archives ✦ online music diary ✦
        </span>
      </div>

      <div className="mx-auto px-3 py-3 sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border-2 border-white/30 bg-gradient-to-br from-[#ff66cc] via-[#7c3aed] to-[#00d5ff] text-xl shadow-[0_0_18px_rgba(255,102,204,0.35)]">
              ♪
            </div>

            <div className="min-w-0">
              <p className="retro-title truncate text-2xl font-black leading-none sm:text-3xl">
                dea.fm
              </p>
              <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-[0.18em] text-[#66ffff] drop-shadow-[1px_1px_0_#000]">
                Dea&apos;s audio archives
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
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
                className="retro-button rounded-md px-3 py-1.5 text-sm uppercase tracking-[0.08em]"
              >
                Admin login
              </button>
            )}

            {!loadingUser && canEdit && (
              <button
                type="button"
                onClick={logout}
                className="rounded-md border-2 border-white/30 bg-black/35 px-3 py-1.5 text-sm font-black uppercase tracking-[0.08em] text-white shadow-md transition hover:bg-red-500/30"
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