const { errorResponse } = require('../utils/responseHelper');

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 'Quyền truy cập bị từ chối. Chỉ dành riêng cho Quản trị viên (Admin).', 403);
  }
  next();
}

module.exports = {
  requireAdmin
};
