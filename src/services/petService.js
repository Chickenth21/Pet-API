const supabase = require('../utils/supabaseClient');

// Danh sách thú cưng mẫu dự phòng
let memoryPets = [
  {
    id: 'pet-1',
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'Miu Miu',
    species: 'cat',
    breed: 'Mèo Anh lông ngắn',
    gender: 'female',
    birth_date: '2024-04-10',
    age_months: 29,
    initial_weight: 4.8,
    activity_level: 'low',
    favorite_things: 'Thích ăn pate cá ngừ, nằm cuộn tròn trên bàn làm việc',
    allergies: 'Dị ứng bột ngũ cốc, ngứa khi ăn cá trích',
    ingredients_to_avoid: 'Ngô nghiền, gluten lúa mì',
    health_notes: 'Đã tiêm đủ 3 mũi vacxin và triệt sản',
    avatar_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  },
  {
    id: 'pet-2',
    user_id: '22222222-2222-2222-2222-222222222222',
    name: 'Bơ (Butter)',
    species: 'dog',
    breed: 'Corgi',
    gender: 'male',
    birth_date: '2025-01-15',
    age_months: 20,
    initial_weight: 11.2,
    activity_level: 'high',
    favorite_things: 'Chạy nhặt bóng tennis, thích ăn ức gà luộc',
    allergies: 'Không có dị ứng đặc biệt',
    ingredients_to_avoid: 'Hành tỏi, socola, nho',
    health_notes: 'Khung xương hông nhạy cảm, cần theo dõi trọng lượng tránh đè nặng cột sống',
    avatar_url: 'https://images.unsplash.com/photo-1546975490-a79abdd54533?w=600&auto=format&fit=crop',
    created_at: new Date().toISOString()
  }
];

class PetService {
  async getPetsByUser(userId) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch {
      // Fallback
    }

    return memoryPets.filter(p => p.user_id === userId);
  }

  async getPetById(petId, userId) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .maybeSingle();

      if (!error && data) return data;
    } catch {
      // Fallback
    }

    const found = memoryPets.find(p => p.id === petId);
    if (!found) throw new Error('Không tìm thấy hồ sơ thú cưng!');
    return found;
  }

  async createPet(userId, petData) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .insert([{ ...petData, user_id: userId }])
        .select('*')
        .single();

      if (!error && data) return data;
    } catch (e) {
      console.warn('[PetService] Create fallback to memory:', e.message);
    }

    const newPet = {
      id: 'pet-' + Date.now(),
      user_id: userId,
      ...petData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    memoryPets.unshift(newPet);
    return newPet;
  }

  async updatePet(petId, userId, petData) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .update({ ...petData, updated_at: new Date().toISOString() })
        .eq('id', petId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (!error && data) return data;
    } catch {
      // Fallback
    }

    const idx = memoryPets.findIndex(p => p.id === petId && p.user_id === userId);
    if (idx === -1) throw new Error('Không tìm thấy thú cưng hoặc bạn không có quyền sửa!');
    memoryPets[idx] = { ...memoryPets[idx], ...petData, updated_at: new Date().toISOString() };
    return memoryPets[idx];
  }

  async deletePet(petId, userId) {
    try {
      await supabase
        .from('pets')
        .delete()
        .eq('id', petId)
        .eq('user_id', userId);
    } catch {
      // Fallback
    }

    memoryPets = memoryPets.filter(p => !(p.id === petId && p.user_id === userId));
    return { success: true };
  }

  /**
   * Tính năng Gợi ý chọn thú cưng phù hợp (Pet Matchmaker)
   */
  evaluateMatchmaker({ livingSpace, roomArea, freeTimeHours, hasChildren, monthlyBudget, sheddingTolerance }) {
    // Thuật toán chấm điểm theo hồ sơ lối sống
    const candidates = [
      {
        breed: 'Mèo Anh lông ngắn (British Shorthair)',
        species: 'cat',
        matchScore: 95,
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop',
        reason: 'Rất điềm tĩnh, độc lập, ít quậy phá, hoàn hảo cho không gian chung cư và chủ nhân bận rộn.',
        pros: ['Không gây tiếng ồn', 'Thân thiện với trẻ nhỏ', 'Không cần dắt đi dạo hàng ngày'],
        cons: ['Lông rụng theo mùa, cần chải lông định kỳ', 'Dễ tăng cân nếu ít vận động'],
        monthlyCost: '800.000 - 1.200.000 VNĐ'
      },
      {
        breed: 'Chó Poodle (Toy / Mini)',
        species: 'dog',
        matchScore: 90,
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop',
        reason: 'Cực kỳ thông minh, vâng lời và đặc biệt là không rụng lông, thích hợp cho người có cơ địa dị ứng.',
        pros: ['Rất ít rụng lông', 'Dễ huấn luyện và tiếp thu lệnh nhanh', 'Kích thước nhỏ gọn'],
        cons: ['Cần chải chuốt và cắt tỉa lông định kỳ', 'Rất quấn chủ, dễ buồn nếu ở nhà một mình quá lâu'],
        monthlyCost: '700.000 - 1.000.000 VNĐ'
      },
      {
        breed: 'Chó Corgi Pembroke',
        species: 'dog',
        matchScore: 82,
        image: 'https://images.unsplash.com/photo-1546975490-a79abdd54533?w=600&auto=format&fit=crop',
        reason: 'Hài hước, năng động, trung thành và luôn mang lại tiếng cười cho cả gia đình có trẻ em.',
        pros: ['Tính cách vui vẻ', 'Rất trung thành và canh nhà tốt'],
        cons: ['Rụng lông tương đối nhiều', 'Nhu cầu vận động cao, cần dắt đi dạo 30-45 phút/ngày'],
        monthlyCost: '1.000.000 - 1.500.000 VNĐ'
      },
      {
        breed: 'Mèo Ragdoll',
        species: 'cat',
        matchScore: 88,
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop',
        reason: 'Được ví như chú cún con đội lốt mèo: cực kỳ hiền lành, thích được ẵm bồng và mắt xanh hút hồn.',
        pros: ['Siêu hiền và kiên nhẫn với trẻ nhỏ', 'Tiếng kêu nhỏ nhẹ'],
        cons: ['Bộ lông dài cần chăm sóc cẩn thận', 'Cần không gian phòng tương đối thoáng mát'],
        monthlyCost: '900.000 - 1.400.000 VNĐ'
      }
    ];

    // Tinh chỉnh điểm số dựa trên tiêu chí nhập
    if (livingSpace === 'apartment_small' || roomArea === 'under_30') {
      candidates.find(c => c.species === 'cat').matchScore += 3;
      const corgi = candidates.find(c => c.breed.includes('Corgi'));
      if (corgi) corgi.matchScore -= 10;
    }

    if (freeTimeHours === 'under_1h') {
      candidates.filter(c => c.species === 'cat').forEach(c => c.matchScore += 5);
      candidates.filter(c => c.species === 'dog').forEach(c => c.matchScore -= 8);
    }

    return candidates.sort((a, b) => b.matchScore - a.matchScore);
  }
}

module.exports = new PetService();
