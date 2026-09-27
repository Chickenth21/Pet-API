const supabase = require('../utils/supabaseClient');

let memoryBreeds = [
  // --- CHÓ CẢNH (DOG BREEDS) ---
  {
    id: 'breed-corgi-pembroke',
    name: 'Corgi Pembroke',
    species: 'dog',
    origin: 'Xứ Wales (Vương Quốc Anh)',
    size_category: 'medium', // small, medium, large
    temperament: 'Thông minh, hài hước, năng động, trung thành',
    image_url: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'breed-poodle-tiny',
    name: 'Poodle Tiny',
    species: 'dog',
    origin: 'Pháp / Đức',
    size_category: 'small',
    temperament: 'Siêu thông minh, quấn chủ, không rụng lông, dễ huấn luyện',
    image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 29).toISOString()
  },
  {
    id: 'breed-poodle-toy',
    name: 'Poodle Toy',
    species: 'dog',
    origin: 'Pháp / Đức',
    size_category: 'small',
    temperament: 'Thông minh, hoạt bát, ngoan ngoãn, thích làm trò',
    image_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 28).toISOString()
  },
  {
    id: 'breed-golden-retriever',
    name: 'Golden Retriever',
    species: 'dog',
    origin: 'Scotland',
    size_category: 'large',
    temperament: 'Đại sứ thân thiện, kiên nhẫn với trẻ nhỏ, rất tình cảm',
    image_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 27).toISOString()
  },
  {
    id: 'breed-pomeranian',
    name: 'Phốc Sóc (Pomeranian)',
    species: 'dog',
    origin: 'Đức / Ba Lan',
    size_category: 'small',
    temperament: 'Kiêu sa, lanh lợi, tự tin, quấn quýt chủ nhân',
    image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 26).toISOString()
  },
  {
    id: 'breed-french-bulldog',
    name: 'Bull Pháp (French Bulldog)',
    species: 'dog',
    origin: 'Pháp',
    size_category: 'medium',
    temperament: 'Điềm đạm, tình cảm, hài hước, ít sủa, hợp căn hộ',
    image_url: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 'breed-pug',
    name: 'Chó Pug Mặt Xệ',
    species: 'dog',
    origin: 'Trung Quốc',
    size_category: 'small',
    temperament: 'Hiền lành, quấn chủ, biểu cảm hài hước, lười vận động',
    image_url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 24).toISOString()
  },
  {
    id: 'breed-shiba-inu',
    name: 'Shiba Inu',
    species: 'dog',
    origin: 'Nhật Bản',
    size_category: 'medium',
    temperament: 'Độc lập, trung thành tuyệt đối, sạch sẽ, biểu cảm phong phú',
    image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 23).toISOString()
  },
  {
    id: 'breed-samoyed',
    name: 'Samoyed',
    species: 'dog',
    origin: 'Siberia (Nga)',
    size_category: 'large',
    temperament: 'Nụ cười thiên thần, cực kỳ thân thiện, bộ lông tuyết trắng',
    image_url: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 22).toISOString()
  },
  {
    id: 'breed-husky',
    name: 'Husky Siberian',
    species: 'dog',
    origin: 'Nga',
    size_category: 'large',
    temperament: 'Năng động, tếu táo, mắt xanh hút hồn, ưa chạy nhảy',
    image_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 21).toISOString()
  },
  {
    id: 'breed-alaska',
    name: 'Alaska Malamute',
    species: 'dog',
    origin: 'Bắc Cực / Alaska',
    size_category: 'large',
    temperament: 'Vạm vỡ, trung thành, thân thiện, phom dáng oai phong',
    image_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'breed-chihuahua',
    name: 'Chihuahua',
    species: 'dog',
    origin: 'Mexico',
    size_category: 'small',
    temperament: 'Tí hon, dũng cảm, nhanh nhẹn, rất bám chủ',
    image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 19).toISOString()
  },
  {
    id: 'breed-dachshund',
    name: 'Lạp Xưởng (Dachshund)',
    species: 'dog',
    origin: 'Đức',
    size_category: 'small',
    temperament: 'Lưng dài chân ngắn, tò mò, dũng cảm, thính giác tinh nhạy',
    image_url: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 18).toISOString()
  },
  {
    id: 'breed-beagle',
    name: 'Beagle',
    species: 'dog',
    origin: 'Vương Quốc Anh',
    size_category: 'medium',
    temperament: 'Đáng yêu, hòa đồng, chiếc mũi siêu thính, hiếu động',
    image_url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 17).toISOString()
  },
  {
    id: 'breed-phu-quoc',
    name: 'Chó Phú Quốc',
    species: 'dog',
    origin: 'Đảo Phú Quốc (Việt Nam)',
    size_category: 'medium',
    temperament: 'Xoáy lưng đặc trưng, cực kỳ tinh khôn, trung thành, bảo vệ gia chủ',
    image_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 16).toISOString()
  },
  {
    id: 'breed-cho-ta',
    name: 'Chó Cỏ / Chó Ta',
    species: 'dog',
    origin: 'Việt Nam',
    size_category: 'medium',
    temperament: 'Khỏe mạnh, thích nghi tốt, trung thành, trông nhà xuất sắc',
    image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 15).toISOString()
  },

  // --- MÈO CẢNH (CAT BREEDS) ---
  {
    id: 'breed-aln',
    name: 'Mèo Anh Lông Ngắn (British Shorthair)',
    species: 'cat',
    origin: 'Vương Quốc Anh',
    size_category: 'medium',
    temperament: 'Điềm tĩnh, má bánh bao, độc lập, không ồn ào, hợp chung cư',
    image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'breed-ald',
    name: 'Mèo Anh Lông Dài (British Longhair)',
    species: 'cat',
    origin: 'Vương Quốc Anh',
    size_category: 'medium',
    temperament: 'Quý tộc, trầm tính, hiền lành, bộ lông bông xù quý phái',
    image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 29).toISOString()
  },
  {
    id: 'breed-ragdoll',
    name: 'Mèo Ragdoll Bicolor',
    species: 'cat',
    origin: 'Hoa Kỳ',
    size_category: 'large',
    temperament: 'Mắt xanh biếc, hiền như cún con, thích được bế bồng thả lỏng',
    image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 28).toISOString()
  },
  {
    id: 'breed-munchkin',
    name: 'Mèo Munchkin Chân Ngắn',
    species: 'cat',
    origin: 'Hoa Kỳ',
    size_category: 'small',
    temperament: 'Chân ngắn đáng yêu, lanh lợi, tinh nghịch, thích lon ton theo chủ',
    image_url: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 27).toISOString()
  },
  {
    id: 'breed-persian',
    name: 'Mèo Ba Tư (Persian Cat)',
    species: 'cat',
    origin: 'Iran / Ba Tư',
    size_category: 'medium',
    temperament: 'Mặt tịt đáng yêu, cực kỳ tĩnh lặng, quý phái, thích nằm êm',
    image_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 26).toISOString()
  },
  {
    id: 'breed-scottish-fold',
    name: 'Mèo Scottish Fold (Tai Cụp)',
    species: 'cat',
    origin: 'Scotland',
    size_category: 'medium',
    temperament: 'Đôi tai cụp tròn xoe, hiền lành, thích ngồi kiểu tượng Phật',
    image_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 'breed-siamese',
    name: 'Mèo Xiêm (Siamese Cat)',
    species: 'cat',
    origin: 'Thái Lan',
    size_category: 'medium',
    temperament: 'Dáng mảnh mai, thông minh, thích trò chuyện meo meo, trung thành',
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 24).toISOString()
  },
  {
    id: 'breed-bengal',
    name: 'Mèo Bengal (Họa Tiết Báo Đốm)',
    species: 'cat',
    origin: 'Hoa Kỳ',
    size_category: 'large',
    temperament: 'Họa tiết đốm da báo hoang dã, nhanh nhẹn, tò mò, thích nghịch nước',
    image_url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 23).toISOString()
  },
  {
    id: 'breed-sphynx',
    name: 'Mèo Sphynx (Không Lông)',
    species: 'cat',
    origin: 'Canada',
    size_category: 'medium',
    temperament: 'Độc đáo không lông, ấm áp, cực kỳ thân thiện và quấn người',
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 22).toISOString()
  },
  {
    id: 'breed-maine-coon',
    name: 'Mèo Maine Coon',
    species: 'cat',
    origin: 'Hoa Kỳ',
    size_category: 'large',
    temperament: 'Người khổng lồ dịu dàng, thông minh, đuôi xù dài như chổi lông',
    image_url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 21).toISOString()
  },
  {
    id: 'breed-russian-blue',
    name: 'Mèo Nga Mắt Xanh (Russian Blue)',
    species: 'cat',
    origin: 'Nga',
    size_category: 'medium',
    temperament: 'Lông xám bạc ánh kim, mắt xanh lục bảo, e thẹn và trầm lắng',
    image_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'breed-meo-ta',
    name: 'Mèo Mướp / Mèo Ta',
    species: 'cat',
    origin: 'Việt Nam',
    size_category: 'medium',
    temperament: 'Nhanh nhẹn, bắt chuột giỏi, đề kháng cao, dễ nuôi và tình cảm',
    image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 19).toISOString()
  }
];

