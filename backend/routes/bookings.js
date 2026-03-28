const express = require('express');
const router = express.Router();
const { bookingsController } = require('../controllers');
const { requireAuth } = require('../middleware/auth');

// Admin routes (authenticated)
router.get('/', requireAuth, bookingsController.getAll);
router.get('/:id', requireAuth, bookingsController.getById);
router.delete('/:id/cancel', requireAuth, bookingsController.cancel);

module.exports = router;
