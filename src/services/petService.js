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
  /**
   * Tính năng Gợi ý chọn thú cưng phù hợp (Pet Matchmaker)
   * Tiêu chí thiết thực: species, budgetTier, livingSpace, personality
   */
  evaluateMatchmaker({ species = 'both', budgetTier = '8m_to_15m', livingSpace = 'apartment_medium', personality = 'cuddly_gentle' }) {
    const candidates = [
      {
        breed: 'Chó Poodle (Tiny / Toy)',
        species: 'dog',
        priceRange: '5.500.000 - 8.500.000 VNĐ',
        idealBudget: ['under_8m', '8m_to_15m'],
        idealSpaces: ['apartment_small', 'apartment_medium', 'house_garden'],
        idealPersonalities: ['cuddly_gentle', 'calm_independent'],
        image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop',
        reason: 'Thông minh, nhỏ nhắn, đặc biệt không rụng lông, vô cùng quấn quýt và phù hợp hoàn hảo với căn hộ nhỏ.',
        pros: ['Rất ít rụng lông, thích hợp người hay dị ứng', 'Thông minh top 2 thế giới, tiếp thu lệnh cực nhanh', 'Kích thước nhỏ gọn, dễ chăm sóc bế bồng'],
        cons: ['Cần chải lông và spa cắt tỉa định kỳ', 'Rất tình cảm nên cần chủ dành thời gian quan tâm'],
        marketLink: '/buy-pets?species=dog'
      },
      {
        breed: 'Chó Corgi Pembroke',
        species: 'dog',
        priceRange: '10.000.000 - 16.000.000 VNĐ',
        idealBudget: ['8m_to_15m', 'above_15m'],
        idealSpaces: ['apartment_medium', 'house_garden'],
        idealPersonalities: ['active_playful', 'cuddly_gentle'],
        image: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=800&auto=format&fit=crop',
        reason: 'Hài hước, chân ngắn mông to siêu đáng yêu, năng động tràn đầy năng lượng và luôn mang lại tiếng cười cho cả nhà.',
        pros: ['Tính cách vui vẻ, hòa đồng, trung thành tuyệt đối', 'Biểu cảm hài hước, canh nhà rất tốt'],
        cons: ['Rụng lông theo mùa, cần chải lông đều đặn', 'Nhu cầu vận động cao, cần dắt đi dạo 30-45 phút mỗi ngày'],
        marketLink: '/buy-pets?species=dog'
      },
      {
        breed: 'Chó Golden Retriever',
        species: 'dog',
        priceRange: '9.000.000 - 15.000.000 VNĐ',
        idealBudget: ['8m_to_15m', 'above_15m'],
        idealSpaces: ['house_garden', 'apartment_medium'],
        idealPersonalities: ['active_playful', 'cuddly_gentle'],
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop',
        reason: 'Đại sứ thân thiện, cực kỳ hiền lành, thông minh và là người bạn đồng hành lý tưởng cho gia đình có sân vườn.',
        pros: ['Cực kỳ kiên nhẫn và yêu mến trẻ nhỏ', 'Rất nghe lời, dễ huấn luyện', 'Đồng hành chạy bộ và thể thao tuyệt vời'],
        cons: ['Kích thước lớn khi trưởng thành (25 - 35kg)', 'Cần không gian vận động và rụng lông tương đối'],
        marketLink: '/buy-pets?species=dog'
      },
      {
        breed: 'Chó Phốc Sóc (Pomeranian)',
        species: 'dog',
        priceRange: '9.000.000 - 16.000.000 VNĐ',
        idealBudget: ['8m_to_15m', 'above_15m'],
        idealSpaces: ['apartment_small', 'apartment_medium', 'house_garden'],
        idealPersonalities: ['cuddly_gentle', 'active_playful'],
        image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop',
        reason: 'Ngoại hình như cục bông tuyết di động, quý phái, lanh lợi và cực kỳ thích được chủ nhân ẵm bồng cưng chiều.',
        pros: ['Ngoại hình kiêu sa, đáng yêu thu hút mọi ánh nhìn', 'Kích thước nhỏ gọn, thích hợp ở căn hộ'],
        cons: ['Bộ lông kép cần chải chuốt chăm sóc thường xuyên', 'Đôi khi thích sủa nhẹ để gây sự chú ý'],
        marketLink: '/buy-pets?species=dog'
      },
      {
        breed: 'Mèo Anh Lông Ngắn (British Shorthair)',
        species: 'cat',
        priceRange: '8.000.000 - 14.000.000 VNĐ',
        idealBudget: ['8m_to_15m', 'under_8m'],
        idealSpaces: ['apartment_small', 'apartment_medium', 'house_garden'],
        idealPersonalities: ['calm_independent', 'cuddly_gentle'],
        image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&auto=format&fit=crop',
        reason: 'Điềm tĩnh, má bánh bao tròn trịa, tự lập ngoan ngoãn khi chủ vắng nhà và không gây tiếng ồn cho chung cư.',
        pros: ['Điềm đạm, không phá phách đồ đạc trong nhà', 'Tự lập rất tốt khi chủ đi làm cả ngày', 'Lông ngắn mềm mịn, ít tốn công chải chuốt'],
        cons: ['Hơi lười vận động, dễ thừa cân nếu ăn nhiều pate', 'Rụng lông tơ vào các đợt giao mùa'],
        marketLink: '/buy-pets?species=cat'
      },
      {
        breed: 'Mèo Ragdoll Mắt Xanh',
        species: 'cat',
        priceRange: '15.000.000 - 25.000.000 VNĐ',
        idealBudget: ['above_15m', '8m_to_15m'],
        idealSpaces: ['apartment_medium', 'house_garden', 'apartment_small'],
        idealPersonalities: ['cuddly_gentle', 'calm_independent'],
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop',
        reason: 'Được mệnh danh là chú cún đội lốt mèo: đôi mắt xanh biếc, hiền lành nũng nịu, khi bế lên sẽ thả lỏng trọn vẹn.',
        pros: ['Cực kỳ tình cảm, thích được ôm ấp và ngủ cùng chủ', 'Tuyệt đối hiền lành, an toàn với trẻ nhỏ', 'Tiếng kêu nhỏ nhẹ, thanh lịch'],
        cons: ['Bộ lông dài cần được chải lông 2-3 lần/tuần', 'Mức giá thuộc phân khúc cao cấp'],
        marketLink: '/buy-pets?species=cat'
      },
      {
        breed: 'Mèo Munchkin Chân Ngắn',
        species: 'cat',
        priceRange: '10.000.000 - 18.000.000 VNĐ',
        idealBudget: ['8m_to_15m', 'above_15m'],
        idealSpaces: ['apartment_small', 'apartment_medium', 'house_garden'],
        idealPersonalities: ['cuddly_gentle', 'active_playful'],
        image: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=800&auto=format&fit=crop',
        reason: 'Bé nấm lùn chân ngắn siêu cấp dễ thương, hoạt bát, tinh nghịch và luôn lon ton theo chân chủ nhân khắp nhà.',
        pros: ['Dáng đi lạch bạch ngộ nghĩnh, biểu cảm đáng yêu', 'Thân thiện, hòa đồng với thú cưng khác', 'Rất thích chơi đùa và nằm lòng vuốt ve'],
        cons: ['Hạn chế leo trèo quá cao do đặc điểm chân ngắn', 'Cần giữ ấm tốt vào mùa đông hoặc phòng điều hòa'],
        marketLink: '/buy-pets?species=cat'
      },
      {
        breed: 'Mèo Ba Tư (Persian Cat)',
        species: 'cat',
        priceRange: '6.000.000 - 11.000.000 VNĐ',
        idealBudget: ['under_8m', '8m_to_15m'],
        idealSpaces: ['apartment_small', 'apartment_medium'],
        idealPersonalities: ['calm_independent', 'cuddly_gentle'],
        image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop',
        reason: 'Trầm tính, vẻ đẹp quý tộc hoàng gia, thích không gian êm đềm và mức chi phí đón bé vô cùng hợp lý.',
        pros: ['Rất tĩnh lặng, không nhảy nhót phá phách', 'Ngân sách đón bé tiết kiệm, dễ tiếp cận', 'Gương mặt tịt biểu cảm ngơ ngác đáng yêu'],
        cons: ['Cần vệ sinh khóe mắt và chải lông xù thường xuyên', 'Khả năng chịu nóng kém, thích không gian mát mẻ'],
        marketLink: '/buy-pets?species=cat'
      }
    ];

    // Lọc theo loài nếu người dùng chọn cụ thể Chó hoặc Mèo
    let pool = candidates;
    if (species === 'dog') {
      pool = candidates.filter(c => c.species === 'dog');
    } else if (species === 'cat') {
      pool = candidates.filter(c => c.species === 'cat');
    }

    // Tính điểm tương thích cho từng giống
    const scored = pool.map(item => {
      let score = 70; // Điểm cơ sở

      // 1. Phù hợp ngân sách (Mệnh giá)
      if (item.idealBudget.includes(budgetTier)) {
        score += 12;
      } else {
        score -= 8;
      }

      // 2. Phù hợp không gian sống
      if (item.idealSpaces.includes(livingSpace)) {
        score += 9;
      } else {
        score -= 6;
      }

      // 3. Phù hợp tính cách
      if (item.idealPersonalities.includes(personality)) {
        score += 9;
      } else {
        score -= 5;
      }

      // Điều chỉnh điểm số biên
      const finalScore = Math.min(98, Math.max(65, score));

      return {
        ...item,
        matchScore: finalScore
      };
    });

    // Sắp xếp giảm dần theo % tương thích
    return scored.sort((a, b) => b.matchScore - a.matchScore);
  }
}

module.exports = new PetService();
