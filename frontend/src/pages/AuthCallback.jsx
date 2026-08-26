import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [statusText, setStatusText] = useState('Verifying your Google authentication...');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function handleOAuthCallback() {
      try {
        // 1. Check URL parameters for errors returned directly from OAuth provider
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const oauthError = params.get('error_description') || params.get('error') ||
                           hashParams.get('error_description') || hashParams.get('error');

        if (oauthError) {
          throw new Error(decodeURIComponent(oauthError));
        }

        setStatusText('Retrieving session from Supabase...');

        // Retry loop: Supabase processes the hash token asynchronously
        let session = null;
        let attempts = 0;
        while (!session && attempts < 8) {
          const { data: { session: s }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (s?.user) { session = s; break; }
          attempts++;
          await new Promise(r => setTimeout(r, 500));
        }

        if (!session?.user) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            throw new Error('Authentication session not found. Please try logging in again.');
          }
        }

        setStatusText('Loading user profile and permissions...');
        const profile = await refreshProfile();

        // Determine user role
        const role = profile?.role || session?.user?.user_metadata?.role || 'teacher';

        if (isCancelled) return;

        setStatusText('Redirecting to your portal...');

        const targetPortal = sessionStorage.getItem('target_portal');
        sessionStorage.removeItem('target_portal');

        // Route to the respective dashboard
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
          setErrorMessage(err.message || 'Failed to complete sign-in.');
        }
      }
    }

    handleOAuthCallback();

    return () => {
      isCancelled = true;
    };
  }, [navigate, refreshProfile]);

  if (errorMessage) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Authentication Failed</h2>
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '1.5rem',
            textAlign: 'left',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            {errorMessage}
          </div>
          <button
            type="button"
            className="google-btn"
            style={{ justifyContent: 'center' }}
            onClick={() => navigate('/login', { replace: true })}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
        <h2 style={{ fontSize: '1.25rem', color: '#1a202c', marginBottom: '8px' }}>Signing You In</h2>
        <p style={{ color: '#718096', fontSize: '0.95rem' }}>{statusText}</p>
      </div>
    </div>
  );
}
