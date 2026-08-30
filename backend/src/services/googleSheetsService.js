const supabase = require('../config/supabase');

/**
 * Syncs an attendance session and its student records to the Department Google Sheet
 * @param {string} sessionId UUID of the attendance session
 */
async function syncSessionToGoogleSheet(sessionId, topicsCovered = '') {
  try {
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

    // 1. Fetch the full session details from Supabase
    const { data: session, error: sessionErr } = await supabase
      .from('attendance_sessions')
      .select(`
        id,
        timetable_id,
        attendance_date,
        period_number,
        total_students,
        present_count,
        absent_count,
        status,
        classes (id, name, code),
        sections (id, name),
        subjects (id, name, code),
        profiles:teacher_id (full_name, email)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      throw new Error(`Session ${sessionId} not found: ${sessionErr?.message}`);
    }

    // 2. Fetch section info if not in join
    let sectionId = session.sections?.id;
    let sectionName = session.sections?.name;
    if (!sectionId && session.timetable_id) {
      const { data: tt } = await supabase
        .from('timetables')
        .select('section_id, sections(name), subjects(name, code), classes(name)')
        .eq('id', session.timetable_id)
        .single();
      sectionId = tt?.section_id;
      sectionName = tt?.sections?.name;
    }
    sectionName = sectionName || (sectionId === '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb' ? 'IT B' : 'IT A');
    sectionId = sectionId || (sectionName === 'IT B' ? '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb' : '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

    // 3. Fetch all students in the class/section to guarantee 100% complete roster
    const { data: allStudents } = await supabase
      .from('students')
      .select('id, register_no, roll_no, full_name, email')
      .eq('section_id', sectionId)
      .eq('is_active', true)
      .order('roll_no', { ascending: true });

    // 4. Fetch status records for this session
    const { data: records } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('attendance_session_id', sessionId);

    const statusMap = {};
    (records || []).forEach((r) => {
      statusMap[r.student_id] = (r.status || 'present').toUpperCase();
    });

    const formattedRecords = (allStudents || []).map((s) => ({
      roll_no: s.roll_no || '',
      register_no: s.register_no || '',
      full_name: s.full_name || '',
      email: s.email || '',
      status: statusMap[s.id] || 'PRESENT'
    }));

    const sheetPayload = {
      action: 'UPDATE_ATTENDANCE',
      session_id: session.id,
      date: session.attendance_date,
      period: `Period ${session.period_number || 1}`,
      period_number: session.period_number || 1,
      subject_name: session.subjects?.name || 'Introduction to Digital Communications',
      subject_code: session.subjects?.code || 'IDC101',
      class_name: session.classes?.name || 'B.Tech IT - 2025 Batch',
      section_name: sectionName,
      teacher_name: session.profiles?.full_name || 'Faculty Member',
      teacher_email: session.profiles?.email || '',
      topics_covered: topicsCovered || '',
      total_students: formattedRecords.length || session.total_students,
      present_count: session.present_count,
      absent_count: session.absent_count,
      records: formattedRecords,
      timestamp: new Date().toISOString()
    };

    // 5. Send payload to Google Sheets Webhook
    if (!webhookUrl) {
      console.log('ℹ️ GOOGLE_SHEET_WEBHOOK_URL is not configured in .env yet.');
      return {
        synced: false,
        message: 'Google Sheet Webhook URL not configured.',
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
      message: 'Successfully updated in Google Sheet',
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
