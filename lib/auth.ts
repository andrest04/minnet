import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// Type mappings for backward compatibility
type LegacyUserType = 'poblador' | 'empresa' | 'admin'
type NewUserType = 'resident' | 'company' | 'administrator'

const LEGACY_TO_NEW_MAP: Record<LegacyUserType, NewUserType> = {
  poblador: 'resident',
  empresa: 'company',
  admin: 'administrator',
}


const NEW_TYPE_TO_ROUTE: Record<NewUserType, string> = {
  resident: '/poblador',
  company: '/empresa',
  administrator: '/admin',
}

/**
 * Require authentication for server components
 * Redirects to /login if user is not authenticated
 * @returns Authenticated user object
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

/**
 * Get current authenticated user (optional - doesn't redirect)
 * @returns User object or null
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Verify user has specific role (supports both legacy and new user types)
 * @param user - Authenticated user
 * @param userType - Required user type (accepts both 'poblador' and 'resident' etc.)
 * @returns boolean
 */
export async function hasUserType(
  user: User,
  userType: LegacyUserType | NewUserType
): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single<{ user_type: NewUserType }>()

  if (!profile) return false

  // Convert legacy type to new type if needed
  const normalizedUserType = userType in LEGACY_TO_NEW_MAP
    ? LEGACY_TO_NEW_MAP[userType as LegacyUserType]
    : userType

  return profile.user_type === normalizedUserType
}

/**
 * Require specific user type - redirects if not matching
 * @param userType - Required user type (accepts both legacy and new types)
 * @returns User object
 */
export async function requireUserType(
  userType: LegacyUserType | NewUserType
): Promise<User> {
  const user = await requireAuth()
  const hasCorrectType = await hasUserType(user, userType)

  if (!hasCorrectType) {
    // Redirect to appropriate dashboard based on actual user type
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single<{ user_type: NewUserType }>()

    const actualType = profile?.user_type

    if (actualType && actualType in NEW_TYPE_TO_ROUTE) {
      redirect(NEW_TYPE_TO_ROUTE[actualType])
    } else {
      redirect('/login')
    }
  }

  return user
}

/**
 * Get user's profile type
 * @param user - Authenticated user
 * @returns User type (new format: 'resident', 'company', 'administrator')
 */
export async function getUserType(user: User): Promise<NewUserType | null> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single<{ user_type: NewUserType }>()

  return profile?.user_type || null
}

/**
 * Sign out user and redirect to login
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
