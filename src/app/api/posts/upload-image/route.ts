import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getAdminUserFromRequest } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
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

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: 'No image file provided.',
        },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'File must be an image.',
        },
        { status: 400 }
      )
    }

    const maxSizeInMB = 5
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024

    if (file.size > maxSizeInBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `Image must be smaller than ${maxSizeInMB}MB.`,
        },
        { status: 400 }
      )
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${adminUser.id}-${Date.now()}.${fileExt}`
    const filePath = `${adminUser.id}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from('post-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Image upload error:', uploadError)

      return NextResponse.json(
        {
          success: false,
          error: 'Could not upload image.',
        },
        { status: 500 }
      )
    }

    const { data } = supabaseAdmin.storage
      .from('post-images')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      image_url: data.publicUrl,
    })
  } catch (error) {
    console.error('Image upload crash:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Image upload failed.',
      },
      { status: 500 }
    )
  }
}