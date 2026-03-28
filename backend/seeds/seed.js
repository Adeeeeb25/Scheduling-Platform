const pool = require('../config/db');
const { DEFAULT_USER_ID, DEFAULT_USER_EMAIL, DEFAULT_USER_TIMEZONE } = require('../config/constants');

const seedDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Insert default user
    const [userExists] = await connection.query('SELECT id FROM users WHERE id = ?', [DEFAULT_USER_ID]);

    if (userExists.length === 0) {
      await connection.query(
        'INSERT INTO users (id, email, timezone) VALUES (?, ?, ?)',
        [DEFAULT_USER_ID, DEFAULT_USER_EMAIL, DEFAULT_USER_TIMEZONE]
      );
      console.log('✓ Default user created');
    }

    // Insert sample event types
    const eventTypes = [
      {
        title: '30-min Meeting',
        description: 'A quick 30-minute meeting',
        slug: '30-min-meeting',
        duration: 30
      },
      {
        title: '1-Hour Consultation',
        description: 'In-depth discussion session',
        slug: 'consultation',
        duration: 60
      },
      {
        title: 'Product Demo',
        description: 'Live product walkthrough and Q&A',
        slug: 'product-demo',
        duration: 45
      }
    ];

    for (const et of eventTypes) {
      const [existing] = await connection.query('SELECT id FROM event_types WHERE slug = ?', [et.slug]);
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO event_types (user_id, title, description, slug, duration_minutes) VALUES (?, ?, ?, ?, ?)',
          [DEFAULT_USER_ID, et.title, et.description, et.slug, et.duration]
        );
      }
    }
    console.log('✓ Sample event types created');

    // Insert default availability (9 AM - 5 PM, Monday to Friday)
    const availability = [
      { day: 1, start: '09:00:00', end: '17:00:00' }, // Monday
      { day: 2, start: '09:00:00', end: '17:00:00' }, // Tuesday
      { day: 3, start: '09:00:00', end: '17:00:00' }, // Wednesday
      { day: 4, start: '09:00:00', end: '17:00:00' }, // Thursday
      { day: 5, start: '09:00:00', end: '17:00:00' }  // Friday
    ];

    for (const avail of availability) {
      const [existing] = await connection.query(
        'SELECT id FROM availability_schedules WHERE user_id = ? AND day_of_week = ?',
        [DEFAULT_USER_ID, avail.day]
      );
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO availability_schedules (user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
          [DEFAULT_USER_ID, avail.day, avail.start, avail.end]
        );
      }
    }
    console.log('✓ Default availability schedule created');

    // Insert sample bookings
    const today = new Date();
    const sampleBookings = [
      {
        eventTypeId: 1,
        name: 'John Doe',
        email: 'john@example.com',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        time: '10:00:00'
      },
      {
        eventTypeId: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        time: '14:00:00'
      }
    ];

    for (const booking of sampleBookings) {
      const dateStr = booking.date.toISOString().split('T')[0];
      const [existing] = await connection.query(
        'SELECT id FROM bookings WHERE event_type_id = ? AND booked_date = ? AND booked_time = ?',
        [booking.eventTypeId, dateStr, booking.time]
      );
      if (existing.length === 0) {
        await connection.query(
          'INSERT INTO bookings (event_type_id, booker_name, booker_email, booked_date, booked_time) VALUES (?, ?, ?, ?, ?)',
          [booking.eventTypeId, booking.name, booking.email, dateStr, booking.time]
        );
      }
    }
    console.log('✓ Sample bookings created');

    connection.release();
    console.log('✓ Database seeding complete');
  } catch (error) {
    console.error('✗ Seeding error:', error.message);
  }
};

module.exports = seedDatabase;
