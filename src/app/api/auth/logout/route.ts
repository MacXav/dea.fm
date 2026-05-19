import { NextResponse } from 'next/server'
import { adminSessionCookieName } from '@/lib/adminAuth'

export async function POST() {
  const response = NextResponse.json({
    success: true,
  })

  response.cookies.set('user_id', '', {
    path: '/',
    maxAge: 0,
  })

  response.cookies.set(adminSessionCookieName, '', {
    path: '/',
    maxAge: 0,
  })

  return response
}