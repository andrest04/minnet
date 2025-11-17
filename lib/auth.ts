import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

// Standardized user types
type UserType = 'resident' | 'company' | 'administrator'

// Route mappings for each user type
const USER_TYPE_TO_ROUTE: Record<UserType, string> = {
  resident: '/resident',
  company: '/company',
  administrator: '/administrator',
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
 * Verify user has specific role
 * @param user - Authenticated user
 * @param userType - Required user type ('resident', 'company', or 'administrator')
 * @returns boolean
 */
export async function hasUserType(
  user: User,
  userType: UserType
): Promise<boolean> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single<{ user_type: UserType }>()

  if (!profile) return false

  return profile.user_type === userType
}

/**
 * Require specific user type - redirects if not matching
 * @param userType - Required user type ('resident', 'company', or 'administrator')
 * @returns User object
 */
export async function requireUserType(
  userType: UserType
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
      .single<{ user_type: UserType }>()

    const actualType = profile?.user_type

    if (actualType && actualType in USER_TYPE_TO_ROUTE) {
      redirect(USER_TYPE_TO_ROUTE[actualType])
    } else {
      redirect('/login')
    }
  }

  return user
}

/**
 * Get user's profile type
 * @param user - Authenticated user
 * @returns User type ('resident', 'company', or 'administrator')
 */
export async function getUserType(user: User): Promise<UserType | null> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single<{ user_type: UserType }>()

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
