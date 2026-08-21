const express = require('express');
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth(['teacher', 'admin']));

// List swap requests for current teacher
router.get('/my-swaps', async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { data, error } = await supabase
      .from('period_swaps')
      .select(`
        id,
        swap_date,
        period_number,
        status,
        reason,
        created_at,
        requester:requester_id (id, full_name, email),
        receiver:receiver_id (id, full_name, email),
        timetable:timetable_id (
          id,
          classes (name),
          sections (name),
          subjects (name, code),
          room_no
        )
      `)
      .or(`requester_id.eq.${teacherId},receiver_id.eq.${teacherId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, swaps: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new period swap request
router.post('/request', async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { receiver_id, timetable_id, swap_date, period_number, reason } = req.body;

    if (!receiver_id || !timetable_id || !swap_date || !period_number) {
      return res.status(400).json({ success: false, message: 'Missing required swap details' });
    }

    const { data, error } = await supabase
      .from('period_swaps')
      .insert([{
        requester_id: requesterId,
        receiver_id,
        timetable_id,
        swap_date,
        period_number,
        status: 'pending',
        reason
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Substitution request sent to faculty', swap: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Accept or Reject substitution request
router.put('/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const { data, error } = await supabase
      .from('period_swaps')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: `Substitution request ${status}`, swap: data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
