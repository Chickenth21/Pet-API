const petService = require('./petService');
const productService = require('./productService');

let memoryConversations = [];
let memoryMessages = [];

class AIService {
  async chat({ userId, petId, conversationId, message }) {
    if (!message || !message.trim()) {
      throw new Error('Nội dung câu hỏi không được để trống!');
    }

    // 1. Lấy thông tin ngữ cảnh thú cưng nếu có petId
    let petContext = null;
    if (petId && userId) {
      try {
        petContext = await petService.getPetById(petId, userId);
      } catch {
        // bỏ qua nếu không tìm thấy
      }
    }

    // 2. Kiểm tra triệu chứng khẩn cấp (Emergency Guardrail)
    const urgentKeywords = ['co giật', 'nôn ra máu', 'hôn mê', 'sốt cao', 'khó thở dữ dội', 'nuốt dị vật', 'bất tỉnh'];
    const lowerMsg = message.toLowerCase();
    const isEmergency = urgentKeywords.some(kw => lowerMsg.includes(kw));

    if (isEmergency) {
      return {
        reply: `🚨 **CẢNH BÁO Y TẾ KHẨN CẤP**: Triệu chứng bạn mô tả ("${message}") có dấu hiệu nguy hiểm trực tiếp đến tính mạng của thú cưng! 
\nVui lòng KHÔNG tự chữa trị tại nhà hoặc chờ đợi. Hãy bọc bé trong khăn mềm giữ ấm và đưa ngay đến phòng khám hoặc bệnh viện thú y 24/7 gần nhất!`,
        isEmergency: true,
        recommendedProducts: [],
        disclaimer: 'Hệ thống Pet Paw AI chỉ hỗ trợ tư vấn dinh dưỡng và chăm sóc cơ bản, không thay thế cấp cứu thú y chuyên khoa.'
      };
    }

    // 3. Tra cứu sản phẩm trong hệ thống phù hợp với thú cưng
    const productsResult = await productService.getProducts({
      pet_type: petContext ? petContext.species : 'all',
      limit: 6
    });
    const candidateProducts = productsResult.products;

    // 4. Sinh câu trả lời thông minh dựa trên dữ liệu thật
    let reply = '';
    let recommendedProducts = [];

    const petName = petContext ? petContext.name : 'bé cưng';
    const petSpeciesName = petContext ? (petContext.species === 'dog' ? 'chó' : 'mèo') : 'thú cưng';
    const allergies = petContext?.allergies || 'Không có ghi nhận dị ứng';

    if (lowerMsg.includes('ăn') || lowerMsg.includes('hạt') || lowerMsg.includes('pate') || lowerMsg.includes('dinh dưỡng')) {
      reply = `Chào bạn! Về chế độ dinh dưỡng cho ${petName} (${petContext?.breed || petSpeciesName}):\n\n` +
        `1. **Lượng calo & Khẩu phần**: Do bé là ${petSpeciesName}${petContext?.age_months ? ` ${Math.floor(petContext.age_months / 12)} tuổi` : ''}, bạn nên chia khẩu phần ăn làm 2-3 bữa nhỏ để ổn định đường huyết và giảm tải cho dạ dày.\n` +
        `2. **Lưu ý dị ứng**: Hồ sơ ghi nhận bé có tiền sử "${allergies}". Bạn cần tuyệt đối tránh các sản phẩm có thành phần này trên bao bì.\n` +
        `3. **Độ ẩm**: Luôn duy trì bát nước lọc sạch bên cạnh bát ăn để phòng ngừa bệnh sỏi thận và đường tiết niệu.`;
      
      // Gợi ý 1-2 sản phẩm thực phẩm trong kho
      recommendedProducts = candidateProducts
        .filter(p => p.category_id === 'c1' || p.category_id === 'c2' || p.category_id === 'c3')
        .slice(0, 2);
    } else if (lowerMsg.includes('cân') || lowerMsg.includes('béo') || lowerMsg.includes('gầy')) {
      reply = `Về vấn đề thể trạng của ${petName}:\n\n` +
        `Hiện tại bạn có thể vào tab **Theo Dõi Sức Khỏe** trên Pet Paw để nhập số cân và kiểm tra chỉ số BCS tự động. Nếu bé có dấu hiệu tăng cân nhanh, hãy giảm 10-15% khẩu phần hạt mỗi ngày và tăng cường các trò chơi kích thích vận động nhé!`;
      
      recommendedProducts = candidateProducts
        .filter(p => p.target_needs?.includes('Kiểm soát cân nặng') || p.category_id === 'c5')
        .slice(0, 2);
    } else if (lowerMsg.includes('tắm') || lowerMsg.includes('vệ sinh') || lowerMsg.includes('lông') || lowerMsg.includes('rụng')) {
      reply = `Để chăm sóc bộ lông và vệ sinh cho ${petName} luôn thơm tho, sạch sẽ:\n\n` +
        `- Nên tắm định kỳ 1-2 tuần/lần bằng sữa tắm chuyên dụng dịu nhẹ.\n` +
        `- Sau khi tắm phải sấy khô tận chân lông để tránh nấm da do ẩm ướt.\n` +
        `- Chải lông hàng ngày giúp loại bỏ lông chết và kích thích tuần hoàn máu dưới da.`;

      recommendedProducts = candidateProducts
        .filter(p => p.category_id === 'c6')
        .slice(0, 2);
    } else {
      reply = `Xin chào bạn! Mình là PetPaw AI Assistant.\n\n` +
        `Mình đã ghi nhận thông tin của bé ${petName} (${petContext?.breed || 'thú cưng'}). Mình có thể hỗ trợ bạn:\n` +
        `- Gợi ý loại thức ăn, hạt dinh dưỡng và pate an toàn, tránh dị ứng.\n` +
        `- Đánh giá thể trạng tăng/giảm cân và tư vấn khẩu phần ăn.\n` +
        `- Mẹo chăm sóc lông da và phòng bệnh thường gặp.\n\n` +
        `Bạn có câu hỏi cụ thể nào về sức khỏe hay thói quen của ${petName} không?`;

      recommendedProducts = candidateProducts.slice(0, 2);
    }

    // Ghi nhận cuộc trò chuyện
    const activeConvId = conversationId || 'conv-' + Date.now();
    memoryMessages.push({
      conversation_id: activeConvId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    });
    memoryMessages.push({
      conversation_id: activeConvId,
      role: 'assistant',
      content: reply,
      recommended_products: recommendedProducts,
      created_at: new Date().toISOString()
    });

    return {
      conversationId: activeConvId,
      reply,
      isEmergency: false,
      recommendedProducts,
      disclaimer: 'Lời khuyên dựa trên kiến thức chăm sóc thú cưng tiêu chuẩn và thông tin hồ sơ bạn đã cung cấp.'
    };
  }

  async getChatHistory(conversationId) {
    return memoryMessages.filter(m => m.conversation_id === conversationId);
  }
}

module.exports = new AIService();
