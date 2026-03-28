const express = require('express');
const router = express.Router();
const { DEFAULT_USER_ID } = require('../config/constants');
const { User } = require('../models');

// Initialize session
router.post('/session', (req, res) => {
  req.session = req.session || {};
  req.session.userId = DEFAULT_USER_ID;
  res.json({ message: 'Session initialized', userId: DEFAULT_USER_ID });
});

// Verify session
router.get('/verify', (req, res) => {
  const userId = req.session?.userId;
  if (userId) {
    res.json({ authenticated: true, userId });
  } else {
    res.json({ authenticated: false });
  }
});

// Get user info
router.get('/user', async (req, res, next) => {
  try {
    const userId = req.session?.userId || DEFAULT_USER_ID;
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ message: 'Session cleared' });
});

module.exports = router;
