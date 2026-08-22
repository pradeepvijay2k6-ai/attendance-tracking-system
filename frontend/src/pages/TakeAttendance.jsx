import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  getTodayTeacherClasses,
  getTimetableStudents,
  submitAttendanceApi
} from '../services/api';

export default function TakeAttendance() {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  // State
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [classes, setClasses] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [students, setStudents] = useState([]);
  const [absentStudentIds, setAbsentStudentIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Fetch teacher classes for the selected date
  useEffect(() => {
    let isMounted = true;

    async function loadSchedule() {
      try {
        setLoadingSchedule(true);
        setFeedback(null);
        setSelectedSlot(null);
        setStudents([]);
        setAbsentStudentIds(new Set());

        const data = await getTodayTeacherClasses(selectedDate);
        if (!isMounted) return;

        setClasses(data.classes || []);

        // Auto-select first pending slot if available
        if (data.classes && data.classes.length > 0) {
          const firstPending = data.classes.find((c) => !c.is_submitted) || data.classes[0];
          setSelectedSlot(firstPending);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load schedule:', err);
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || 'Could not load your classes for this date.'
        });
      } finally {
        if (isMounted) setLoadingSchedule(false);
      }
    }

    loadSchedule();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, refreshKey]);

  // 2. Fetch students when a slot is selected
  useEffect(() => {
    if (!selectedSlot?.id) return;

    let isMounted = true;

    async function loadStudents() {
      try {
        setLoadingStudents(true);
        setAbsentStudentIds(new Set());
        setFeedback(null);

        const data = await getTimetableStudents(selectedSlot.id);
        if (isMounted) {
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
        if (isMounted) {
          setFeedback({
            type: 'error',
            message: err.response?.data?.message || 'Failed to load student roster.'
          });
        }
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    }

    loadStudents();

    return () => {
      isMounted = false;
    };
  }, [selectedSlot]);

  // 3. Toggle absentee state
  const toggleStudentStatus = (studentId) => {
    setAbsentStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId); // Mark Present
      } else {
        next.add(studentId); // Mark Absent
      }
      return next;
    });
  };

  const markAllPresent = () => {
    setAbsentStudentIds(new Set());
  };

  // 4. Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.roll_no.toLowerCase().includes(q) ||
        s.register_no.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const totalCount = students.length;
  const absentCount = absentStudentIds.size;
  const presentCount = totalCount - absentCount;

  // 5. Submit attendance
  const handleSubmitAttendance = async () => {
    if (!selectedSlot?.id) return;

    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      setFeedback(null);

      const payload = {
        timetable_id: selectedSlot.id,
        attendance_date: selectedDate,
        absent_student_ids: Array.from(absentStudentIds)
      };

      const response = await submitAttendanceApi(payload);
      const isSynced = response.google_sheets_sync?.synced;
      const sheetMsg = isSynced ? ' • 📊 Google Sheet updated!' : '';

      setFeedback({
        type: 'success',
        message: `Attendance recorded successfully! Total: ${response.result?.total_students || totalCount} | Present: ${response.result?.present_count ?? presentCount} | Absent: ${response.result?.absent_count ?? absentCount}${sheetMsg}`
      });

      // Trigger refresh of schedule
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Submission failed:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit attendance.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = profile?.full_name || user?.email || 'Teacher';

  return (
    <div className="attendance-page-layout">
      {/* Top Navbar */}
      <header className="attendance-nav">
        <div className="nav-left">
          <button className="back-link" onClick={() => navigate('/teacher')}>
            ← Back to Dashboard
          </button>
          <h2>Mark Period Attendance</h2>
        </div>
        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="https://docs.google.com/spreadsheets/d/1hr6niV60fj67sidkYEj7ausv6aoGUndR1wcakoVmRjo/edit"
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: '#059669', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600' }}
          >
            📊 View Google Sheet
          </a>
          <span className="teacher-name">{displayName}</span>
          <button className="logout-btn-sm" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="attendance-main-container">
        {/* Date Selector & Class Selector Bar */}
        <section className="selection-bar-card">
          <div className="selection-group">
            <label htmlFor="attendance-date">Attendance Date:</label>
            <input
              id="attendance-date"
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="slots-container">
            <label>Today's Assigned Periods:</label>
            {loadingSchedule ? (
              <p className="loading-text">Loading your scheduled classes...</p>
            ) : classes.length === 0 ? (
              <div className="no-classes-notice">
                No classes scheduled for you on this day. (Check timetable in Admin console).
              </div>
            ) : (
              <div className="slots-pills">
                {classes.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isSubmitted = slot.is_submitted;
                  const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  const dayLabel = dayNames[slot.day_of_week] || '';

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      className={`slot-pill ${isSelected ? 'selected' : ''} ${isSubmitted ? 'submitted' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="period-badge">{dayLabel} • P{slot.period_number}</span>
                        <span className="badge role-teacher" style={{ fontSize: '0.72rem' }}>{slot.sections?.name || 'Section'}</span>
                      </div>
                      <span className="slot-subject">{slot.subjects?.name || slot.subjects?.code}</span>
                      <span className="slot-class">{slot.classes?.name} • Room: {slot.room_no}</span>
                      {isSubmitted && <span className="submitted-tag">✓ Recorded</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Status / Feedback Banner */}
        {feedback && (
          <div className={`feedback-alert ${feedback.type}`}>
            <span>{feedback.message}</span>
            <button className="close-alert" onClick={() => setFeedback(null)}>✕</button>
          </div>
        )}

        {/* Active Class & Student Attendance Section */}
        {selectedSlot && (
          <section className="attendance-section">
            {/* Header with Metrics and Absentee Principle */}
            <div className="attendance-header-card">
              <div className="class-details">
                <h3>
                  {selectedSlot.subjects?.name} ({selectedSlot.subjects?.code})
                </h3>
                <p>
                  Class: <strong>{selectedSlot.classes?.name} - {selectedSlot.sections?.name}</strong> | Room: <strong>{selectedSlot.room_no}</strong> | Time: <strong>{selectedSlot.start_time} - {selectedSlot.end_time}</strong>
                </p>
                <div className="instruction-box">
                  <strong>Fast Marking:</strong> All students are marked <strong>Present</strong> by default. Tap on any <strong>Absent</strong> student to toggle.
                </div>
              </div>

              {/* Counters */}
              <div className="metric-counters">
                <div className="metric-badge total">
                  <small>Total</small>
                  <strong>{totalCount}</strong>
                </div>
                <div className="metric-badge present">
                  <small>Present</small>
                  <strong>{presentCount}</strong>
                </div>
                <div className="metric-badge absent">
                  <small>Absent</small>
                  <strong>{absentCount}</strong>
                </div>
              </div>
            </div>

            {/* Student Search & Quick Controls */}
            <div className="controls-bar">
              <input
                type="text"
                placeholder="🔍 Search student by name or roll number..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="btn-mark-all-present"
                onClick={markAllPresent}
                disabled={absentCount === 0}
              >
                Clear All Absentees (Mark All Present)
              </button>
            </div>

            {/* Students Grid */}
            {loadingStudents ? (
              <div className="roster-loading">
                <div className="spinner"></div>
                <p>Loading student roster...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-roster">
                <p>No students found for this class & section.</p>
              </div>
            ) : (
              <div className="students-grid">
                {filteredStudents.map((student) => {
                  const isAbsent = absentStudentIds.has(student.id);
                  return (
                    <div
                      key={student.id}
                      className={`student-card ${isAbsent ? 'is-absent' : 'is-present'}`}
                      onClick={() => toggleStudentStatus(student.id)}
                    >
                      <div className="student-header">
                        <span className="roll-badge">{student.roll_no}</span>
                        <span className={`status-pill ${isAbsent ? 'absent' : 'present'}`}>
                          {isAbsent ? 'ABSENT' : 'PRESENT'}
                        </span>
                      </div>
                      <h4 className="student-name">{student.full_name}</h4>
                      <small className="reg-no">Reg: {student.register_no}</small>
                      <div className="toggle-hint">
                        {isAbsent ? 'Click to Mark Present' : 'Click to Mark Absent'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="submit-action-footer">
              <div className="footer-summary">
                Submitting attendance for <strong>{selectedSlot.classes?.name}</strong>: {presentCount} Present, {absentCount} Absent.
              </div>
              <button
                type="button"
                className="btn-submit-attendance"
                disabled={submitting || totalCount === 0}
                onClick={() => setShowConfirmModal(true)}
              >
                {submitting ? 'Submitting...' : 'Submit Attendance'}
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <h3>Confirm Attendance Submission</h3>
            <p style={{ marginTop: '8px', color: '#475569' }}>
              Are you sure you want to submit attendance for <strong>{selectedSlot?.classes?.name} - {selectedSlot?.sections?.name}</strong>?
            </p>

            <div className="modal-summary-box">
              <div><strong>Period:</strong> Period {selectedSlot?.period_number}</div>
              <div><strong>Date:</strong> {selectedDate}</div>
              <div><strong>Total Students:</strong> {totalCount}</div>
              <div style={{ color: '#16a34a' }}><strong>Present:</strong> {presentCount}</div>
              <div style={{ color: '#dc2626' }}><strong>Absent ({absentCount}):</strong></div>
              {absentCount > 0 ? (
                <ul className="modal-absent-list">
                  {students
                    .filter((s) => absentStudentIds.has(s.id))
                    .map((s) => (
                      <li key={s.id}>
                        {s.roll_no} - {s.full_name}
                      </li>
                    ))}
                </ul>
              ) : (
                <p style={{ color: '#16a34a', fontSize: '0.9rem' }}>All students marked PRESENT.</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn-confirm"
                onClick={handleSubmitAttendance}
                disabled={submitting}
              >
                {submitting ? 'Saving to Database...' : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
