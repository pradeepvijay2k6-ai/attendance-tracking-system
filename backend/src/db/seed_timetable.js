const supabase = require('../config/supabase');

const PERIOD_TIMINGS = {
  1: { start: '08:00:00', end: '08:45:00' },
  2: { start: '08:45:00', end: '09:30:00' },
  3: { start: '09:50:00', end: '10:35:00' },
  4: { start: '10:35:00', end: '11:20:00' },
  5: { start: '12:20:00', end: '13:05:00' },
  6: { start: '13:05:00', end: '13:50:00' },
  7: { start: '14:10:00', end: '14:55:00' },
  8: { start: '14:55:00', end: '15:40:00' },
};

const SUBJECTS_DATA = [
  { code: 'UMA3353', name: 'Mathematical Foundations for Computing Technology', semester: 5 },
  { code: 'UHS3386', name: 'Universal Human Values 2: Understanding Harmony', semester: 5 },
  { code: 'UIT3361', name: 'Object-Oriented Programming Using Java', semester: 5 },
  { code: 'UIT3301', name: 'Database Technology', semester: 5 },
  { code: 'UIT3362', name: 'Principles of Software Engineering and Practices', semester: 5 },
  { code: 'UGE3386', name: 'Design Thinking, Innovation and Entrepreneurship', semester: 5 },
  { code: 'UIT3363', name: 'Digital Systems and Microprocessors Design', semester: 5 },
  { code: 'UIT3302', name: 'Introduction to Digital Communication', semester: 5 },
  { code: 'UITV303', name: 'Skill Development Software - 1', semester: 5 },
  { code: 'UPA3341', name: 'Indian Democracy and Constitution', semester: 5 },
  // Special/Non-academic slots
  { code: 'LIB101', name: 'Library', semester: 5 },
  { code: 'MTR101', name: 'Mentor / Self Learning / Minors', semester: 5 },
  { code: 'IFP101', name: 'Internal Funded Project', semester: 5 },
];

const TEACHERS_INITIALS = {
  'ASU': { name: 'Dr. Arige Sumanth (ASU)', email: 'smarige@gmail.com' },
  'HS':  { name: 'Faculty HS (HS)', email: 'hs.faculty@institution.edu' },
  'NK':  { name: 'Faculty NK (NK)', email: 'nk.faculty@institution.edu' },
  'VT':  { name: 'Faculty VT (VT)', email: 'vt.faculty@institution.edu' },
  'GS':  { name: 'Faculty GS (GS)', email: 'gs.faculty@institution.edu' },
  'SV':  { name: 'Faculty SV (SV)', email: 'sv.faculty@institution.edu' },
  'VS':  { name: 'Faculty VS (VS)', email: 'vs.faculty@institution.edu' },
  'SDP': { name: 'Faculty SDP (SDP)', email: 'sdp.faculty@institution.edu' },
  'PJ':  { name: 'Faculty PJ (PJ)', email: 'pj.faculty@institution.edu' },
  'MMI': { name: 'Faculty MMI (MMI)', email: 'mmi.faculty@institution.edu' },
};

