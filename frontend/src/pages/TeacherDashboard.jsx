import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import DownloadAppModal, { isRunningAsApp } from '../components/DownloadAppModal';
import {
  getTodayTeacherClasses,
  getMySwapsApi,
  createSwapRequestApi,
  respondSwapApi,
  getExtraClassesApi,
  scheduleExtraClassApi,
  getAdminTeachersApi,
  getAdminClassesApi,
  getAdminSectionsApi,
  getAdminSubjectsApi,
  getAdminTimetablesApi
} from '../services/api';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const [todayClasses, setTodayClasses] = useState([]);
  const [allTimetableSlots, setAllTimetableSlots] = useState([]);
  const [swapsList, setSwapsList] = useState([]);
  const [extraClassesList, setExtraClassesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Substitution Modal
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [swapForm, setSwapForm] = useState({
    receiver_id: '',
    timetable_id: '',
    swap_date: new Date().toISOString().split('T')[0],
    period_number: 1,
    reason: ''
  });

  // Extra Class Modal
  const [showExtraModal, setShowExtraModal] = useState(false);
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [extraForm, setExtraForm] = useState({
    class_id: '',
    section_id: '',
    subject_id: '',
    class_date: new Date().toISOString().split('T')[0],
    start_time: '16:00',
    end_time: '17:00',
    room_no: 'IT Hall 201',
    description: ''
  });

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Faculty Member';
  const displayEmail = user?.email;
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  useEffect(() => {
    setIsInstalled(isRunningAsApp());

    async function loadDashboardData() {
      if (!user) return;
      try {
        setLoading(true);
        const [clsData, ttData, swapsData, extraData, profData, cData, sData, subData] = await Promise.all([
          getTodayTeacherClasses().catch(() => ({ classes: [] })),
          getAdminTimetablesApi().catch(() => ({ timetables: [] })),
          getMySwapsApi().catch(() => ({ swaps: [] })),
          getExtraClassesApi().catch(() => ({ extra_classes: [] })),
          getAdminTeachersApi().catch(() => ({ teachers: [] })),
          getAdminClassesApi().catch(() => ({ classes: [] })),
          getAdminSectionsApi().catch(() => ({ sections: [] })),
          getAdminSubjectsApi().catch(() => ({ subjects: [] }))
        ]);

        const mySlots = (ttData.timetables || []).filter(t => t.teacher_id === user?.id || t.teacher_id === profile?.id);
        const myToday = (clsData.classes || []).filter(t => t.teacher_id === user?.id || t.teacher_id === profile?.id);

        setTodayClasses(myToday);
        setAllTimetableSlots(mySlots);
        setSwapsList(swapsData.swaps || []);
        setExtraClassesList(extraData.extra_classes || []);
        setTeachersList(profData.teachers || []);
        setClassesList(cData.classes || []);
        setSectionsList(sData.sections || []);
        setSubjectsList(subData.subjects || []);
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user, profile]);

  const handleSendSwap = async (e) => {
    e.preventDefault();
    try {
      await createSwapRequestApi(swapForm);
      setShowSwapModal(false);
      alert('Substitution request submitted.');
      const res = await getMySwapsApi();
      setSwapsList(res.swaps || []);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleRespondSwap = async (swapId, status) => {
    try {
      await respondSwapApi(swapId, status);
      const res = await getMySwapsApi();
      setSwapsList(res.swaps || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScheduleExtra = async (e) => {
    e.preventDefault();
    try {
      await scheduleExtraClassApi(extraForm);
      setShowExtraModal(false);
      alert('Extra class scheduled and published.');
      const res = await getExtraClassesApi();
      setExtraClassesList(res.extra_classes || []);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const displayClasses = todayClasses.length > 0 ? todayClasses : allTimetableSlots;

  return (
    <div className="dashboard-layout">
      {/* Clean Header Bar */}
      <header className="dashboard-header">
        <div className="header-left">
          <h2>Faculty Portal</h2>
          <span className="badge role-teacher header-dept-badge">{profile?.department || 'Information Technology'}</span>
        </div>
        <div className="header-right">
          {avatarUrl && <img src={avatarUrl} alt="Avatar" className="user-avatar" />}
          <div className="user-info">
            <strong>{displayName}</strong>
            <small>{displayEmail}</small>
          </div>
          {!isInstalled && (
            <button
              onClick={() => setShowDownloadModal(true)}
              className="app-download-header-btn"
              title="Install App"
            >
              <span>📲</span>
              <span className="app-btn-label"> Install</span>
            </button>
          )}
          <button onClick={logout} className="logout-btn">Sign Out</button>
        </div>
      </header>

      <DownloadAppModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />

      <main className="dashboard-content">
        <div className="welcome-banner">
          <h3>Welcome, {displayName}</h3>
          <p>{profile?.department || 'Department of Information Technology'} • Faculty Portal</p>
        </div>

        {/* Assigned Periods Section */}
        <section className="dashboard-section" style={{ marginBottom: '28px' }}>
          <div className="periods-section-toolbar">
            <h3 className="periods-section-title">
              {todayClasses.length > 0 ? "Today's Scheduled Periods" : `Assigned Periods (${displayClasses.length} Periods)`}
            </h3>
            <div className="periods-action-buttons">
              <a
                href="https://docs.google.com/spreadsheets/d/1hr6niV60fj67sidkYEj7ausv6aoGUndR1wcakoVmRjo/edit"
                target="_blank"
                rel="noreferrer"
                className="sheet-link-btn"
              >
                📊 Live Google Sheet
              </a>
              <button
                className="primary-action-btn"
                onClick={() => navigate('/teacher/attendance')}
              >
                Take Attendance
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#64748b' }}>Loading periods...</p>
          ) : displayClasses.length === 0 ? (
            <div style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <p style={{ color: '#64748b', marginBottom: '12px' }}>
                No periods scheduled. Check with the administrator.
              </p>
              <button className="secondary-action-btn" onClick={() => navigate('/teacher/attendance')}>
                View Timetable Periods
              </button>
            </div>
          ) : (
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {displayClasses.map((cls) => {
                const dayLabel = dayNames[cls.day_of_week] || '';
                return (
                  <div key={cls.id} className="feature-card" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="period-badge">{dayLabel ? `${dayLabel} • P${cls.period_number}` : `Period ${cls.period_number}`}</span>
                      <span className="badge role-teacher">{cls.sections?.name || 'Section'}</span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', margin: '4px 0', fontWeight: '700' }}>
                      {cls.subjects?.name || 'Introduction to Digital Communications'}
                    </h4>
                    <p style={{ fontSize: '0.85rem', margin: '4px 0 14px 0', color: '#64748b' }}>
                      {cls.classes?.name || 'B.Tech IT - 2025 Batch'} • Room {cls.room_no || 'IT Hall 201'}
                    </p>
                    <button
                      className="primary-action-btn"
                      style={{ width: '100%' }}
                      onClick={() => navigate('/teacher/attendance')}
                    >
                      Take Attendance
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Feature Actions */}
        <div className="grid-cards" style={{ marginBottom: '28px' }}>
          <div className="feature-card">
            <h4>Take Attendance</h4>
            <p>Mark period attendance with one-click exception marking. Automatically records present status and syncs with your Google Sheet.</p>
            <button className="primary-action-btn" onClick={() => navigate('/teacher/attendance')}>
              Take Attendance
            </button>
          </div>

          <div className="feature-card">
            <h4>Period Substitution</h4>
            <p>Request period exchange with another faculty member for a specific date or accept incoming exchange requests.</p>
            <button className="secondary-action-btn" onClick={() => {
              setSwapForm({
                receiver_id: teachersList[0]?.id || '',
                timetable_id: todayClasses[0]?.id || '',
                swap_date: new Date().toISOString().split('T')[0],
                period_number: 1,
                reason: ''
              });
              setShowSwapModal(true);
            }}>
              Request Substitution
            </button>
          </div>

          <div className="feature-card">
            <h4>Schedule Extra Class</h4>
            <p>Reserve available classroom hours for additional sessions and publish schedule notifications to class students.</p>
            <button className="secondary-action-btn" onClick={() => {
              setExtraForm({
                class_id: classesList[0]?.id || '',
                section_id: sectionsList[0]?.id || '',
                subject_id: subjectsList[0]?.id || '',
                class_date: new Date().toISOString().split('T')[0],
                start_time: '16:00',
                end_time: '17:00',
                room_no: 'IT Hall 201',
                description: 'Special Tutorial Session'
              });
              setShowExtraModal(true);
            }}>
              Schedule Extra Class
            </button>
          </div>
        </div>

        {/* Active Substitutions & Extra Classes */}
        <div className="summary-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
            Substitutions & Scheduled Extra Classes
          </h3>
          {swapsList.length === 0 && extraClassesList.length === 0 ? (
            <p style={{ color: '#64748b' }}>No active substitution requests or scheduled extra classes.</p>
          ) : (
            <ul className="schedule-list">
              {swapsList.map((sw) => (
                <li key={sw.id} className="schedule-item">
                  <div className="schedule-item-info">
                    <span className="subject-title">Period Swap: {sw.swap_date} (Period {sw.period_number})</span>
                    <small>From: {sw.requester?.full_name} &rarr; To: {sw.receiver?.full_name}</small>
                  </div>
                  <div>
                    {sw.status === 'pending' && sw.receiver?.id === user?.id ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="action-btn edit" onClick={() => handleRespondSwap(sw.id, 'approved')}>Accept</button>
                        <button className="action-btn delete" onClick={() => handleRespondSwap(sw.id, 'rejected')}>Reject</button>
                      </div>
                    ) : (
                      <span className={`badge ${sw.status === 'approved' ? 'role-student' : 'role-admin'}`}>{sw.status}</span>
                    )}
                  </div>
                </li>
              ))}
              {extraClassesList.map((ex) => (
                <li key={ex.id} className="schedule-item">
                  <div className="schedule-item-info">
                    <span className="subject-title">Extra Class: {ex.subjects?.name}</span>
                    <small>{ex.class_date} • {ex.start_time} - {ex.end_time} (Room {ex.room_no})</small>
                  </div>
                  <span className="badge role-teacher">{ex.sections?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* MODAL: REQUEST SUBSTITUTION */}
      {showSwapModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Request Period Substitution</h3>
            <form onSubmit={handleSendSwap}>
              <div className="form-group">
                <label>Date of Exchange</label>
                <input required type="date" value={swapForm.swap_date} onChange={(e) => setSwapForm({ ...swapForm, swap_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Period Number</label>
                <select value={swapForm.period_number} onChange={(e) => setSwapForm({ ...swapForm, period_number: parseInt(e.target.value, 10) })}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Substitute Teacher</label>
                <select value={swapForm.receiver_id} onChange={(e) => setSwapForm({ ...swapForm, receiver_id: e.target.value })}>
                  {teachersList.filter((t) => t.id !== user?.id).map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Reason for Substitution</label>
                <textarea required rows="2" value={swapForm.reason} onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })} placeholder="e.g. Attending academic conference" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSwapModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE EXTRA CLASS */}
      {showExtraModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Schedule Extra Class</h3>
            <form onSubmit={handleScheduleExtra}>
              <div className="form-group">
                <label>Class</label>
                <select value={extraForm.class_id} onChange={(e) => setExtraForm({ ...extraForm, class_id: e.target.value })}>
                  {classesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Section</label>
                <select value={extraForm.section_id} onChange={(e) => setExtraForm({ ...extraForm, section_id: e.target.value })}>
                  {sectionsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={extraForm.subject_id} onChange={(e) => setExtraForm({ ...extraForm, subject_id: e.target.value })}>
                  {subjectsList.map((sub) => <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input required type="date" value={extraForm.class_date} onChange={(e) => setExtraForm({ ...extraForm, class_date: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <input required type="time" value={extraForm.start_time} onChange={(e) => setExtraForm({ ...extraForm, start_time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input required type="time" value={extraForm.end_time} onChange={(e) => setExtraForm({ ...extraForm, end_time: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Classroom / Lab</label>
                <input required type="text" value={extraForm.room_no} onChange={(e) => setExtraForm({ ...extraForm, room_no: e.target.value })} placeholder="e.g. IT Hall 201" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowExtraModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Publish Extra Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
