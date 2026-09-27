const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Public endpoints
router.get('/', locationController.getLocations);
router.get('/:id', locationController.getLocationById);

module.exports = router;
