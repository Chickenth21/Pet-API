const aiService = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class AIController {
  async chat(req, res, next) {
    try {
      const { message, petId, conversationId } = req.body;
      if (!message) {
        return errorResponse(res, 'Vui lòng cung cấp nội dung câu hỏi!', 400);
      }

      const userId = req.user ? req.user.id : null;
      const result = await aiService.chat({
        userId,
        petId,
        conversationId,
        message
      });

      return successResponse(res, result, 'AI tư vấn thành công');
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await aiService.getChatHistory(req.params.conversationId);
      return successResponse(res, history, 'Lấy lịch sử hội thoại thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
