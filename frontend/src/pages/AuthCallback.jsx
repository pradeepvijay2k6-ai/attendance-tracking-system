import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [statusText, setStatusText] = useState('Completing Google Sign-In...');
  const [errorMessage, setErrorMessage] = useState('');
  const [dots, setDots] = useState('');

  // Animated dots for loading indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function handleOAuthCallback() {
      try {
        // Parse both query params and hash params
        const params = new URLSearchParams(window.location.search);
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        // Check for OAuth errors
        const oauthError = params.get('error_description') || params.get('error') ||
                           hashParams.get('error_description') || hashParams.get('error');

        if (oauthError) {
          throw new Error(decodeURIComponent(oauthError));
        }

        setStatusText('Verifying your Google account');

        // Supabase handles the hash token automatically via onAuthStateChange,
        // but we also try getSession() with a short retry loop to be safe
        let session = null;
        let attempts = 0;

        while (!session && attempts < 8) {
          const { data: { session: s }, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (s?.user) {
            session = s;
            break;
          }
          attempts++;
          await new Promise(r => setTimeout(r, 600));
        }

        if (!session?.user) {
          // Final fallback: try getUser directly
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            throw new Error('Session not found after Google Sign-In. Please try again.');
          }
        }

        if (isCancelled) return;
        setStatusText('Loading your profile');

        const profile = await refreshProfile();
        const role = profile?.role || session?.user?.user_metadata?.role || 'teacher';

        if (isCancelled) return;
        setStatusText('Redirecting to your dashboard');

        const targetPortal = sessionStorage.getItem('target_portal');
        sessionStorage.removeItem('target_portal');

        await new Promise(r => setTimeout(r, 400));

        if (targetPortal === 'admin' || role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'student') {
          navigate('/student', { replace: true });
        } else {
          navigate('/teacher', { replace: true });
        }
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        if (!isCancelled) {
          setErrorMessage(err.message || 'Failed to complete sign-in. Please try again.');
        }
      }
    }

    handleOAuthCallback();

    return () => {
      isCancelled = true;
    };
  }, [navigate, refreshProfile]);

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
  };

  if (errorMessage) {
    return (
      <div style={containerStyle}>
        <div style={{
          background: '#1e293b',
          borderRadius: '20px',
          padding: '40px 32px',
          maxWidth: '420px',
          width: '100%',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#f87171', fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px' }}>
            Sign-In Failed
          </h2>
          <p style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '0.88rem',
            lineHeight: '1.6',
            textAlign: 'left',
          }}>
            {errorMessage}
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 28px',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{
        background: '#1e293b',
        borderRadius: '20px',
        padding: '48px 36px',
        maxWidth: '380px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        textAlign: 'center',
      }}>
        {/* Animated spinner */}
        <div style={{
          width: '56px',
          height: '56px',
          border: '4px solid rgba(56,189,248,0.15)',
          borderTop: '4px solid #38bdf8',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
          margin: '0 auto 24px auto',
        }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* SSN Logo text */}
        <div style={{ fontSize: '0.75rem', letterSpacing: '2px', color: '#38bdf8', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
          SSN IT Attendance
        </div>

        <h2 style={{ color: '#f1f5f9', fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>
          Signing You In
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', minHeight: '20px' }}>
          {statusText}{dots}
        </p>

        {/* Progress steps */}
        <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
          {[
            { label: 'Google authentication', done: statusText.includes('profile') || statusText.includes('dashboard') },
            { label: 'Loading user profile', done: statusText.includes('dashboard') },
            { label: 'Redirecting to dashboard', done: false },
          ].map(({ label, done }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%',
                background: done ? '#10b981' : 'rgba(56,189,248,0.2)',
                border: done ? 'none' : '2px solid rgba(56,189,248,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontSize: '10px', color: '#fff',
              }}>
                {done ? '✓' : ''}
              </div>
              <span style={{ color: done ? '#34d399' : '#94a3b8' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
