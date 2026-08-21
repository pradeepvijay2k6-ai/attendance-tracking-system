require('dotenv').config();
const supabase = require('../config/supabase');

/**
 * Clears all application data (students, classes, subjects, timetables, attendance, swaps, etc.)
 * Leaves auth profiles intact and promotes existing users to admin so they can manage the fresh system.
 */
async function cleanResetData() {
  console.log('🧹 Starting Complete Application Data Reset...');

  try {
    // 1. Clear transactional records
    await supabase.from('regularization_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('period_swaps').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('extra_classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('attendance_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('attendance_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('timetables').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Clear student roster
    await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 3. Clear academic master structure
    await supabase.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('departments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 4. Ensure current user profile has admin role
    const { data: profiles } = await supabase.from('profiles').select('id');
    if (profiles && profiles.length > 0) {
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', profiles[0].id);
    }

    console.log('✓ All application records cleared successfully! System is fresh and ready for clean data entry.');
    return { success: true, message: 'All application data has been wiped clean. Database is ready for new data.' };
  } catch (error) {
    console.error('Reset error:', error);
    return { success: false, error: error.message };
  }
}

if (require.main === module) {
  cleanResetData();
}

module.exports = { cleanResetData };
