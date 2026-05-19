'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Callback() {
  const router = useRouter()
  const hasRun = useRef(false)

  const [message, setMessage] = useState('Connecting Spotify...')
  const [notAllowed, setNotAllowed] = useState(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const exchangeCode = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const returnedState = urlParams.get('state')

      const savedState =
        sessionStorage.getItem('spotify_auth_state') ||
        localStorage.getItem('spotify_auth_state')

      const exchangeInProgress = sessionStorage.getItem(
        'spotify_exchange_in_progress'
      )

      const existingUserId = localStorage.getItem('user_id')

      if (!code) {
        if (exchangeInProgress === 'true') {
          setMessage('Finishing Spotify login...')
          return
        }

        if (existingUserId) {
          setMessage('Already connected. Redirecting...')
          router.push('/feed')
          return
        }

        setMessage('No Spotify code found. Go back and try Admin login again.')
        return
      }

      if (!returnedState || !savedState || returnedState !== savedState) {
        setMessage(
          'Spotify login state did not match. Go back and try Admin login again.'
        )
        return
      }

      const codeKey = `spotify-code-used-${code}`

      if (sessionStorage.getItem(codeKey)) {
        if (existingUserId) {
          setMessage('Already connected. Redirecting...')
          router.push('/feed')
          return
        }

        setMessage(
          'This login code was already used. Go back and try Admin login again.'
        )
        return
      }

      sessionStorage.setItem(codeKey, 'true')
      sessionStorage.setItem('spotify_exchange_in_progress', 'true')
      sessionStorage.removeItem('spotify_auth_state')
      localStorage.removeItem('spotify_auth_state')

      window.history.replaceState({}, document.title, '/auth/callback')

      try {
        setMessage('Connecting Spotify...')

        const res = await fetch('/api/auth/exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        const data = await res.json()

        console.log('Spotify callback response:', data)

        if (!res.ok || !data.success) {
          console.error('Exchange failed:', data)

          sessionStorage.removeItem('spotify_exchange_in_progress')

          if (data.not_allowed) {
            setNotAllowed(true)
            setMessage(
              data.error ||
                'This Spotify account is not allowed to make edits. You can still view the site.'
            )
            return
          }

          setMessage(
            data.error ||
              'Spotify connection failed. Go back and try Admin login again.'
          )
          return
        }

        if (!data.user_id || !data.access_token) {
          sessionStorage.removeItem('spotify_exchange_in_progress')
          setMessage('Missing Spotify user data. Try logging in again.')
          return
        }

        localStorage.setItem('user_id', data.user_id)
        localStorage.setItem('access_token', data.access_token)

        if (typeof data.can_edit === 'boolean') {
          localStorage.setItem('can_edit', String(data.can_edit))
        }

        sessionStorage.removeItem('spotify_exchange_in_progress')

        setMessage('Connected. Redirecting...')
        router.push('/feed')
      } catch (err) {
        console.error('Callback error:', err)
        sessionStorage.removeItem('spotify_exchange_in_progress')
        setMessage('Something went wrong while connecting Spotify.')
      }
    }

    exchangeCode()
  }, [router])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'var(--site-bg)',
        color: 'var(--site-text)',
      }}
    >
      <div
        className="w-full max-w-md border border-white/10 p-6 text-center"
        style={{
          background: 'var(--site-card)',
          borderRadius: 'var(--site-radius)',
        }}
      >
        <p
          className="text-sm uppercase tracking-[0.25em] mb-3"
          style={{
            color: 'var(--site-accent)',
          }}
        >
          dea.fm
        </p>

        <h1 className="text-2xl font-bold mb-2">
          {notAllowed ? 'View Only' : 'Spotify Login'}
        </h1>

        <p className="opacity-75 mb-5">{message}</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/feed"
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15"
          >
            Go to feed
          </Link>

          <Link
            href="/"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}