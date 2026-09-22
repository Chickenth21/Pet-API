const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

router.get('/dashboard', requireAuth, requireAdmin, adminController.getDashboardStats);
router.post('/test-discord-error', requireAuth, requireAdmin, adminController.testDiscordError);

module.exports = router;
