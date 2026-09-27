const petBreedService = require('../services/petBreedService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class PetBreedController {
  /**
   * Lấy danh sách giống thú cưng (Public / Dropdowns)
   */
  async getBreeds(req, res, next) {
    try {
      const { species, search, page, limit } = req.query;
      const data = await petBreedService.getBreeds({
        species,
        search,
        page,
        limit,
        include_inactive: false
      });
      return successResponse(res, data, 'Lấy danh sách giống thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lấy danh sách giống cho Quản trị viên (bao gồm cả giống bị ẩn)
   */
  async getAdminBreeds(req, res, next) {
    try {
      const { species, search, page, limit } = req.query;
      const data = await petBreedService.getBreeds({
        species,
        search,
        page,
        limit,
        include_inactive: true
      });
      return successResponse(res, data, 'Lấy danh sách giống thú cưng quản trị thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lấy chi tiết 1 giống
   */
  async getBreedById(req, res, next) {
    try {
      const breed = await petBreedService.getBreedById(req.params.id);
      if (!breed) {
        return errorResponse(res, 'Không tìm thấy giống thú cưng', 404);
      }
      return successResponse(res, breed, 'Lấy thông tin giống thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Thêm giống thú cưng mới (Admin)
   */
  async createBreed(req, res, next) {
    try {
      const { name, species } = req.body;
      if (!name || !species) {
        return errorResponse(res, 'Vui lòng cung cấp Tên giống và Loài (Chó hoặc Mèo)', 400);
      }

      const newBreed = await petBreedService.createBreed(req.body);
      return successResponse(res, newBreed, 'Thêm giống thú cưng mới thành công', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Cập nhật thông tin giống (Admin)
   */
  async updateBreed(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await petBreedService.updateBreed(id, req.body);
      if (!updated) {
        return errorResponse(res, 'Không tìm thấy giống để cập nhật', 404);
      }
      return successResponse(res, updated, 'Cập nhật thông tin giống thành công');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Bật / tắt hiển thị giống (Admin)
   */
  async toggleBreedActive(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await petBreedService.toggleBreedActive(id);
      if (!updated) {
        return errorResponse(res, 'Không tìm thấy giống', 404);
      }
      return successResponse(res, updated, `Đã ${updated.is_active ? 'bật' : 'tắt'} kích hoạt giống`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Xóa giống thú cưng (Admin)
   */
  async deleteBreed(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await petBreedService.deleteBreed(id);
      if (!deleted) {
        return errorResponse(res, 'Không tìm thấy giống để xóa', 404);
      }
      return successResponse(res, null, 'Đã xóa giống thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PetBreedController();
