import { supabase } from '../config/supabase';

/**
 * Initiates Google OAuth Sign-In flow
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google Sign-in Error:', error.message);
    throw error;
  }

  return data;
}

/**
 * Signs out the currently authenticated user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign Out Error:', error.message);
    throw error;
  }
}

/**
 * Gets the current authenticated user session
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get Session Error:', error.message);
    return null;
  }
  return session;
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
}

/**
 * Fetches the user profile from the 'profiles' table
 * @param {string} userId 
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('Profile fetch warning (may not exist yet):', error.message);
    return null;
  }

  return data;
}
