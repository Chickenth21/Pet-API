const { sendDiscordError } = require('../utils/discordLogger');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Global Error Handler Middleware
 * Tự động gửi lỗi 500 hoặc unhandled errors sang kênh Discord
 */
function errorHandler(err, req, res, next) {
  console.error('[API Error Caught]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';

  // Chỉ gửi thông báo Discord đối với các lỗi nghiêm trọng (status >= 500)
  if (statusCode >= 500) {
    sendDiscordError(err, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress
    }).catch(e => console.error('[Discord Hook Error]:', e.message));
  }

  return errorResponse(res, message, statusCode, err);
}

module.exports = errorHandler;
