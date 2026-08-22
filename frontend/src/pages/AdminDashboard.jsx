import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStatsApi,
  getAdminStudentsApi,
  createStudentApi,
  updateStudentApi,
  deleteStudentApi,
  getAdminTeachersApi,
  createTeacherApi,
  updateTeacherApi,
  deleteTeacherApi,
  getAdminClassesApi,
  createClassApi,
  deleteClassApi,
  getAdminSectionsApi,
  createSectionApi,
  deleteSectionApi,
  getAdminSubjectsApi,
  createSubjectApi,
  deleteSubjectApi,
  getAdminDepartmentsApi,
  createDepartmentApi,
  deleteDepartmentApi,
  getAdminTimetablesApi,
  createTimetableApi,
  updateTimetableApi,
  deleteTimetableApi,
  getAdminSessionsApi,
  deleteAdminSessionApi,
  resetSystemDataApi,
  adminOverrideStudentAttendanceApi
} from '../services/api';

const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ALLOWED_ADMIN_EMAILS = [
  'pradeepvijay2k6@gmail.com',
  'clutchforever999@gmail.com'
];

export default function AdminDashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // overview, students, teachers, classes, subjects, timetable, sessions, reset
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Security Gate
  const isPasscodeUnlocked = sessionStorage.getItem('admin_authenticated') === 'true' || sessionStorage.getItem('admin_passcode') === 'IT@123';
  const [isUnlocked, setIsUnlocked] = useState(isPasscodeUnlocked);
  const [enteredPasscode, setEnteredPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Master Data States
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [timetablesList, setTimetablesList] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);

  // Search & Filter
  const [searchStudent, setSearchStudent] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({ register_no: '', roll_no: '', full_name: '', email: '', class_id: '', section_id: '' });

  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({ full_name: '', email: '', role: 'teacher', department: '', phone: '' });

  const [showClassModal, setShowClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', code: '', year: 1, semester: 1, department_id: '' });

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionForm, setSectionForm] = useState({ name: '', class_id: '' });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', semester: 1, department_id: '' });

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });

  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [timetableForm, setTimetableForm] = useState({
    class_id: '',
    section_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 1,
    period_number: 1,
    start_time: '09:00:00',
    end_time: '10:00:00',
    room_no: 'Room 101'
  });

  const [showResetModal, setShowResetModal] = useState(false);

  // Student Attendance Override Modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    student_id: '',
    timetable_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    status: 'present',
    remarks: 'Admin Attendance Correction'
  });
  const [overrideLoading, setOverrideLoading] = useState(false);

  const handleOpenOverrideModal = (student = null) => {
    setOverrideForm({
      student_id: student?.id || (students[0]?.id || ''),
      timetable_id: timetablesList[0]?.id || '',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'present',
      remarks: 'Admin Attendance Correction'
    });
    setShowOverrideModal(true);
  };

  const handleSaveAttendanceOverride = async (e) => {
    e.preventDefault();
    if (!overrideForm.student_id || !overrideForm.timetable_id || !overrideForm.attendance_date) {
      setFeedback({ type: 'error', message: 'Please select a student, timetable slot, and attendance date.' });
      return;
    }

    try {
      setOverrideLoading(true);
      const res = await adminOverrideStudentAttendanceApi(overrideForm);
      setFeedback({ type: 'success', message: res.message || 'Student attendance updated & synced with Google Sheet successfully!' });
      setShowOverrideModal(false);
      loadAllMasterData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update attendance.' });
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleUnlockAdmin = (e) => {
    e.preventDefault();
    if (enteredPasscode.trim() === 'IT@123') {
      sessionStorage.setItem('admin_passcode', 'IT@123');
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsUnlocked(true);
      setPasscodeError('');
      loadAllMasterData();
    } else {
      setPasscodeError('Invalid Admin Passkey. Access restricted.');
    }
  };

  const loadAllMasterData = async () => {
    setLoading(true);
    try {
      const [stData, clData, secData, subData, depData, ttData, sessData, profData] = await Promise.all([
        getAdminStatsApi().catch(() => null),
        getAdminClassesApi().catch(() => ({ classes: [] })),
        getAdminSectionsApi().catch(() => ({ sections: [] })),
        getAdminSubjectsApi().catch(() => ({ subjects: [] })),
        getAdminDepartmentsApi().catch(() => ({ departments: [] })),
        getAdminTimetablesApi().catch(() => ({ timetables: [] })),
        getAdminSessionsApi().catch(() => ({ sessions: [] })),
        getAdminTeachersApi().catch(() => ({ teachers: [] }))
      ]);

      if (stData?.stats) setStats(stData.stats);
      setClassesList(clData.classes || []);
      setSectionsList(secData.sections || []);
      setSubjectsList(subData.subjects || []);
      setDepartmentsList(depData.departments || []);
      setTimetablesList(ttData.timetables || []);
      setSessionsList(sessData.sessions || []);
      setTeachers(profData.teachers || []);

      const stdRes = await getAdminStudentsApi();
      setStudents(stdRes.students || []);
    } catch (err) {
      console.error('Error loading master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isUnlocked) return;
    let isMounted = true;
    Promise.all([
      getAdminStatsApi().catch(() => null),
      getAdminClassesApi().catch(() => ({ classes: [] })),
      getAdminSectionsApi().catch(() => ({ sections: [] })),
      getAdminSubjectsApi().catch(() => ({ subjects: [] })),
      getAdminDepartmentsApi().catch(() => ({ departments: [] })),
      getAdminTimetablesApi().catch(() => ({ timetables: [] })),
      getAdminSessionsApi().catch(() => ({ sessions: [] })),
      getAdminTeachersApi().catch(() => ({ teachers: [] }))
    ]).then(([stData, clData, secData, subData, depData, ttData, sessData, profData]) => {
      if (!isMounted) return;
      if (stData?.stats) setStats(stData.stats);
      setClassesList(clData.classes || []);
      setSectionsList(secData.sections || []);
      setSubjectsList(subData.subjects || []);
      setDepartmentsList(depData.departments || []);
      setTimetablesList(ttData.timetables || []);
      setSessionsList(sessData.sessions || []);
      setTeachers(profData.teachers || []);
    });

    getAdminStudentsApi().then((stdRes) => {
      if (isMounted) setStudents(stdRes.students || []);
    }).catch((err) => console.error(err));

    return () => { isMounted = false; };
  }, [isUnlocked]);

  useEffect(() => {
    if (activeTab === 'students' && isUnlocked) {
      let isMounted = true;
      getAdminStudentsApi({
        search: searchStudent,
        class_id: filterClass,
        section_id: filterSection
      }).then((res) => {
        if (isMounted) setStudents(res.students || []);
      }).catch((err) => console.error(err));
      return () => { isMounted = false; };
    }
  }, [searchStudent, filterClass, filterSection, activeTab, isUnlocked]);

  const handleRefreshStudents = async () => {
    try {
      const stdRes = await getAdminStudentsApi({
        search: searchStudent,
        class_id: filterClass,
        section_id: filterSection
      });
      setStudents(stdRes.students || []);
    } catch (err) {
      console.error('Error refreshing students:', err);
    }
  };

  const openAddStudentModal = () => {
    setEditingStudent(null);
    setStudentForm({
      register_no: '',
      roll_no: '',
      full_name: '',
      email: '',
      class_id: classesList[0]?.id || '',
      section_id: sectionsList[0]?.id || ''
    });
    setShowStudentModal(true);
  };

  const openAddTeacherModal = () => {
    setEditingTeacher(null);
    setTeacherForm({
      full_name: '',
      email: '',
      role: 'teacher',
      department: departmentsList[0]?.name || 'Information Technology',
      phone: ''
    });
    setShowTeacherModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...studentForm,
        class_id: studentForm.class_id || classesList[0]?.id,
        section_id: studentForm.section_id || sectionsList[0]?.id
      };

      if (!payload.class_id || !payload.section_id) {
        setFeedback({ type: 'error', message: 'Please select a valid class and section.' });
        return;
      }

      if (editingStudent) {
        await updateStudentApi(editingStudent.id, payload);
        setFeedback({ type: 'success', message: 'Student details updated.' });
      } else {
        await createStudentApi(payload);
        setFeedback({ type: 'success', message: 'Student registered successfully.' });
      }
      setShowStudentModal(false);
      setEditingStudent(null);
      handleRefreshStudents();
      const stRes = await getAdminStatsApi();
      if (stRes?.stats) setStats(stRes.stats);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(`Delete student record for "${name}"?`)) return;
    try {
      await deleteStudentApi(id);
      setFeedback({ type: 'success', message: `Student "${name}" deleted.` });
      handleRefreshStudents();
      const stRes = await getAdminStatsApi();
      if (stRes?.stats) setStats(stRes.stats);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await updateTeacherApi(editingTeacher.id, teacherForm);
        setFeedback({ type: 'success', message: 'Faculty profile updated.' });
      } else {
        await createTeacherApi(teacherForm);
        setFeedback({ type: 'success', message: 'Faculty profile created.' });
      }
      setShowTeacherModal(false);
      setEditingTeacher(null);
      const res = await getAdminTeachersApi();
      setTeachers(res.teachers || []);
      const stRes = await getAdminStatsApi();
      if (stRes?.stats) setStats(stRes.stats);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleDeleteTeacher = async (id, name) => {
    if (!window.confirm(`Delete faculty "${name}"?`)) return;
    try {
      await deleteTeacherApi(id);
      setFeedback({ type: 'success', message: `Faculty "${name}" removed.` });
      const res = await getAdminTeachersApi();
      setTeachers(res.teachers || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleSaveTimetable = async (e) => {
    e.preventDefault();
    try {
      if (editingTimetable) {
        await updateTimetableApi(editingTimetable.id, timetableForm);
        setFeedback({ type: 'success', message: 'Timetable slot updated.' });
      } else {
        await createTimetableApi(timetableForm);
        setFeedback({ type: 'success', message: 'Timetable slot created.' });
      }
      setShowTimetableModal(false);
      setEditingTimetable(null);
      const res = await getAdminTimetablesApi();
      setTimetablesList(res.timetables || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleDeleteTimetable = async (id) => {
    if (!window.confirm('Delete this timetable slot?')) return;
    try {
      await deleteTimetableApi(id);
      setFeedback({ type: 'success', message: 'Timetable slot deleted.' });
      const res = await getAdminTimetablesApi();
      setTimetablesList(res.timetables || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this attendance session log?')) return;
    try {
      await deleteAdminSessionApi(id);
      setFeedback({ type: 'success', message: 'Attendance log deleted.' });
      const res = await getAdminSessionsApi();
      setSessionsList(res.sessions || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    }
  };

  const handleSystemReset = async () => {
    try {
      setLoading(true);
      await resetSystemDataApi();
      setShowResetModal(false);
      setFeedback({ type: 'success', message: 'All database records have been reset.' });
      loadAllMasterData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_passcode');
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('target_portal');
    logout();
  };

  const userEmail = (user?.email || '').toLowerCase().trim();
  const isAllowedAdmin = ALLOWED_ADMIN_EMAILS.includes(userEmail) || profile?.role === 'admin';

  // Email / Role Restriction Gate
  if (user && !isAllowedAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '460px', textAlign: 'center' }}>
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '6px 14px', borderRadius: '20px', display: 'inline-block', fontWeight: '700', fontSize: '0.78rem', marginBottom: '14px' }}>
            ACCESS RESTRICTED
          </div>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '8px', fontWeight: '700' }}>
            Administrator Access Only
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px', lineHeight: '1.5' }}>
            Access to this administrative portal is restricted to authorized administrators or users granted the Admin role.
          </p>
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '0.84rem', color: '#475569' }}>
            Currently signed in as: <strong style={{ color: '#0f172a' }}>{userEmail}</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={() => navigate('/teacher')}>
              Teacher Portal
            </button>
            <button type="button" className="terminal-btn secondary" style={{ flex: 1 }} onClick={logout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Passkey Lock Screen
  if (!isUnlocked) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '6px', fontWeight: '700' }}>
            Administrator Verification
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '20px' }}>
            Enter the admin passkey to access institutional master settings.
          </p>

          {passcodeError && (
            <div className="feedback-alert error" style={{ marginBottom: '16px', textAlign: 'left' }}>
              <span>{passcodeError}</span>
            </div>
          )}

          <form onSubmit={handleUnlockAdmin}>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Admin Passkey</label>
              <input
                type="password"
                required
                placeholder="Enter passkey..."
                value={enteredPasscode}
                onChange={(e) => setEnteredPasscode(e.target.value)}
                autoFocus
                style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-cancel" style={{ flex: 1 }} onClick={() => navigate('/teacher')}>
                Teacher Portal
              </button>
              <button type="submit" className="terminal-btn primary" style={{ flex: 1, padding: '10px', background: '#0f172a' }}>
                Verify Passkey
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-layout">
      {/* Header Bar */}
      <header className="admin-header">
        <div className="brand-group">
          <div>
            <h1 className="brand-title">Admin Management Portal</h1>
            <p className="brand-subtitle">Institution Configuration & Master Controls</p>
          </div>
        </div>
        <div className="user-profile-widget">
          <button className="terminal-btn secondary" onClick={() => navigate('/teacher')}>
            Teacher Portal
          </button>
          <span className="badge role-admin">ADMIN</span>
          <span className="user-email">{profile?.full_name || user?.email}</span>
          <button className="logout-btn" onClick={handleAdminLogout}>Sign Out</button>
        </div>
      </header>

      {/* Clean Navigation Tabs */}
      <nav className="admin-tabs">
        <button className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`admin-tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
          Students ({students.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
          Faculty ({teachers.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>
          Classes & Sections ({classesList.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}>
          Subjects ({subjectsList.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'timetable' ? 'active' : ''}`} onClick={() => setActiveTab('timetable')}>
          Timetable Matrix ({timetablesList.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
          Attendance Logs ({sessionsList.length})
        </button>
        <button className={`admin-tab-btn danger ${activeTab === 'reset' ? 'active' : ''}`} onClick={() => setActiveTab('reset')}>
          System Reset
        </button>
      </nav>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`feedback-alert ${feedback.type}`} style={{ margin: '1rem 2rem' }}>
          <span>{feedback.message}</span>
          <button className="close-alert" onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="admin-main-content">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="overview-tab-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-val">{stats?.total_students || students.length}</div>
                <div className="stat-lbl">Enrolled Students</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{stats?.total_teachers || teachers.length}</div>
                <div className="stat-lbl">Faculty Members</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{stats?.total_classes || classesList.length}</div>
                <div className="stat-lbl">Classes Configured</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{stats?.total_subjects || subjectsList.length}</div>
                <div className="stat-lbl">Active Subjects</div>
              </div>
              <div className="stat-card">
                <div className="stat-val">{stats?.total_sessions || sessionsList.length}</div>
                <div className="stat-lbl">Attendance Logs</div>
              </div>
            </div>

            <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
              <div className="summary-card">
                <h3>Quick Management Actions</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '1rem' }}>
                  <button className="terminal-btn primary" onClick={openAddStudentModal}>
                    + Add Student
                  </button>
                  <button className="terminal-btn secondary" style={{ background: '#059669', color: '#ffffff' }} onClick={() => handleOpenOverrideModal()}>
                    ✏️ Update / Override Attendance
                  </button>
                  <button className="terminal-btn secondary" onClick={openAddTeacherModal}>
                    + Add Faculty
                  </button>
                  <button className="terminal-btn secondary" onClick={() => setShowClassModal(true)}>
                    + Add Class
                  </button>
                  <button className="terminal-btn secondary" onClick={() => setShowSubjectModal(true)}>
                    + Add Subject
                  </button>
                  <button className="terminal-btn secondary" onClick={() => { setEditingTimetable(null); setShowTimetableModal(true); }}>
                    + Add Timetable Slot
                  </button>
                </div>
              </div>

              <div className="summary-card">
                <h3>Recent Attendance Submissions</h3>
                {sessionsList.length === 0 ? (
                  <p style={{ color: '#64748b', marginTop: '0.5rem' }}>No attendance sessions recorded yet.</p>
                ) : (
                  <ul className="schedule-list" style={{ marginTop: '0.5rem' }}>
                    {sessionsList.slice(0, 5).map((s) => (
                      <li key={s.id} className="schedule-item">
                        <div className="schedule-item-info">
                          <span className="subject-title">{s.subjects?.name || 'Subject'} ({s.sections?.name || 'Section'})</span>
                          <span className="time-badge">{s.attendance_date} • Period {s.period_number}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span className="badge role-teacher">Present: {s.present_count}</span>
                          <span className="badge role-student" style={{ background: '#fee2e2', color: '#b91c1c' }}>Absent: {s.absent_count}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS MASTER */}
        {activeTab === 'students' && (
          <div className="admin-section-card">
            <div className="section-toolbar">
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="Search student name, roll number, register number..."
                  className="search-input"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
                <select className="filter-select" value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                  <option value="">All Classes</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select className="filter-select" value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
                  <option value="">All Sections</option>
                  {sectionsList.map((sec) => (
                    <option key={sec.id} value={sec.id}>{sec.name}</option>
                  ))}
                </select>
              </div>

              <div className="toolbar-actions">
                <button className="terminal-btn primary" onClick={openAddStudentModal}>
                  + Add Student
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Register Number</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No students found.</td></tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.roll_no}</strong></td>
                        <td><code>{s.register_no}</code></td>
                        <td>{s.full_name}</td>
                        <td>{s.email}</td>
                        <td>{s.classes?.name || '—'}</td>
                        <td><span className="badge role-teacher">{s.sections?.name || '—'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="action-btn"
                              style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '600' }}
                              onClick={() => handleOpenOverrideModal(s)}
                            >
                              ✏️ Mark Attd
                            </button>
                            <button className="action-btn edit" onClick={() => {
                              setEditingStudent(s);
                              setStudentForm({ register_no: s.register_no, roll_no: s.roll_no, full_name: s.full_name, email: s.email, class_id: s.class_id, section_id: s.section_id });
                              setShowStudentModal(true);
                            }}>Edit</button>
                            <button className="action-btn delete" onClick={() => handleDeleteStudent(s.id, s.full_name)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FACULTY & USER ROLES */}
        {activeTab === 'teachers' && (
          <div className="admin-section-card">
            <div className="section-toolbar">
              <div>
                <h2>User Accounts & Role Management</h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>
                  All users who sign in via Google OAuth appear here automatically. You can switch their roles or assign classes instantly.
                </p>
              </div>
              <button className="terminal-btn primary" onClick={openAddTeacherModal}>
                + Add / Pre-authorize User
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User / Full Name</th>
                    <th>Email Address</th>
                    <th>Department</th>
                    <th>Assigned Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong>{t.full_name || 'Unnamed User'}</strong>
                        {t.email === userEmail && <span style={{ marginLeft: '6px', fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>}
                      </td>
                      <td><code>{t.email}</code></td>
                      <td>{t.department || 'Information Technology'}</td>
                      <td>
                        <select
                          value={t.role || 'teacher'}
                          onChange={async (e) => {
                            const newRole = e.target.value;
                            try {
                              await updateTeacherApi(t.id, { role: newRole });
                              setTeachers(prev => prev.map(item => item.id === t.id ? { ...item, role: newRole } : item));
                              setFeedback({ type: 'success', message: `Updated ${t.full_name || t.email}'s role to ${newRole.toUpperCase()} successfully!` });
                            } catch (err) {
                              setFeedback({ type: 'error', message: `Failed to update role: ${err.message}` });
                            }
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '0.82rem',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            background: t.role === 'admin' ? '#eff6ff' : '#f0fdf4',
                            color: t.role === 'admin' ? '#1d4ed8' : '#15803d'
                          }}
                        >
                          <option value="teacher">👨‍🏫 Teacher / Faculty</option>
                          <option value="admin">🛡️ Administrator</option>
                          <option value="student">🎓 Student</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="action-btn"
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '5px 9px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '600' }}
                            onClick={() => {
                              setTimetableForm(prev => ({ ...prev, teacher_id: t.id }));
                              setEditingTimetable(null);
                              setActiveTab('timetable');
                              setShowTimetableModal(true);
                            }}
                          >
                            + Assign Class
                          </button>
                          <button className="action-btn edit" onClick={() => {
                            setEditingTeacher(t);
                            setTeacherForm({ full_name: t.full_name || '', email: t.email || '', role: t.role || 'teacher', department: t.department || '', phone: t.phone || '' });
                            setShowTeacherModal(true);
                          }}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDeleteTeacher(t.id, t.full_name || t.email)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: CLASSES & SECTIONS */}
        {activeTab === 'classes' && (
          <div className="dashboard-grid">
            <div className="admin-section-card">
              <div className="section-toolbar">
                <h3>Departments</h3>
                <button className="terminal-btn secondary" onClick={() => { setDeptForm({ name: '', code: '' }); setShowDeptModal(true); }}>
                  + Add Dept
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Code</th><th>Department Name</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {departmentsList.map((d) => (
                    <tr key={d.id}>
                      <td><code>{d.code}</code></td>
                      <td>{d.name}</td>
                      <td><button className="action-btn delete" onClick={async () => { await deleteDepartmentApi(d.id); loadAllMasterData(); }}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-section-card">
              <div className="section-toolbar">
                <h3>Classes</h3>
                <button className="terminal-btn primary" onClick={() => { setClassForm({ name: '', code: '', year: 1, semester: 1, department_id: departmentsList[0]?.id || '' }); setShowClassModal(true); }}>
                  + Add Class
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Class Name</th><th>Code</th><th>Year/Sem</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {classesList.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.name}</strong></td>
                      <td><code>{c.code}</code></td>
                      <td>Year {c.year} • Sem {c.semester}</td>
                      <td><button className="action-btn delete" onClick={async () => { await deleteClassApi(c.id); loadAllMasterData(); }}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-section-card" style={{ gridColumn: '1 / -1' }}>
              <div className="section-toolbar">
                <h3>Sections</h3>
                <button className="terminal-btn primary" onClick={() => { setSectionForm({ name: '', class_id: classesList[0]?.id || '' }); setShowSectionModal(true); }}>
                  + Add Section
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr><th>Section Name</th><th>Class</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {sectionsList.map((sec) => (
                    <tr key={sec.id}>
                      <td><span className="badge role-teacher">{sec.name}</span></td>
                      <td>{sec.classes?.name || '—'}</td>
                      <td><button className="action-btn delete" onClick={async () => { await deleteSectionApi(sec.id); loadAllMasterData(); }}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SUBJECTS */}
        {activeTab === 'subjects' && (
          <div className="admin-section-card">
            <div className="section-toolbar">
              <h2>Course & Subject Master</h2>
              <button className="terminal-btn primary" onClick={() => {
                setSubjectForm({ name: '', code: '', semester: 1, department_id: departmentsList[0]?.id || '' });
                setShowSubjectModal(true);
              }}>
                + Add Subject
              </button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjectsList.map((sub) => (
                  <tr key={sub.id}>
                    <td><code>{sub.code}</code></td>
                    <td><strong>{sub.name}</strong></td>
                    <td>{sub.departments?.name || '—'}</td>
                    <td>Semester {sub.semester}</td>
                    <td><button className="action-btn delete" onClick={async () => { await deleteSubjectApi(sub.id); loadAllMasterData(); }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: TIMETABLE */}
        {activeTab === 'timetable' && (
          <div className="admin-section-card">
            <div className="section-toolbar">
              <h2>Timetable Period Matrix</h2>
              <button className="terminal-btn primary" onClick={() => {
                setEditingTimetable(null);
                setTimetableForm({
                  class_id: classesList[0]?.id || '',
                  section_id: sectionsList[0]?.id || '',
                  subject_id: subjectsList[0]?.id || '',
                  teacher_id: teachers[0]?.id || '',
                  day_of_week: 1,
                  period_number: 1,
                  start_time: '09:00:00',
                  end_time: '10:00:00',
                  room_no: 'Room 101'
                });
                setShowTimetableModal(true);
              }}>
                + Add Slot
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Period</th>
                    <th>Time Slot</th>
                    <th>Class & Section</th>
                    <th>Subject</th>
                    <th>Faculty</th>
                    <th>Room</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timetablesList.map((tt) => (
                    <tr key={tt.id}>
                      <td><strong>{dayNames[tt.day_of_week]}</strong></td>
                      <td><span className="period-badge">P{tt.period_number}</span></td>
                      <td>{tt.start_time?.slice(0, 5)} - {tt.end_time?.slice(0, 5)}</td>
                      <td>{tt.classes?.name} • <span className="badge role-teacher">{tt.sections?.name}</span></td>
                      <td><strong>{tt.subjects?.name}</strong> (<code>{tt.subjects?.code}</code>)</td>
                      <td>{tt.profiles?.full_name || 'Unassigned'}</td>
                      <td><code>{tt.room_no}</code></td>
                      <td>
                        <button className="action-btn edit" onClick={() => {
                          setEditingTimetable(tt);
                          setTimetableForm({
                            class_id: tt.class_id,
                            section_id: tt.section_id,
                            subject_id: tt.subject_id,
                            teacher_id: tt.teacher_id,
                            day_of_week: tt.day_of_week,
                            period_number: tt.period_number,
                            start_time: tt.start_time,
                            end_time: tt.end_time,
                            room_no: tt.room_no
                          });
                          setShowTimetableModal(true);
                        }}>Edit</button>
                        <button className="action-btn delete" onClick={() => handleDeleteTimetable(tt.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: ATTENDANCE SESSIONS AUDIT */}
        {activeTab === 'sessions' && (
          <div className="admin-section-card">
            <div className="section-toolbar">
              <h2>Historical Attendance Logs</h2>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Period</th>
                    <th>Class / Section</th>
                    <th>Subject</th>
                    <th>Conducted By</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsList.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.attendance_date}</strong></td>
                      <td>Period {s.period_number}</td>
                      <td>{s.classes?.name} ({s.sections?.name})</td>
                      <td>{s.subjects?.name}</td>
                      <td>{s.profiles?.full_name || 'Faculty'}</td>
                      <td><span className="badge role-teacher">{s.present_count}</span></td>
                      <td><span className="badge role-student" style={{ background: '#fee2e2', color: '#b91c1c' }}>{s.absent_count}</span></td>
                      <td><span className="badge role-admin">{s.status}</span></td>
                      <td>
                        <button className="action-btn delete" onClick={() => handleDeleteSession(s.id)}>Delete Log</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: SYSTEM RESET */}
        {activeTab === 'reset' && (
          <div className="admin-section-card" style={{ border: '1px solid #ef4444' }}>
            <h2 style={{ color: '#b91c1c' }}>Reset Application Data</h2>
            <p style={{ marginTop: '0.5rem', color: '#475569', lineHeight: '1.6' }}>
              This action permanently clears records across students, classes, sections, subjects, timetables, and attendance logs.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <button className="terminal-btn danger" onClick={() => setShowResetModal(true)}>
                Wipe & Reset Database Records
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD/EDIT STUDENT */}
      {showStudentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
            <form onSubmit={handleSaveStudent}>
              <div className="form-group">
                <label>Roll Number</label>
                <input required type="text" value={studentForm.roll_no} onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })} placeholder="e.g. 001" />
              </div>
              <div className="form-group">
                <label>Register Number</label>
                <input required type="text" value={studentForm.register_no} onChange={(e) => setStudentForm({ ...studentForm, register_no: e.target.value })} placeholder="e.g. 3122255002001" />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input required type="text" value={studentForm.full_name} onChange={(e) => setStudentForm({ ...studentForm, full_name: e.target.value })} placeholder="Student name" />
              </div>
              <div className="form-group">
                <label>Institutional Email</label>
                <input required type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} placeholder="student@ssn.edu.in" />
              </div>
              <div className="form-group">
                <label>Class</label>
                <select value={studentForm.class_id} onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}>
                  {classesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Section</label>
                <select value={studentForm.section_id} onChange={(e) => setStudentForm({ ...studentForm, section_id: e.target.value })}>
                  {sectionsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowStudentModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT TEACHER */}
      {showTeacherModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingTeacher ? 'Edit Faculty' : 'Add Faculty Member'}</h3>
            <form onSubmit={handleSaveTeacher}>
              <div className="form-group">
                <label>Full Name</label>
                <input required type="text" value={teacherForm.full_name} onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })} placeholder="Dr. Arige Sumanth" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input required type="email" value={teacherForm.email} onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })} placeholder="faculty@ssn.edu.in" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={teacherForm.department} onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })} placeholder="Information Technology" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={teacherForm.role} onChange={(e) => setTeacherForm({ ...teacherForm, role: e.target.value })}>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin / HOD</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowTeacherModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Save Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT TIMETABLE */}
      {showTimetableModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingTimetable ? 'Edit Timetable Slot' : 'Add Timetable Slot'}</h3>
            <form onSubmit={handleSaveTimetable}>
              <div className="form-group">
                <label>Day of Week</label>
                <select value={timetableForm.day_of_week} onChange={(e) => setTimetableForm({ ...timetableForm, day_of_week: e.target.value })}>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
              <div className="form-group">
                <label>Period Number</label>
                <select value={timetableForm.period_number} onChange={(e) => setTimetableForm({ ...timetableForm, period_number: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Class</label>
                <select value={timetableForm.class_id} onChange={(e) => setTimetableForm({ ...timetableForm, class_id: e.target.value })}>
                  {classesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Section</label>
                <select value={timetableForm.section_id} onChange={(e) => setTimetableForm({ ...timetableForm, section_id: e.target.value })}>
                  {sectionsList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={timetableForm.subject_id} onChange={(e) => setTimetableForm({ ...timetableForm, subject_id: e.target.value })}>
                  {subjectsList.map((sub) => <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Faculty</label>
                <select value={timetableForm.teacher_id} onChange={(e) => setTimetableForm({ ...timetableForm, teacher_id: e.target.value })}>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Room / Hall</label>
                <input type="text" value={timetableForm.room_no} onChange={(e) => setTimetableForm({ ...timetableForm, room_no: e.target.value })} placeholder="IT Hall 201" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowTimetableModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Save Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLASS */}
      {showClassModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Class</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await createClassApi(classForm);
              setShowClassModal(false);
              loadAllMasterData();
            }}>
              <div className="form-group">
                <label>Class Name</label>
                <input required type="text" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} placeholder="B.Tech IT - 2025 Batch" />
              </div>
              <div className="form-group">
                <label>Class Code</label>
                <input required type="text" value={classForm.code} onChange={(e) => setClassForm({ ...classForm, code: e.target.value })} placeholder="IT-2025" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={classForm.department_id} onChange={(e) => setClassForm({ ...classForm, department_id: e.target.value })}>
                  {departmentsList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowClassModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SECTION */}
      {showSectionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Section</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await createSectionApi(sectionForm);
              setShowSectionModal(false);
              loadAllMasterData();
            }}>
              <div className="form-group">
                <label>Section Name</label>
                <input required type="text" value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} placeholder="IT A or IT B" />
              </div>
              <div className="form-group">
                <label>Belongs to Class</label>
                <select value={sectionForm.class_id} onChange={(e) => setSectionForm({ ...sectionForm, class_id: e.target.value })}>
                  {classesList.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSectionModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Create Section</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      {showSubjectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Subject</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await createSubjectApi(subjectForm);
              setShowSubjectModal(false);
              loadAllMasterData();
            }}>
              <div className="form-group">
                <label>Subject Name</label>
                <input required type="text" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} placeholder="Introduction to Digital Communications" />
              </div>
              <div className="form-group">
                <label>Subject Code</label>
                <input required type="text" value={subjectForm.code} onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} placeholder="IDC101" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={subjectForm.department_id} onChange={(e) => setSubjectForm({ ...subjectForm, department_id: e.target.value })}>
                  {departmentsList.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Create Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DEPARTMENT */}
      {showDeptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Department</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await createDepartmentApi(deptForm);
              setShowDeptModal(false);
              loadAllMasterData();
            }}>
              <div className="form-group">
                <label>Department Name</label>
                <input required type="text" value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="Information Technology" />
              </div>
              <div className="form-group">
                <label>Department Code</label>
                <input required type="text" value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="IT" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowDeptModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET CONFIRMATION */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content danger-modal">
            <h3 style={{ color: '#b91c1c' }}>Confirm Database Reset</h3>
            <p style={{ marginTop: '0.5rem', color: '#475569' }}>
              Are you sure? This will delete all students, classes, subjects, timetables, and attendance logs.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button type="button" className="btn-danger" onClick={handleSystemReset} disabled={loading}>
                {loading ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OVERRIDE STUDENT ATTENDANCE (ANY DAY, ANY STUDENT) */}
      {showOverrideModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>✏️ Update Student Attendance</h3>
              <button onClick={() => setShowOverrideModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
              Update attendance for any individual student on any date. Changes sync directly to the Master Google Spreadsheet.
            </p>

            <form onSubmit={handleSaveAttendanceOverride}>
              <div className="form-group">
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Select Student</label>
                <select
                  required
                  value={overrideForm.student_id}
                  onChange={(e) => setOverrideForm({ ...overrideForm, student_id: e.target.value })}
                  style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.roll_no} - {st.full_name} ({st.sections?.name || 'IT'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Attendance Date</label>
                <input
                  required
                  type="date"
                  value={overrideForm.attendance_date}
                  onChange={(e) => setOverrideForm({ ...overrideForm, attendance_date: e.target.value })}
                  style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Class Period / Subject</label>
                <select
                  required
                  value={overrideForm.timetable_id}
                  onChange={(e) => setOverrideForm({ ...overrideForm, timetable_id: e.target.value })}
                  style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                >
                  <option value="">-- Choose Period & Subject --</option>
                  {timetablesList.map((tt) => (
                    <option key={tt.id} value={tt.id}>
                      Period {tt.period_number} • {tt.subjects?.name || 'IDC101'} ({tt.sections?.name || 'Section'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Attendance Status</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setOverrideForm({ ...overrideForm, status: 'present' })}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: overrideForm.status === 'present' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: overrideForm.status === 'present' ? '#dcfce7' : '#f8fafc',
                      color: overrideForm.status === 'present' ? '#15803d' : '#475569',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    ✅ PRESENT
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideForm({ ...overrideForm, status: 'absent' })}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: overrideForm.status === 'absent' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      background: overrideForm.status === 'absent' ? '#fee2e2' : '#f8fafc',
                      color: overrideForm.status === 'absent' ? '#b91c1c' : '#475569',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}
                  >
                    ❌ ABSENT
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.85rem' }}>Reason / Remarks</label>
                <input
                  type="text"
                  value={overrideForm.remarks}
                  onChange={(e) => setOverrideForm({ ...overrideForm, remarks: e.target.value })}
                  placeholder="e.g., Medical Certificate, OD Approval, Correction"
                  style={{ padding: '9px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-cancel" onClick={() => setShowOverrideModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-confirm" disabled={overrideLoading} style={{ background: '#059669' }}>
                  {overrideLoading ? 'Updating & Syncing...' : 'Save & Sync Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
