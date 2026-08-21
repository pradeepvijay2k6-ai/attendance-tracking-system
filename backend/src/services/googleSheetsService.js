const supabase = require('../config/supabase');

/**
 * Syncs an attendance session and its student records to the Teacher's Google Sheet
 * @param {string} sessionId UUID of the attendance session
 */
async function syncSessionToGoogleSheet(sessionId) {
  try {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    // 1. Fetch the full session details from Supabase
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
        classes (name, code),
        sections (name),
        subjects (name, code),
        profiles:teacher_id (full_name, email)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      throw new Error(`Session ${sessionId} not found: ${sessionErr?.message}`);
    }

    // 2. Fetch all student records for this session
    const { data: records, error: recordsErr } = await supabase
      .from('attendance_records')
      .select(`
        status,
        remarks,
        students (
          register_no,
          roll_no,
          full_name,
          email
        )
      `)
      .eq('attendance_session_id', sessionId)
      .order('students(roll_no)', { ascending: true });

    if (recordsErr) {
      throw new Error(`Failed to load student records: ${recordsErr?.message}`);
    }

    // 3. Format the payload for Google Sheets
    const formattedRecords = (records || []).map((r) => ({
      roll_no: r.students?.roll_no || '',
      register_no: r.students?.register_no || '',
      full_name: r.students?.full_name || '',
      email: r.students?.email || '',
      status: (r.status || 'present').toUpperCase()
    }));

    const sheetPayload = {
      action: 'UPDATE_ATTENDANCE',
      session_id: session.id,
      date: session.attendance_date,
      period: `Period ${session.period_number}`,
      period_number: session.period_number,
      subject_name: session.subjects?.name || 'Introduction to Digital Communications',
      subject_code: session.subjects?.code || 'IDC101',
      class_name: session.classes?.name || 'B.Tech IT',
      section_name: session.sections?.name || 'IT A',
      teacher_name: session.profiles?.full_name || 'Dr. Arige Sumanth',
      teacher_email: session.profiles?.email || '',
      total_students: session.total_students,
      present_count: session.present_count,
      absent_count: session.absent_count,
      records: formattedRecords,
      timestamp: new Date().toISOString()
    };

    // 4. Send payload to Google Sheets Webhook if configured
    if (!webhookUrl) {
      console.log('ℹ️ GOOGLE_SHEET_WEBHOOK_URL is not configured in .env yet. Prepared payload:', {
        date: sheetPayload.date,
        period: sheetPayload.period,
        section: sheetPayload.section_name,
        present: sheetPayload.present_count,
        absent: sheetPayload.absent_count
      });
      return {
        synced: false,
        message: 'Google Sheet Webhook URL not configured. Set GOOGLE_SHEET_WEBHOOK_URL in backend/.env',
        payload: sheetPayload
      };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetPayload),
      redirect: 'follow'
    });

    const result = await response.text();
    console.log(`✓ Attendance successfully synced to Google Sheet for ${sheetPayload.section_name}:`, result);

    return {
      synced: true,
      message: 'Successfully updated in teacher Google Sheet',
      response: result
    };
  } catch (error) {
    console.error('Google Sheets Sync Error:', error.message);
    return {
      synced: false,
      error: error.message
    };
  }
}

module.exports = {
  syncSessionToGoogleSheet
};
