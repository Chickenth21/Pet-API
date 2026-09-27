const express = require('express');
const router = express.Router();
const petSaleController = require('../controllers/petSaleController');

router.get('/', petSaleController.getPetsForSale);
router.get('/:id', petSaleController.getPetForSaleById);

module.exports = router;
