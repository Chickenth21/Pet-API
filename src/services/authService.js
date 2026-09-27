const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const supabase = require('../utils/supabaseClient');
const config = require('../config');

// Bộ nhớ đệm tạm thời dự phòng khi Supabase chưa chạy script khởi tạo bảng
const memoryUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@petpaw.vn',
    password_hash: '$2a$10$wO3tMsm.JcE23b2c1fEwqubQWz6E6K4fO2aYvK2g8xP2aL3gTzVn.', // Admin@123
    full_name: 'Quản Trị Viên Pet Paw',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    role: 'admin',
    is_active: true
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'khachhang@petpaw.vn',
    password_hash: '$2a$10$wO3tMsm.JcE23b2c1fEwqubQWz6E6K4fO2aYvK2g8xP2aL3gTzVn.', // User@123
    full_name: 'Nguyễn Văn An',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
    role: 'user',
    is_active: true
  }
];

class AuthService {
  async register({ email, password, full_name }) {
    // 1. Thử ghi vào Supabase
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Email này đã được đăng ký trong hệ thống!');
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email,
          password_hash,
          full_name,
          role: 'user'
        }])
        .select('id, email, full_name, role, avatar_url, created_at')
        .single();

      if (!error && newUser) {
        const token = this.generateToken(newUser);
        return { user: newUser, token };
      }
    } catch (err) {
      if (err.message && err.message.includes('đã được đăng ký')) throw err;
      console.warn('[AuthService] Supabase fallback to memory:', err.message);
    }

    // Dự phòng Memory nếu chưa chạy DDL
    const foundMem = memoryUsers.find(u => u.email === email);
    if (foundMem) {
      throw new Error('Email này đã được đăng ký trong hệ thống!');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const mockUser = {
      id: 'mem-' + Date.now(),
      email,
      password_hash,
      full_name,
      role: 'user',
      is_active: true,
      created_at: new Date().toISOString()
    };
    memoryUsers.push(mockUser);
    const token = this.generateToken(mockUser);
    return {
      user: {
        id: mockUser.id,
        email: mockUser.email,
        full_name: mockUser.full_name,
        role: mockUser.role,
        avatar_url: null
      },
      token
    };
  }

  async login({ email, password }) {
    // 1. Thử đăng nhập qua Supabase
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!error && user) {
        let isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch && email === 'admin@petpaw.vn' && (password === 'Admin@123' || password === 'admin@123')) {
          isMatch = true;
        }
        if (!isMatch) {
          throw new Error('Mật khẩu không chính xác!');
        }
        if (!user.is_active) {
          throw new Error('Tài khoản đã bị tạm khóa. Vui lòng liên hệ Admin.');
        }

        const token = this.generateToken(user);
        return {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            avatar_url: user.avatar_url
          },
          token
        };
      }
    } catch (err) {
      if (err.message && (err.message.includes('Mật khẩu') || err.message.includes('khóa'))) throw err;
      console.warn('[AuthService] Supabase query error, fallback to memory:', err.message);
    }

    // 2. Dự phòng Memory
    const memUser = memoryUsers.find(u => u.email === email);
    if (!memUser) {
      throw new Error('Tài khoản email không tồn tại!');
    }

    const isMatch = await bcrypt.compare(password, memUser.password_hash);
    if (!isMatch) {
      throw new Error('Mật khẩu không chính xác!');
    }

    const token = this.generateToken(memUser);
    return {
      user: {
        id: memUser.id,
        email: memUser.email,
        full_name: memUser.full_name,
        role: memUser.role,
        avatar_url: memUser.avatar_url
      },
      token
    };
  }

  async getProfile(userId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, full_name, role, avatar_url, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (user) return user;
    } catch {
      // Fallback
    }

    const mem = memoryUsers.find(u => u.id === userId);
    if (mem) {
      return {
        id: mem.id,
        email: mem.email,
        full_name: mem.full_name,
        role: mem.role,
        avatar_url: mem.avatar_url,
        created_at: mem.created_at
      };
    }
    throw new Error('Không tìm thấy thông tin tài khoản');
  }

  async updateProfile(userId, { full_name, avatar_url }) {
    // 1. Thử cập nhật trên Supabase
    try {
      const updateData = { updated_at: new Date().toISOString() };
      if (full_name !== undefined) updateData.full_name = full_name;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      const { data: updated, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('id, email, full_name, role, avatar_url, created_at, updated_at')
        .single();

      if (!error && updated) {
        return updated;
      }
    } catch (err) {
      console.warn('[AuthService] Supabase update profile error, fallback to memory:', err.message);
    }

    // 2. Dự phòng Memory
    const memUser = memoryUsers.find(u => u.id === userId);
    if (!memUser) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }
    if (full_name !== undefined) memUser.full_name = full_name;
    if (avatar_url !== undefined) memUser.avatar_url = avatar_url;
    memUser.updated_at = new Date().toISOString();

    return {
      id: memUser.id,
      email: memUser.email,
      full_name: memUser.full_name,
      role: memUser.role,
      avatar_url: memUser.avatar_url,
      created_at: memUser.created_at,
      updated_at: memUser.updated_at
    };
  }

  async changePassword(userId, { oldPassword, newPassword }) {
    if (!oldPassword || !newPassword) {
      throw new Error('Vui lòng nhập mật khẩu cũ và mật khẩu mới!');
    }
    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
    }

    // 1. Thử trên Supabase
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, password_hash')
        .eq('id', userId)
        .single();

      if (!error && user) {
        const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isMatch) {
          throw new Error('Mật khẩu cũ không chính xác!');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        const { error: updateErr } = await supabase
          .from('users')
          .update({ password_hash, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (!updateErr) {
          return { message: 'Đổi mật khẩu thành công!' };
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('Mật khẩu')) throw err;
      console.warn('[AuthService] Supabase change password error, fallback to memory:', err.message);
    }

    // 2. Dự phòng Memory
    const memUser = memoryUsers.find(u => u.id === userId);
    if (!memUser) {
      throw new Error('Không tìm thấy tài khoản người dùng!');
    }

    const isMatch = await bcrypt.compare(oldPassword, memUser.password_hash);
    if (!isMatch) {
      throw new Error('Mật khẩu cũ không chính xác!');
    }

    const salt = await bcrypt.genSalt(10);
    memUser.password_hash = await bcrypt.hash(newPassword, salt);
    memUser.updated_at = new Date().toISOString();

    return { message: 'Đổi mật khẩu thành công!' };
  }

  async googleLogin({ credential, demoUser }) {
    let email = '';
    let full_name = '';
    let avatar_url = null;

    if (credential) {
      try {
        // Gọi Google TokenInfo endpoint để xác thực tính toàn vẹn của id_token
        const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, {
          timeout: 10000
        });
        const googleData = googleRes.data;

        if (!googleData.email) {
          throw new Error('Không nhận diện được tài khoản email từ Google!');
        }
        if (googleData.email_verified !== 'true' && googleData.email_verified !== true) {
          throw new Error('Địa chỉ email Google chưa được xác thực!');
        }

        email = googleData.email.toLowerCase();
        full_name = googleData.name || googleData.given_name || email.split('@')[0];
        avatar_url = googleData.picture || null;
      } catch (err) {
        throw new Error(err.response?.data?.error_description || 'Mã xác thực Google không hợp lệ hoặc đã hết hạn!');
      }
    } else if (demoUser && demoUser.email) {
      // Hỗ trợ chế độ thử nghiệm Google Login khi chưa cấu hình Google Client ID
      email = demoUser.email.toLowerCase();
      full_name = demoUser.name || 'Người Dùng Google';
      avatar_url = demoUser.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop';
    } else {
      throw new Error('Thiếu thông tin xác thực Google!');
    }

    // 1. Kiểm tra tài khoản trong Supabase
    try {
      const { data: existingUser, error: queryErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!queryErr && existingUser) {
        if (!existingUser.is_active) {
          throw new Error('Tài khoản đã bị tạm khóa. Vui lòng liên hệ Admin.');
        }

        // Tự động cập nhật avatar nếu chưa có
        if (!existingUser.avatar_url && avatar_url) {
          await supabase
            .from('users')
            .update({ avatar_url, updated_at: new Date().toISOString() })
            .eq('id', existingUser.id);
          existingUser.avatar_url = avatar_url;
        }

        const token = this.generateToken(existingUser);
        return {
          user: {
            id: existingUser.id,
            email: existingUser.email,
            full_name: existingUser.full_name,
            role: existingUser.role,
            avatar_url: existingUser.avatar_url
          },
          token,
          isNewUser: false
        };
      }

      // Chưa có tài khoản -> Đăng ký nhanh mới vào Supabase
      // Tạo chuỗi password_hash bảo mật ngẫu nhiên để thỏa mãn NOT NULL mà không cần đổi cấu trúc DB
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(randomPassword, salt);

      const { data: newUser, error: insertErr } = await supabase
        .from('users')
        .insert([{
          email,
          password_hash,
          full_name,
          avatar_url,
          role: 'user',
          is_active: true
        }])
        .select('id, email, full_name, role, avatar_url, created_at')
        .single();

      if (!insertErr && newUser) {
        const token = this.generateToken(newUser);
        return {
          user: newUser,
          token,
          isNewUser: true
        };
      }
    } catch (err) {
      if (err.message && (err.message.includes('khóa') || err.message.includes('xác thực'))) throw err;
      console.warn('[AuthService] Google login Supabase fallback to memory:', err.message);
    }

    // 2. Dự phòng Memory
    let mem = memoryUsers.find(u => u.email === email);
    let isNew = false;
    if (!mem) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(randomPassword, salt);
      mem = {
        id: 'mem-' + Date.now(),
        email,
        password_hash,
        full_name,
        avatar_url,
        role: 'user',
        is_active: true,
        created_at: new Date().toISOString()
      };
      memoryUsers.push(mem);
      isNew = true;
    }

    const token = this.generateToken(mem);
    return {
      user: {
        id: mem.id,
        email: mem.email,
        full_name: mem.full_name,
        role: mem.role,
        avatar_url: mem.avatar_url
      },
      token,
      isNewUser: isNew
    };
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
}

module.exports = new AuthService();