class PetBreedService {
  /**
   * Lấy danh sách giống thú cưng
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

    // Lọc theo loài và tìm kiếm
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

    // Sắp xếp tên bảng chữ cái tiếng Việt
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limitNum);

    return {
      breeds: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Lấy chi tiết 1 giống
   */
  async getBreedById(id) {
    return memoryBreeds.find(b => b.id === id) || null;
  }

  /**
   * Thêm giống thú cưng mới
   */
  async createBreed(data) {
    const newBreed = {
      id: `breed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      species: data.species || 'dog',
      origin: data.origin ? data.origin.trim() : 'Đang cập nhật',
      size_category: data.size_category || 'medium',
      temperament: data.temperament ? data.temperament.trim() : '',
      image_url: data.image_url ? data.image_url.trim() : (
        data.species === 'cat'
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop'
      ),
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      created_at: new Date().toISOString()
    };

    memoryBreeds.unshift(newBreed);
    return newBreed;
  }

  /**
   * Cập nhật thông tin giống
   */
  async updateBreed(id, updateData) {
    const idx = memoryBreeds.findIndex(b => b.id === id);
    if (idx === -1) return null;

    memoryBreeds[idx] = {
      ...memoryBreeds[idx],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return memoryBreeds[idx];
  }

  /**
   * Bật / tắt trạng thái kích hoạt giống
   */
  async toggleBreedActive(id) {
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
    const idx = memoryBreeds.findIndex(b => b.id === id);
    if (idx === -1) return false;

    memoryBreeds.splice(idx, 1);
    return true;
  }
}

module.exports = new PetBreedService();
