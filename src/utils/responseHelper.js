/**
 * Chuẩn hóa cấu trúc phản hồi JSON cho toàn bộ API Pet Paw
 */

function successResponse(res, data = null, message = 'Thành công', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function errorResponse(res, message = 'Đã xảy ra lỗi', statusCode = 500, error = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  });
}

module.exports = {
  successResponse,
  errorResponse
};
