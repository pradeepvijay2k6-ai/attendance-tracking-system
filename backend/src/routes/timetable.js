const express = require('express');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * GET /api/timetable/teacher/today
 * Fetches scheduled periods strictly for the authenticated/specified teacher.
 */
router.get('/teacher/today', async (req, res) => {
  try {
    const { date, day, teacher_id } = req.query;
    const teacherId = teacher_id || req.user?.id;

    if (!teacherId) {
      return res.json({
        success: true,
        date: new Date().toISOString().split('T')[0],
        day_of_week: 1,
        classes: []
      });
    }

    // Determine target day of week (1 = Monday, 7 = Sunday)
    const targetDate = date ? new Date(date) : new Date();
    let dayOfWeek = day ? parseInt(day, 10) : targetDate.getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Fetch timetable slots strictly assigned to this teacher
    const { data: allSlots, error } = await supabase
      .from('timetables')
      .select(`
        id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        room_no,
        teacher_id,
        classes (id, name, code),
        sections (id, name),
        subjects (id, name, code)
      `)
      .eq('teacher_id', teacherId)
      .order('day_of_week', { ascending: true })
      .order('period_number', { ascending: true });

    if (error) {
      console.error('Error fetching timetable slots for teacher:', error);
      return res.status(400).json({ success: false, message: error.message, classes: [] });
    }

    const formattedDate = targetDate.toISOString().split('T')[0];

    // Check for approved substitutions for this date
    // 1. Where teacher is the substitute covering for someone (receiver_id)
    const { data: coveredSwaps } = await supabase
      .from('period_swaps')
      .select(`
        id,
        swap_date,
        period_number,
        requester:requester_id (id, full_name, email),
        timetable:timetable_id (
          id,
          day_of_week,
          period_number,
          start_time,
          end_time,
          room_no,
          classes (id, name, code),
          sections (id, name),
          subjects (id, name, code)
        )
      `)
      .eq('receiver_id', teacherId)
      .eq('swap_date', formattedDate)
      .eq('status', 'approved');

    // 2. Where teacher requested someone else to cover (requester_id)
    const { data: handedOverSwaps } = await supabase
      .from('period_swaps')
      .select('timetable_id, period_number, receiver:receiver_id(full_name)')
      .eq('requester_id', teacherId)
      .eq('swap_date', formattedDate)
      .eq('status', 'approved');

    const handedOverMap = {};
    (handedOverSwaps || []).forEach(sw => {
      handedOverMap[sw.timetable_id] = sw;
    });

    // Filter regular slots by day of week
    let dayFiltered = (allSlots || []).filter((s) => s.day_of_week === dayOfWeek);
    let schedule = (dayFiltered.length > 0) ? dayFiltered : (allSlots || []);

    // Tag handed-over periods
    schedule = schedule.map(slot => {
      if (handedOverMap[slot.id]) {
        return {
          ...slot,
          is_substituted_out: true,
          covered_by: handedOverMap[slot.id].receiver?.full_name || 'Substitute Teacher'
        };
      }
      return slot;
    });

    // Add incoming substitution classes to schedule
    (coveredSwaps || []).forEach(sw => {
      if (sw.timetable) {
        schedule.push({
          ...sw.timetable,
          is_substitute_cover: true,
          substituted_for: sw.requester?.full_name || 'Faculty Member'
        });
      }
    });

    // Check if attendance is already submitted for any of these periods on target date
    const timetableIds = schedule.map((slot) => slot.id);

    let sessionMap = {};
    if (timetableIds.length > 0) {
      const { data: sessions } = await supabase
        .from('attendance_sessions')
        .select('id, timetable_id, period_number, total_students, present_count, absent_count, status')
        .in('timetable_id', timetableIds)
        .eq('attendance_date', formattedDate);

      (sessions || []).forEach((s) => {
        sessionMap[s.timetable_id] = s;
      });
    }

    const enhancedSchedule = schedule.map((slot) => ({
      ...slot,
      attendance_session: sessionMap[slot.id] || null,
      is_submitted: !!sessionMap[slot.id]
    }));

    res.json({
      success: true,
      date: formattedDate,
      day_of_week: dayOfWeek,
      classes: enhancedSchedule
    });
  } catch (err) {
    console.error('Server error in timetable/teacher/today:', err);
    res.status(500).json({ success: false, message: 'Internal server error', classes: [] });
  }
});

/**
 * GET /api/timetable/:timetable_id/students
 * Fetches all students enrolled in the class/section of a specific timetable slot
 */
