import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAdminUserFromRequest } from '@/lib/adminAuth'

export const runtime = 'nodejs'

type SpotifyRefreshResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

async function refreshSpotifyAccessToken(refreshToken: string) {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing Spotify client ID or secret.')
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  const data = (await response.json()) as SpotifyRefreshResponse

  if (!response.ok || !data.access_token) {
    console.error('Spotify token refresh error:', data)
    throw new Error('Could not refresh Spotify access token.')
  }

  return data
}

async function searchSpotify(accessToken: string, query: string) {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  let data: any = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  return { response, data }
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)

    if (!adminUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const query = request.nextUrl.searchParams.get('q')?.trim()

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing search query.',
        },
        { status: 400 }
      )
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, access_token, refresh_token, can_edit')
      .eq('id', adminUser.id)
      .single()

    if (userError || !userData) {
      console.error('Load user error:', userError)

      return NextResponse.json(
        {
          success: false,
          error: 'Could not load user.',
        },
        { status: 500 }
      )
    }

    if (!userData.can_edit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    if (!userData.access_token && !userData.refresh_token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No Spotify token found. Log in with Spotify again.',
        },
        { status: 401 }
      )
    }

    let accessToken = userData.access_token as string

    let spotifyResult = await searchSpotify(accessToken, query)

    if (spotifyResult.response.status === 401 && userData.refresh_token) {
      const refreshed = await refreshSpotifyAccessToken(userData.refresh_token)

      accessToken = refreshed.access_token as string

      const updatePayload: {
        access_token: string
        refresh_token?: string
      } = {
        access_token: accessToken,
      }

      if (refreshed.refresh_token) {
        updatePayload.refresh_token = refreshed.refresh_token
      }

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update(updatePayload)
        .eq('id', userData.id)

      if (updateError) {
        console.error('Save refreshed token error:', updateError)
      }

      spotifyResult = await searchSpotify(accessToken, query)
    }

    if (!spotifyResult.response.ok) {
      console.error('Spotify search error:', spotifyResult.data)

      return NextResponse.json(
        {
          success: false,
          error:
            spotifyResult.data?.error?.message ||
            'Spotify search failed. Try logging in again.',
        },
        { status: spotifyResult.response.status }
      )
    }

    return NextResponse.json({
      success: true,
      tracks: spotifyResult.data?.tracks?.items || [],
    })
  } catch (error) {
    console.error('Spotify search route crash:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong while searching Spotify.',
      },
      { status: 500 }
    )
  }
}