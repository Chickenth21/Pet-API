const supabase = require('../utils/supabaseClient');

let memoryPetsForSale = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    name: 'Bé Corgi Pembroke Vàng Trắng Mặt Cười',
    species: 'dog',
    breed: 'Corgi Pembroke',
    gender: 'female',
    age_months: 2,
    color: 'Vàng trắng',
    price: 12500000,
    deposit_amount: 2000000,
    vaccination_status: 'Đã tiêm 2 mũi Vanguard 7 bệnh, sổ giun 2 lần',
    pedigree: 'VKA',
    health_warranty: 'Bảo hành 30 ngày Care & Parvo, hỗ trợ tư vấn sức khỏe trọn đời',
    microchip_id: 'MC-98514100234',
    images: [
      'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop'
    ],
    video_url: 'https://www.youtube.com/watch?v=kYv9qQG8p5s',
    description: 'Bé Corgi chân ngắn mông to siêu đáng yêu, mắt sáng lanh lợi, háo ăn và rất quấn chủ. Đã biết đi vệ sinh đúng khay cát/tã lót.',
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    name: 'Bé Mèo Anh Lông Ngắn Silver Shaded Mắt Xanh',
    species: 'cat',
    breed: 'Mèo Anh lông ngắn',
    gender: 'male',
    age_months: 3,
    color: 'Silver Shaded',
    price: 9500000,
    deposit_amount: 1500000,
    vaccination_status: 'Đã tiêm 2 mũi 4 bệnh Merial, sổ giun đầy đủ',
    pedigree: 'WCF',
    health_warranty: 'Bảo hành 15 ngày sức khỏe, cam kết thuần chủng trọn đời',
    microchip_id: 'MC-84092100871',
    images: [
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop'
    ],
    video_url: 'https://www.youtube.com/watch?v=0k73hL9jE64',
    description: 'Bé mèo ALN phom dáng mũm mĩm, má tròn, mắt xanh biếc ngọc lục bảo. Tính cách trầm tĩnh, thích nằm lòng và cực kỳ sạch sẽ.',
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    name: 'Bé Poodle Tiny Nâu Đỏ Lông Xoăn Tít',
    species: 'dog',
    breed: 'Poodle Tiny',
    gender: 'male',
    age_months: 2,
    color: 'Nâu đỏ',
    price: 6800000,
    deposit_amount: 1000000,
    vaccination_status: 'Đã tiêm 2 mũi phòng bệnh, tẩy giun định kỳ',
    pedigree: 'Không giấy',
    health_warranty: 'Bảo hành 15 ngày bệnh Care/Parvo',
    microchip_id: null,
    images: [
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&auto=format&fit=crop'
    ],
    video_url: null,
    description: 'Bé Poodle size Tiny nhỏ nhắn, lông xoăn dày đẹp màu nâu đỏ ánh hạt dẻ. Nhanh nhẹn, thông minh và không rụng lông, rất hợp nuôi nhà chung cư.',
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'e4444444-4444-4444-4444-444444444444',
    name: 'Bé Mèo Munchkin Chân Ngắn Bicolor Đáng Yêu',
    species: 'cat',
    breed: 'Mèo Munchkin',
    gender: 'female',
    age_months: 3,
    color: 'Bicolor (Xám trắng)',
    price: 14000000,
    deposit_amount: 3000000,
    vaccination_status: 'Đã hoàn thành 2 mũi vaccine, đã gắn microchip',
    pedigree: 'TICA',
    health_warranty: 'Bảo hành sức khỏe toàn diện 30 ngày',
    microchip_id: 'MC-72019400512',
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop'
    ],
    video_url: 'https://www.youtube.com/watch?v=D_9x9s9cE7A',
    description: 'Bé Munchkin chân lùn tịt bước đi nhún nhảy siêu dễ thương. Cực kỳ ham chơi, thích vờn cần câu mèo và ngủ gối đầu lên tay chủ.',
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    name: 'Bé Golden Retriever Đại Bản Lĩnh & Thân Thiện',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    age_months: 2,
    color: 'Vàng kim (Golden)',
    price: 10500000,
    deposit_amount: 2000000,
    vaccination_status: 'Đã tiêm 2 mũi vaccine, sổ giun 3 lần',
    pedigree: 'VKA',
    health_warranty: 'Bảo hành thuần chủng và sức khỏe 30 ngày',
    microchip_id: 'MC-61028300994',
    images: [
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop'
    ],
    video_url: null,
    description: 'Bé Golden khung xương to bản, đầu thủ đẹp, chân tay mập mạp. Tính tình hiền lành, thân thiện tuyệt đối với trẻ nhỏ và các vật nuôi khác.',
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'e6666666-6666-6666-6666-666666666666',
    name: 'Bé Mèo Ragdoll Bicolor Mắt Xanh Dương Thuần Chủng',
    species: 'cat',
    breed: 'Mèo Ragdoll',
    gender: 'female',
    age_months: 3,
    color: 'Seal Point Bicolor',
    price: 16500000,
    deposit_amount: 3500000,
    vaccination_status: 'Đã tiêm 2 mũi vaccine Merial 4 bệnh',
    pedigree: 'WCF',
    health_warranty: 'Bảo hành 30 ngày bệnh truyền nhiễm',
    microchip_id: 'MC-50912400199',
    images: [
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop'
    ],
    video_url: null,
    description: 'Bé Ragdoll tiểu thư lông tơ xù bồng bềnh, tính cách ngoan hiền, thích được ôm ấp.',
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'e7777777-7777-7777-7777-777777777777',
    name: 'Bé Phốc Sóc Pomeranian Trắng Tuyết Mini',
    species: 'dog',
    breed: 'Pomeranian',
    gender: 'female',
    age_months: 2,
    color: 'Trắng tuyết',
    price: 11000000,
    deposit_amount: 2000000,
    vaccination_status: 'Đã tiêm 2 mũi Vanguard, sổ giun đầy đủ',
    pedigree: 'VKA',
    health_warranty: 'Bảo hành sức khỏe 30 ngày Care & Parvo',
    microchip_id: 'MC-33819200445',
    images: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop'
    ],
    video_url: null,
    description: 'Bé Phốc Sóc lông dày bông tuyết siêu đáng yêu, mặt gấu xinh xắn, nhanh nhẹn quấn người.',
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'e8888888-8888-8888-8888-888888888888',
    name: 'Bé Mèo Ba Tư Persian Trắng Thuần Chủng Mặt Tịt',
    species: 'cat',
    breed: 'Mèo Ba Tư',
    gender: 'male',
    age_months: 3,
    color: 'Trắng thuần',
    price: 8500000,
    deposit_amount: 1500000,
    vaccination_status: 'Đã tiêm 2 mũi phòng bệnh, sổ giun định kỳ',
    pedigree: 'Không giấy',
    health_warranty: 'Bảo hành 15 ngày sức khỏe',
    microchip_id: null,
    images: [
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop'
    ],
    video_url: null,
    description: 'Bé Ba Tư lông dài óng ả, mắt tròn to long lanh, ăn khỏe và rất lành tính.',
    status: 'available',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

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

      if (!error && data && data.length > 0) {
        return {
          pets: data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count || data.length,
            totalPages: Math.ceil((count || data.length) / limitNum)
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
    const newPet = {
      id: `e${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: petData.name,
      species: petData.species || 'dog',
      breed: petData.breed || 'Chưa rõ giống',
      gender: petData.gender || 'male',
      age_months: parseInt(petData.age_months, 10) || 2,
      color: petData.color || '',
      price: parseFloat(petData.price) || 0,
      deposit_amount: parseFloat(petData.deposit_amount) || 0,
      vaccination_status: petData.vaccination_status || 'Đã tiêm phòng cơ bản',
      pedigree: petData.pedigree || 'Không giấy',
      health_warranty: petData.health_warranty || 'Bảo hành 15 ngày Care & Parvo',
      microchip_id: petData.microchip_id || null,
      images: Array.isArray(petData.images) 
        ? petData.images 
        : (petData.image_url ? [petData.image_url] : ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop']),
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
    const payload = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    if (payload.price !== undefined) payload.price = parseFloat(payload.price);
    if (payload.deposit_amount !== undefined) payload.deposit_amount = parseFloat(payload.deposit_amount);
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
