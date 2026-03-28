const pool = require('../config/db');

// Event Types Model
const EventType = {
  // Create event type
  create: async (userId, title, description, slug, duration, dateFrom = null, dateTo = null) => {
    const [result] = await pool.query(
      'INSERT INTO event_types (user_id, title, description, slug, duration_minutes, date_from, date_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, description, slug, duration, dateFrom, dateTo]
    );
    return result.insertId;
  },

  // Get all event types for a user
  getByUserId: async (userId) => {
    const [rows] = await pool.query('SELECT * FROM event_types WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
  },

  // Get single event type by ID
  getById: async (eventTypeId) => {
    const [rows] = await pool.query('SELECT * FROM event_types WHERE id = ?', [eventTypeId]);
    return rows[0] || null;
  },

  // Get event type by slug
  getBySlug: async (slug) => {
    const [rows] = await pool.query('SELECT * FROM event_types WHERE slug = ?', [slug]);
    return rows[0] || null;
  },

  // Update event type
  update: async (eventTypeId, title, description, duration, dateFrom = null, dateTo = null) => {
    const [result] = await pool.query(
      'UPDATE event_types SET title = ?, description = ?, duration_minutes = ?, date_from = ?, date_to = ? WHERE id = ?',
      [title, description, duration, dateFrom, dateTo, eventTypeId]
    );
    return result.affectedRows > 0;
  },

  // Delete event type
  delete: async (eventTypeId) => {
    const [result] = await pool.query('DELETE FROM event_types WHERE id = ?', [eventTypeId]);
    return result.affectedRows > 0;
  }
};

// Availability Model
const Availability = {
  // Get availability by user
  getByUserId: async (userId) => {
    const [rows] = await pool.query(
      'SELECT * FROM availability_schedules WHERE user_id = ? ORDER BY day_of_week ASC',
      [userId]
    );
    return rows;
  },

  // Create or update availability
  upsert: async (userId, dayOfWeek, startTime, endTime) => {
    const [existing] = await pool.query(
      'SELECT id FROM availability_schedules WHERE user_id = ? AND day_of_week = ?',
      [userId, dayOfWeek]
    );

    if (existing.length > 0) {
      const [result] = await pool.query(
        'UPDATE availability_schedules SET start_time = ?, end_time = ? WHERE user_id = ? AND day_of_week = ?',
        [startTime, endTime, userId, dayOfWeek]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await pool.query(
        'INSERT INTO availability_schedules (user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [userId, dayOfWeek, startTime, endTime]
      );
      return result.insertId > 0;
    }
  },

  // Delete availability for a day
  delete: async (userId, dayOfWeek) => {
    const [result] = await pool.query(
      'DELETE FROM availability_schedules WHERE user_id = ? AND day_of_week = ?',
      [userId, dayOfWeek]
    );
    return result.affectedRows > 0;
  }
};

// Bookings Model
const Booking = {
  // Create booking
  create: async (eventTypeId, bookerName, bookerEmail, bookedDate, bookedTime) => {
    const [result] = await pool.query(
      'INSERT INTO bookings (event_type_id, booker_name, booker_email, booked_date, booked_time) VALUES (?, ?, ?, ?, ?)',
      [eventTypeId, bookerName, bookerEmail, bookedDate, bookedTime]
    );
    return result.insertId;
  },

  // Get booking by ID
  getById: async (bookingId) => {
    const [rows] = await pool.query(
      `SELECT b.*, et.title, et.duration_minutes
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE b.id = ?`,
      [bookingId]
    );
    return rows[0] || null;
  },

  // Get all bookings for an event type
  getByEventTypeId: async (eventTypeId) => {
    const [rows] = await pool.query(
      'SELECT * FROM bookings WHERE event_type_id = ? ORDER BY booked_date DESC, booked_time DESC',
      [eventTypeId]
    );
    return rows;
  },

  // Get all bookings for a user (through event types)
  getByUserId: async (userId) => {
    const [rows] = await pool.query(
      `SELECT b.*, et.title, et.slug
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE et.user_id = ?
       ORDER BY b.booked_date DESC, b.booked_time DESC`,
      [userId]
    );
    return rows;
  },

  // Check if time slot is available
  isSlotAvailable: async (eventTypeId, bookedDate, bookedTime) => {
    const [rows] = await pool.query(
      'SELECT id FROM bookings WHERE event_type_id = ? AND booked_date = ? AND booked_time = ? AND status != ?',
      [eventTypeId, bookedDate, bookedTime, 'cancelled']
    );
    return rows.length === 0;
  },

  // Cancel booking
  cancel: async (bookingId) => {
    const [result] = await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      ['cancelled', bookingId]
    );
    return result.affectedRows > 0;
  },

  // Get upcoming bookings
  getUpcoming: async (userId) => {
    const [rows] = await pool.query(
      `SELECT b.*, et.title, et.slug
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE et.user_id = ? AND b.booked_date >= CURDATE() AND b.status != ?
       ORDER BY b.booked_date ASC, b.booked_time ASC`,
      [userId, 'cancelled']
    );
    return rows;
  },

  // Get past bookings
  getPast: async (userId) => {
    const [rows] = await pool.query(
      `SELECT b.*, et.title, et.slug
       FROM bookings b
       JOIN event_types et ON b.event_type_id = et.id
       WHERE et.user_id = ? AND b.booked_date < CURDATE()
       ORDER BY b.booked_date DESC, b.booked_time DESC`,
      [userId]
    );
    return rows;
  }
};

// User Model
const User = {
  // Get user by ID
  getById: async (userId) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    return rows[0] || null;
  },

  // Update user timezone
  updateTimezone: async (userId, timezone) => {
    const [result] = await pool.query(
      'UPDATE users SET timezone = ? WHERE id = ?',
      [timezone, userId]
    );
    return result.affectedRows > 0;
  }
};

module.exports = { EventType, Availability, Booking, User };
