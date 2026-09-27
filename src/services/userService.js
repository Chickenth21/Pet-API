const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const supabase = require('../utils/supabaseClient');
const { memoryUsers } = require('./authService');

class UserService {
  /**
   * Lấy danh sách tài khoản người dùng và phân quyền (kèm tìm kiếm, lọc theo vai trò, phân trang)
   */
  async getUsers({ search, role, status, page = 1, limit = 50 } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    try {
      let query = supabase
        .from('users')
        .select('id, email, full_name, avatar_url, role, is_active, created_at, updated_at', { count: 'exact' });

      if (role && role !== 'all') {
        query = query.eq('role', role);
      }

      if (status && status !== 'all') {
        const isActive = status === 'active';
        query = query.eq('is_active', isActive);
      }

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        return {
          users: data,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count !== null ? count : data.length,
            totalPages: Math.ceil((count !== null ? count : data.length) / limitNum) || 0
          }
        };
      }
    } catch {
      // Fallback
    }

    // In-memory fallback
    let list = Array.isArray(memoryUsers) ? [...memoryUsers] : [];
    if (role && role !== 'all') {
      list = list.filter(u => u.role === role);
    }
    if (status && status !== 'all') {
      const isActive = status === 'active';
      list = list.filter(u => u.is_active === isActive);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u => 
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.full_name && u.full_name.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const paginated = list.slice(offset, offset + limitNum).map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      role: u.role || 'user',
      is_active: u.is_active !== false,
      created_at: u.created_at || new Date().toISOString(),
      updated_at: u.updated_at || new Date().toISOString()
    }));

    return {
      users: paginated,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 0
      }
    };
  }

  /**
   * Phân quyền tài khoản (Cập nhật role: 'admin' | 'user' | 'guest')
   */
  async updateUserRole(userId, newRole, currentAdminId) {
    const validRoles = ['admin', 'user', 'guest'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Vai trò không hợp lệ: ${newRole}. Chỉ chấp nhận: ${validRoles.join(', ')}`);
    }

    // Kiểm tra an toàn: Không cho phép tự tước quyền admin nếu chỉ còn duy nhất 1 admin
    if (userId === currentAdminId && newRole !== 'admin') {
      const { users } = await this.getUsers({ role: 'admin', limit: 100 });
      const activeAdmins = users.filter(u => u.role === 'admin' && u.is_active);
      if (activeAdmins.length <= 1) {
        throw new Error('Bạn không thể hạ quyền của chính mình khi bạn là Quản trị viên duy nhất còn lại!');
      }
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, email, full_name, avatar_url, role, is_active, updated_at')
        .single();

      if (!error && data) {
        if (Array.isArray(memoryUsers)) {
          const m = memoryUsers.find(u => String(u.id) === String(userId));
          if (m) m.role = newRole;
        }
        return data;
      }
    } catch {
      // Fallback
    }

    if (Array.isArray(memoryUsers)) {
      const m = memoryUsers.find(u => String(u.id) === String(userId));
      if (m) {
        m.role = newRole;
        return {
          id: m.id,
          email: m.email,
          full_name: m.full_name,
          avatar_url: m.avatar_url,
          role: m.role,
          is_active: m.is_active !== false,
          updated_at: new Date().toISOString()
        };
      }
    }

    throw new Error('Không tìm thấy tài khoản người dùng để phân quyền!');
  }

  /**
   * Khóa / Mở khóa trạng thái tài khoản
   */
  async toggleUserStatus(userId, currentAdminId) {
    if (userId === currentAdminId) {
      throw new Error('Bạn không thể tự khóa tài khoản Quản trị đang đăng nhập của mình!');
    }

    let currentStatus = true;
    try {
      const { data: user } = await supabase
        .from('users')
        .select('is_active')
        .eq('id', userId)
        .maybeSingle();

      if (user) {
        currentStatus = user.is_active;
      } else if (Array.isArray(memoryUsers)) {
        const m = memoryUsers.find(u => String(u.id) === String(userId));
        if (m) currentStatus = m.is_active !== false;
      }
    } catch {
      if (Array.isArray(memoryUsers)) {
        const m = memoryUsers.find(u => String(u.id) === String(userId));
        if (m) currentStatus = m.is_active !== false;
      }
    }

    const nextStatus = !currentStatus;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, email, full_name, avatar_url, role, is_active, updated_at')
        .single();

      if (!error && data) {
        if (Array.isArray(memoryUsers)) {
          const m = memoryUsers.find(u => String(u.id) === String(userId));
          if (m) m.is_active = nextStatus;
        }
        return data;
      }
    } catch {
      // Fallback
    }

    if (Array.isArray(memoryUsers)) {
      const m = memoryUsers.find(u => String(u.id) === String(userId));
      if (m) {
        m.is_active = nextStatus;
        return {
          id: m.id,
          email: m.email,
          full_name: m.full_name,
          avatar_url: m.avatar_url,
          role: m.role || 'user',
          is_active: m.is_active,
          updated_at: new Date().toISOString()
        };
      }
    }

    throw new Error('Không tìm thấy tài khoản để cập nhật trạng thái');
  }

  /**
   * Tạo tài khoản mới từ trang Quản trị (Admin tạo nhân viên hoặc khách hàng)
   */
  async createUser({ email, password, full_name, role = 'user', is_active = true }) {
    if (!email || !password || !full_name) {
      throw new Error('Vui lòng điền đầy đủ Email, Mật khẩu và Họ tên!');
    }

    const cleanEmail = email.toLowerCase().trim();
    const hash = await bcrypt.hash(password, 10);
    const newId = crypto.randomUUID();

    const newUser = {
      id: newId,
      email: cleanEmail,
      password_hash: hash,
      full_name: full_name.trim(),
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop`,
      role: role || 'user',
      is_active: Boolean(is_active),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select('id, email, full_name, avatar_url, role, is_active, created_at, updated_at')
        .single();

      if (!error && data) {
        if (Array.isArray(memoryUsers)) memoryUsers.push(newUser);
        return data;
      }
      if (error && error.code === '23505') {
        throw new Error('Email này đã tồn tại trong hệ thống!');
      }
    } catch (err) {
      if (err.message && err.message.includes('đã tồn tại')) throw err;
    }

    if (Array.isArray(memoryUsers)) {
      if (memoryUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
        throw new Error('Email này đã tồn tại trong bộ nhớ!');
      }
      memoryUsers.push(newUser);
    }

    return {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      avatar_url: newUser.avatar_url,
      role: newUser.role,
      is_active: newUser.is_active,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    };
  }

  /**
   * Xóa tài khoản
   */
  async deleteUser(userId, currentAdminId) {
    if (userId === currentAdminId) {
      throw new Error('Bạn không thể xóa chính tài khoản Quản trị đang đăng nhập!');
    }

    try {
      await supabase.from('users').delete().eq('id', userId);
    } catch {
      // Fallback
    }

    if (Array.isArray(memoryUsers)) {
      const idx = memoryUsers.findIndex(u => String(u.id) === String(userId));
      if (idx !== -1) memoryUsers.splice(idx, 1);
    }

    return true;
  }
}

module.exports = new UserService();
