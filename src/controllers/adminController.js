const productService = require('../services/productService');
const affiliateService = require('../services/affiliateService');
const blogService = require('../services/blogService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const clickStats = await affiliateService.getClickStats();
      const productsData = await productService.getProducts({ limit: 100, include_inactive: true });
      const categories = await productService.getCategories();
      const blogs = await blogService.getAllPostsAdmin();

      return successResponse(res, {
        summary: {
          totalUsers: 148,
          totalPets: 215,
          totalProducts: productsData.pagination.total,
          totalArticles: blogs.length,
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

  // --- QUẢN LÝ SẢN PHẨM (PRODUCT CRUD) ---
  async createProduct(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        return errorResponse(res, 'Tên sản phẩm không được để trống', 400);
      }
      const product = await productService.createProduct(req.body);
      return successResponse(res, product, 'Thêm sản phẩm thành công', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      return successResponse(res, product, 'Cập nhật sản phẩm thành công');
    } catch (err) {
      next(err);
    }
  }

  async toggleProductActive(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.toggleProductActive(id);
      return successResponse(
        res, 
        product, 
        product.is_active ? 'Đã hiển thị sản phẩm trên trang khách hàng' : 'Đã ẩn sản phẩm khỏi trang khách hàng'
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await productService.deleteProduct(id);
      return successResponse(res, deleted, 'Đã xóa sản phẩm thành công');
    } catch (err) {
      next(err);
    }
  }

  // --- QUẢN LÝ BÀI VIẾT BLOG (BLOG CRUD) ---
  async getBlogs(req, res, next) {
    try {
      const blogs = await blogService.getAllPostsAdmin();
      return successResponse(res, blogs, 'Lấy danh sách bài viết quản trị thành công');
    } catch (err) {
      next(err);
    }
  }

  async createBlog(req, res, next) {
    try {
      const { title } = req.body;
      if (!title) {
        return errorResponse(res, 'Tiêu đề bài viết không được để trống', 400);
      }
      const post = await blogService.createPost(req.body);
      return successResponse(res, post, 'Thêm bài viết mới thành công', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateBlog(req, res, next) {
    try {
      const { id } = req.params;
      const post = await blogService.updatePost(id, req.body);
      return successResponse(res, post, 'Cập nhật bài viết thành công');
    } catch (err) {
      next(err);
    }
  }

  async toggleBlogPublish(req, res, next) {
    try {
      const { id } = req.params;
      const post = await blogService.togglePostPublish(id);
      return successResponse(
        res,
        post,
        post.is_published ? 'Đã xuất bản bài viết lên website khách hàng' : 'Đã chuyển bài viết về dạng bản nháp'
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteBlog(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await blogService.deletePost(id);
      return successResponse(res, deleted, 'Đã xóa bài viết thành công');
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

