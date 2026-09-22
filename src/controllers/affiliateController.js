const affiliateService = require('../services/affiliateService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class AffiliateController {
  async trackClick(req, res, next) {
    try {
      const { productId, platform } = req.body;
      if (!productId || !platform) {
        return errorResponse(res, 'Vui lòng cung cấp productId và platform (shopee/tiktok)', 400);
      }

      await affiliateService.trackClick({
        productId,
        platform,
        userId: req.user ? req.user.id : null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      return successResponse(res, null, 'Ghi nhận click affiliate thành công');
    } catch (err) {
      next(err);
    }
  }

  async getClickStats(req, res, next) {
    try {
      const stats = await affiliateService.getClickStats();
      return successResponse(res, stats, 'Lấy thống kê affiliate thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AffiliateController();
