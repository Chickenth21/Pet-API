const petService = require('../services/petService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class PetController {
  async getMyPets(req, res, next) {
    try {
      const pets = await petService.getPetsByUser(req.user.id);
      return successResponse(res, pets, 'Lấy danh sách thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }

  async getPetById(req, res, next) {
    try {
      const pet = await petService.getPetById(req.params.id, req.user.id);
      return successResponse(res, pet, 'Lấy thông tin thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }

  async createPet(req, res, next) {
    try {
      const { name, species, breed } = req.body;
      if (!name || !species || !breed) {
        return errorResponse(res, 'Vui lòng nhập đầy đủ tên, loài và giống thú cưng!', 400);
      }

      const newPet = await petService.createPet(req.user.id, req.body);
      return successResponse(res, newPet, 'Tạo hồ sơ thú cưng thành công!', 201);
    } catch (err) {
      next(err);
    }
  }

  async updatePet(req, res, next) {
    try {
      const updated = await petService.updatePet(req.params.id, req.user.id, req.body);
      return successResponse(res, updated, 'Cập nhật hồ sơ thú cưng thành công!');
    } catch (err) {
      next(err);
    }
  }

  async deletePet(req, res, next) {
    try {
      await petService.deletePet(req.params.id, req.user.id);
      return successResponse(res, null, 'Xóa hồ sơ thú cưng thành công!');
    } catch (err) {
      next(err);
    }
  }

  async matchmakerQuiz(req, res, next) {
    try {
      const recommendations = petService.evaluateMatchmaker(req.body);
      return successResponse(res, recommendations, 'Phân tích tiêu chí và gợi ý giống thú cưng thành công!');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PetController();
