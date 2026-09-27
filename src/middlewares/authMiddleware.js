const jwt = require('jsonwebtoken');
const config = require('../config');
const { errorResponse } = require('../utils/responseHelper');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Vui lòng đăng nhập để thực hiện thao tác này', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ', 401, err.message);
  }
}

// Middleware tùy chọn (nếu có token thì gán req.user, không có thì vẫn cho qua dưới dạng guest)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, config.jwtSecret);
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
