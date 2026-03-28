const { SESSION_KEY } = require('../config/constants');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. Please initialize session first.' });
  }

  req.userId = userId;
  next();
};

// Middleware to initialize default user session
const initializeSession = (req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  req.session.userId = req.body.userId || null;
  next();
};

module.exports = {
  requireAuth,
  initializeSession
};
