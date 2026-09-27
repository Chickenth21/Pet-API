const express = require('express');
const router = express.Router();
const petBreedController = require('../controllers/petBreedController');

// Public endpoints cho Client & Dropdowns
router.get('/', petBreedController.getBreeds);
router.get('/:id', petBreedController.getBreedById);

module.exports = router;
