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
      post_id,
      genre,
      year,
      caption,
      mood_tags,
    } = body

    if (!post_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing post_id.',
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({
        genre: genre || '',
        year: year || null,
        caption: caption || '',
        mood_tags: Array.isArray(mood_tags) ? mood_tags : [],
      })
      .eq('id', post_id)
      .select()
      .single()

    if (error) {
      console.error('[server] Update post error:', error)

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
      post: data,
    })
  } catch (error) {
    console.error('[server] Update post crash:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Update post failed.',
      },
      { status: 500 }
    )
  }
}