const blogService = require('../services/blogService');
const { successResponse } = require('../utils/responseHelper');

class BlogController {
  async getPosts(req, res, next) {
    try {
      const data = await blogService.getPosts(req.query);
      return successResponse(res, data, 'Lấy danh sách bài viết thành công');
    } catch (err) {
      next(err);
    }
  }

  async getPostBySlug(req, res, next) {
    try {
      const post = await blogService.getPostBySlug(req.params.slug);
      return successResponse(res, post, 'Lấy chi tiết bài viết thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new BlogController();
