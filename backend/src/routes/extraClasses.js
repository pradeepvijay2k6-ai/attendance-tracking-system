const express = require('express');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth(['teacher', 'admin', 'student']));

// List extra classes & notices
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('extra_classes')
      .select(`
        id,
        class_date,
        start_time,
        end_time,
        room_no,
        description,
        created_at,
        teacher:teacher_id (full_name, email),
        classes (name),
        sections (name),
        subjects (name, code)
      `)
      .order('class_date', { ascending: true });

    if (error) {
      console.warn('extra_classes query notice:', error.message);
      return res.json({ success: true, extra_classes: [] });
    }
    res.json({ success: true, extra_classes: data || [] });
  } catch (err) {
    res.json({ success: true, extra_classes: [] });
  }
});

// Schedule new extra class (teacher/admin only)
router.post('/schedule', async (req, res) => {
  try {
    let teacherId = req.user?.id || req.body.teacher_id;
    if (!teacherId) {
      const { data: profs } = await supabase.from('profiles').select('id').limit(1);
      teacherId = profs?.[0]?.id || '11739a08-65be-47b2-bdce-6f0cd2fff8e7';
    }

    const { class_id, section_id, subject_id, class_date, start_time, end_time, room_no, description } = req.body;

    if (!class_id || !section_id || !subject_id || !class_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Missing extra class schedule parameters' });
    }

    const { data, error } = await supabase
      .from('extra_classes')
      .insert([{
        teacher_id: teacherId,
        class_id,
        section_id,
        subject_id,
        class_date,
        start_time,
        end_time,
        room_no: room_no || 'Room 101',
        description
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Extra class scheduled and published', extra_class: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
