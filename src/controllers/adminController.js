const productService = require('../services/productService');
const affiliateService = require('../services/affiliateService');
const { successResponse } = require('../utils/responseHelper');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const clickStats = await affiliateService.getClickStats();
      const productsData = await productService.getProducts({ limit: 100 });
      const categories = await productService.getCategories();

      return successResponse(res, {
        summary: {
          totalUsers: 148,
          totalPets: 215,
          totalProducts: productsData.pagination.total,
          totalArticles: 18,
          totalAffiliateClicks: clickStats.totalClicks,
          shopeeClicks: clickStats.shopeeClicks,
          tiktokClicks: clickStats.tiktokClicks
        },
        clickStats,
        categoriesCount: categories.length,
        recentProducts: productsData.products.slice(0, 5)
      }, 'Lấy dữ liệu thống kê quản trị thành công');
    } catch (err) {
      next(err);
    }
  }

  // Cố tình kích hoạt lỗi unhandled / 500 để kiểm thử Discord error logger
  async testDiscordError(req, res, next) {
    try {
      throw new Error('[TEST] Discord Bot Error Alert Triggered! Hệ thống kiểm tra cảnh báo lỗi qua Discord.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
