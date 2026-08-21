const express = require('express');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/timetable/teacher/today
 * Fetches scheduled periods for Dr. Arige Sumanth / Authenticated Teacher.
 * Returns the periods for the selected day or all 6 weekly periods so attendance can be taken anytime.
 */
router.get('/teacher/today', async (req, res) => {
  try {
    // Determine teacher ID from auth token or database active teacher profile
    let teacherId = req.user?.id;
    if (!teacherId) {
      const { data: profs } = await supabase.from('profiles').select('id').limit(1);
      teacherId = profs?.[0]?.id || '11739a08-65be-47b2-bdce-6f0cd2fff8e7';
    }

    const { date, day } = req.query;

    // Determine target day of week (1 = Monday, 7 = Sunday)
    const targetDate = date ? new Date(date) : new Date();
    let dayOfWeek = day ? parseInt(day, 10) : targetDate.getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // Update timetable rows so this teacher owns them
    await supabase
      .from('timetables')
      .update({ teacher_id: teacherId })
      .neq('teacher_id', teacherId);

    // Fetch all timetable slots
    const { data: allSlots, error } = await supabase
      .from('timetables')
      .select(`
        id,
        day_of_week,
        period_number,
        start_time,
        end_time,
        room_no,
        classes (id, name, code),
        sections (id, name),
        subjects (id, name, code)
      `)
      .order('day_of_week', { ascending: true })
      .order('period_number', { ascending: true });

    if (error) {
      console.error('Error fetching timetable slots:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    // Filter by day of week if matching slots exist; otherwise show all slots
    const dayFiltered = (allSlots || []).filter((s) => s.day_of_week === dayOfWeek);
    const schedule = (dayFiltered.length > 0) ? dayFiltered : (allSlots || []);

    // Check if attendance is already submitted for any of these periods on target date
    const formattedDate = targetDate.toISOString().split('T')[0];
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
    res.status(500).json({ success: false, message: 'Internal server error' });
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
        day_of_week,
        start_time,
        end_time,
        room_no,
        classes (id, name, code),
        sections (id, name),
        subjects (id, name, code)
      `)
      .eq('id', timetable_id)
      .single();

    if (ttError || !timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    // 2. Fetch all active students in that class & section (IT A: 71 students, IT B: 70 students)
    const { data: students, error: stdError } = await supabase
      .from('students')
      .select('id, register_no, roll_no, full_name, email')
      .eq('class_id', timetable.class_id)
      .eq('section_id', timetable.section_id)
      .eq('is_active', true)
      .order('roll_no', { ascending: true });

    if (stdError) {
      return res.status(400).json({ success: false, message: stdError.message });
    }

    res.json({
      success: true,
      timetable,
      total_students: students ? students.length : 0,
      students: students || []
    });
  } catch (err) {
    console.error('Server error in timetable/students:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
