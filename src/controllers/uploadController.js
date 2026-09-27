const r2UploadService = require('../services/r2UploadService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class UploadController {
  /**
   * POST /api/upload/image
   * Upload 1 ảnh duy nhất (hỗ trợ avatar, ảnh đại diện, cover)
   */
  async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Vui lòng đính kèm file ảnh cần tải lên (field: "image")', 400);
      }

      const folder = req.body.folder || 'pets';
      const result = await r2UploadService.processAndUploadImage(req.file, folder);

      return successResponse(res, result, 'Xử lý nén WebP và tải ảnh thành công', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/upload/images
   * Upload nhiều ảnh cùng lúc (cho gallery thú cưng hoặc sản phẩm)
   */
  async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return errorResponse(res, 'Vui lòng đính kèm ít nhất một file ảnh (field: "images")', 400);
      }

      const folder = req.body.folder || 'pets';
      const results = await r2UploadService.processAndUploadMultipleImages(req.files, folder);

      return successResponse(res, results, `Đã xử lý nén WebP và tải lên ${results.length} ảnh thành công`, 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UploadController();
