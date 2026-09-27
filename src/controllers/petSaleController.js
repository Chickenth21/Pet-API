const petSaleService = require('../services/petSaleService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class PetSaleController {
  async getPetsForSale(req, res, next) {
    try {
      const {
        species,
        breed,
        gender,
        status,
        minPrice,
        maxPrice,
        search,
        page,
        limit,
        include_sold
      } = req.query;

      const data = await petSaleService.getPets({
        species,
        breed,
        gender,
        status,
        minPrice,
        maxPrice,
        search,
        page,
        limit,
        include_sold: include_sold === 'true' || include_sold === true
      });

      return successResponse(res, data, 'Lấy danh sách thú cưng mở bán thành công');
    } catch (err) {
      next(err);
    }
  }

  async getPetForSaleById(req, res, next) {
    try {
      const { id } = req.params;
      const pet = await petSaleService.getPetById(id);
      if (!pet) {
        return errorResponse(res, 'Không tìm thấy thông tin bé thú cưng này', 404);
      }
      return successResponse(res, pet, 'Lấy thông tin chi tiết thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PetSaleController();
