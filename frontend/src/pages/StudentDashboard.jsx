import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import DepartmentTicker from '../components/DepartmentTicker';
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

  // Aggregate totals across all subjects (Features 2, 3, 4)
  const totalConducted = subjects.reduce((sum, s) => sum + (s.total_conducted || 0), 0);
  const totalAttended  = subjects.reduce((sum, s) => sum + (s.total_attended  || 0), 0);
  const overallPct     = totalConducted > 0
    ? parseFloat(((totalAttended / totalConducted) * 100).toFixed(2))
    : 100.0;

  // Status Category System (Feature 4)
  let overallCategory = 'SAFE';
  if (totalConducted > 0) {
    if (overallPct < 65.0) overallCategory = 'CRITICAL';
    else if (overallPct < 75.0) overallCategory = 'WARNING';
  }

  const overallNeeded = overallCategory !== 'SAFE'
    ? Math.ceil((0.75 * totalConducted - totalAttended) / (1 - 0.75))
    : 0;

  const overallMissable = overallCategory === 'SAFE' && totalConducted > 0
    ? Math.floor((totalAttended - 0.75 * totalConducted) / 0.75)
    : 0;

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
        {/* ── IT Department Updates Scrolling Ticker (Feature 7) ───────────────── */}
        <DepartmentTicker />

        {/* ── Welcome Banner ───────────────────────────────────────────────── */}
        <div className="welcome-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3>Welcome, {studentInfo?.full_name || displayName}</h3>
              <p>Track your subject-wise attendance numbers, percentages, and exam eligibility in real-time.</p>
              {studentInfo && (
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  Roll No: <strong>{studentInfo.roll_no}</strong> &nbsp;|&nbsp;
                  Reg No: <strong>{studentInfo.register_no}</strong>
                </p>
              )}
            </div>
            {!loading && totalConducted > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span className={`status-badge status-${overallCategory.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                  {overallCategory === 'SAFE' && '✅ SAFE'}
                  {overallCategory === 'WARNING' && '⚠️ WARNING'}
                  {overallCategory === 'CRITICAL' && '🚨 CRITICAL'}
                  {' '}&bull; {overallPct}%
                </span>
                <span style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
                  Total Attended: {totalAttended} / {totalConducted} classes
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Overall Attendance Alert / Number-Based Dialog Boxes (Feature 5) ── */}
        {!loading && totalConducted > 0 && (
          overallCategory === 'CRITICAL' ? (
            <div className="feedback-alert critical" style={{ margin: '0 0 24px 0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>🚨</span>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#9f1239', fontWeight: 800 }}>
                    Critical Attendance Alert: {overallPct}% ({totalAttended} / {totalConducted} classes)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Your attendance is strictly in the <strong>CRITICAL</strong> category (&lt; 65%). You are at immediate risk of semester exam debarment.
                    You must attend the next <strong>{overallNeeded} consecutive classes</strong> without absence to recover to the 75% mandatory threshold.
                  </p>
                </div>
              </div>
            </div>
          ) : overallCategory === 'WARNING' ? (
            <div className="feedback-alert warning" style={{ margin: '0 0 24px 0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>⚠️</span>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#92400e', fontWeight: 800 }}>
                    Attendance Shortage Warning: {overallPct}% ({totalAttended} / {totalConducted} classes)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Your attendance is in the <strong>WARNING</strong> zone (65% to below 75%).
                    Please attend the upcoming <strong>{overallNeeded} classes</strong> to safely restore your status above 75%.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="feedback-alert success" style={{ margin: '0 0 24px 0', padding: '16px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '1.6rem' }}>✅</span>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#15803d', fontWeight: 800 }}>
                    Good Standing: {overallPct}% ({totalAttended} / {totalConducted} classes)
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
                    Your overall attendance is <strong>SAFE</strong> and satisfies institutional exam eligibility requirements.
                    {overallMissable > 0 ? ` You have a buffer of up to ${overallMissable} classes while maintaining \u2265 75%.` : ''}
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {/* ── Subject Cards (Features 2, 3, 4) ─────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading your attendance data…</div>
        ) : (
          <div className="grid-cards" style={{ marginBottom: '28px' }}>
            {subjects.length > 0 ? subjects.map((sub) => {
              const attended = sub.total_attended || 0;
              const conducted = sub.total_conducted || 0;
              const pct = conducted > 0 ? parseFloat(((attended / conducted) * 100).toFixed(2)) : 100.0;
              
              let cat = sub.attendance_status || 'SAFE';
              if (conducted > 0) {
                if (pct < 65.0) cat = 'CRITICAL';
                else if (pct < 75.0) cat = 'WARNING';
                else cat = 'SAFE';
              }

              const missable = cat === 'SAFE' && conducted > 0
                ? Math.floor((attended - 0.75 * conducted) / 0.75)
                : 0;
              const needed = cat !== 'SAFE' && conducted > 0
                ? Math.ceil((0.75 * conducted - attended) / (1 - 0.75))
                : 0;

              return (
                <div className="feature-card" key={sub.subject_id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="period-badge">{sub.subject_code}</span>
                    <span className={`status-badge status-${cat.toLowerCase()}`}>
                      {cat} &bull; {pct}%
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', margin: '4px 0 8px 0', fontWeight: 700 }}>{sub.subject_name}</h4>
                  
                  {/* Attendance Fraction (Feature 2) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span className="attendance-fraction-badge" style={{ fontSize: '0.92rem' }}>
                      {attended} / {conducted} classes
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Faculty: {sub.teacher_name}
                    </span>
                  </div>

                  {/* Visual Progress bar */}
                  <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '8px', margin: '6px 0 10px 0', overflow: 'hidden' }}>
                    <div
                      className={`progress-${cat.toLowerCase()}`}
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        height: '100%',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  {conducted > 0 ? (
                    <p style={{ fontSize: '0.8rem', color: cat === 'CRITICAL' ? '#b91c1c' : (cat === 'WARNING' ? '#b45309' : '#15803d'), margin: '0 0 12px 0', fontWeight: 600 }}>
                      {cat === 'CRITICAL' && `🚨 Critical: Must attend next ${needed} class${needed !== 1 ? 'es' : ''} to reach 75%`}
                      {cat === 'WARNING' && `⚠️ Warning: Attend next ${needed} class${needed !== 1 ? 'es' : ''} to reach 75%`}
                      {cat === 'SAFE' && `✓ Safe: Can miss up to ${missable} class${missable !== 1 ? 'es' : ''} while maintaining 75%`}
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 12px 0' }}>
                      No classes conducted yet.
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
