const supabase = require('../config/supabase');

/**
 * Authentication middleware that verifies Supabase JWT token and role permissions
 * @param {Array<string>} allowedRoles Optional list of roles permitted to access the route
 */
const requireAuth = (allowedRoles = []) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token missing or invalid. Format should be: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token',
        error: authError?.message
      });
    }

    // Retrieve user's role from public.profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, department')
      .eq('id', user.id)
      .single();

    const userRole = profile?.role || user.user_metadata?.role || 'teacher';

    // Role-based access control check
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: [${allowedRoles.join(', ')}]. Your role is '${userRole}'`
      });
    }

    // Attach validated user and profile to the request object
    req.user = {
      id: user.id,
      email: user.email,
      role: userRole,
      full_name: profile?.full_name || user.user_metadata?.full_name,
      department: profile?.department,
      profile
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication server error'
    });
  }
};

module.exports = { requireAuth };
