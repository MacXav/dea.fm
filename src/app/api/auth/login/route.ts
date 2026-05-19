import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI || `${origin}/api/auth/callback`

  console.log('[spotify login] Env check:', {
    hasClientId: Boolean(clientId),
    redirectUri,
    clientIdStart: clientId?.slice(0, 6),
  })

  if (!clientId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Spotify login is not configured.',
        debug: {
          hasClientId: Boolean(clientId),
          redirectUri,
        },
      },
      { status: 500 }
    )
  }

  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-library-read',
  ].join(' ')

  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes,
    state,
  })

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  )
}