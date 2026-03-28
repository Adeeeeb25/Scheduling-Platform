const mysql = require('mysql2/promise');
require('dotenv').config();

const initializeDatabase = async () => {
  let connection;
  try {
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 3306
    });

    const dbName = process.env.DB_NAME || 'scheduling_platform';

    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database ${dbName} created/exists`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        timezone VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create event_types table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration_minutes INT NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        date_from DATE,
        date_to DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_slug (user_id, slug)
      );
    `);
    console.log('✓ Event Types table created');

    // Add date_from and date_to columns if they don't exist
    try {
      await connection.query(`
        ALTER TABLE event_types
        ADD COLUMN IF NOT EXISTS date_from DATE,
        ADD COLUMN IF NOT EXISTS date_to DATE
      `);
    } catch (err) {
      // Column might already exist, which is fine
    }

    // Create availability_schedules table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS availability_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        day_of_week INT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_day (user_id, day_of_week)
      );
    `);
    console.log('✓ Availability Schedules table created');

    // Create bookings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type_id INT NOT NULL,
        booker_name VARCHAR(255) NOT NULL,
        booker_email VARCHAR(255) NOT NULL,
        booked_date DATE NOT NULL,
        booked_time TIME NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE,
        UNIQUE KEY unique_booking (event_type_id, booked_date, booked_time)
      );
    `);
    console.log('✓ Bookings table created');

    await connection.end();
    console.log('✓ Database initialization complete');
  } catch (error) {
    console.error('✗ Database initialization error:', error.message || error.code || error);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
};

module.exports = initializeDatabase;
