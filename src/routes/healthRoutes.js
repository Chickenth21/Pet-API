const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { requireAuth } = require('../middlewares/authMiddleware');

router.get('/pets/:petId', requireAuth, healthController.getHealthOverview);
router.post('/pets/:petId', requireAuth, healthController.addHealthRecord);
router.delete('/pets/:petId/records/:recordId', requireAuth, healthController.deleteHealthRecord);

module.exports = router;
