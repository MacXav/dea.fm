import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAdminUserFromRequest } from '@/lib/adminAuth'

export async function PATCH(request: NextRequest) {
  try {
    const adminUser = await getAdminUserFromRequest(request)

    if (!adminUser?.can_edit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const body = await request.json()

    const {
      spotify_id,
      display_name,
      avatar_url,
      song_of_day_post_id,
    } = body

    if (!spotify_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing spotify_id.',
        },
        { status: 400 }
      )
    }

    const updates: {
      display_name?: string
      avatar_url?: string | null
      song_of_day_post_id?: string | null
    } = {}

    if (display_name !== undefined) {
      if (!String(display_name).trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Display name is required.',
          },
          { status: 400 }
        )
      }

      updates.display_name = String(display_name).trim()
    }

    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url ? String(avatar_url).trim() : null
    }

    if (song_of_day_post_id !== undefined) {
      updates.song_of_day_post_id = song_of_day_post_id || null
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('spotify_id', spotify_id)
      .select(
        'id, spotify_id, display_name, email, avatar_url, can_edit, song_of_day_post_id'
      )
      .single()

    if (error) {
      console.error('[server] Update profile error:', error)

      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: data,
    })
  } catch (error) {
    console.error('[server] Update profile crash:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Update profile failed.',
      },
      { status: 500 }
    )
  }
}