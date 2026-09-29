const productService = require('../services/productService');
const affiliateService = require('../services/affiliateService');
const blogService = require('../services/blogService');
const petSaleService = require('../services/petSaleService');
const petService = require('../services/petService');
const userService = require('../services/userService');
const supabase = require('../utils/supabaseClient');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const clickStats = await affiliateService.getClickStats();
      const productsData = await productService.getProducts({ limit: 100, include_inactive: true });
      const categories = await productService.getCategories();
      const blogs = await blogService.getAllPostsAdmin();
      const petsSaleData = await petSaleService.getPets({ limit: 100, include_sold: true });

      const totalPetsForSale = petsSaleData.pagination.total;
      const petsAvailable = petsSaleData.pets.filter(p => p.status === 'available').length;
      const petsSold = petsSaleData.pets.filter(p => p.status === 'sold').length;

      let totalUsers = 0;
      let totalPets = 0;
      try {
        const [usersCountRes, petsCountRes] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('pets').select('*', { count: 'exact', head: true })
        ]);
        if (usersCountRes.count !== null && !usersCountRes.error) totalUsers = usersCountRes.count;
        if (petsCountRes.count !== null && !petsCountRes.error) totalPets = petsCountRes.count;
      } catch {
        // Fallback
      }

      return successResponse(res, {
        summary: {
          totalUsers,
          totalPets,
          totalPetsForSale,
          petsAvailable,
          petsSold,
          totalProducts: productsData.pagination.total,
          totalArticles: blogs.length,
          totalAffiliateClicks: clickStats.totalClicks,
          shopeeClicks: clickStats.shopeeClicks,
          tiktokClicks: clickStats.tiktokClicks
        },
        clickStats,
        categoriesCount: categories.length,
        recentProducts: productsData.products.slice(0, 5),
        recentPets: petsSaleData.pets.slice(0, 5)
      }, 'Lấy dữ liệu thống kê quản trị thành công');
    } catch (err) {
      next(err);
    }
  }

  // --- QUẢN LÝ SẢN PHẨM (PRODUCT CRUD) ---
  async createProduct(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        return errorResponse(res, 'Tên sản phẩm không được để trống', 400);
      }
      const product = await productService.createProduct(req.body);
      return successResponse(res, product, 'Thêm sản phẩm thành công', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      return successResponse(res, product, 'Cập nhật sản phẩm thành công');
    } catch (err) {
      next(err);
    }
  }

  async toggleProductActive(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.toggleProductActive(id);
      return successResponse(
        res, 
        product, 
        product.is_active ? 'Đã hiển thị sản phẩm trên trang khách hàng' : 'Đã ẩn sản phẩm khỏi trang khách hàng'
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await productService.deleteProduct(id);
      return successResponse(res, deleted, 'Đã xóa sản phẩm thành công');
    } catch (err) {
      next(err);
    }
  }

  // --- QUẢN LÝ BÀI VIẾT BLOG (BLOG CRUD) ---
  async getBlogs(req, res, next) {
    try {
      const blogs = await blogService.getAllPostsAdmin();
      return successResponse(res, blogs, 'Lấy danh sách bài viết quản trị thành công');
    } catch (err) {
      next(err);
    }
  }

  async createBlog(req, res, next) {
    try {
      const { title } = req.body;
      if (!title) {
        return errorResponse(res, 'Tiêu đề bài viết không được để trống', 400);
      }
      const post = await blogService.createPost(req.body);
      return successResponse(res, post, 'Thêm bài viết mới thành công', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateBlog(req, res, next) {
    try {
      const { id } = req.params;
      const post = await blogService.updatePost(id, req.body);
      return successResponse(res, post, 'Cập nhật bài viết thành công');
    } catch (err) {
      next(err);
    }
  }

  async toggleBlogPublish(req, res, next) {
    try {
      const { id } = req.params;
      const post = await blogService.togglePostPublish(id);
      return successResponse(
        res,
        post,
        post.is_published ? 'Đã xuất bản bài viết lên website khách hàng' : 'Đã chuyển bài viết về dạng bản nháp'
      );
    } catch (err) {
      next(err);
    }
  }

  async deleteBlog(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await blogService.deletePost(id);
      return successResponse(res, deleted, 'Đã xóa bài viết thành công');
    } catch (err) {
      next(err);
    }
  }

  // --- QUẢN LÝ THÚ CƯNG BÁN (PET SALES CRUD) ---
  async getAdminPetsForSale(req, res, next) {
    try {
      const { species, status, search, page, limit } = req.query;
      const data = await petSaleService.getPets({
        species,
        status,
        search,
        page,
        limit,
        include_sold: true
      });
      return successResponse(res, data, 'Lấy danh sách thú cưng quản trị thành công');
    } catch (err) {
      next(err);
    }
  }

  async createPetForSale(req, res, next) {
    try {
      const { name, price, species, breed } = req.body;
      if (!name || !price || !breed) {
        return errorResponse(res, 'Vui lòng điền đầy đủ Tên, Giống và Giá bán của bé cưng', 400);
      }
      const pet = await petSaleService.createPet(req.body);
      return successResponse(res, pet, 'Đăng thông tin bé thú cưng thành công', 201);
    } catch (err) {
      next(err);
    }
  }

  async updatePetForSale(req, res, next) {
    try {
      const { id } = req.params;
      const pet = await petSaleService.updatePet(id, req.body);
      if (!pet) {
        return errorResponse(res, 'Không tìm thấy bé thú cưng để cập nhật', 404);
      }
      return successResponse(res, pet, 'Cập nhật thông tin bé thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }

  async updatePetForSaleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        return errorResponse(res, 'Trạng thái không được để trống', 400);
      }
      const pet = await petSaleService.updatePetStatus(id, status);
      const statusLabels = {
        available: '🟢 Đang tìm chủ',
        reserved: '🟡 Đã nhận cọc',
        sold: '⚪ Đã về nhà mới'
      };
      return successResponse(res, pet, `Đã cập nhật trạng thái bé thành: ${statusLabels[status] || status}`);
    } catch (err) {
      next(err);
    }
  }

  async deletePetForSale(req, res, next) {
    try {
      const { id } = req.params;
      await petSaleService.deletePet(id);
      return successResponse(res, null, 'Đã xóa bé thú cưng khỏi danh sách mở bán');
    } catch (err) {
      next(err);
    }
  }

  // --- QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN (USER & ROLE RBAC) ---
  async getUsers(req, res, next) {
    try {
      const { search, role, status, page, limit } = req.query;
      const data = await userService.getUsers({ search, role, status, page, limit });
      return successResponse(res, data, 'Lấy danh sách người dùng thành công');
    } catch (err) {
      next(err);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role) {
        return errorResponse(res, 'Vui lòng cung cấp vai trò mới (admin, user, guest)', 400);
      }
      const updated = await userService.updateUserRole(id, role, req.user?.id);
      return successResponse(res, updated, `Đã cập nhật quyền tài khoản thành công: ${role}`);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await userService.toggleUserStatus(id, req.user?.id);
      const msg = updated.is_active ? 'Đã kích hoạt tài khoản thành công' : 'Đã khóa tài khoản thành công';
      return successResponse(res, updated, msg);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  async createUser(req, res, next) {
    try {
      const { email, password, full_name, role, is_active } = req.body;
      if (!email || !password || !full_name) {
        return errorResponse(res, 'Vui lòng nhập đầy đủ Email, Mật khẩu và Họ tên', 400);
      }
      const newUser = await userService.createUser({ email, password, full_name, role, is_active });
      return successResponse(res, newUser, 'Tạo tài khoản mới thành công', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id, req.user?.id);
      return successResponse(res, { id }, 'Đã xóa tài khoản người dùng thành công');
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  }

  // --- QUẢN LÝ HỒ SƠ THÚ CƯNG KHÁCH HÀNG & THỂ TRẠNG (USER PETS & HEALTH) ---
  async getUserPets(req, res, next) {
    try {
      const { search, species, page, limit } = req.query;
      const data = await petService.getAllPetsForAdmin({ search, species, page, limit });
      return successResponse(res, data, 'Lấy danh sách hồ sơ thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }

  async getUserPetHealth(req, res, next) {
    try {
      const { id } = req.params;
      const data = await petService.getPetHealthDetailsForAdmin(id);
      return successResponse(res, data, 'Lấy chi tiết thể trạng thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }

  async deleteUserPet(req, res, next) {
    try {
      const { id } = req.params;
      await petService.deletePetByAdmin(id);
      return successResponse(res, { id }, 'Đã xóa hồ sơ thú cưng thành công');
    } catch (err) {
      next(err);
    }
  }

  // Cố tình kích hoạt lỗi unhandled / 500 để kiểm thử Discord error logger
  async testDiscordError(req, res, next) {
    try {
      throw new Error('[TEST] Discord Bot Error Alert Triggered! Hệ thống kiểm tra cảnh báo lỗi qua Discord.');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();

