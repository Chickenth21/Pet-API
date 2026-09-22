const productService = require('../services/productService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class ProductController {
  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();
      return successResponse(res, categories, 'Lấy danh mục thành công');
    } catch (err) {
      next(err);
    }
  }

  async getProducts(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const data = await productService.getProducts(req.query, userId);
      return successResponse(res, data, 'Lấy danh sách sản phẩm thành công');
    } catch (err) {
      next(err);
    }
  }

  async getProductBySlug(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const product = await productService.getProductBySlug(req.params.slug, userId);
      return successResponse(res, product, 'Lấy chi tiết sản phẩm thành công');
    } catch (err) {
      next(err);
    }
  }

  async toggleFavorite(req, res, next) {
    try {
      const { productId } = req.body;
      if (!productId) {
        return errorResponse(res, 'Vui lòng cung cấp productId', 400);
      }
      const result = await productService.toggleFavorite(req.user.id, productId);
      return successResponse(res, result, result.is_favorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích');
    } catch (err) {
      next(err);
    }
  }

  async getFavorites(req, res, next) {
    try {
      const favorites = await productService.getFavorites(req.user.id);
      return successResponse(res, favorites, 'Lấy danh sách yêu thích thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
