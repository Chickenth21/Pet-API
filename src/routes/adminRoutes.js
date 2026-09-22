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

// Quản lý bài viết cẩm nang (Blog CRUD tác động trực tiếp tới trang khách hàng)
router.get('/blogs', adminController.getBlogs);
router.post('/blogs', adminController.createBlog);
router.put('/blogs/:id', adminController.updateBlog);
router.patch('/blogs/:id/toggle-publish', adminController.toggleBlogPublish);
router.delete('/blogs/:id', adminController.deleteBlog);

module.exports = router;

