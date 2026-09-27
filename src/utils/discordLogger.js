const axios = require('axios');
const config = require('../config');

// Cấu hình bảng màu chuẩn theo yêu cầu:
// 1. Lỗi: Màu ĐỎ (0xED4245)
// 2. Cảnh báo: Màu VÀNG (0xFEE75C)
// 3. Mess / Tin nhắn: Màu XANH NƯỚC BIỂN (0x00A8FC)
const SEVERITY_LEVELS = {
  error: {
    name: 'LỖI HỆ THỐNG / ERROR',
    color: 0xED4245, // Đỏ rực
    terminalColor: '\x1b[31m', // Red
    tag: '🔥 [ERROR]',
    icon: '🚨'
  },
  warning: {
    name: 'CẢNH BÁO / WARNING',
    color: 0xFEE75C, // Vàng tươi
    terminalColor: '\x1b[33m', // Yellow
    tag: '⚡ [WARNING]',
    icon: '⚠️'
  },
  message: {
    name: 'THÔNG ĐIỆP HỆ THỐNG / MESSAGE',
    color: 0x00A8FC, // Xanh nước biển (Sea Blue / Cyan)
    terminalColor: '\x1b[36m', // Cyan / Sea Blue
    tag: '💬 [MESSAGE]',
    icon: '🌊'
  },
  info: {
    name: 'THÔNG TIN HOẠT ĐỘNG / INFO',
    color: 0x00A8FC, // Xanh nước biển
    terminalColor: '\x1b[36m',
    tag: '💬 [MESSAGE]',
    icon: '🌊'
  }
};

/**
 * Gửi thông báo phân cấp màu sắc đến Discord & in log phân biệt màu trên terminal
 * @param {Object} options
 * @param {'error'|'warning'|'message'|'info'} options.level - Mức độ (error: đỏ, warning: vàng, message: xanh nước biển)
 * @param {Error|string} options.err - Đối tượng lỗi hoặc thông điệp
 * @param {Object} options.context - Ngữ cảnh (source, url, method, componentStack, etc.)
 */
async function sendDiscordAlert({ level = 'error', err = null, message = '', context = {} }) {
  const normalizedLevel = (level || 'error').toLowerCase();
  const configLevel = SEVERITY_LEVELS[normalizedLevel] || SEVERITY_LEVELS.error;

  const errorMessage = err?.message || (typeof err === 'string' ? err : message) || 'Không có mô tả chi tiết';
  const errorStack = err?.stack ? err.stack.substring(0, 1000) : (context.stack || '');
  const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const source = context.source || 'Hệ Thống Pet Paw';

  // 1. In log phân biệt màu sắc trên Terminal console
  const resetColor = '\x1b[0m';
  const termColor = configLevel.terminalColor;

  console.log(`${termColor}======================================================${resetColor}`);
  console.log(`${termColor}${configLevel.icon} [PET PAW ALERT] [${configLevel.name}] [${source}]${resetColor}`);
  console.log(`${termColor}🕒 Thời gian: ${timestamp}${resetColor}`);
  console.log(`${termColor}📍 URL / Vị trí: ${context.url || 'Internal'}${resetColor}`);
  console.log(`${termColor}📝 Nội dung: ${errorMessage}${resetColor}`);
  if (context.componentStack) {
    console.log(`${termColor}🧩 Component Stack: ${context.componentStack.substring(0, 350)}${resetColor}`);
  }
  if (errorStack) {
    console.log(`${termColor}📜 Chi tiết Stack:\n${errorStack}${resetColor}`);
  }
  console.log(`${termColor}======================================================${resetColor}\n`);

  // 2. Gửi cảnh báo đến kênh Discord qua Webhook
  try {
    const { channelId, token } = config.discord;
    if (!channelId || !token) {
      console.warn('[DiscordLogger] Không tìm thấy DISCORD_CHANNEL_ID hoặc DISCORD_TOKEN.');
      return;
    }

    const fields = [
      { name: 'Thời gian', value: timestamp, inline: true },
      { name: 'Phân loại', value: `**${configLevel.name}**`, inline: true },
      { name: 'Nguồn phát sinh', value: source, inline: true },
      { name: 'Môi trường', value: config.nodeEnv, inline: true },
      { name: 'Phương thức', value: context.method || 'Thao tác hệ thống', inline: true },
      { name: 'Đường dẫn (URL)', value: context.url || 'Internal / Server', inline: false }
    ];

    if (context.componentStack) {
      fields.push({
        name: 'React Component Stack',
        value: `\`\`\`${context.componentStack.substring(0, 500)}\`\`\``,
        inline: false
      });
    }

    if (errorStack) {
      fields.push({
        name: 'Chi tiết Kỹ Thuật (Stack)',
        value: `\`\`\`javascript\n${errorStack.substring(0, 900)}\n\`\`\``,
        inline: false
      });
    }

    const payload = {
      content: `${configLevel.icon} **[PET PAW SYSTEM NOTIFICATION]** ${configLevel.tag} tại **${source}**!`,
      embeds: [
        {
          title: `${configLevel.icon} ${errorMessage.substring(0, 200)}`,
          color: configLevel.color, // Đỏ (error), Vàng (warning), Xanh nước biển (message)
          fields,
          footer: {
            text: `Pet Paw Monitoring • Mức độ: ${normalizedLevel.toUpperCase()}`
          }
        }
      ]
    };

    const res = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bot ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 6000
      }
    );

    console.log(`[DiscordLogger] Đã gửi thông báo (${normalizedLevel.toUpperCase()}) đến Discord thành công (status: ${res.status})`);
  } catch (discordErr) {
    console.error('[DiscordLogger] Lỗi khi gửi log sang Discord:', discordErr.response?.data || discordErr.message);
  }
}

// Wrapper tiện ích:
// 1. Lỗi: Màu Đỏ
async function sendDiscordError(err, context = {}) {
  return sendDiscordAlert({ level: 'error', err, context });
}

// 2. Cảnh báo: Màu Vàng
async function sendDiscordWarning(message, context = {}) {
  return sendDiscordAlert({ level: 'warning', message, context });
}

// 3. Mess / Tin nhắn: Màu Xanh Nước Biển
async function sendDiscordMessage(message, context = {}) {
  return sendDiscordAlert({ level: 'message', message, context });
}

module.exports = {
  sendDiscordAlert,
  sendDiscordError,
  sendDiscordWarning,
  sendDiscordMessage
};
