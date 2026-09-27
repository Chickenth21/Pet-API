const multer = require('multer');

// 1. Lưu file tạm vào RAM (memoryStorage) theo đúng yêu cầu kiến trúc
const storage = multer.memoryStorage();

// 2. Kiểm tra định dạng file (Chỉ chấp nhận file ảnh)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận tải lên các file định dạng hình ảnh (JPEG, PNG, WebP, GIF, HEIC)!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // Giới hạn tối đa 15MB mỗi ảnh gốc
  },
  fileFilter,
});

module.exports = upload;
