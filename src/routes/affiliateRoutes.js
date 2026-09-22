const express = require('express');
const router = express.Router();
const affiliateController = require('../controllers/affiliateController');
const { optionalAuth, requireAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

router.post('/track', optionalAuth, affiliateController.trackClick);
router.get('/stats', requireAuth, requireAdmin, affiliateController.getClickStats);

module.exports = router;
