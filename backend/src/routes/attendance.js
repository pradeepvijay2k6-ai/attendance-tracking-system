const express = require('express');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');
const { syncSessionToGoogleSheet } = require('../services/googleSheetsService');

const router = express.Router();

/**
 * POST /api/attendance/submit
 * Submits absentee-based attendance using the PostgreSQL submit_attendance RPC function.
 * Automatically synchronizes with the teacher's Google Sheet.
 * 
 * Request body:
 * {
 *   "timetable_id": "...",
 *   "attendance_date": "YYYY-MM-DD",
 *   "absent_student_ids": ["uuid1", "uuid2"]
 * }
 */
router.post('/submit', async (req, res) => {
  try {
    const {
      timetable_id,
      attendance_date,
      absent_student_ids = []
    } = req.body;

    // Use logged in teacher ID or request body or active profile
    let teacher_id = req.user?.id || req.body.teacher_id;
    if (!teacher_id) {
      const { data: profs } = await supabase.from('profiles').select('id').limit(1);
      teacher_id = profs?.[0]?.id || '11739a08-65be-47b2-bdce-6f0cd2fff8e7';
    }

    // -----------------------------
    // Validation
    // -----------------------------
    if (!timetable_id || !attendance_date) {
      return res.status(400).json({
        success: false,
        message: 'timetable_id and attendance_date are required'
      });
    }

    if (!Array.isArray(absent_student_ids)) {
      return res.status(400).json({
        success: false,
        message: 'absent_student_ids must be an array of student UUIDs'
      });
    }

    // -----------------------------
    // Call Supabase Database Function
    // -----------------------------
    const { data, error } = await supabase.rpc('submit_attendance', {
      p_timetable_id: timetable_id,
      p_attendance_date: attendance_date,
      p_teacher_id: teacher_id,
      p_absent_student_ids: absent_student_ids
    });

    if (error) {
      console.error('Attendance RPC Submission Error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // -----------------------------
    // Automatic Google Sheets Sync
    // -----------------------------
    let googleSheetStatus = null;
    if (data?.session_id) {
      try {
        googleSheetStatus = await syncSessionToGoogleSheet(data.session_id);
      } catch (sheetErr) {
        console.warn('Google Sheets sync warning:', sheetErr.message);
        googleSheetStatus = { synced: false, error: sheetErr.message };
      }
    }

    // -----------------------------
    // Success Response
    // -----------------------------
    res.status(201).json({
      success: true,
      message: 'Attendance submitted successfully',
      result: data,
      google_sheets_sync: googleSheetStatus
    });
  } catch (error) {
    console.error('Server error in submit attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing attendance'
    });
  }
});

/**
 * POST /api/attendance/session/:session_id/sync-sheet
 * Manually re-sync an attendance session to Google Sheets
 */
router.post('/session/:session_id/sync-sheet', requireAuth(['teacher', 'admin']), async (req, res) => {
  try {
    const { session_id } = req.params;
    const result = await syncSessionToGoogleSheet(session_id);
    res.json({
      success: true,
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/attendance/session/:session_id
 * Fetches attendance session details and list of student records
 */
router.get('/session/:session_id', requireAuth(['teacher', 'admin', 'student']), async (req, res) => {
  try {
    const { session_id } = req.params;

    const { data: session, error: sessionErr } = await supabase
      .from('attendance_sessions')
      .select(`
        id,
        attendance_date,
        period_number,
        total_students,
        present_count,
        absent_count,
        status,
        submitted_at: created_at,
        classes (name, code),
        sections (name),
        subjects (name, code),
        profiles:teacher_id (full_name, email)
      `)
      .eq('id', session_id)
      .single();

    if (sessionErr || !session) {
      return res.status(404).json({ success: false, message: 'Attendance session not found' });
    }

    const { data: records, error: recErr } = await supabase
      .from('attendance_records')
      .select(`
        id,
        status,
        remarks,
        students (
          id,
          register_no,
          roll_no,
          full_name,
          email
        )
      `)
      .eq('attendance_session_id', session_id);

    if (recErr) {
      return res.status(400).json({ success: false, message: recErr.message });
    }

    res.json({
      success: true,
      session,
      records: records || []
    });
  } catch (error) {
    console.error('Server error in get session:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;