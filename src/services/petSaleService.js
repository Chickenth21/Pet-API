const supabase = require('../utils/supabaseClient');

let memoryPetsForSale = [];

class PetSaleService {
  async getPets({
    species,
    breed,
    gender,
    status,
    minPrice,
    maxPrice,
    search,
    page = 1,
    limit = 10,
    include_sold = true
  } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    try {
      let query = supabase
        .from('pets_for_sale')
        .select('*', { count: 'exact' });

      if (species && species !== 'all') {
        query = query.eq('species', species);
      }
      if (breed) {
        query = query.ilike('breed', `%${breed}%`);
      }
      if (gender) {
        query = query.eq('gender', gender);
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      } else if (!include_sold) {
        query = query.neq('status', 'sold');
      }
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,breed.ilike.%${search}%,color.ilike.%${search}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data, error, count } = await query;

      if (!error && data) {
        return {
          pets: data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count !== null ? count : data.length,
            totalPages: Math.ceil((count !== null ? count : data.length) / limitNum) || 0
          }
        };
      }
    } catch {
      // Fallback sang memory data
    }

    // Memory Filter
    let filtered = [...memoryPetsForSale];

    if (species && species !== 'all') {
      filtered = filtered.filter(p => p.species === species);
    }
    if (breed) {
      filtered = filtered.filter(p => p.breed.toLowerCase().includes(breed.toLowerCase()));
    }
    if (gender) {
      filtered = filtered.filter(p => p.gender === gender);
    }
    if (status && status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    } else if (!include_sold) {
      filtered = filtered.filter(p => p.status !== 'sold');
    }
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.breed.toLowerCase().includes(q) || 
        (p.color && p.color.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    return {
      pets: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  async getPetById(id) {
    try {
      const { data, error } = await supabase
        .from('pets_for_sale')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) return data;
    } catch {
      // Fallback
    }

    return memoryPetsForSale.find(p => p.id === id) || null;
  }

  async createPet(petData) {
    const crypto = require('crypto');
    const parseVND = (v) => {
      if (typeof v === 'number') return Math.round(v);
      if (!v) return 0;
      const digits = String(v).replace(/[^0-9]/g, '');
      return parseInt(digits, 10) || 0;
    };

    const newPet = {
      id: crypto.randomUUID(),
      name: petData.name,
      species: petData.species || 'dog',
      breed: petData.breed || 'Chưa rõ giống',
      gender: petData.gender || 'male',
      age_months: parseInt(petData.age_months, 10) || 2,
      color: petData.color || '',
      price: parseVND(petData.price),
      deposit_amount: parseVND(petData.deposit_amount),
      vaccination_status: petData.vaccination_status || 'Đã tiêm phòng cơ bản',
      pedigree: petData.pedigree || 'Không giấy',
      health_warranty: petData.health_warranty || 'Bảo hành 15 ngày Care & Parvo',
      microchip_id: petData.microchip_id || null,
      images: Array.isArray(petData.images) 
        ? petData.images 
        : (petData.image_url ? [petData.image_url] : []),
      video_url: petData.video_url || null,
      description: petData.description || '',
      status: petData.status || 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('pets_for_sale')
        .insert([newPet])
        .select()
        .single();

      if (!error && data) {
        memoryPetsForSale.unshift(data);
        return data;
      }
    } catch {
      // Fallback
    }

    memoryPetsForSale.unshift(newPet);
    return newPet;
  }

  async updatePet(id, updateData) {
    const parseVND = (v) => {
      if (typeof v === 'number') return Math.round(v);
      if (!v) return 0;
      const digits = String(v).replace(/[^0-9]/g, '');
      return parseInt(digits, 10) || 0;
    };

    const payload = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    if (payload.price !== undefined) payload.price = parseVND(payload.price);
    if (payload.deposit_amount !== undefined) payload.deposit_amount = parseVND(payload.deposit_amount);
    if (payload.age_months !== undefined) payload.age_months = parseInt(payload.age_months, 10);
    if (payload.image_url && !payload.images) {
      payload.images = [payload.image_url];
    }

    try {
      const { data, error } = await supabase
        .from('pets_for_sale')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const idx = memoryPetsForSale.findIndex(p => p.id === id);
        if (idx !== -1) memoryPetsForSale[idx] = data;
        return data;
      }
    } catch {
      // Fallback
    }

    const idx = memoryPetsForSale.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryPetsForSale[idx] = { ...memoryPetsForSale[idx], ...payload };
      return memoryPetsForSale[idx];
    }

    return null;
  }

  async updatePetStatus(id, status) {
    const validStatuses = ['available', 'reserved', 'sold'];
    if (!validStatuses.includes(status)) {
      throw new Error('Trạng thái thú cưng không hợp lệ');
    }

    return this.updatePet(id, { status });
  }

  async deletePet(id) {
    try {
      await supabase
        .from('pets_for_sale')
        .delete()
        .eq('id', id);
    } catch {
      // Fallback
    }

    const idx = memoryPetsForSale.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = memoryPetsForSale.splice(idx, 1)[0];
      return deleted;
    }
    return true;
  }
}

module.exports = new PetSaleService();