router.get('/:timetable_id/students', async (req, res) => {
  try {
    const { timetable_id } = req.params;

    // 1. Fetch timetable info
    const { data: timetable, error: ttError } = await supabase
      .from('timetables')
      .select(`
        id,
        class_id,
        section_id,
        period_number,
        classes (id, name, code),
        sections (id, name),
        subjects (id, name, code)
      `)
      .eq('id', timetable_id)
      .single();

    if (ttError || !timetable) {
      return res.status(404).json({ success: false, message: 'Timetable period not found' });
    }

    // 2. Fetch all active students in this class and section
    const { data: students, error: stError } = await supabase
      .from('students')
      .select('id, register_no, roll_no, full_name, email, is_active')
      .eq('class_id', timetable.class_id)
      .eq('section_id', timetable.section_id)
      .eq('is_active', true)
      .order('roll_no', { ascending: true });

    if (stError) {
      console.error('Error fetching students:', stError);
      return res.status(400).json({ success: false, message: stError.message });
    }

    res.json({
      success: true,
      timetable,
      count: students.length,
      students
    });
  } catch (err) {
    console.error('Server error in timetable/:timetable_id/students:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/timetable/student
 * Returns timetable slots + per-subject attendance stats for the logged-in student.
 */
router.get('/student', async (req, res) => {
  try {
    const email = req.query.email || req.user?.email;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Student email is required', timetable: [], subjects: [] });
    }

    // 1. Look up the student record by email
    const { data: student, error: stErr } = await supabase
      .from('students')
      .select('id, register_no, roll_no, full_name, email, class_id, section_id, is_active')
      .eq('email', email)
      .single();

    if (stErr || !student) {
      return res.status(404).json({ success: false, message: `No student found with email: ${email}`, timetable: [], subjects: [] });
    }

    // 2. Fetch all timetable slots for this student's class + section
    const { data: slots, error: ttErr } = await supabase
      .from('timetables')
      .select(`
        id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        room_no,
        classes  (id, name, code),
        sections (id, name),
        subjects (id, name, code),
        profiles (id, full_name, email)
      `)
      .eq('class_id', student.class_id)
      .eq('section_id', student.section_id)
      .order('day_of_week',   { ascending: true })
      .order('period_number', { ascending: true });

    if (ttErr) throw ttErr;

    // 3. Fetch all attendance records for this student (with session info)
    const { data: records } = await supabase
      .from('attendance_records')
      .select('status, attendance_sessions(subject_id, attendance_date)')
      .eq('student_id', student.id);

    // Build per-subject stats map
    const subjectStats = {};
    (records || []).forEach((r) => {
      const subjectId = r.attendance_sessions?.subject_id;
      if (!subjectId) return;
      if (!subjectStats[subjectId]) subjectStats[subjectId] = { total: 0, attended: 0 };
      subjectStats[subjectId].total++;
      if (r.status === 'present' || r.status === 'od') subjectStats[subjectId].attended++;
    });

    // 4. Build unique subject summaries from timetable slots with Safe / Warning / Critical thresholds
    const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const subjectMap = {};
    (slots || []).forEach((slot) => {
      const subId = slot.subjects?.id;
      if (!subId || subjectMap[subId]) return;
      const s = subjectStats[subId] || { total: 0, attended: 0 };
      const pct = s.total > 0 ? parseFloat(((s.attended / s.total) * 100).toFixed(2)) : 100.0;
      
      // Calculate category: SAFE (>= 75%), WARNING (65% to < 75%), CRITICAL (< 65%)
      let statusCategory = 'SAFE';
      if (s.total > 0) {
        if (pct < 65.0) statusCategory = 'CRITICAL';
        else if (pct < 75.0) statusCategory = 'WARNING';
      }

      subjectMap[subId] = {
        subject_id: subId,
        subject_name: slot.subjects?.name,
        subject_code: slot.subjects?.code,
        teacher_name: slot.profiles?.full_name || 'Assigned Faculty',
        teacher_email: slot.profiles?.email,
        class_name: slot.classes?.name,
        section_name: slot.sections?.name,
        total_conducted: s.total,
        total_attended: s.attended,
        attendance_percentage: pct,
        attendance_status: statusCategory, // 'SAFE' | 'WARNING' | 'CRITICAL'
        is_shortage: pct < 75.0 && s.total > 0,
        is_critical: pct < 65.0 && s.total > 0
      };
    });

    // Augment timetable rows with friendly day name
    const timetableWithDays = (slots || []).map((slot) => ({
      ...slot,
      day_name: DAY_NAMES[slot.day_of_week] || `Day ${slot.day_of_week}`
    }));

    res.json({
      success: true,
      student,
      timetable: timetableWithDays,
      subjects: Object.values(subjectMap)
    });
  } catch (err) {
    console.error('Server error in GET /timetable/student:', err);
    res.status(500).json({ success: false, message: 'Internal server error', timetable: [], subjects: [] });
  }
});

module.exports = router;


