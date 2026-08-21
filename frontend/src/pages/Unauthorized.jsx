import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const handleGoHome = () => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'student') navigate('/student');
    else navigate('/teacher');
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#e53e3e', marginBottom: '0.5rem' }}>403</h1>
        <h2 style={{ fontSize: '1.4rem', color: '#2d3748', marginBottom: '1rem' }}>Access Restricted</h2>
        <p style={{ color: '#718096', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          You do not have the required permissions to access this page.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button className="primary-action-btn" onClick={handleGoHome}>
            Go to Your Dashboard
          </button>
          <button className="secondary-action-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
