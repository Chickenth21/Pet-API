const supabase = require('../utils/supabaseClient');
const crypto = require('crypto');

// Dữ liệu ban đầu đồng bộ với giao diện phòng khám & spa thực tế
let memoryLocations = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'Bệnh Viện Thú Y PetCare 24/7',
    type: 'clinic',
    address: '124 Hoàng Hoa Thám, Ba Đình, Hà Nội',
    district: 'Ba Đình',
    city: 'Hà Nội',
    phone: '024 3823 4567',
    rating: 4.9,
    reviews_count: 182,
    emergency_24h: true,
    distance: '1.2 km',
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop',
    services: ['Cấp cứu 24/7', 'Phẫu thuật chuyên sâu', 'Xét nghiệm máu', 'Tiêm phòng vacxin'],
    description: 'Hệ thống bệnh viện thú y chuẩn quốc tế với đầy đủ trang thiết bị cấp cứu, phòng mổ vô trùng và đội ngũ bác sĩ chuyên khoa.',
    is_active: true,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    name: 'Hệ Thống Thú Y 2Vet Clinic',
    type: 'clinic',
    address: '335 Kim Mã, Ba Đình, Hà Nội',
    district: 'Ba Đình',
    city: 'Hà Nội',
    phone: '098 632 8822',
    rating: 4.8,
    reviews_count: 145,
    emergency_24h: true,
    distance: '2.5 km',
    image_url: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&auto=format&fit=crop',
    services: ['Siêu âm - X-quang', 'Nội trú điều trị', 'Khám da liễu', 'Triệt sản an toàn'],
    description: 'Phòng khám thú y uy tín, cung cấp các dịch vụ chẩn đoán hình ảnh kỹ thuật số hiện đại và phác đồ điều trị an toàn.',
    is_active: true,
    created_at: new Date('2026-01-05').toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    name: 'PetSpa & Grooming House',
    type: 'spa',
    address: '56 Nguyễn Chí Thanh, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    city: 'Hà Nội',
    phone: '091 234 5678',
    rating: 4.9,
    reviews_count: 96,
    emergency_24h: false,
    distance: '3.1 km',
    image_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop',
    services: ['Tắm sấy khử mùi', 'Cắt tỉa lông tạo kiểu', 'Cắt móng vệ sinh tai', 'Khách sạn thú cưng'],
    description: 'Spa thú cưng chuẩn 5 sao với các gói dịch vụ tắm bồn sục oxy, massage xoa dịu stress và cắt tỉa nghệ thuật chuẩn giống.',
    is_active: true,
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    name: 'Phòng Khám Thú Y Gaia Pet Hospital',
    type: 'clinic',
    address: '38 Xuân Diệu, Tây Hồ, Hà Nội',
    district: 'Tây Hồ',
    city: 'Hà Nội',
    phone: '024 3718 6969',
    rating: 4.7,
    reviews_count: 110,
    emergency_24h: false,
    distance: '4.0 km',
    image_url: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop',
    services: ['Khám tổng quát', 'Nha khoa thú cưng', 'Điều trị nội trú', 'Chăm sóc mèo chuyên sâu'],
    description: 'Phòng khám thú y với đội ngũ bác sĩ song ngữ, trang bị máy sinh hóa máu tự động và khu điều trị nội trú riêng biệt cho mèo.',
    is_active: true,
    created_at: new Date('2026-01-12').toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    name: 'Kimi Pet - Spa & Phụ Kiện Thú Cưng',
    type: 'spa',
    address: '126 Láng Hạ, Đống Đa, Hà Nội',
    district: 'Đống Đa',
    city: 'Hà Nội',
    phone: '088 888 1234',
    rating: 4.8,
    reviews_count: 204,
    emergency_24h: false,
    distance: '3.8 km',
    image_url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&auto=format&fit=crop',
    services: ['Spa tắm bồn sục', 'Nhuộm lông nghệ thuật', 'Khách sạn chó mèo cao cấp'],
    description: 'Học viện cắt tỉa và salon thú cưng cao cấp hàng đầu với hệ thống phòng khách sạn điều hòa riêng biệt.',
    is_active: true,
    created_at: new Date('2026-01-15').toISOString(),
    updated_at: new Date().toISOString()
  }
];

