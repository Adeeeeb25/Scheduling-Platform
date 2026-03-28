const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { EventType, Availability, Booking } = require('../models');
const { publicBookingsController } = require('../controllers');

// Get event type by slug (public)
router.get('/event-types/:slug', async (req, res, next) => {
  try {
    const eventType = await EventType.getBySlug(req.params.slug);
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }
    res.json(eventType);
  } catch (error) {
    next(error);
  }
});

// Get available time slots for a date (public)
router.get('/availability/:slug', async (req, res, next) => {
  try {
    const { date } = req.query; // YYYY-MM-DD format

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    const eventType = await EventType.getBySlug(req.params.slug);
    if (!eventType) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dateObj = new Date(date + 'T00:00:00Z');
    const dayOfWeek = dateObj.getUTCDay();

    // Get availability for this day
    const [availability] = await pool.query(
      'SELECT * FROM availability_schedules WHERE user_id = ? AND day_of_week = ?',
      [eventType.user_id, dayOfWeek]
    );

    if (availability.length === 0) {
      return res.json({ availableSlots: [] });
    }

    const avail = availability[0];

    // Generate 30-minute slots between start and end time
    const slots = [];
    const startTime = new Date(`2000-01-01T${avail.start_time}`);
    const endTime = new Date(`2000-01-01T${avail.end_time}`);
    const duration = eventType.duration_minutes;

    let currentTime = startTime;
    while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
      const timeStr = currentTime.toTimeString().slice(0, 5);
      slots.push(timeStr);
      currentTime = new Date(currentTime.getTime() + duration * 60000);
    }

    // Get booked slots for this event type on this date
    const [bookedSlots] = await pool.query(
      'SELECT booked_time FROM bookings WHERE event_type_id = ? AND booked_date = ? AND status != ?',
      [eventType.id, date, 'cancelled']
    );

    const bookedTimes = bookedSlots.map(b => b.booked_time.slice(0, 5));
    const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));

    res.json({
      date,
      dayOfWeek,
      eventType: eventType.slug,
      availableSlots,
      eventDuration: eventType.duration_minutes
    });
  } catch (error) {
    next(error);
  }
});

// Create booking (public)
router.post('/bookings', publicBookingsController.create);

// Get booking confirmation (public)
router.get('/bookings/:id/confirmation', async (req, res, next) => {
  try {
    const booking = await Booking.getById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
