import { supabase } from '../config/supabase';

/**
 * Initiates Google OAuth Sign-In flow
 */
export async function signInWithGoogle() {
  // For installed apps (WebAPK/PWA/Electron), use the canonical deployed URL
  // so OAuth redirect always succeeds regardless of local file:// or localhost
  const isInstalledApp = (
    window.location.protocol === 'file:' ||
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.desktopApi?.isDesktop
  );

  const PRODUCTION_URL = 'https://pradeepvijay2k6-ai.github.io/attendance-tracking-system';
  const redirectBase = isInstalledApp
    ? PRODUCTION_URL
    : window.location.origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${redirectBase}/auth/callback`,
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

    // Fetch existing profile by userId
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, avatar_url, department')
      .eq('id', userId)
      .maybeSingle();

    // Check if a pre-seeded profile exists for this email
    const { data: matchedProfile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, department')
      .ilike('email', userEmail)
      .maybeSingle();

    const preSeededId = matchedProfile?.id;
    const resolvedName = matchedProfile?.full_name || profile?.full_name || user?.user_metadata?.full_name || userEmail.split('@')[0];
    const resolvedRole = isAdminUser ? 'admin' : (matchedProfile?.role || profile?.role || 'teacher');
    const resolvedDept = matchedProfile?.department || profile?.department || 'Information Technology';

    // Upsert to ensure profile is synced to this authenticated userId
    const { data: updatedProfile, error: upsertErr } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
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
    }

    // Link any timetables assigned to the pre-seeded profile ID to the authenticated user ID
    if (preSeededId && preSeededId !== userId) {
      await supabase
        .from('timetables')
        .update({ teacher_id: userId })
        .eq('teacher_id', preSeededId);
    }

    // Also link Dr. Arige Sumanth if logging in from either arigesumanth@gmail.com or ariges@ssn.edu.in
    if (isDrSumanth) {
      const { data: sub } = await supabase.from('subjects').select('id').eq('code', 'UIT3302').maybeSingle();
      if (sub) {
        await supabase
          .from('timetables')
          .update({ teacher_id: userId })
          .eq('subject_id', sub.id);
      }
    }

    return updatedProfile || { id: userId, full_name: resolvedName, email: userEmail, role: resolvedRole, department: resolvedDept };
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    return null;
  }
}
