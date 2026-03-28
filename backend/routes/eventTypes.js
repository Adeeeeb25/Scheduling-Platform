const express = require('express');
const router = express.Router();
const { eventTypesController } = require('../controllers');
const { requireAuth } = require('../middleware/auth');

// Admin routes (authenticated)
router.get('/', requireAuth, eventTypesController.getAll);
router.post('/', requireAuth, eventTypesController.create);
router.get('/:id', requireAuth, eventTypesController.getById);
router.put('/:id', requireAuth, eventTypesController.update);
router.delete('/:id', requireAuth, eventTypesController.delete);

module.exports = router;