const TIMETABLE_RAW = {
  'III_IT_A': {
    'MON': { 1: 'UIT3361 (HS)', 2: 'UIT3301 (NK)', 3: 'UGE3386 (VT)', 4: 'UGE3386 (VT)', 5: 'UIT3362 (GS)' },
    'TUE': { 1: 'UMA3353 (SV)', 2: 'UIT3363 (VS)', 3: 'UIT3361 (HS)', 4: 'UIT3301 (NK)', 5: 'UIT3302 (ASU)', 6: 'UHS3386 (SDP)', 7: 'UHS3386 (SDP)', 8: 'Library' },
    'WED': { 1: 'UGE3386 (VT)', 2: 'UGE3386 (VT)', 3: 'Mentor / Self Learning / Minors', 4: 'UIT3363 (VS)', 7: 'UITV303', 8: 'UMA3353 (SV)' },
    'THU': { 1: 'UIT3362 (GS)', 2: 'UIT3302 (ASU)', 3: 'UIT3301 (NK)', 4: 'UHS3386 (SDP)', 5: 'UMA3353 (SV)', 6: 'Internal Funded Project' },
    'FRI': { 1: 'UIT3363 (VS)', 2: 'UIT3302 (ASU)', 3: 'UHS3386 (SDP)', 4: 'UHS3386 (SDP)', 5: 'UMA3353 (SV)' }
  },
  'III_IT_B': {
    'MON': { 1: 'UIT3302 (ASU)', 2: 'UIT3363 (VS)', 3: 'UHS3386 (SDP)', 4: 'UMA3353 (PJ)', 5: 'UIT3301 (NK)', 6: 'UHS3386 (SDP)', 7: 'UHS3386 (SDP)', 8: 'Library' },
    'TUE': { 1: 'UGE3386 (VT)', 2: 'UGE3386 (VT)', 3: 'UIT3302 (ASU)', 4: 'UMA3353 (PJ)', 5: 'UIT3363 (VS)', 6: 'Internal Funded Project' },
    'WED': { 1: 'UMA3353 (PJ)', 2: 'UMA3353 (PJ)', 3: 'Mentor / Self Learning / Minors', 4: 'UGE3386 (VT)', 5: 'UITV303' },
    'THU': { 1: 'UIT3301 (NK)', 2: 'UHS3386 (SDP)', 3: 'UIT3361 (MMI)', 4: 'UGE3386 (VT)', 5: 'UIT3362 (GS)' },
    'FRI': { 1: 'UIT3301 (NK)', 2: 'UIT3361 (MMI)', 3: 'UIT3362 (GS)', 4: 'UIT3363 (VS)', 5: 'UMA3353 (PJ)', 6: 'UIT3302 (ASU)' }
  }
};

const DAY_MAP = { 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5 };

