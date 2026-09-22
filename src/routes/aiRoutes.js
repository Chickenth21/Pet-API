const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middlewares/authMiddleware');

router.post('/chat', optionalAuth, aiController.chat);
router.get('/history/:conversationId', aiController.getHistory);

module.exports = router;
