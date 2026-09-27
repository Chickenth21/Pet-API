const supabase = require('../utils/supabaseClient');

let memoryBreeds = [];

class PetBreedService {
  /**
   * Lấy danh sách giống thú cưng (Hỗ trợ phân trang, lọc theo loài, tìm kiếm)
   */
  async getBreeds({
    species,
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
        .from('pet_breeds')
        .select('*', { count: 'exact' });

      if (!include_inactive) {
        query = query.eq('is_active', true);
      }
      if (species && species !== 'all') {
        query = query.eq('species', species);
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,origin.ilike.%${search}%,temperament.ilike.%${search}%`);
      }

      query = query
        .order('name', { ascending: true })
        .range(offset, offset + limitNum - 1);

      const { data, count, error } = await query;

      if (!error && data) {
        return {
          breeds: data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count !== null ? count : data.length,
            totalPages: Math.ceil((count !== null ? count : data.length) / limitNum) || 0
          }
        };
      }
    } catch {
      // Fallback
    }

    // Memory fallback (nếu rỗng thì trả về mảng rỗng)
    let filtered = [...memoryBreeds];
    if (!include_inactive) {
      filtered = filtered.filter(b => b.is_active !== false);
    }
    if (species && species !== 'all') {
      filtered = filtered.filter(b => b.species === species);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(q) ||
        (b.origin && b.origin.toLowerCase().includes(q)) ||
        (b.temperament && b.temperament.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    return {
      breeds: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 0
      }
    };
  }

  /**
   * Lấy chi tiết 1 giống
   */
  async getBreedById(id) {
    try {
      const { data, error } = await supabase
        .from('pet_breeds')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) return data;
    } catch {
      // Fallback
    }
    return memoryBreeds.find(b => b.id === id) || null;
  }

  /**
   * Thêm giống thú cưng mới
   */
  async createBreed(data) {
    const newBreed = {
      id: `breed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name ? data.name.trim() : '',
      species: data.species || 'dog',
      origin: data.origin ? data.origin.trim() : 'Đang cập nhật',
      size_category: data.size_category || 'medium',
      temperament: data.temperament ? data.temperament.trim() : '',
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data: inserted, error } = await supabase
        .from('pet_breeds')
        .insert([newBreed])
        .select()
        .single();

      if (error) {
        console.error('Supabase createBreed error:', error);
      } else if (inserted) {
        memoryBreeds.unshift(inserted);
        return inserted;
      }
    } catch (err) {
      console.error('Supabase createBreed exception:', err);
    }

    memoryBreeds.unshift(newBreed);
    return newBreed;
  }

  /**
   * Cập nhật thông tin giống
   */
  async updateBreed(id, updateData) {
    const payload = {};
    if (updateData.name !== undefined) payload.name = updateData.name.trim();
    if (updateData.species !== undefined) payload.species = updateData.species;
    if (updateData.origin !== undefined) payload.origin = updateData.origin.trim();
    if (updateData.size_category !== undefined) payload.size_category = updateData.size_category;
    if (updateData.temperament !== undefined) payload.temperament = updateData.temperament.trim();
    if (updateData.is_active !== undefined) payload.is_active = Boolean(updateData.is_active);
    payload.updated_at = new Date().toISOString();

    try {
      const { data: updated, error } = await supabase
        .from('pet_breeds')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateBreed error:', error);
      } else if (updated) {
        const idx = memoryBreeds.findIndex(b => b.id === id);
        if (idx !== -1) memoryBreeds[idx] = updated;
        return updated;
      }
    } catch (err) {
      console.error('Supabase updateBreed exception:', err);
    }

    const idx = memoryBreeds.findIndex(b => b.id === id);
    if (idx === -1) return null;

    memoryBreeds[idx] = {
      ...memoryBreeds[idx],
      ...payload
    };

    return memoryBreeds[idx];
  }

  /**
   * Bật / tắt trạng thái kích hoạt giống
   */
  async toggleBreedActive(id) {
    try {
      const { data: current } = await supabase
        .from('pet_breeds')
        .select('is_active')
        .eq('id', id)
        .single();

      if (current) {
        const nextState = !current.is_active;
        const { data: updated } = await supabase
          .from('pet_breeds')
          .update({ is_active: nextState, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (updated) {
          const idx = memoryBreeds.findIndex(b => b.id === id);
          if (idx !== -1) memoryBreeds[idx] = updated;
          return updated;
        }
      }
    } catch {
      // Fallback
    }

    const breed = memoryBreeds.find(b => b.id === id);
    if (!breed) return null;

    breed.is_active = !breed.is_active;
    breed.updated_at = new Date().toISOString();
    return breed;
  }

  /**
   * Xóa giống thú cưng
   */
  async deleteBreed(id) {
    try {
      await supabase.from('pet_breeds').delete().eq('id', id);
    } catch {
      // Fallback
    }

    const idx = memoryBreeds.findIndex(b => b.id === id);
    if (idx === -1) return false;

    memoryBreeds.splice(idx, 1);
    return true;
  }
}

module.exports = new PetBreedService();
