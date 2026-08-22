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

    if (!allSlots || allSlots.length === 0) {
      return res.json({
        success: true,
        date: targetDate.toISOString().split('T')[0],
        day_of_week: dayOfWeek,
        classes: []
      });
    }

    // Filter by day of week if matching slots exist; otherwise return all assigned slots for this teacher
    const dayFiltered = (allSlots || []).filter((s) => s.day_of_week === dayOfWeek);
    const schedule = (dayFiltered.length > 0) ? dayFiltered : allSlots;

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

module.exports = router;
