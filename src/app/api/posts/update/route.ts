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
          error: 'Unauthorized.',
        },
        { status: 401 }
      )
    }

    const {
      post_id,
      genre,
      year,
      caption,
      mood_tags,
      image_url,
    } = await request.json()

    if (!post_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing post_id.',
        },
        { status: 400 }
      )
    }

    const cleanImageUrl = image_url || null

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({
        genre: genre || '',
        year: year || null,
        caption: caption || '',
        mood_tags: Array.isArray(mood_tags) ? mood_tags : [],
        image_url: cleanImageUrl,
        uploaded_image_url: cleanImageUrl,
        post_image_url: cleanImageUrl,
      })
      .eq('id', post_id)
      .select()
      .single()

    if (error) {
      console.error('[posts update] Supabase error:', error)

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
    console.error('[posts update] Unexpected error:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong while updating the post.',
      },
      { status: 500 }
    )
  }
}