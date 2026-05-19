import { supabase } from '@/lib/supabase'

export interface CurrentUser {
  id: string
  spotify_id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  can_edit: boolean
  bio?: string | null
  profile_title?: string | null
  featured_post_id?: string | null
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = document.cookie
    .split('; ')
    .find((row) => row.startsWith('user_id='))
    ?.split('=')[1]

  if (!userId) return null

  const { data, error } = await supabase
    .from('users')
    .select(
      'id, spotify_id, display_name, email, avatar_url, can_edit, bio, profile_title, featured_post_id'
    )
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Could not get current user:', error)
    return null
  }

  return data
}