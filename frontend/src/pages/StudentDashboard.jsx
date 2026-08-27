import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { getExtraClassesApi, getStudentTimetableApi } from '../services/api';

const DAY_ABBR = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

export default function StudentDashboard() {
  const { user, profile, logout } = useAuth();

  const [extraClasses, setExtraClasses]   = useState([]);
  const [subjects,     setSubjects]       = useState([]);
  const [timetable,    setTimetable]      = useState([]);
  const [studentInfo,  setStudentInfo]    = useState(null);
  const [loading,      setLoading]        = useState(true);
  const [showRegModal, setShowRegModal]   = useState(false);
  const [regForm,      setRegForm]        = useState({
    date: new Date().toISOString().split('T')[0],
    period: 1,
    reason: ''
  });

  const displayName  = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Student';
  const displayEmail = user?.email;
  const avatarUrl    = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // ── Load timetable + attendance data ────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ttRes, ecRes] = await Promise.all([
          getStudentTimetableApi(),
          getExtraClassesApi()
        ]);

        if (ttRes?.subjects?.length > 0) setSubjects(ttRes.subjects);
        if (ttRes?.timetable?.length > 0) setTimetable(ttRes.timetable);
        if (ttRes?.student)               setStudentInfo(ttRes.student);
        setExtraClasses(ecRes?.extra_classes || []);
      } catch (err) {
        console.warn('Could not load student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Aggregate totals across all subjects
  const totalConducted = subjects.reduce((sum, s) => sum + (s.total_conducted || 0), 0);
  const totalAttended  = subjects.reduce((sum, s) => sum + (s.total_attended  || 0), 0);
  const overallPct     = totalConducted > 0
    ? parseFloat(((totalAttended / totalConducted) * 100).toFixed(1))
    : 100.0;
  const isShortage     = overallPct < 75.0 && totalConducted > 0;

  const handleRegSubmit = (e) => {
    e.preventDefault();
    alert(`Regularization request submitted for ${regForm.date} (Period ${regForm.period}).`);
    setShowRegModal(false);
  };

  // Group timetable by day for display
  const timetableByDay = timetable.reduce((acc, slot) => {
    const day = slot.day_name || `Day ${slot.day_of_week}`;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});
  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    .filter(d => timetableByDay[d]);

  return (
    <div className="dashboard-layout">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-left">
          <h2>Student Portal</h2>
          <span className="badge role-student">
            {studentInfo
              ? `${subjects[0]?.class_name || 'B.Tech IT'} · ${subjects[0]?.section_name || ''}`
              : 'B.Tech IT - 2025 Batch'}
          </span>
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
        {/* ── Welcome Banner ───────────────────────────────────────────────── */}
        <div className="welcome-banner">
          <h3>Welcome, {studentInfo?.full_name || displayName}</h3>
          <p>Track your subject-wise attendance percentage, scheduled classes, and exam eligibility in real-time.</p>
          {studentInfo && (
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              Roll No: <strong>{studentInfo.roll_no}</strong> &nbsp;|&nbsp;
              Reg No: <strong>{studentInfo.register_no}</strong>
            </p>
          )}
        </div>

        {/* ── Overall Attendance Alert ─────────────────────────────────────── */}
        {!loading && (
          isShortage ? (
            <div className="feedback-alert error" style={{ margin: '0 0 24px 0' }}>
              <span>
                <strong>Attendance Notice:</strong> Your overall attendance ({overallPct}%) is below the
                mandatory 75% threshold. Please attend upcoming classes to meet eligibility criteria.
              </span>
            </div>
          ) : (
            <div className="feedback-alert success" style={{ margin: '0 0 24px 0' }}>
              <span>
                <strong>Good Standing:</strong> Your overall attendance ({overallPct}%) meets institutional
                eligibility requirements.
              </span>
            </div>
          )
        )}

        {/* ── Subject Cards ─────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading your attendance data…</div>
        ) : (
          <div className="grid-cards" style={{ marginBottom: '28px' }}>
            {subjects.length > 0 ? subjects.map((sub) => {
              const pct       = sub.attendance_percentage ?? 100.0;
              const shortage  = sub.is_shortage;
              const missable  = !shortage
                ? Math.floor((sub.total_attended - 0.75 * sub.total_conducted) / 0.75)
                : 0;
              const needed    = shortage
                ? Math.ceil((0.75 * sub.total_conducted - sub.total_attended) / (1 - 0.75))
                : 0;

              return (
                <div className="feature-card" key={sub.subject_id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="period-badge">{sub.subject_code}</span>
                    <span
                      className="badge"
                      style={{
                        background: shortage ? '#fee2e2' : '#dcfce7',
                        color: shortage ? '#b91c1c' : '#15803d',
                        fontWeight: 'bold'
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <h4>{sub.subject_name}</h4>
                  <p>Faculty: {sub.teacher_name} &bull; Attended: {sub.total_attended} of {sub.total_conducted} classes</p>

                  {/* Progress bar */}
                  <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '6px', margin: '8px 0' }}>
                    <div
                      style={{
                        background: shortage ? '#ef4444' : '#22c55e',
                        width: `${Math.min(pct, 100)}%`,
                        height: '100%',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  {sub.total_conducted > 0 && (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 8px' }}>
                      {shortage
                        ? `⚠ Attend next ${needed} class${needed !== 1 ? 'es' : ''} to reach 75%`
                        : `✓ Can miss up to ${missable} more class${missable !== 1 ? 'es' : ''}`}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                    <button
                      className="secondary-action-btn"
                      style={{ width: '100%' }}
                      onClick={() => setShowRegModal(true)}
                    >
                      Request Regularization
                    </button>
                  </div>
                </div>
              );
            }) : (
              /* No subjects found — show placeholder card */
              <div className="feature-card">
                <span className="period-badge">IDC101</span>
                <h4>Introduction to Digital Communications</h4>
                <p>Faculty: Dr. Arige Sumanth &bull; No attendance records yet.</p>
                <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                  <button className="secondary-action-btn" style={{ width: '100%' }} onClick={() => setShowRegModal(true)}>
                    Request Regularization
                  </button>
                </div>
              </div>
            )}

            {/* Recovery Margin Card */}
            <div className="feature-card">
              <h4>Recovery Margin Calculator</h4>
              {totalConducted > 0 ? (
                <>
                  <p>
                    {isShortage
                      ? `Attend the next ${Math.ceil((0.75 * totalConducted - totalAttended) / (1 - 0.75))} consecutive classes to reach 75%.`
                      : `You can miss up to ${Math.floor((totalAttended - 0.75 * totalConducted) / 0.75)} classes while maintaining 75%.`}
                  </p>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', color: '#475569' }}>
                    <strong>Minimum required:</strong> 75.0% for end-semester examinations.
                  </div>
                </>
              ) : (
                <p style={{ color: '#94a3b8' }}>No attendance sessions recorded yet. Your calculator will update once your teacher begins marking attendance.</p>
              )}
            </div>

            {/* Extra Classes Card */}
            <div className="feature-card">
              <h4>Scheduled Extra Classes ({extraClasses.length})</h4>
              {extraClasses.length === 0 ? (
                <p>No extra classes scheduled this week.</p>
              ) : (
                <ul style={{ paddingLeft: '18px', fontSize: '0.88rem', color: '#334155' }}>
                  {extraClasses.slice(0, 3).map((ex) => (
                    <li key={ex.id} style={{ marginBottom: '4px' }}>
                      <strong>{ex.subjects?.name}</strong>: {ex.class_date} ({ex.start_time} – {ex.end_time})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Dr. Arige Sumanth's Timetable ────────────────────────────────── */}
        {!loading && timetable.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ marginBottom: '12px', color: '#1e293b', fontWeight: 700 }}>
              📅 Your Weekly Timetable
            </h4>
            <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={thStyle}>Day</th>
                    <th style={thStyle}>Period</th>
                    <th style={thStyle}>Time</th>
                    <th style={thStyle}>Subject</th>
                    <th style={thStyle}>Faculty</th>
                    <th style={thStyle}>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedDays.map((day) =>
                    timetableByDay[day].map((slot, idx) => (
                      <tr
                        key={slot.id}
                        style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderTop: '1px solid #e2e8f0' }}
                      >
                        {idx === 0 && (
                          <td
                            rowSpan={timetableByDay[day].length}
                            style={{ ...tdStyle, fontWeight: 700, color: '#334155', background: '#f1f5f9', textAlign: 'center' }}
                          >
                            {DAY_ABBR[day] || day}
                          </td>
                        )}
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span className="period-badge" style={{ fontSize: '0.75rem' }}>P{slot.period_number}</span>
                        </td>
                        <td style={tdStyle}>
                          {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>
                          {slot.subjects?.name}
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{slot.subjects?.code}</div>
                        </td>
                        <td style={tdStyle}>{slot.profiles?.full_name || '—'}</td>
                        <td style={tdStyle}>{slot.room_no || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Regularization Modal ─────────────────────────────────────────────── */}
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
                <textarea
                  required
                  rows="3"
                  value={regForm.reason}
                  onChange={(e) => setRegForm({ ...regForm, reason: e.target.value })}
                  placeholder="State the reason or approved OD details…"
                />
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

// ── Table cell styles ─────────────────────────────────────────────────────────
const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#475569',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.03em'
};

const tdStyle = {
  padding: '10px 14px',
  color: '#334155'
};
