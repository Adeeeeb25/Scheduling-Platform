module.exports = {
  DEFAULT_USER_ID: parseInt(process.env.DEFAULT_USER_ID) || 1,
  DEFAULT_USER_EMAIL: process.env.DEFAULT_USER_EMAIL || 'admin@example.com',
  DEFAULT_USER_TIMEZONE: process.env.DEFAULT_USER_TIMEZONE || 'UTC',
  SESSION_KEY: 'user_session',
  TIMEZONES: [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]
};
