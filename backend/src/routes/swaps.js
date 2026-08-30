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

// Create new period swap request with conflict detection
router.post('/request', async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { receiver_id, timetable_id, swap_date, period_number, reason } = req.body;

    if (!receiver_id || !timetable_id || !swap_date || !period_number) {
      return res.status(400).json({ success: false, message: 'Missing required swap details' });
    }

    if (receiver_id === requesterId) {
      return res.status(400).json({ success: false, message: 'Cannot swap a period with yourself' });
    }

    // Determine target day of week for conflict check
    const targetDate = new Date(swap_date);
    let dayOfWeek = targetDate.getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // 1. Conflict Check: Check if receiver faculty is already teaching in this period on this day
    const { data: conflictingSlots } = await supabase
      .from('timetables')
      .select('id, period_number, subjects(name)')
      .eq('teacher_id', receiver_id)
      .eq('day_of_week', dayOfWeek)
      .eq('period_number', parseInt(period_number, 10));

    if (conflictingSlots && conflictingSlots.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Conflict: Selected faculty already has a class scheduled for Period ${period_number} on ${swap_date}. Please choose another substitute or period.`
      });
    }

    // 2. Conflict Check: Check if there is already an active/approved swap for this slot on this date
    const { data: existingSwaps } = await supabase
      .from('period_swaps')
      .select('id, status')
      .eq('timetable_id', timetable_id)
      .eq('swap_date', swap_date)
      .in('status', ['pending', 'approved']);

    if (existingSwaps && existingSwaps.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A substitution request is already active for this class on this date.'
      });
    }

    const { data, error } = await supabase
      .from('period_swaps')
      .insert([{
        requester_id: requesterId,
        receiver_id,
        timetable_id,
        swap_date,
        period_number: parseInt(period_number, 10),
        status: 'pending',
        reason
      }])
      .select(`
        *,
        requester:requester_id (id, full_name, email),
        receiver:receiver_id (id, full_name, email)
      `)
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
    const userId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    // Ensure only the receiver (or admin) can approve/reject
    const { data: currentSwap, error: fetchErr } = await supabase
      .from('period_swaps')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !currentSwap) {
      return res.status(404).json({ success: false, message: 'Substitution request not found' });
    }

    if (currentSwap.receiver_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Only the assigned substitute can respond to this request.' });
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

// Cancel substitution request (by requester)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: currentSwap } = await supabase
      .from('period_swaps')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentSwap) {
      return res.status(404).json({ success: false, message: 'Substitution request not found' });
    }

    if (currentSwap.requester_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this request' });
    }

    const { error } = await supabase.from('period_swaps').delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true, message: 'Substitution request cancelled successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