class LocationService {
  /**
   * Lấy danh sách bệnh viện thú y và tiệm spa (Hỗ trợ phân trang, lọc theo type, quận huyện, tìm kiếm)
   */
  async getLocations({
    type,
    district,
    search,
    page = 1,
    limit = 50,
    include_inactive = false
  } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    try {
      let query = supabase
        .from('pet_locations')
        .select('*', { count: 'exact' });

      if (!include_inactive) {
        query = query.eq('is_active', true);
      }
      if (type && type !== 'all') {
        query = query.eq('type', type);
      }
      if (district && district !== 'all') {
        query = query.ilike('district', `%${district}%`);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      query = query
        .order('emergency_24h', { ascending: false })
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        return {
          locations: data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count !== null ? count : data.length,
            totalPages: Math.ceil((count !== null ? count : data.length) / limitNum) || 0
          }
        };
      }
    } catch {
      // Fallback xuống memoryLocations
    }

    // In-memory fallback
    let filtered = [...memoryLocations];
    if (!include_inactive) {
      filtered = filtered.filter(l => l.is_active !== false);
    }
    if (type && type !== 'all') {
      filtered = filtered.filter(l => l.type === type);
    }
    if (district && district !== 'all') {
      filtered = filtered.filter(l => l.district && l.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l => 
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.address && l.address.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    return {
      locations: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 0
      }
    };
  }

  /**
   * Lấy chi tiết cơ sở theo ID
   */
  async getLocationById(id) {
    try {
      const { data, error } = await supabase
        .from('pet_locations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return data;
    } catch {
      // Fallback
    }

    return memoryLocations.find(l => String(l.id) === String(id)) || null;
  }

  /**
   * Tạo mới địa điểm Bệnh viện thú y / Tiệm Spa
   */
  async createLocation(locationData) {
    const newLocation = {
      id: crypto.randomUUID(),
      name: locationData.name.trim(),
      type: locationData.type || 'clinic', // 'clinic' | 'spa'
      address: locationData.address ? locationData.address.trim() : '',
      district: locationData.district ? locationData.district.trim() : 'Hà Nội',
      city: locationData.city ? locationData.city.trim() : 'Hà Nội',
      phone: locationData.phone ? locationData.phone.trim() : '',
      rating: parseFloat(locationData.rating) || 5.0,
      reviews_count: parseInt(locationData.reviews_count, 10) || 0,
      emergency_24h: Boolean(locationData.emergency_24h),
      distance: locationData.distance ? locationData.distance.trim() : 'Gần bạn',
      image_url: locationData.image_url ? locationData.image_url.trim() : '',
      services: Array.isArray(locationData.services) ? locationData.services : (typeof locationData.services === 'string' ? locationData.services.split(',').map(s => s.trim()).filter(Boolean) : []),
      description: locationData.description ? locationData.description.trim() : '',
      is_active: locationData.is_active !== undefined ? Boolean(locationData.is_active) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('pet_locations')
        .insert([newLocation])
        .select()
        .single();

      if (!error && data) {
        memoryLocations.unshift(data);
        return data;
      }
    } catch {
      // Fallback
    }

    memoryLocations.unshift(newLocation);
    return newLocation;
  }

  /**
   * Cập nhật thông tin cơ sở
   */
  async updateLocation(id, updateData) {
    const payload = { ...updateData, updated_at: new Date().toISOString() };
    if (payload.rating !== undefined) payload.rating = parseFloat(payload.rating) || 5.0;
    if (payload.reviews_count !== undefined) payload.reviews_count = parseInt(payload.reviews_count, 10) || 0;
    if (payload.emergency_24h !== undefined) payload.emergency_24h = Boolean(payload.emergency_24h);
    if (payload.is_active !== undefined) payload.is_active = Boolean(payload.is_active);
    if (typeof payload.services === 'string') {
      payload.services = payload.services.split(',').map(s => s.trim()).filter(Boolean);
    }

    try {
      const { data, error } = await supabase
        .from('pet_locations')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const idx = memoryLocations.findIndex(l => String(l.id) === String(id));
        if (idx !== -1) memoryLocations[idx] = data;
        return data;
      }
    } catch {
      // Fallback
    }

    const idx = memoryLocations.findIndex(l => String(l.id) === String(id));
    if (idx !== -1) {
      memoryLocations[idx] = { ...memoryLocations[idx], ...payload };
      return memoryLocations[idx];
    }

    return null;
  }

  /**
   * Bật/Tắt trạng thái hoạt động cơ sở
   */
  async toggleLocationActive(id) {
    const loc = await this.getLocationById(id);
    if (!loc) throw new Error('Không tìm thấy cơ sở thú y / spa!');

    const newStatus = !loc.is_active;
    return await this.updateLocation(id, { is_active: newStatus });
  }

  /**
   * Xóa cơ sở khỏi hệ thống
   */
  async deleteLocation(id) {
    try {
      await supabase
        .from('pet_locations')
        .delete()
        .eq('id', id);
    } catch {
      // Fallback
    }

    memoryLocations = memoryLocations.filter(l => String(l.id) !== String(id));
    return true;
  }
}

module.exports = new LocationService();
