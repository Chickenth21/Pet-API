const axios = require('axios');
const config = require('../config');

/**
 * Gửi thông báo lỗi đến kênh Discord sử dụng Bot Token và Channel ID
 */
async function sendDiscordError(err, context = {}) {
  try {
    const { channelId, token } = config.discord;
    if (!channelId || !token) {
      console.warn('[DiscordLogger] Không tìm thấy DISCORD_CHANNEL_ID hoặc DISCORD_TOKEN.');
      return;
    }

    const errorMessage = err?.message || String(err);
    const errorStack = err?.stack ? err.stack.substring(0, 1000) : 'No stack trace';
    const timestamp = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    const payload = {
      content: `⚠️ **[PET PAW SYSTEM ALERT]** Phát hiện lỗi hệ thống!`,
      embeds: [
        {
          title: `🔥 Error: ${errorMessage.substring(0, 200)}`,
          color: 0xE74C3C, // Màu đỏ cảnh báo
          fields: [
            { name: 'Thời gian', value: timestamp, inline: true },
            { name: 'Môi trường', value: config.nodeEnv, inline: true },
            { name: 'Phương thức', value: context.method || 'N/A', inline: true },
            { name: 'Đường dẫn (URL)', value: context.url || 'Internal / Server', inline: false },
            { name: 'Chi tiết Stack', value: `\`\`\`javascript\n${errorStack}\n\`\`\``, inline: false }
          ],
          footer: {
            text: 'Pet Paw Error Monitoring Bot'
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
        timeout: 5000
      }
    );

    console.log('[DiscordLogger] Đã gửi thông báo lỗi đến Discord thành công (status:', res.status, ')');
  } catch (discordErr) {
    console.error('[DiscordLogger] Lỗi khi gửi log sang Discord:', discordErr.response?.data || discordErr.message);
  }
}

module.exports = {
  sendDiscordError
};
