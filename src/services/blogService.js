const supabase = require('../utils/supabaseClient');

let memoryBlogPosts = [
  {
    id: 'b1',
    title: 'Top 5 Giống Chó Thông Minh và Thân Thiện Nhất Cho Gia Đình Có Trẻ Nhỏ',
    slug: 'top-5-giong-cho-thong-minh-than-thien-nhat',
    summary: 'Khám phá các giống chó sở hữu trí tuệ xuất sắc, dễ bảo ban huấn luyện và đặc biệt dịu dàng, kiên nhẫn khi chơi cùng các bé nhỏ.',
    content: `## 1. Golden Retriever - Người Bạn Vàng Của Mọi Gia Đình
Golden Retriever luôn đứng đầu danh sách những giống chó thân thiện nhất thế giới. Chúng sở hữu sự nhẫn nại phi thường, ánh mắt ấm áp và tính cách vui tươi bất tận.

### Đặc điểm nổi bật:
- Trí tuệ xếp hạng 4 trong thế giới loài chó.
- Bản tính hòa nhã, hầu như không bao giờ cắn người vô cớ.
- Cực kỳ thích bơi lội và chơi trò nhặt bóng.

---

## 2. Poodle - Nhà Bác Học Tinh Nghịch
Đừng để bộ lông xoăn quý phái đánh lừa! Poodle đứng thứ 2 về trí thông minh trong tất cả các giống chó.

### Ưu điểm vượt trội:
- **Không rụng lông**: Rất an toàn cho trẻ nhỏ hoặc người bị dị ứng đường hô hấp.
- Nắm bắt khẩu lệnh mới chỉ sau 3-5 lần lặp lại.
- Dễ dàng thích nghi với không gian căn hộ chung cư.

---

## 3. Border Collie - Đỉnh Cao Trí Tuệ
Nếu bạn muốn một chú cún có khả năng hiểu hàng trăm từ ngữ và giải đố thông minh, Border Collie là lựa chọn vô địch. Tuy nhiên, chúng đòi hỏi chủ nhân phải có nhiều thời gian cho đi dạo và vận động ngoài trời.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop',
    youtube_url: 'https://www.youtube.com/watch?v=0k73hL9jE64',
    category: 'Kiến thức chọn giống',
    tags: ['chó thông minh', 'chó thân thiện', 'chó cho gia đình'],
    target_pet_type: 'dog',
    is_published: true,
    views_count: 342,
    published_at: '2026-09-10T09:00:00Z',
    created_at: '2026-09-10T09:00:00Z'
  },
  {
    id: 'b2',
    title: 'Dấu Hiệu Thú Cưng Bị Béo Phì và Cách Kiểm Soát Khẩu Phần Ăn Khoa Học',
    slug: 'dau-hieu-thu-cung-beo-phi-va-cach-kiem-soat-khau-phan',
    summary: 'Thừa cân ở chó mèo là thủ phạm âm thầm rút ngắn tuổi thọ, gây tiểu đường và thoái hóa khớp xương. Hướng dẫn áp dụng thang đo BCS chuẩn xác.',
    content: `## Nhận biết sớm dấu hiệu thừa cân qua dáng điệu
Nhiều chủ nuôi thường lầm tưởng rằng thú cưng càng tròn trịa, mập mạp thì càng đáng yêu. Thực tế, khi lớp mỡ tích tụ quá mức, tim và phổi của thú cưng luôn trong tình trạng quá tải.

### 3 bước tự kiểm tra thể trạng tại nhà:
1. **Sờ nắn xương sườn**: Đặt hai bàn tay nhẹ nhàng lên hai bên lồng ngực. Nếu bạn phải ấn mạnh ngón tay mới cảm nhận được xương sườn, bé đã bước vào giai đoạn thừa cân.
2. **Quan sát eo từ trên cao**: Đứng nhìn thẳng xuống lưng thú cưng. Thân hình chuẩn sẽ có đường thắt eo nhẹ nhàng phía sau lồng ngực.
3. **Kiểm tra bụng dưới**: Nhìn từ phương ngang, bụng của chó mèo bình thường phải hơi nâng lên so với ngực, không được võng sát mặt sàn.

### Giải pháp kiểm soát cân nặng an toàn:
- Giảm 10-15% định lượng hạt ăn mỗi ngày.
- Chia nhỏ cữ ăn thành 3 lần để bé không bị đói cồn cào.
- Khuyến khích vận động thông qua đồ chơi đuổi bắt hoặc laser.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop',
    youtube_url: 'https://www.youtube.com/watch?v=D_9x9s9cE7A',
    category: 'Sức khỏe & Dinh dưỡng',
    tags: ['béo phì chó mèo', 'chế độ ăn kiêng', 'thang đo BCS'],
    target_pet_type: 'all',
    is_published: true,
    views_count: 512,
    published_at: '2026-09-15T14:30:00Z',
    created_at: '2026-09-15T14:30:00Z'
  },
  {
    id: 'b3',
    title: 'Các Bệnh Thường Gặp Ở Chó Mèo Vào Mùa Ẩm Ướt và Cách Phòng Ngừa',
    slug: 'cac-benh-thuong-gap-o-cho-meo-mua-am-uot',
    summary: 'Độ ẩm không khí tăng cao là môi trường lý tưởng cho nấm da, ve rận ký sinh và vi khuẩn đường ruột bùng phát. Hãy trang bị ngay các biện pháp phòng vệ.',
    content: `## 1. Nấm da (Ringworm) và viêm da mủ
Mùa mưa nồm khiến lông thú cưng lâu khô sau khi đi vệ sinh hoặc tắm rửa, tạo điều kiện cho bào tử nấm Microsporum phát triển.

### Biểu hiện:
- Xuất hiện các mảng vảy tròn màu đỏ, rụng lông viền ngoài.
- Thú cưng ngứa ngáy, thường xuyên gãi hoặc cọ xát tai vào tường.

### Cách phòng tránh:
- Luôn sấy khô tận chân lông sau khi tắm hoặc dắt cún đi dạo trời mưa về.
- Sử dụng sữa tắm kháng khuẩn dịu nhẹ có chứa tinh dầu tràm hoặc hoa cúc.
- Giữ đệm nằm và chuồng khô ráo, phơi nắng định kỳ.

---

## 2. Bệnh đường ruột và tiêu chảy cấp
Thức ăn thừa để lâu trong bát vào mùa ẩm rất nhanh lên men và nhiễm khuẩn Salmonella. Hãy thay nước sạch mỗi ngày và không để hạt quá 4 tiếng ngoài không khí.`,
    thumbnail_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop',
    youtube_url: 'https://www.youtube.com/watch?v=kYv9qQG8p5s',
    category: 'Phòng bệnh thú y',
    tags: ['phòng bệnh', 'nấm da', 'tiêu hóa thú cưng'],
    target_pet_type: 'all',
    is_published: true,
    views_count: 289,
    published_at: '2026-09-18T10:15:00Z',
    created_at: '2026-09-18T10:15:00Z'
  }
];

class BlogService {
  async getPosts({ category, target_pet_type, search, limit = 10, page = 1 }) {
    let list = memoryBlogPosts.filter(b => b.is_published);

    if (category) {
      list = list.filter(b => b.category === category);
    }
    if (target_pet_type && target_pet_type !== 'all') {
      list = list.filter(b => b.target_pet_type === target_pet_type || b.target_pet_type === 'all');
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b => b.title.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q));
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + Number(limit));

    return {
      posts: paginated,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  async getPostBySlug(slug) {
    const post = memoryBlogPosts.find(b => b.slug === slug && b.is_published);
    if (!post) throw new Error('Không tìm thấy bài viết!');

    post.views_count += 1;
    const related = memoryBlogPosts
      .filter(b => b.id !== post.id && b.is_published)
      .slice(0, 3);

    return {
      ...post,
      related_posts: related
    };
  }
}

module.exports = new BlogService();
