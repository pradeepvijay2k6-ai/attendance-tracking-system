import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { getExtraClassesApi } from '../services/api';

export default function StudentDashboard() {
  const { user, profile, logout } = useAuth();
  const [extraClasses, setExtraClasses] = useState([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ date: new Date().toISOString().split('T')[0], period: 1, reason: '' });

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Student';
  const displayEmail = user?.email;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const totalConducted = 12;
  const attended = 10;
  const percentage = ((attended / totalConducted) * 100).toFixed(1);
  const isShortage = parseFloat(percentage) < 75.0;

  useEffect(() => {
    async function loadNotices() {
      try {
        const res = await getExtraClassesApi();
        setExtraClasses(res.extra_classes || []);
      } catch (err) {
        console.warn('Could not load notices:', err);
      }
    }
    loadNotices();
  }, []);

  const handleRegSubmit = (e) => {
    e.preventDefault();
    alert(`Regularization request submitted for ${regForm.date} (Period ${regForm.period}).`);
    setShowRegModal(false);
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-left">
          <h2>Student Portal</h2>
          <span className="badge role-student">B.Tech IT - 2025 Batch</span>
        </div>
        <div className="header-right">
          {avatarUrl && <img src={avatarUrl} alt="Avatar" className="user-avatar" />}
          <div className="user-info">
            <strong>{displayName}</strong>
            <small>{displayEmail}</small>
          </div>
          <button onClick={logout} className="logout-btn">Sign Out</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-banner">
          <h3>Welcome, {displayName}</h3>
          <p>Track your subject-wise attendance percentage, scheduled classes, and exam eligibility in real-time.</p>
        </div>

        {/* Shortage Alert Banner if <75% */}
        {isShortage ? (
          <div className="feedback-alert error" style={{ margin: '0 0 24px 0' }}>
            <span><strong>Attendance Notice:</strong> Your current attendance ({percentage}%) is below the mandatory 75% threshold. Please attend upcoming classes to meet eligibility criteria.</span>
          </div>
        ) : (
          <div className="feedback-alert success" style={{ margin: '0 0 24px 0' }}>
            <span><strong>Good Standing:</strong> Your current attendance ({percentage}%) meets institutional eligibility requirements.</span>
          </div>
        )}

        {/* Subject Cards Grid */}
        <div className="grid-cards" style={{ marginBottom: '28px' }}>
          <div className="feature-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="period-badge">IDC101</span>
              <span className="badge" style={{ background: isShortage ? '#fee2e2' : '#dcfce7', color: isShortage ? '#b91c1c' : '#15803d', fontWeight: 'bold' }}>
                {percentage}%
              </span>
            </div>
            <h4>Introduction to Digital Communications</h4>
            <p>Faculty: Dr. Arige Sumanth • Attended: {attended} of {totalConducted} classes</p>
            <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
              <button className="secondary-action-btn" style={{ width: '100%' }} onClick={() => setShowRegModal(true)}>
                Request Regularization
              </button>
            </div>
          </div>

          <div className="feature-card">
            <h4>Recovery Margin Calculator</h4>
            <p>
              {isShortage
                ? `Attend the next ${Math.ceil((0.75 * totalConducted - attended) / (1 - 0.75))} consecutive classes to reach 75%.`
                : `You can miss up to ${Math.floor((attended - 0.75 * totalConducted) / 0.75)} classes while maintaining 75%.`}
            </p>
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', color: '#475569' }}>
              <strong>Minimum required:</strong> 75.0% for end-semester examinations.
            </div>
          </div>

          <div className="feature-card">
            <h4>Scheduled Extra Classes ({extraClasses.length})</h4>
            {extraClasses.length === 0 ? (
              <p>No extra classes scheduled this week.</p>
            ) : (
              <ul style={{ paddingLeft: '18px', fontSize: '0.88rem', color: '#334155' }}>
                {extraClasses.slice(0, 2).map((ex) => (
                  <li key={ex.id} style={{ marginBottom: '4px' }}>
                    <strong>{ex.subjects?.name}</strong>: {ex.class_date} ({ex.start_time} - {ex.end_time})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {/* Regularization Modal */}
      {showRegModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Submit Regularization Request</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>
              Submit an attendance review request to your faculty for verified On-Duty (OD) or attendance corrections.
            </p>
            <form onSubmit={handleRegSubmit}>
              <div className="form-group">
                <label>Date of Class</label>
                <input required type="date" value={regForm.date} onChange={(e) => setRegForm({ ...regForm, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Period Number</label>
                <select value={regForm.period} onChange={(e) => setRegForm({ ...regForm, period: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Reason / On-Duty Details</label>
                <textarea required rows="3" value={regForm.reason} onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })} placeholder="State the reason or approved OD details..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowRegModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