async function seed() {
  console.log('🚀 Starting Timetable & Subjects Seeding...');

  // 1. Department
  let { data: dept } = await supabase.from('departments').select('*').eq('code', 'IT').maybeSingle();
  if (!dept) {
    const { data: newDept, error } = await supabase.from('departments').insert({ name: 'Information Technology', code: 'IT' }).select().single();
    if (error) console.error('Error creating IT dept:', error);
    dept = newDept;
  }
  console.log('✅ Department ready:', dept?.id, dept?.name);

  // 2. Class: B.Tech IT - III Year (Semester 5)
  let { data: cls } = await supabase.from('classes').select('*').ilike('name', '%III%').maybeSingle();
  if (!cls) {
    let { data: firstCls } = await supabase.from('classes').select('*').limit(1).maybeSingle();
    if (firstCls) {
      cls = firstCls;
    } else {
      const { data: newCls, error } = await supabase.from('classes').insert({
        name: 'B.Tech IT - III Year',
        code: 'IT-III-2025',
        year: 3,
        semester: 5,
        department_id: dept?.id
      }).select().single();
      if (error) console.error('Error creating class:', error);
      cls = newCls;
    }
  }
  console.log('✅ Class ready:', cls?.id, cls?.name);

  // 3. Sections: IT A and IT B
  const sectionsMap = {};
  for (const secName of ['IT A', 'IT B']) {
    let { data: sec } = await supabase.from('sections').select('*').eq('class_id', cls.id).eq('name', secName).maybeSingle();
    if (!sec) {
      const { data: newSec, error } = await supabase.from('sections').insert({
        class_id: cls.id,
        name: secName
      }).select().single();
      if (error) console.error('Error creating section:', secName, error);
      sec = newSec;
    }
    const key = secName === 'IT A' ? 'III_IT_A' : 'III_IT_B';
    sectionsMap[key] = sec;
    console.log(`✅ Section ${secName} ready:`, sec?.id);
  }

  // 4. Subjects
  const subjectsMap = {};
  for (const s of SUBJECTS_DATA) {
    let { data: sub } = await supabase.from('subjects').select('*').eq('code', s.code).maybeSingle();
    if (!sub) {
      const { data: newSub, error } = await supabase.from('subjects').insert({
        code: s.code,
        name: s.name,
        semester: s.semester,
        department_id: dept?.id
      }).select().single();
      if (error) console.error('Error creating subject:', s.code, error);
      sub = newSub;
    } else {
      await supabase.from('subjects').update({ name: s.name, semester: s.semester }).eq('id', sub.id);
    }
    subjectsMap[s.code] = sub;
    subjectsMap[s.name] = sub;
    console.log(`✅ Subject ${s.code} ready:`, sub?.name);
  }

  // 5. Teachers
  const teachersMap = {};
  const { data: existingProfiles } = await supabase.from('profiles').select('*');
  let fallbackTeacher = existingProfiles?.find(p => p.role === 'teacher' || p.email === 'smarige@gmail.com') || existingProfiles?.[0];

  for (const [initial, info] of Object.entries(TEACHERS_INITIALS)) {
    let prof = existingProfiles?.find(p => p.email?.toLowerCase() === info.email.toLowerCase() || p.full_name?.includes(`(${initial})`));
    if (!prof) {
      // Upsert profile
      const { data: newProf, error } = await supabase.from('profiles').upsert({
        email: info.email,
        full_name: info.name,
        role: 'teacher',
        department: 'Information Technology'
      }).select().maybeSingle();
      prof = newProf || fallbackTeacher;
    }
    teachersMap[initial] = prof || fallbackTeacher;
    console.log(`✅ Faculty [${initial}] ready:`, prof?.full_name || info.name);
  }

  // 6. Timetables
  for (const [secKey, secObj] of Object.entries(sectionsMap)) {
    if (secObj?.id) {
      await supabase.from('timetables').delete().eq('class_id', cls.id).eq('section_id', secObj.id);
    }
  }

  let totalSlotsInserted = 0;

  for (const [secKey, days] of Object.entries(TIMETABLE_RAW)) {
    const secObj = sectionsMap[secKey];
    if (!secObj) continue;

    for (const [dayStr, periods] of Object.entries(days)) {
      const dayOfWeek = DAY_MAP[dayStr];
      if (!dayOfWeek) continue;

      for (const [periodNumStr, slotVal] of Object.entries(periods)) {
        if (!slotVal) continue;
        const periodNum = parseInt(periodNumStr, 10);
        const timing = PERIOD_TIMINGS[periodNum];
        if (!timing) continue;

        let subjectCode = null;
        let teacherInitial = null;

        const matchWithTeacher = slotVal.match(/^([A-Z0-9]+)\s*\(([A-Z]+)\)$/i);
        if (matchWithTeacher) {
          subjectCode = matchWithTeacher[1].toUpperCase();
          teacherInitial = matchWithTeacher[2].toUpperCase();
        } else if (subjectsMap[slotVal.toUpperCase()]) {
          subjectCode = slotVal.toUpperCase();
        } else if (slotVal === 'Library') {
          subjectCode = 'LIB101';
        } else if (slotVal === 'Mentor / Self Learning / Minors') {
          subjectCode = 'MTR101';
        } else if (slotVal === 'Internal Funded Project') {
          subjectCode = 'IFP101';
        } else if (slotVal.startsWith('UITV303')) {
          subjectCode = 'UITV303';
        }

        const subjectObj = subjectsMap[subjectCode] || subjectsMap[slotVal];
        const teacherObj = (teacherInitial && teachersMap[teacherInitial]) ? teachersMap[teacherInitial] : fallbackTeacher;

        if (subjectObj && teacherObj) {
          const { error: insErr } = await supabase.from('timetables').insert({
            class_id: cls.id,
            section_id: secObj.id,
            subject_id: subjectObj.id,
            teacher_id: teacherObj.id,
            day_of_week: dayOfWeek,
            period_number: periodNum,
            start_time: timing.start,
            end_time: timing.end,
            room_no: secKey === 'III_IT_A' ? 'Room 201' : 'Room 202'
          });

          if (insErr) {
            console.error(`Error inserting slot ${secKey} ${dayStr} P${periodNum}:`, insErr.message);
          } else {
            totalSlotsInserted++;
          }
        }
      }
    }
  }

  console.log(`🎉 Seeding complete! Successfully inserted ${totalSlotsInserted} timetable period slots with exact timings across III_IT_A and III_IT_B.`);
}

seed().catch(console.error);
