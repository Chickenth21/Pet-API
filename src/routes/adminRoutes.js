const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

// Bảo vệ toàn bộ endpoint admin
router.use(requireAuth, requireAdmin);

// Thống kê & Kiểm thử
router.get('/dashboard', adminController.getDashboardStats);
router.post('/test-discord-error', adminController.testDiscordError);

// Quản lý sản phẩm (Product CRUD tác động trực tiếp tới trang khách hàng)
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.patch('/products/:id/toggle-active', adminController.toggleProductActive);
router.delete('/products/:id', adminController.deleteProduct);

// Quản lý thú cưng mở bán (Pet Sales CRUD)
router.get('/pet-sales', adminController.getAdminPetsForSale);
router.post('/pet-sales', adminController.createPetForSale);
router.put('/pet-sales/:id', adminController.updatePetForSale);
router.patch('/pet-sales/:id/status', adminController.updatePetForSaleStatus);
router.delete('/pet-sales/:id', adminController.deletePetForSale);

const petBreedController = require('../controllers/petBreedController');

// Quản lý bài viết cẩm nang (Blog CRUD tác động trực tiếp tới trang khách hàng)
router.get('/blogs', adminController.getBlogs);
router.post('/blogs', adminController.createBlog);
router.put('/blogs/:id', adminController.updateBlog);
router.patch('/blogs/:id/toggle-publish', adminController.toggleBlogPublish);
router.delete('/blogs/:id', adminController.deleteBlog);

// Quản lý Giống Chó & Mèo (Pet Breeds Management)
router.get('/breeds', petBreedController.getAdminBreeds);
router.post('/breeds', petBreedController.createBreed);
router.put('/breeds/:id', petBreedController.updateBreed);
router.patch('/breeds/:id/toggle-active', petBreedController.toggleBreedActive);
router.delete('/breeds/:id', petBreedController.deleteBreed);

module.exports = router;

