const path = require('path');
const dotenv = require('dotenv');

// Đảm bảo luôn tải đúng tệp .env tại thư mục server
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback mặc định

// Chuẩn hóa SUPABASE_URL: loại bỏ /rest/v1/ nếu người dùng cấu hình kèm
let supabaseUrl = process.env.SUPABASE_URL || 'https://kqdnvaoocfbhvwkcxhdp.supabase.co';
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'petpaw_jwt_secret_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  supabase: {
    url: supabaseUrl,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    password: process.env.SUPABASE_PASSWORD || ''
  },
  discord: {
    channelId: process.env.DISCORD_CHANNEL_ID || '1551796683199873064',
    token: process.env.DISCORD_TOKEN || ''
  }
};
