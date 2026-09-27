const supabase = require('../utils/supabaseClient');
const crypto = require('crypto');

let memoryCategories = [
  { id: 'c1111111-1111-1111-1111-111111111111', name: 'Thức ăn hạt cho Mèo', slug: 'thuc-an-hat-cho-meo', pet_type: 'cat', sort_order: 1, is_active: true },
  { id: 'c2222222-2222-2222-2222-222222222222', name: 'Thức ăn hạt cho Chó', slug: 'thuc-an-hat-cho-cho', pet_type: 'dog', sort_order: 2, is_active: true },
  { id: 'c3333333-3333-3333-3333-333333333333', name: 'Pate & Thức ăn ướt', slug: 'pate-thuc-an-uot', pet_type: 'all', sort_order: 3, is_active: true },
  { id: 'c4444444-4444-4444-4444-444444444444', name: 'Bánh thưởng & Snack', slug: 'banh-thuong-snack', pet_type: 'all', sort_order: 4, is_active: true },
  { id: 'c5555555-5555-5555-5555-555555555555', name: 'Đồ chơi & Vận động', slug: 'do-choi-van-dong', pet_type: 'all', sort_order: 5, is_active: true },
  { id: 'c6666666-6666-6666-6666-666666666666', name: 'Chăm sóc & Vệ sinh', slug: 'cham-soc-ve-sinh', pet_type: 'all', sort_order: 6, is_active: true }
];

let memoryProducts = [];

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
      limit = 12,
      include_inactive = false
    } = filters;

    let products = [];
    try {
      let query = supabase
        .from('products')
        .select('*, categories(id, name, slug)', { count: 'exact' });

      if (!include_inactive || include_inactive === 'false') {
        query = query.eq('is_active', true);
      }

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

    // No products fallback to memory


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

  async createProduct(productData) {
    const slugify = (text) =>
      text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    const slug = productData.slug || `${slugify(productData.name || 'san-pham')}-${Date.now().toString().slice(-4)}`;
    
    // Map category ID if it's shorthand 'c1'..'c6'
    let catId = productData.category_id;
    const catMap = {
      'c1': 'c1111111-1111-1111-1111-111111111111',
      'c2': 'c2222222-2222-2222-2222-222222222222',
      'c3': 'c3333333-3333-3333-3333-333333333333',
      'c4': 'c4444444-4444-4444-4444-444444444444',
      'c5': 'c5555555-5555-5555-5555-555555555555',
      'c6': 'c6666666-6666-6666-6666-666666666666'
    };
    if (catMap[catId]) {
      catId = catMap[catId];
    } else if (!catId || !catId.includes('-')) {
      catId = 'c1111111-1111-1111-1111-111111111111';
    }

    const parsePrice = (val) => {
      if (typeof val === 'number') return Math.round(val);
      if (!val) return 0;
      const digitsOnly = String(val).replace(/[^0-9]/g, '');
      return parseInt(digitsOnly, 10) || 0;
    };

    const newProduct = {
      id: (productData.id && productData.id.includes('-')) ? productData.id : crypto.randomUUID(),
      category_id: catId,
      name: productData.name,
      slug,
      brand: productData.brand || 'Pet Paw Selected',
      images: Array.isArray(productData.images)
        ? productData.images
        : (productData.images ? [productData.images] : (productData.image_url ? [productData.image_url] : [])),
      description: productData.description || '',
      ingredients: productData.ingredients || '',
      benefits: productData.benefits || '',
      usage_instructions: productData.usage_instructions || '',
      pet_type: productData.pet_type || 'all',
      target_age: productData.target_age || 'Mọi lứa tuổi',
      target_needs: productData.target_needs || '',
      reference_price: parsePrice(productData.reference_price),
      shopee_url: productData.shopee_url || '',
      tiktok_url: productData.tiktok_url || '',
      is_active: productData.is_active !== undefined ? Boolean(productData.is_active) : true,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) {
        console.error('Supabase createProduct error:', error);
      } else if (data) {
        memoryProducts.unshift(data);
        return data;
      }
    } catch (err) {
      console.error('Supabase createProduct exception:', err);
    }

    memoryProducts.unshift(newProduct);
    return newProduct;
  }

  async updateProduct(id, updateData) {
    const payload = { ...updateData, updated_at: new Date().toISOString() };
    if (updateData.reference_price !== undefined) {
      if (typeof updateData.reference_price === 'number') {
        payload.reference_price = Math.round(updateData.reference_price);
      } else {
        const digitsOnly = String(updateData.reference_price).replace(/[^0-9]/g, '');
        payload.reference_price = parseInt(digitsOnly, 10) || 0;
      }
    }
    if (updateData.images && !Array.isArray(updateData.images)) {
      payload.images = [updateData.images];
    }
    if (updateData.category_id) {
      const catMap = {
        'c1': 'c1111111-1111-1111-1111-111111111111',
        'c2': 'c2222222-2222-2222-2222-222222222222',
        'c3': 'c3333333-3333-3333-3333-333333333333',
        'c4': 'c4444444-4444-4444-4444-444444444444',
        'c5': 'c5555555-5555-5555-5555-555555555555',
        'c6': 'c6666666-6666-6666-6666-666666666666'
      };
      if (catMap[updateData.category_id]) {
        payload.category_id = catMap[updateData.category_id];
      }
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const idx = memoryProducts.findIndex(p => p.id === id);
        if (idx !== -1) memoryProducts[idx] = data;
        return data;
      }
    } catch (err) {
      console.error('Supabase updateProduct exception:', err);
    }

    const index = memoryProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryProducts[index] = { ...memoryProducts[index], ...payload };
      return memoryProducts[index];
    }
    return payload;
  }

  async toggleProductActive(id) {
    try {
      const { data: current } = await supabase
        .from('products')
        .select('is_active')
        .eq('id', id)
        .single();

      if (current) {
        const nextState = !current.is_active;
        const { data, error } = await supabase
          .from('products')
          .update({ is_active: nextState, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const idx = memoryProducts.findIndex(p => p.id === id);
          if (idx !== -1) memoryProducts[idx] = data;
          return data;
        }
      }
    } catch (err) {
      console.error('Supabase toggleProductActive exception:', err);
    }

    const index = memoryProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryProducts[index].is_active = !memoryProducts[index].is_active;
      return memoryProducts[index];
    }
    return { id, is_active: true };
  }

  async deleteProduct(id) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.error('Supabase deleteProduct exception:', err);
    }

    const index = memoryProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      memoryProducts.splice(index, 1);
    }
    return true;
  }
}

module.exports = new ProductService();

