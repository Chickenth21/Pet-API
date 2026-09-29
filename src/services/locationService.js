const supabase = require('../utils/supabaseClient');
const crypto = require('crypto');

// Dữ liệu ban đầu đồng bộ với giao diện phòng khám & spa thực tế
let memoryLocations = [];

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

      if (!error && data) {
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
