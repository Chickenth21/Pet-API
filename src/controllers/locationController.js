const locationService = require('../services/locationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class LocationController {
  /**
   * Public: Lấy danh sách địa điểm (bệnh viện / spa)
   */
  async getLocations(req, res, next) {
    try {
      const { type, district, search, page, limit } = req.query;
      const data = await locationService.getLocations({
        type,
        district,
        search,
        page,
        limit,
        include_inactive: false
      });
      return successResponse(res, data, 'Lấy danh sách cơ sở thú y & spa thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Public: Lấy chi tiết một địa điểm
   */
  async getLocationById(req, res, next) {
    try {
      const { id } = req.params;
      const location = await locationService.getLocationById(id);
      if (!location) {
        return errorResponse(res, 'Không tìm thấy cơ sở thú y hoặc spa', 404);
      }
      return successResponse(res, location, 'Lấy thông tin chi tiết thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Admin: Lấy toàn bộ danh sách địa điểm (bao gồm cả tạm ẩn)
   */
  async getAdminLocations(req, res, next) {
    try {
      const { type, district, search, page, limit } = req.query;
      const data = await locationService.getLocations({
        type,
        district,
        search,
        page,
        limit,
        include_inactive: true
      });
      return successResponse(res, data, 'Lấy danh sách quản trị cơ sở thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Admin: Thêm mới địa điểm Bệnh viện / Tiệm Spa
   */
  async createLocation(req, res, next) {
    try {
      const { name, type, address, phone } = req.body;
      if (!name || !type) {
        return errorResponse(res, 'Vui lòng điền tên cơ sở và phân loại (bệnh viện hoặc spa)', 400);
      }
      const newLoc = await locationService.createLocation(req.body);
      return successResponse(res, newLoc, 'Thêm mới cơ sở thành công', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Admin: Cập nhật thông tin cơ sở
   */
  async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await locationService.updateLocation(id, req.body);
      if (!updated) {
        return errorResponse(res, 'Không tìm thấy cơ sở để cập nhật', 404);
      }
      return successResponse(res, updated, 'Cập nhật thông tin cơ sở thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Admin: Bật/Tắt kích hoạt
   */
  async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await locationService.toggleLocationActive(id);
      return successResponse(res, updated, 'Cập nhật trạng thái hiển thị thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Admin: Xóa cơ sở
   */
  async deleteLocation(req, res, next) {
    try {
      const { id } = req.params;
      await locationService.deleteLocation(id);
      return successResponse(res, { id }, 'Xóa cơ sở thú y / spa thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LocationController();
