import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import {
  adminSessionCookieName,
  createAdminSessionToken,
} from '@/lib/adminAuth'

async function readResponseSafely(response: Response) {
  const text = await response.text()

  try {
    return {
      data: JSON.parse(text),
      rawText: text,
    }
  } catch {
    return {
      data: null,
      rawText: text,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing Spotify environment variables. Check CLIENT_ID, CLIENT_SECRET, and REDIRECT_URI.',
        },
        { status: 500 }
      )
    }

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error: 'No Spotify authorization code provided.',
        },
        { status: 400 }
      )
    }

    const adminSpotifyIds = process.env.ADMIN_SPOTIFY_IDS
      ? process.env.ADMIN_SPOTIFY_IDS.split(',').map((id) => id.trim())
      : []

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenBody,
    })

    const tokenResult = await readResponseSafely(tokenRes)
    const tokenData = tokenResult.data

    if (!tokenRes.ok || !tokenData) {
      console.error('Spotify token error:', tokenResult.rawText)

      return NextResponse.json(
        {
          success: false,
          error:
            tokenData?.error_description ||
            tokenData?.error ||
            tokenResult.rawText ||
            'Spotify token exchange failed.',
        },
        { status: tokenRes.status || 500 }
      )
    }

    const userRes = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userResult = await readResponseSafely(userRes)
    const spotifyUser = userResult.data

    if (!userRes.ok || !spotifyUser) {
      console.error('Spotify profile error:', userResult.rawText)

      return NextResponse.json(
        {
          success: false,
          error:
            userResult.rawText ||
            spotifyUser?.error?.message ||
            'Could not read Spotify profile.',
          not_allowed: true,
        },
        { status: userRes.status || 403 }
      )
    }

    console.log('Spotify ID:', spotifyUser.id)

    const canEdit = adminSpotifyIds.includes(spotifyUser.id)

    if (!canEdit) {
      return NextResponse.json(
        {
          success: false,
          not_allowed: true,
          error:
            'This Spotify account is not allowed to make edits on dea.fm. You can still view the site without logging in.',
          spotify_id: spotifyUser.id,
          display_name: spotifyUser.display_name,
        },
        { status: 403 }
      )
    }

    const avatarUrl =
      spotifyUser.images && spotifyUser.images.length > 0
        ? spotifyUser.images[0].url
        : null

    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          spotify_id: spotifyUser.id,
          display_name: spotifyUser.display_name,
          email: spotifyUser.email,
          avatar_url: avatarUrl,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          can_edit: true,
        },
        { onConflict: 'spotify_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Supabase user upsert error:', error)

      return NextResponse.json(
        {
          success: false,
          error,
        },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user_id: userData.id,
      access_token: tokenData.access_token,
      can_edit: userData.can_edit,
    })

    response.cookies.set('user_id', userData.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    const adminToken = createAdminSessionToken(userData.id)

    response.cookies.set(adminSessionCookieName, adminToken, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch (err) {
    console.error('Spotify callback crash:', err)

    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong while connecting Spotify.',
      },
      { status: 500 }
    )
  }
}