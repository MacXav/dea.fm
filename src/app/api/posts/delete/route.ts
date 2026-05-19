import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAdminUserFromRequest } from '@/lib/adminAuth'

export async function DELETE(request: NextRequest) {
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
    const { post_id } = body

    if (!post_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing post_id.',
        },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', post_id)

    if (error) {
      console.error('[server] Delete post error:', error)

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
    })
  } catch (error) {
    console.error('[server] Delete post crash:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Delete post failed.',
      },
      { status: 500 }
    )
  }
}