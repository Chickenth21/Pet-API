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

  async updateProfile(req, res, next) {
    try {
      const { full_name, avatar_url } = req.body;
      const user = await authService.updateProfile(req.user.id, { full_name, avatar_url });
      return successResponse(res, user, 'Cập nhật thông tin tài khoản thành công!');
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, { oldPassword, newPassword });
      return successResponse(res, result, 'Đổi mật khẩu thành công!');
    } catch (err) {
      next(err);
    }
  }

  async googleAuth(req, res, next) {
    try {
      const { credential, demoUser } = req.body;
      const result = await authService.googleLogin({ credential, demoUser });
      const message = result.isNewUser 
        ? 'Đăng ký tài khoản Pet Paw qua Google thành công!' 
        : 'Đăng nhập Pet Paw qua Google thành công!';
      return successResponse(res, result, message);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
