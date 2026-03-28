const { EventType, Availability, Booking, User } = require('../models');
const { DEFAULT_USER_ID } = require('../config/constants');

// Event Types Controller
const eventTypesController = {
  // Get all event types
  getAll: async (req, res, next) => {
    try {
      const userId = req.userId || DEFAULT_USER_ID;
      const eventTypes = await EventType.getByUserId(userId);
      res.json(eventTypes);
    } catch (error) {
      next(error);
    }
  },

  // Get single event type
  getById: async (req, res, next) => {
    try {
      const eventType = await EventType.getById(req.params.id);
      if (!eventType) {
        return res.status(404).json({ error: 'Event type not found' });
      }
      res.json(eventType);
    } catch (error) {
      next(error);
    }
  },

  // Create event type
  create: async (req, res, next) => {
    try {
      const { title, description, duration, slug, date_from, date_to } = req.body;

      if (!title || !duration || !slug) {
        return res.status(400).json({ error: 'Missing required fields: title, duration, slug' });
      }

      const userId = req.userId || DEFAULT_USER_ID;
      const id = await EventType.create(userId, title, description, slug, duration, date_from || null, date_to || null);

      res.status(201).json({ id, title, description, slug, duration, date_from, date_to, userId });
    } catch (error) {
      next(error);
    }
  },

  // Update event type
  update: async (req, res, next) => {
    try {
      const { title, description, duration, date_from, date_to } = req.body;

      if (!title || !duration) {
        return res.status(400).json({ error: 'Missing required fields: title, duration' });
      }

      const updated = await EventType.update(req.params.id, title, description, duration, date_from || null, date_to || null);
      if (!updated) {
        return res.status(404).json({ error: 'Event type not found' });
      }

      const eventType = await EventType.getById(req.params.id);
      res.json(eventType);
    } catch (error) {
      next(error);
    }
  },

  // Delete event type
  delete: async (req, res, next) => {
    try {
      const deleted = await EventType.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Event type not found' });
      }
      res.json({ message: 'Event type deleted', id: req.params.id });
    } catch (error) {
      next(error);
    }
  }
};

// Availability Controller
const availabilityController = {
  // Get availability
  get: async (req, res, next) => {
    try {
      const userId = req.userId || DEFAULT_USER_ID;
      const availability = await Availability.getByUserId(userId);
      res.json(availability);
    } catch (error) {
      next(error);
    }
  },

  // Set availability (bulk upsert)
  set: async (req, res, next) => {
    try {
      const { schedule } = req.body; // Array of { dayOfWeek, startTime, endTime }

      if (!Array.isArray(schedule)) {
        return res.status(400).json({ error: 'Schedule must be an array' });
      }

      const userId = req.userId || DEFAULT_USER_ID;

      for (const item of schedule) {
        if (item.dayOfWeek >= 0 && item.startTime && item.endTime) {
          await Availability.upsert(userId, item.dayOfWeek, item.startTime, item.endTime);
        }
      }

      const updated = await Availability.getByUserId(userId);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  },

  // Delete availability for a day
  deleteDay: async (req, res, next) => {
    try {
      const userId = req.userId || DEFAULT_USER_ID;
      const { dayOfWeek } = req.params;

      const deleted = await Availability.delete(userId, dayOfWeek);
      if (!deleted) {
        return res.status(404).json({ error: 'Availability not found' });
      }

      res.json({ message: 'Availability deleted', dayOfWeek });
    } catch (error) {
      next(error);
    }
  }
};

// Bookings Controller
const bookingsController = {
  // Get all bookings (admin)
  getAll: async (req, res, next) => {
    try {
      const userId = req.userId || DEFAULT_USER_ID;
      const { type } = req.query; // type: 'upcoming' | 'past' | 'all'

      let bookings;
      if (type === 'upcoming') {
        bookings = await Booking.getUpcoming(userId);
      } else if (type === 'past') {
        bookings = await Booking.getPast(userId);
      } else {
        bookings = await Booking.getByUserId(userId);
      }

      res.json(bookings);
    } catch (error) {
      next(error);
    }
  },

  // Get single booking
  getById: async (req, res, next) => {
    try {
      const booking = await Booking.getById(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  // Cancel booking
  cancel: async (req, res, next) => {
    try {
      const cancelled = await Booking.cancel(req.params.id);
      if (!cancelled) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const booking = await Booking.getById(req.params.id);
      res.json({ message: 'Booking cancelled', booking });
    } catch (error) {
      next(error);
    }
  }
};

// Public Bookings Controller
const publicBookingsController = {
  // Create booking (public)
  create: async (req, res, next) => {
    try {
      const { eventTypeSlug, bookerName, bookerEmail, bookedDate, bookedTime } = req.body;

      if (!eventTypeSlug || !bookerName || !bookerEmail || !bookedDate || !bookedTime) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get event type
      const eventType = await EventType.getBySlug(eventTypeSlug);
      if (!eventType) {
        return res.status(404).json({ error: 'Event type not found' });
      }

      // Check if booked date is within allowed date range
      if (eventType.date_from || eventType.date_to) {
        if (eventType.date_from && bookedDate < eventType.date_from) {
          return res.status(400).json({ error: `Event is not available before ${eventType.date_from}` });
        }
        if (eventType.date_to && bookedDate > eventType.date_to) {
          return res.status(400).json({ error: `Event is not available after ${eventType.date_to}` });
        }
      }

      // Check if slot is available
      const available = await Booking.isSlotAvailable(eventType.id, bookedDate, bookedTime);
      if (!available) {
        return res.status(409).json({ error: 'This time slot is already booked' });
      }

      // Create booking
      const bookingId = await Booking.create(eventType.id, bookerName, bookerEmail, bookedDate, bookedTime);
      const booking = await Booking.getById(bookingId);

      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = {
  eventTypesController,
  availabilityController,
  bookingsController,
  publicBookingsController
};
