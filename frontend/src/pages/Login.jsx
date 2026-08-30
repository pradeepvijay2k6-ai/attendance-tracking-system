import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import DownloadAppModal, { detectUserOS, isRunningAsApp } from '../components/DownloadAppModal';

const ALLOWED_ADMIN_EMAILS = [
  'pradeepvijay2k6@gmail.com',
  'clutchforever999@gmail.com'
];

export default function Login() {
  const { loginWithGoogle, user, role, loading: authLoading } = useAuth();
  const [adminPasskey, setAdminPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const userOS = detectUserOS();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLogin = location.pathname.includes('/admin') || new URLSearchParams(location.search).get('portal') === 'admin';

  useEffect(() => {
    if (!authLoading && user) {
      const storedPasskey = sessionStorage.getItem('admin_passcode');
      const targetPortal = sessionStorage.getItem('target_portal');
      const userEmail = (user.email || '').toLowerCase().trim();
      const isAllowedAdmin = ALLOWED_ADMIN_EMAILS.includes(userEmail) || role === 'admin';

      if ((isAdminLogin || targetPortal === 'admin') && storedPasskey === 'IT@123' && isAllowedAdmin) {
        navigate('/admin', { replace: true });
      } else if (!isAdminLogin) {
        if (role === 'student') navigate('/student', { replace: true });
        else navigate('/teacher', { replace: true });
      } else if (isAdminLogin && !isAllowedAdmin) {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, role, authLoading, navigate, location, isAdminLogin]);

  const handleTeacherLogin = async () => {
    try {
      setLoading(true);
      setError('');
      sessionStorage.removeItem('admin_passcode');
      sessionStorage.setItem('target_portal', 'teacher');
      await loginWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to initiate Google Sign-in. Please try again.');
      setLoading(false);
    }
  };

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setError(`Security lockout active. Please wait ${lockoutTimer}s before retrying.`);
      return;
    }

    if (!adminPasskey.trim()) {
      setError('Please enter the Admin Passkey.');
      return;
    }

    if (adminPasskey.trim() !== 'IT@123') {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        setLockoutTimer(30);
        setError('Too many failed attempts. Security lockout enabled for 30 seconds.');
      } else {
        setError(`Invalid Admin Passkey. ${5 - nextAttempts} attempt(s) remaining.`);
      }
      return;
    }

    try {
      setLoading(true);
      setError('');
      setFailedAttempts(0);
      sessionStorage.setItem('admin_passcode', 'IT@123');
      sessionStorage.setItem('target_portal', 'admin');
      sessionStorage.setItem('admin_authenticated', 'true');
      await loginWithGoogle();
    } catch (err) {
      console.error('Admin OAuth error:', err);
      setError(err.message || 'Failed to initiate Google Sign-in.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Portal Switcher Tabs */}
        <div className="portal-tabs">
          <Link
            to="/login/teacher"
            className={`portal-tab-btn ${!isAdminLogin ? 'active' : ''}`}
          >
            Faculty Portal
          </Link>
          <Link
            to="/login/admin"
            className={`portal-tab-btn ${isAdminLogin ? 'active admin' : ''}`}
          >
            Administrator
          </Link>
        </div>

        {/* Portal Header */}
        <div className="auth-header">
          {isAdminLogin ? (
            <>
              <div className="auth-badge admin-badge">Institutional Administration</div>
              <h1 className="auth-title">Admin Master Sign In</h1>
              <p className="auth-subtitle">
                Enter the administration passkey and authenticate with your institutional Google account.
              </p>
            </>
          ) : (
            <>
              <div className="auth-badge">Faculty Portal</div>
              <h1 className="auth-title">Teacher Sign In</h1>
              <p className="auth-subtitle">
                Sign in with your institutional Google account to mark attendance and manage course schedules.
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="auth-error-banner">
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form: Passkey + Google OAuth */}
        {isAdminLogin ? (
          <form onSubmit={handleAdminLogin} className="auth-actions">
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: '600', color: '#334155' }}>
                Admin Passkey
              </label>
              <input
                type="password"
                required
                placeholder="Enter passkey..."
                value={adminPasskey}
                onChange={(e) => setAdminPasskey(e.target.value)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.98rem',
                  outline: 'none'
                }}
              />
              <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>
                Requires passkey verification and Google authentication.
              </small>
            </div>

            <button
              type="submit"
              className="google-btn"
              disabled={loading || authLoading}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                marginTop: '6px'
              }}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Authenticating...' : 'Sign In with Google (Admin)'}</span>
            </button>
          </form>
        ) : (
          /* Teacher Login Form */
          <div className="auth-actions">
            <button
              type="button"
              className="google-btn"
              onClick={handleTeacherLogin}
              disabled={loading || authLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>
          </div>
        )}

        <div className="auth-footer">
          <p>
            {isAdminLogin ? (
              <Link to="/login/teacher" style={{ color: '#2563eb', fontWeight: '500', textDecoration: 'none' }}>
                Go to Teacher Sign In
              </Link>
            ) : (
              <Link to="/login/admin" style={{ color: '#475569', fontWeight: '500', textDecoration: 'none' }}>
                Administrator Sign In
              </Link>
            )}
          </p>

          {!isRunningAsApp() && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setShowDownloadModal(true)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download App for {userOS.name}</span>
              </button>
            </div>
          )}

          <div className="role-tags" style={{ marginTop: '14px' }}>
            <span className="role-tag">SSN College of Engineering</span>
            <span className="role-tag">Department of IT</span>
          </div>
        </div>
      </div>

      <DownloadAppModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
    </div>
  );
}
