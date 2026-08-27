/**
 * insert_student_smarige.js
 * Inserts smarige@gmail.com into the B.Tech IT 2025 IT B section
 * and links the Supabase auth profile if it exists.
 *
 * Run: node backend/src/db/insert_student_smarige.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lbafexslnhilrrfbgbfi.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_osNCCZWZcaFlz5J_BlgKZQ_hpzoziSc'
);

const CLASS_ID   = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // B.Tech IT - 2025 Batch
const SECTION_ID = '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; // IT B

async function run() {
  console.log('Inserting student smarige@gmail.com …');

  // 1. Upsert student record
  const { data: student, error } = await supabase
    .from('students')
    .upsert([{
      register_no: '3122255002142',
      roll_no:     '142',
      full_name:   'S. Arige',
      email:       'smarige@gmail.com',
      class_id:    CLASS_ID,
      section_id:  SECTION_ID,
      is_active:   true
    }], { onConflict: 'email' })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to upsert student:', error.message);
    process.exit(1);
  }
  console.log('✅ Student upserted:', student);

  // 2. Try to link to an existing Supabase auth profile
  const { data: prof } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'smarige@gmail.com')
    .maybeSingle();

  if (prof?.id && !student.profile_id) {
    const { error: linkErr } = await supabase
      .from('students')
      .update({ profile_id: prof.id })
      .eq('email', 'smarige@gmail.com');
    if (linkErr) console.warn('⚠ Could not link profile_id:', linkErr.message);
    else         console.log('✅ Linked profile_id:', prof.id);
  } else if (!prof) {
    console.log('ℹ No auth profile found for smarige@gmail.com yet (will link on first login).');
  }

  // 3. Verify: show the student + their timetable slots
  const { data: verify } = await supabase
    .from('students')
    .select(`
      register_no, roll_no, full_name, email, is_active,
      classes(name, code),
      sections(name)
    `)
    .eq('email', 'smarige@gmail.com')
    .single();
  console.log('\n📋 Student record:');
  console.log('  Name      :', verify?.full_name);
  console.log('  Email     :', verify?.email);
  console.log('  Roll No   :', verify?.roll_no);
  console.log('  Reg No    :', verify?.register_no);
  console.log('  Class     :', verify?.classes?.name);
  console.log('  Section   :', verify?.sections?.name);

  const { data: slots } = await supabase
    .from('timetables')
    .select('day_of_week, period_number, start_time, end_time, room_no, subjects(name, code), profiles(full_name)')
    .eq('class_id',   CLASS_ID)
    .eq('section_id', SECTION_ID)
    .order('day_of_week',   { ascending: true })
    .order('period_number', { ascending: true });

  const DAYS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  console.log(`\n📅 Timetable (${slots?.length || 0} slots assigned to Dr. Arige Sumanth for IT B):`);
  (slots || []).forEach(s => {
    console.log(`  ${DAYS[s.day_of_week]} P${s.period_number}  ${s.start_time}–${s.end_time}  ${s.subjects?.code}  ${s.profiles?.full_name}  ${s.room_no}`);
  });

  console.log('\n✅ Done! smarige@gmail.com is now enrolled in Dr. Arige Sumanth\'s IDC101 classes.');
}

run().catch(err => { console.error(err); process.exit(1); });
