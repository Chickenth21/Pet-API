const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, full_name } = req.body;
      if (!email || !password || !full_name) {
        return errorResponse(res, 'Vui lòng điền đầy đủ email, mật khẩu và họ tên!', 400);
      }
      if (password.length < 6) {
        return errorResponse(res, 'Mật khẩu phải có tối thiểu 6 ký tự!', 400);
      }

      const result = await authService.register({ email, password, full_name });
      return successResponse(res, result, 'Đăng ký tài khoản thành công!', 201);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return errorResponse(res, 'Vui lòng nhập đầy đủ email và mật khẩu!', 400);
      }

      const result = await authService.login({ email, password });
      return successResponse(res, result, 'Đăng nhập thành công!');
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return successResponse(res, user, 'Lấy thông tin tài khoản thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
