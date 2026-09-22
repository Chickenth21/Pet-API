const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { requireAuth, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/categories', productController.getCategories);
router.get('/', optionalAuth, productController.getProducts);
router.get('/favorites', requireAuth, productController.getFavorites);
router.post('/favorites/toggle', requireAuth, productController.toggleFavorite);
router.get('/:slug', optionalAuth, productController.getProductBySlug);

module.exports = router;
