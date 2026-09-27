const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middlewares/uploadMiddleware');
const { optionalAuth } = require('../middlewares/authMiddleware');

// 1. Tải lên 1 ảnh duy nhất (Field: "image")
router.post('/image', optionalAuth, upload.single('image'), uploadController.uploadSingle);

// 2. Tải lên nhiều ảnh đồng thời (Field: "images", tối đa 10 ảnh mỗi đợt)
router.post('/images', optionalAuth, upload.array('images', 10), uploadController.uploadMultiple);

module.exports = router;
