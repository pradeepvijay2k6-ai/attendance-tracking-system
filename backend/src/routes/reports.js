const express = require('express');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth(['teacher', 'admin']));

/**
 * GET /api/reports/defaulters
 * Calculates cumulative attendance % for all students and returns those below threshold (default 75%)
 */
router.get('/defaulters', async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold || '75.0');
    const { section_id, class_id } = req.query;

    // 1. Fetch total sessions conducted
    let sessionQuery = supabase.from('attendance_sessions').select('id, class_id, section_id, subject_id');
    if (class_id) sessionQuery = sessionQuery.eq('class_id', class_id);
    if (section_id) sessionQuery = sessionQuery.eq('section_id', section_id);
    const { data: sessions } = await sessionQuery;

    const totalSessions = sessions ? sessions.length : 0;

    // 2. Fetch all students
    let studentQuery = supabase
      .from('students')
      .select('id, register_no, roll_no, full_name, email, class_id, section_id, classes(name), sections(name)')
      .eq('is_active', true)
      .order('roll_no', { ascending: true });

    if (class_id) studentQuery = studentQuery.eq('class_id', class_id);
    if (section_id) studentQuery = studentQuery.eq('section_id', section_id);

    const { data: students, error: stdErr } = await studentQuery;
    if (stdErr) throw stdErr;

    // 3. Fetch all attendance records
    const { data: records } = await supabase
      .from('attendance_records')
      .select('student_id, status');

    const attendanceByStudent = {};
    (records || []).forEach((r) => {
      if (!attendanceByStudent[r.student_id]) {
        attendanceByStudent[r.student_id] = { total: 0, present: 0, absent: 0, od: 0 };
      }
      attendanceByStudent[r.student_id].total += 1;
      if (r.status === 'present' || r.status === 'od') {
        attendanceByStudent[r.student_id].present += 1;
      } else {
        attendanceByStudent[r.student_id].absent += 1;
      }
    });

    const studentAnalytics = (students || []).map((s) => {
      const stats = attendanceByStudent[s.id] || { total: 0, present: 0, absent: 0 };
      const attended = stats.present;
      const total = stats.total || totalSessions || 1;
      const percentage = total > 0 ? ((attended / total) * 100).toFixed(1) : '100.0';

      return {
        ...s,
        total_classes: total,
        attended_classes: attended,
        absent_classes: stats.absent,
        percentage: parseFloat(percentage),
        is_defaulter: parseFloat(percentage) < threshold
      };
    });

    const defaulters = studentAnalytics.filter((s) => s.is_defaulter);

    res.json({
      success: true,
      threshold,
      total_students: studentAnalytics.length,
      defaulter_count: defaulters.length,
      defaulters,
      all_students: studentAnalytics
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
