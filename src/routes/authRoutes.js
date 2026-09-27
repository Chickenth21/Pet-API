const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.updateProfile);
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
