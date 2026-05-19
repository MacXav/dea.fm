import { NextRequest, NextResponse } from 'next/server'

interface SpotifyTokenResponse {
  access_token?: string
  token_type?: string
  expires_in?: number
  error?: string
  error_description?: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || !query.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing search query.',
      },
      { status: 400 }
    )
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.error('[spotify search] Missing Spotify env vars:', {
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Missing Spotify client ID or secret.',
      },
      { status: 500 }
    )
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      cache: 'no-store',
    })

    const tokenData = (await tokenResponse.json()) as SpotifyTokenResponse

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('[spotify search] Token error:', tokenData)

      return NextResponse.json(
        {
          success: false,
          error:
            tokenData.error_description ||
            tokenData.error ||
            'Could not authenticate with Spotify.',
        },
        { status: 500 }
      )
    }

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?${new URLSearchParams({
        q: query.trim(),
        type: 'track',
        limit: '10',
      }).toString()}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        cache: 'no-store',
      }
    )

    const searchData = await searchResponse.json()

    if (!searchResponse.ok) {
      console.error('[spotify search] Search error:', searchData)

      return NextResponse.json(
        {
          success: false,
          error: 'Spotify search failed.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tracks: searchData.tracks?.items || [],
    })
  } catch (error) {
    console.error('[spotify search] Search crash:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Spotify search failed.',
      },
      { status: 500 }
    )
  }
}