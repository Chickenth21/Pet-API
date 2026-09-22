const supabase = require('../utils/supabaseClient');

let memoryCategories = [
  { id: 'c1', name: 'Thức ăn hạt cho Mèo', slug: 'thuc-an-hat-cho-meo', pet_type: 'cat', sort_order: 1, is_active: true },
  { id: 'c2', name: 'Thức ăn hạt cho Chó', slug: 'thuc-an-hat-cho-cho', pet_type: 'dog', sort_order: 2, is_active: true },
  { id: 'c3', name: 'Pate & Thức ăn ướt', slug: 'pate-thuc-an-uot', pet_type: 'all', sort_order: 3, is_active: true },
  { id: 'c4', name: 'Bánh thưởng & Snack', slug: 'banh-thuong-snack', pet_type: 'all', sort_order: 4, is_active: true },
  { id: 'c5', name: 'Đồ chơi & Vận động', slug: 'do-choi-van-dong', pet_type: 'all', sort_order: 5, is_active: true },
  { id: 'c6', name: 'Chăm sóc & Vệ sinh', slug: 'cham-soc-ve-sinh', pet_type: 'all', sort_order: 6, is_active: true }
];

let memoryProducts = [
  {
    id: 'p1',
    category_id: 'c1',
    name: 'Hạt Royal Canin British Shorthair Adult cho Mèo Anh Lông Ngắn',
    slug: 'royal-canin-british-shorthair-adult',
    brand: 'Royal Canin',
    images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop'],
    description: 'Hạt chuyên dụng thiết kế theo khuôn hàm mèo Anh lông ngắn hình vầng trăng khuyết, bảo vệ sức khỏe tim mạch và duy trì khối lượng cơ bắp săn chắc.',
    ingredients: 'Thịt gia cầm sấy khô cô đặc, gạo tấm, protein thực vật cô lập, mỡ gà sạch, dầu cá giàu EPA/DHA, củ cải đường, men bia.',
    benefits: 'Duy trì vóc dáng chắc nịch không bị xệ bụng; Chăm sóc đường tiết niệu; Tăng cường men vi sinh đường ruột.',
    usage_instructions: 'Cho ăn theo định lượng in trên bao bì. Mèo 5kg: 60g/ngày.',
    pet_type: 'cat',
    target_age: 'Trưởng thành (trên 12 tháng)',
    target_needs: 'Kiểm soát cân nặng',
    reference_price: 420000,
    shopee_url: 'https://shopee.vn/search?keyword=royal+canin+british+shorthair',
    tiktok_url: 'https://www.tiktok.com/search?q=royal+canin+british+shorthair',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p2',
    category_id: 'c2',
    name: 'Hạt Chó Con SmartHeart Gold Puppy Phát Triển Não Bộ & Tiêu Hóa',
    slug: 'smartheart-gold-puppy-dha',
    brand: 'SmartHeart',
    images: ['https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&auto=format&fit=crop'],
    description: 'Hạt cho cún con với hàm lượng DHA tinh khiết từ dầu cá biển giúp cún cưng tiếp thu huấn luyện thông minh và mắt sáng long lanh.',
    ingredients: 'Bột thịt gia cầm, gạo vỡ, bắp, đậu nành, bột củ cải đường, dầu cá ngừ, prebiotic FOS.',
    benefits: 'Khung xương và khớp phát triển vững chắc; Tiêu hóa khỏe mạnh, giảm mùi hôi chất thải.',
    usage_instructions: 'Có thể ngâm mềm với nước ấm hoặc sữa chuyên dụng cho cún dưới 3 tháng tuổi.',
    pet_type: 'dog',
    target_age: 'Dưới 12 tháng',
    target_needs: 'Tăng trưởng nhanh & Miễn dịch',
    reference_price: 285000,
    shopee_url: 'https://shopee.vn/search?keyword=smartheart+gold+puppy',
    tiktok_url: 'https://www.tiktok.com/search?q=smartheart+gold+puppy',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p3',
    category_id: 'c3',
    name: 'Pate Ciao Churu Cho Mèo Dạng Kem Tuýp (Gói 4 thanh x 14g)',
    slug: 'pate-ciao-churu-dang-thanh',
    brand: 'Inaba Ciao',
    images: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop'],
    description: 'Món ăn vặt dạng kem số 1 Nhật Bản bổ sung độ ẩm dồi dào, đánh thức mọi vị giác khó tính của loài mèo.',
    ingredients: 'Thịt ức gà tươi, cá ngừ đại dương Maguro, chiết xuất sò điệp Hokkaido, trà xanh khử mùi hôi miệng.',
    benefits: 'Phòng ngừa hiệu quả các bệnh sỏi thận và sỏi đường tiết niệu do mèo ít chịu uống nước.',
    usage_instructions: 'Bóp cho ăn trực tiếp hoặc trộn vào hạt khô để tăng độ hấp dẫn.',
    pet_type: 'cat',
    target_age: 'Mọi lứa tuổi',
    target_needs: 'Bổ sung nước & Kích thích ăn uống',
    reference_price: 45000,
    shopee_url: 'https://shopee.vn/search?keyword=pate+ciao+churu',
    tiktok_url: 'https://www.tiktok.com/search?q=pate+ciao+churu',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p4',
    category_id: 'c6',
    name: 'Sữa Tắm Thảo Dược Khử Mùi & Dưỡng Lông SOS (Chai 530ml)',
    slug: 'sua-tam-duong-long-sos-530ml',
    brand: 'SOS Pet',
    images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop'],
    description: 'Dòng sữa tắm cao cấp dịu nhẹ giữ mùi hương hoa cỏ tự nhiên lưu hương thơm mát đến 10 ngày.',
    ingredients: 'Chiết xuất hoa cúc La Mã, dầu dừa tinh khiết, Vitamin E, Protein tơ tằm.',
    benefits: 'Diệt khuẩn da, làm mềm mượt lông xơ rối, ngăn ngừa viêm da và ngứa ngáy mùa ẩm ướt.',
    usage_instructions: 'Làm ướt lông, xoa bóp tạo bọt 3-5 phút sau đó xả sạch lại bằng nước ấm.',
    pet_type: 'all',
    target_age: 'Mọi lứa tuổi',
    target_needs: 'Dưỡng lông & Diệt khuẩn',
    reference_price: 115000,
    shopee_url: 'https://shopee.vn/search?keyword=sua+tam+sos+cho+meo',
    tiktok_url: 'https://www.tiktok.com/search?q=sua+tam+sos',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p5',
    category_id: 'c5',
    name: 'Đồ Chơi Tháp Bóng 3 Tầng Kích Thích Vận Động Cho Mèo',
    slug: 'thap-bong-3-tang-cho-meo',
    brand: 'PetJoy',
    images: ['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&auto=format&fit=crop'],
    description: 'Tháp bóng 3 tầng thông minh giúp mèo cưng tự chơi hàng giờ, giải tỏa ức chế và kích thích phản xạ săn mồi.',
    ingredients: 'Nhựa ABS nguyên sinh không độc hại, an toàn tuyệt đối cho thú cưng khi cắn gặm.',
    benefits: 'Tăng cường vận động tiêu hao mỡ thừa cho mèo lười; Giảm thói quen cào rách ghế sofa.',
    usage_instructions: 'Đặt trên mặt sàn phẳng trong phòng khách hoặc gần chỗ ngủ của mèo.',
    pet_type: 'cat',
    target_age: 'Mọi lứa tuổi',
    target_needs: 'Vận động & Giảm cân',
    reference_price: 65000,
    shopee_url: 'https://shopee.vn/search?keyword=thap+bong+3+tang+cho+meo',
    tiktok_url: 'https://www.tiktok.com/search?q=thap+bong+3+tang',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'p6',
    category_id: 'c4',
    name: 'Bánh Thưởng Sạch Răng Cho Chó Vegebrand Dental Bone (Gói 180g)',
    slug: 'banh-thuong-sach-rang-vegebrand',
    brand: 'Vegebrand',
    images: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop'],
    description: 'Xương gặm làm sạch mảng bám răng, phòng ngừa cao răng và tạo hơi thở thơm tho tự nhiên cho cún yêu.',
    ingredients: 'Bột gạo, tinh bột sắn, gelatin tự nhiên, bạc hà khử mùi, chlorophyll.',
    benefits: 'Cơ hàm dẻo dai; Đánh bay 90% cao răng tích tụ; Hương bạc hà mát lành.',
    usage_instructions: 'Cho cún gặm 1 thanh/ngày sau bữa ăn chính.',
    pet_type: 'dog',
    target_age: 'Trưởng thành (trên 12 tháng)',
    target_needs: 'Chăm sóc răng miệng',
    reference_price: 78000,
    shopee_url: 'https://shopee.vn/search?keyword=vegebrand+dental+bone',
    tiktok_url: 'https://www.tiktok.com/search?q=vegebrand+dental',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

let memoryFavorites = [];

class ProductService {
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) return data;
    } catch {
      // Fallback
    }
    return memoryCategories;
  }

  async getProducts(filters = {}, userId = null) {
    const {
      search = '',
      pet_type = 'all',
      category_id,
      brand,
      target_needs,
      min_price,
      max_price,
      page = 1,
      limit = 12
    } = filters;

    let products = [];
    try {
      let query = supabase
        .from('products')
        .select('*, categories(id, name, slug)', { count: 'exact' })
        .eq('is_active', true);

      if (pet_type && pet_type !== 'all') {
        query = query.or(`pet_type.eq.${pet_type},pet_type.eq.all`);
      }
      if (category_id) {
        query = query.eq('category_id', category_id);
      }
      if (brand) {
        query = query.ilike('brand', `%${brand}%`);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`);
      }

      const { data, count, error } = await query;
      if (!error && data && data.length > 0) {
        products = data;
      }
    } catch {
      // Fallback
    }

    if (products.length === 0) {
      products = memoryProducts.filter(p => p.is_active);
    }

    // Lọc bộ tiêu chuẩn
    let filtered = products.filter(p => {
      if (pet_type && pet_type !== 'all') {
        if (p.pet_type !== pet_type && p.pet_type !== 'all') return false;
      }
      if (category_id && p.category_id !== category_id) {
        return false;
      }
      if (brand && !p.brand.toLowerCase().includes(brand.toLowerCase())) {
        return false;
      }
      if (target_needs && !p.target_needs?.toLowerCase().includes(target_needs.toLowerCase())) {
        return false;
      }
      if (min_price && p.reference_price < Number(min_price)) {
        return false;
      }
      if (max_price && p.reference_price > Number(max_price)) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc) return false;
      }
      return true;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + Number(limit));

    // Đánh dấu sản phẩm đã được user yêu thích
    const favoritesSet = new Set(
      userId ? memoryFavorites.filter(f => f.user_id === userId).map(f => f.product_id) : []
    );

    const result = paginated.map(p => ({
      ...p,
      is_favorite: favoritesSet.has(p.id)
    }));

    return {
      products: result,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  async getProductBySlug(slug, userId = null) {
    let product = memoryProducts.find(p => p.slug === slug);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) product = data;
    } catch {
      // Fallback
    }

    if (!product) throw new Error('Không tìm thấy sản phẩm!');

    const isFav = userId
      ? memoryFavorites.some(f => f.user_id === userId && f.product_id === product.id)
      : false;

    // Lấy 4 sản phẩm liên quan
    const related = memoryProducts
      .filter(p => p.id !== product.id && (p.pet_type === product.pet_type || p.category_id === product.category_id))
      .slice(0, 4);

    return {
      ...product,
      is_favorite: isFav,
      related_products: related
    };
  }

  async toggleFavorite(userId, productId) {
    const existingIndex = memoryFavorites.findIndex(f => f.user_id === userId && f.product_id === productId);
    let isFavorite = false;

    if (existingIndex > -1) {
      memoryFavorites.splice(existingIndex, 1);
      isFavorite = false;
    } else {
      memoryFavorites.push({ user_id: userId, product_id: productId, created_at: new Date().toISOString() });
      isFavorite = true;
    }

    try {
      if (isFavorite) {
        await supabase.from('user_favorites').insert([{ user_id: userId, product_id: productId }]);
      } else {
        await supabase.from('user_favorites').delete().eq('user_id', userId).eq('product_id', productId);
      }
    } catch {
      // Fallback
    }

    return { is_favorite: isFavorite };
  }

  async getFavorites(userId) {
    const favProductIds = memoryFavorites.filter(f => f.user_id === userId).map(f => f.product_id);
    return memoryProducts.filter(p => favProductIds.includes(p.id));
  }
}

module.exports = new ProductService();
