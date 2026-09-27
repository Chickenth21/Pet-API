const express = require('express');
const router = express.Router();
const { sendDiscordAlert } = require('../utils/discordLogger');
const { successResponse, errorResponse } = require('../utils/responseHelper');

/**
 * Endpoint nhận thông báo/báo cáo từ Frontend Client (React)
 * Hỗ trợ 3 mức độ phân biệt màu sắc:
 * - 'error': Màu đỏ (Lỗi nghiêm trọng / Exception)
 * - 'warning': Màu vàng (Cảnh báo người dùng / Dữ liệu)
 * - 'message' / 'info': Màu xanh nước biển (Thông điệp / Tin nhắn)
 */
router.post('/report', async (req, res) => {
  try {
    const { 
      level = 'error',
      message, 
      stack, 
      componentStack, 
      url, 
      userAgent,
      userEmail 
    } = req.body || {};

    if (!message) {
      return errorResponse(res, 'Vui lòng cung cấp nội dung thông điệp (message)', 400);
    }

    const clientError = new Error(message);
    if (stack) clientError.stack = stack;

    // Gửi cảnh báo phân biệt màu sắc sang Discord & in Terminal
    await sendDiscordAlert({
      level,
      err: clientError,
      message,
      context: {
        source: 'Frontend Client (React UI)',
        url: url || req.headers.referer || 'Unknown Page',
        method: `CLIENT_${level.toUpperCase()}`,
        componentStack,
        userAgent: userAgent || req.headers['user-agent'],
        userEmail: userEmail || 'Khách vãng lai'
      }
    });

    return successResponse(res, { reported: true, level }, `Đã tiếp nhận và gửi ${level} vào Discord thành công`);
  } catch (err) {
    console.error('[ErrorReporter Middleware] Lỗi khi xử lý báo cáo:', err.message);
    return errorResponse(res, 'Không thể gửi báo cáo lỗi', 500, err);
  }
});

module.exports = router;
