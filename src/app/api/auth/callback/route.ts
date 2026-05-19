import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(`${origin}/feed?error=spotify_denied`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/feed?error=missing_code`)
  }

  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ||
    `${origin}/api/auth/callback`

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Spotify token error:', tokenData)
      return NextResponse.redirect(`${origin}/feed?error=spotify_token_failed`)
    }

    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const spotifyProfile = await profileResponse.json()

    if (!profileResponse.ok) {
      console.error('Spotify profile error:', spotifyProfile)
      return NextResponse.redirect(`${origin}/feed?error=spotify_profile_failed`)
    }

    const spotifyId = spotifyProfile.id
    const email = spotifyProfile.email || ''
    const displayName = spotifyProfile.display_name || spotifyId
    const avatarUrl = spotifyProfile.images?.[0]?.url || null

    const canEdit =
      email.toLowerCase() === 'dea.gouel5@gmail.com' ||
      spotifyId === 'dea.gouel5'

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          spotify_id: spotifyId,
          email,
          display_name: displayName,
          avatar_url: avatarUrl,
          can_edit: canEdit,
          spotify_access_token: tokenData.access_token,
          spotify_refresh_token: tokenData.refresh_token || null,
          spotify_token_expires_at: new Date(
            Date.now() + tokenData.expires_in * 1000
          ).toISOString(),
        },
        {
          onConflict: 'spotify_id',
        }
      )
      .select()
      .single()

    if (userError) {
      console.error('User upsert error:', userError)
      return NextResponse.redirect(`${origin}/feed?error=user_save_failed`)
    }

    const response = NextResponse.redirect(`${origin}/feed`)

    response.cookies.set('user_id', user.id, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    response.cookies.set('spotify_id', spotifyId, {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    response.cookies.set('can_edit', String(canEdit), {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })

    return response
  } catch (error) {
    console.error('Spotify callback crash:', error)
    return NextResponse.redirect(`${origin}/feed?error=spotify_callback_failed`)
  }
}