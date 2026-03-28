require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const initializeDatabase = require('./config/initDb');
const seedDatabase = require('./seeds/seed');

// Routes
const authRoutes = require('./routes/auth');
const eventTypesRoutes = require('./routes/eventTypes');
const availabilityRoutes = require('./routes/availability');
const bookingsRoutes = require('./routes/bookings');
const publicRoutes = require('./routes/public');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (in-memory for simplicity)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/event-types', eventTypesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/public', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔧 Initializing database...');
    await initializeDatabase();

    console.log('🌱 Seeding database with sample data...');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation:`);
      console.log(`   Admin Routes:`);
      console.log(`   - POST http://localhost:${PORT}/api/auth/session`);
      console.log(`   - GET http://localhost:${PORT}/api/event-types`);
      console.log(`   - GET http://localhost:${PORT}/api/availability`);
      console.log(`   - GET http://localhost:${PORT}/api/bookings`);
      console.log(`   Public Routes (no auth required):`);
      console.log(`   - GET http://localhost:${PORT}/api/public/event-types/:slug`);
      console.log(`   - GET http://localhost:${PORT}/api/public/availability/:slug?date=YYYY-MM-DD`);
      console.log(`   - POST http://localhost:${PORT}/api/public/bookings`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message || error.code || error);
    console.error('Error details:', error);
    process.exit(1);
  }
};

startServer();
