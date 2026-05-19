import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const COOKIE_NAME = 'admin_session'

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET

  if (!secret) {
    throw new Error('Missing ADMIN_SESSION_SECRET')
  }

  return secret
}

function signPayload(payload: string) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex')
}

export function createAdminSessionToken(userId: string) {
  const payload = JSON.stringify({
    userId,
    createdAt: Date.now(),
  })

  const encodedPayload = Buffer.from(payload).toString('base64url')
  const signature = signPayload(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export async function getAdminUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) return null

  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) return null

  const expectedSignature = signPayload(encodedPayload)

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return null
  }

  let parsed: { userId?: string; createdAt?: number }

  try {
    parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString())
  } catch {
    return null
  }

  if (!parsed.userId || !parsed.createdAt) return null

  const maxAgeMs = 1000 * 60 * 60 * 24 * 30
  const expired = Date.now() - parsed.createdAt > maxAgeMs

  if (expired) return null

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, spotify_id, display_name, email, avatar_url, can_edit')
    .eq('id', parsed.userId)
    .single()

  if (error || !data?.can_edit) return null

  return data
}

export const adminSessionCookieName = COOKIE_NAME