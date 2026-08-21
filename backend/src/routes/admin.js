const express = require('express');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { cleanResetData } = require('../db/clean_reset');

const router = express.Router();

const ADMIN_PASSCODE = 'IT@123';

// Passcode verification endpoint
router.post('/verify-passcode', (req, res) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE) {
    return res.json({ success: true, message: 'Admin access authorized', admin_key: ADMIN_PASSCODE });
  }
  return res.status(401).json({ success: false, message: 'Incorrect Admin Password. Access Denied.' });
});

// Middleware to guard all admin endpoints: requires either header x-admin-passcode === 'IT@123' or auth token with role === 'admin'
router.use((req, res, next) => {
  const passcodeHeader = req.headers['x-admin-passcode'];
  if (passcodeHeader === ADMIN_PASSCODE) {
    return next();
  }
  // Otherwise verify auth role
  return requireAuth(['admin'])(req, res, next);
});

// ==============================================================================
// 1. STATS & OVERVIEW
// ==============================================================================
router.get('/stats', async (req, res) => {
  try {
    const [
      { count: studentsCount },
      { count: teachersCount },
      { count: classesCount },
      { count: subjectsCount },
      { count: sessionsCount },
      { data: recentSessions }
    ] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('classes').select('id', { count: 'exact', head: true }),
      supabase.from('subjects').select('id', { count: 'exact', head: true }),
      supabase.from('attendance_sessions').select('id', { count: 'exact', head: true }),
      supabase
        .from('attendance_sessions')
        .select(`
          id,
          attendance_date,
          period_number,
          total_students,
          present_count,
          absent_count,
          status,
          classes (name),
          sections (name),
          subjects (name),
          profiles (full_name)
        `)
        .order('attendance_date', { ascending: false })
        .limit(10)
    ]);

    res.json({
      success: true,
      stats: {
        total_students: studentsCount || 0,
        total_teachers: teachersCount || 0,
        total_classes: classesCount || 0,
        total_subjects: subjectsCount || 0,
        total_sessions: sessionsCount || 0
      },
      recent_sessions: recentSessions || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 2. STUDENTS CRUD
// ==============================================================================
router.get('/students', async (req, res) => {
  try {
    const { class_id, section_id, search } = req.query;
    let query = supabase
      .from('students')
      .select(`
        id,
        register_no,
        roll_no,
        full_name,
        email,
        class_id,
        section_id,
        is_active,
        created_at,
        classes (id, name, code),
        sections (id, name)
      `)
      .order('roll_no', { ascending: true });

    if (class_id) query = query.eq('class_id', class_id);
    if (section_id) query = query.eq('section_id', section_id);
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,register_no.ilike.%${search}%,email.ilike.%${search}%,roll_no.ilike.%${search}%`);
    }

    const { data: students, error } = await query;
    if (error) throw error;
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { register_no, roll_no, full_name, email, class_id, section_id } = req.body;
    if (!register_no || !roll_no || !full_name || !email || !class_id || !section_id) {
      return res.status(400).json({ success: false, message: 'All student fields are required' });
    }

    const { data, error } = await supabase
      .from('students')
      .insert([{ register_no, roll_no, full_name, email, class_id, section_id, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Student created successfully', student: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/students/bulk', async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Students array is required' });
    }

    const { data, error } = await supabase
      .from('students')
      .upsert(students, { onConflict: 'register_no' })
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, message: `Successfully inserted/updated ${data.length} students`, students: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { register_no, roll_no, full_name, email, class_id, section_id, is_active } = req.body;

    const { data, error } = await supabase
      .from('students')
      .update({ register_no, roll_no, full_name, email, class_id, section_id, is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Student updated successfully', student: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 3. TEACHERS & USER PROFILES CRUD
// ==============================================================================
router.get('/teachers', async (req, res) => {
  try {
    const { data: teachers, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, role, department, phone, created_at')
      .order('full_name', { ascending: true });

    if (error) throw error;
    res.json({ success: true, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/teachers', async (req, res) => {
  try {
    const crypto = require('crypto');
    const { email, full_name, role = 'teacher', department = 'Information Technology', phone } = req.body;
    if (!email || !full_name) {
      return res.status(400).json({ success: false, message: 'Email and Full Name are required' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: crypto.randomUUID(),
        email: email.trim(),
        full_name: full_name.trim(),
        role,
        department,
        phone
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Faculty profile created successfully', teacher: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, department, phone } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, email, role, department, phone, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Faculty profile updated', teacher: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Faculty profile removed' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 4. DEPARTMENTS, CLASSES, SECTIONS & SUBJECTS CRUD
// ==============================================================================
router.get('/departments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('departments').select('*').order('name', { ascending: true });
    if (error) throw error;
    res.json({ success: true, departments: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/departments', async (req, res) => {
  try {
    const { name, code } = req.body;
    const { data, error } = await supabase.from('departments').insert([{ name, code }]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, department: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/classes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, name, code, year, semester, department_id, departments(id, name, code), sections(id, name)')
      .order('name', { ascending: true });
    if (error) throw error;
    res.json({ success: true, classes: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const { name, code, year, semester, department_id } = req.body;
    const { data, error } = await supabase
      .from('classes')
      .insert([{ name, code, year: year || 1, semester: semester || 1, department_id }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, class: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Class deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/sections', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('id, name, class_id, classes(id, name, code)')
      .order('name', { ascending: true });
    if (error) throw error;
    res.json({ success: true, sections: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/sections', async (req, res) => {
  try {
    const { class_id, name } = req.body;
    const { data, error } = await supabase.from('sections').insert([{ class_id, name }]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, section: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/sections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Section deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, code, semester, department_id, departments(id, name, code)')
      .order('name', { ascending: true });
    if (error) throw error;
    res.json({ success: true, subjects: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const { name, code, semester = 1, department_id } = req.body;
    const { data, error } = await supabase.from('subjects').insert([{ name, code, semester, department_id }]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, subject: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Subject deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 5. TIMETABLES CRUD
// ==============================================================================
router.get('/timetables', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('timetables')
      .select(`
        id,
        class_id,
        section_id,
        subject_id,
        teacher_id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        room_no,
        classes (id, name, code),
        sections (id, name),
        subjects (id, name, code),
        profiles (id, full_name, email)
      `)
      .order('day_of_week', { ascending: true })
      .order('period_number', { ascending: true });

    if (error) throw error;
    res.json({ success: true, timetables: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/timetables', async (req, res) => {
  try {
    const { class_id, section_id, subject_id, teacher_id, day_of_week, period_number, start_time, end_time, room_no } = req.body;

    const { data, error } = await supabase
      .from('timetables')
      .insert([{
        class_id,
        section_id,
        subject_id,
        teacher_id,
        day_of_week: parseInt(day_of_week, 10),
        period_number: parseInt(period_number, 10),
        start_time: start_time || '09:00:00',
        end_time: end_time || '10:00:00',
        room_no: room_no || 'Room 101'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Timetable slot created', timetable: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/timetables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, section_id, subject_id, teacher_id, day_of_week, period_number, start_time, end_time, room_no } = req.body;

    const { data, error } = await supabase
      .from('timetables')
      .update({
        class_id,
        section_id,
        subject_id,
        teacher_id,
        day_of_week: parseInt(day_of_week, 10),
        period_number: parseInt(period_number, 10),
        start_time,
        end_time,
        room_no
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Timetable slot updated', timetable: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/timetables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('timetables').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Timetable slot deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 6. ATTENDANCE SESSIONS AUDIT & OVERRIDES
// ==============================================================================
router.get('/attendance-sessions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attendance_sessions')
      .select(`
        id,
        attendance_date,
        period_number,
        total_students,
        present_count,
        absent_count,
        status,
        created_at,
        classes (name, code),
        sections (name),
        subjects (name, code),
        profiles (full_name, email)
      `)
      .order('attendance_date', { ascending: false });

    if (error) throw error;
    res.json({ success: true, sessions: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/attendance-sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('attendance_sessions').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Attendance session deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 7. SYSTEM DATABASE CLEAN RESET
// ==============================================================================
router.post('/system/reset-data', async (req, res) => {
  try {
    const result = await cleanResetData();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
