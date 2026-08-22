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
  sessionStorage.removeItem('admin_passcode');
  sessionStorage.removeItem('admin_authenticated');
  sessionStorage.removeItem('target_portal');
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
 * Fetches or synchronizes the user profile from the 'profiles' table.
 * Automatically aligns Dr. Arige Sumanth and Admin accounts.
 * @param {string} userId 
 */
export async function getUserProfile(userId) {
  if (!userId) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = (user?.email || '').toLowerCase().trim();

    const isDrSumanth = userEmail === 'arigesumanth@gmail.com' || userEmail === 'arigesu@ssn.edu.in';
    const isAdminUser = userEmail === 'pradeepvijay2k6@gmail.com' || userEmail === 'clutchforever999@gmail.com';

    // Fetch existing profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, department')
      .eq('id', userId)
      .maybeSingle();

    const resolvedName = isDrSumanth
      ? 'Dr. Arige Sumanth'
      : (profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Faculty Member');

    const resolvedRole = isAdminUser ? 'admin' : (profile?.role || 'teacher');
    const resolvedDept = profile?.department || 'Information Technology';

    // Upsert to ensure profile is synced
    const { data: updatedProfile, error: upsertErr } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail || profile?.email || 'faculty@ssn.edu.in',
        full_name: resolvedName,
        role: resolvedRole,
        department: resolvedDept,
        avatar_url: user?.user_metadata?.avatar_url || profile?.avatar_url || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (upsertErr) {
      console.warn('Profile upsert warning:', upsertErr.message);
      return profile || { id: userId, full_name: resolvedName, email: userEmail, role: resolvedRole, department: resolvedDept };
    }

    // Link all 6 IDC101 timetable slots to this teacher ID
    if (isDrSumanth || resolvedRole === 'teacher') {
      await supabase
        .from('timetables')
        .update({ teacher_id: userId })
        .eq('subject_id', '33333333-cccc-cccc-cccc-cccccccccccc');
    }

    return updatedProfile;
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    return null;
  }
}
