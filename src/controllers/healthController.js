const healthService = require('../services/healthService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class HealthController {
  async getHealthOverview(req, res, next) {
    try {
      const { petId } = req.params;
      const data = await healthService.getRecordsByPet(petId, req.user.id);
      return successResponse(res, data, 'Lấy lịch sử và biểu đồ sức khỏe thành công');
    } catch (err) {
      next(err);
    }
  }

  async addHealthRecord(req, res, next) {
    try {
      const { petId } = req.params;
      const { weight } = req.body;

      if (!weight || isNaN(weight)) {
        return errorResponse(res, 'Vui lòng nhập số cân nặng hợp lệ!', 400);
      }

      const record = await healthService.createRecord(petId, req.user.id, req.body);
      return successResponse(res, record, 'Ghi nhận chỉ số sức khỏe thành công!', 201);
    } catch (err) {
      next(err);
    }
  }

  async deleteHealthRecord(req, res, next) {
    try {
      const { petId, recordId } = req.params;
      await healthService.deleteRecord(recordId, petId, req.user.id);
      return successResponse(res, null, 'Xóa bản ghi sức khỏe thành công!');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HealthController();
