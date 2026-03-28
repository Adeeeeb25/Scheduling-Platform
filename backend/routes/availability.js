const express = require('express');
const router = express.Router();
const { availabilityController } = require('../controllers');
const { requireAuth } = require('../middleware/auth');

// Admin routes (authenticated)
router.get('/', requireAuth, availabilityController.get);
router.post('/', requireAuth, availabilityController.set);
router.delete('/:dayOfWeek', requireAuth, availabilityController.deleteDay);

module.exports = router;
