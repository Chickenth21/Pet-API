const { createClient } = require('@supabase/supabase-js');
const config = require('../config');

const ws = require('ws');

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  console.warn('⚠️ Cảnh báo: SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY chưa được cấu hình đầy đủ!');
}

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    transport: ws
  }
});

module.exports = supabase;
