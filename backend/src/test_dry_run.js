require('dotenv').config();
const supabase = require('./config/supabase');

const BASE_URL = 'http://localhost:5050/api';

async function dryRun() {
  console.log('====================================================');
  console.log('🧪 STARTING COMPREHENSIVE SYSTEM DRY RUN');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(testName, ok, detail = '') {
    if (ok) {
      console.log(`[PASS] ${testName} ${detail}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${detail}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Database Entities & Dr. Arige Sumanth Profile
    // ----------------------------------------------------
    const { data: profs } = await supabase.from('profiles').select('id, full_name, email, role');
    const teacher = profs && profs[0];
    report('1. Profile Check', !!teacher, `Teacher: ${teacher?.full_name} (${teacher?.email}, role: ${teacher?.role})`);

    // ----------------------------------------------------
    // TEST 2: Student Count (IT A & IT B)
    // ----------------------------------------------------
    const { data: stdA } = await supabase.from('students').select('id').eq('section_id', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    const { data: stdB } = await supabase.from('students').select('id').eq('section_id', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    const totalStd = (stdA?.length || 0) + (stdB?.length || 0);
    report('2. Student Roster', totalStd === 141, `Total: ${totalStd} (IT A: ${stdA?.length}/71, IT B: ${stdB?.length}/70)`);

    // ----------------------------------------------------
    // TEST 3: Timetable Retrieval for Teacher
    // ----------------------------------------------------
    const ttRes = await fetch(`${BASE_URL}/timetable/teacher/today?date=2026-08-25`); // Tuesday
    const ttData = await ttRes.json();
    report('3. Teacher Timetable API', ttData.success && ttData.classes?.length > 0, `Returned ${ttData.classes?.length} periods for teacher`);

    const sampleSlot = ttData.classes?.[0];
    const timetableId = sampleSlot?.id;

    // ----------------------------------------------------
    // TEST 4: Student Roster Retrieval for Selected Period
    // ----------------------------------------------------
    let rosterData = null;
    if (timetableId) {
      const rosterRes = await fetch(`${BASE_URL}/timetable/${timetableId}/students`);
      rosterData = await rosterRes.json();
      report('4. Period Student Roster API', rosterData.success && rosterData.students?.length > 0, `Roster count: ${rosterData.students?.length}`);
    }

    // ----------------------------------------------------
    // TEST 5: Attendance Submission & Google Sheet Sync
    // ----------------------------------------------------
    if (sampleSlot && rosterData?.students?.length > 0) {
      const absentSample = [rosterData.students[0].id, rosterData.students[1].id];
      const submitRes = await fetch(`${BASE_URL}/attendance/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetable_id: timetableId,
          attendance_date: '2026-08-25',
          absent_student_ids: absentSample,
          teacher_id: teacher?.id
        })
      });
      const submitData = await submitRes.json();
      report('5. Attendance Submission & GS Sync', submitData.success, `Present: ${submitData.session?.present_count}, Absent: ${submitData.session?.absent_count}`);
    }

    // ----------------------------------------------------
    // TEST 6: Extra Class Scheduler
    // ----------------------------------------------------
    const extraRes = await fetch(`${BASE_URL}/extra-classes/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        section_id: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        subject_id: '33333333-cccc-cccc-cccc-cccccccccccc',
        class_date: '2026-08-26',
        start_time: '16:00',
        end_time: '17:00',
        room_no: 'IT Hall 201',
        description: 'Dry run review session',
        teacher_id: teacher?.id
      })
    });
    const extraData = await extraRes.json();
    report('6. Extra Class Scheduling', extraData.success, `Created session ID: ${extraData.extra_class?.id}`);

    // ----------------------------------------------------
    // TEST 7: Admin Passcode Verification
    // ----------------------------------------------------
    const passRes = await fetch(`${BASE_URL}/admin/verify-passcode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: 'IT@123' })
    });
    const passData = await passRes.json();
    report('7. Admin Passkey Gate (IT@123)', passData.success, passData.message);

    // ----------------------------------------------------
    // TEST 8: Admin Master CRUD APIs (Classes, Timetable, Stats)
    // ----------------------------------------------------
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'x-admin-passcode': 'IT@123' }
    });
    const statsData = await statsRes.json();
    report('8. Admin Stats API', statsData.success, `Students: ${statsData.stats?.total_students}, Classes: ${statsData.stats?.total_classes}, Subjects: ${statsData.stats?.total_subjects}`);

    // ----------------------------------------------------
    // TEST 9: Admin Student Creation & Deletion
    // ----------------------------------------------------
    const createStdRes = await fetch(`${BASE_URL}/admin/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-passcode': 'IT@123'
      },
      body: JSON.stringify({
        register_no: '3122255002999',
        roll_no: '999',
        full_name: 'Dry Run Student',
        email: 'dryrun@ssn.edu.in',
        class_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        section_id: '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      })
    });
    const createStdData = await createStdRes.json();
    report('9a. Admin Add Student API', createStdData.success, `Created student ID: ${createStdData.student?.id}`);

    if (createStdData.student?.id) {
      const delStdRes = await fetch(`${BASE_URL}/admin/students/${createStdData.student.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-passcode': 'IT@123' }
      });
      const delStdData = await delStdRes.json();
      report('9b. Admin Delete Student API', delStdData.success, 'Cleaned test student');
    }

  } catch (err) {
    console.error('Fatal Dry Run Exception:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 DRY RUN SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

dryRun();
