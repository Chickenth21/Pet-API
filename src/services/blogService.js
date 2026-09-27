const supabase = require('../utils/supabaseClient');

let memoryBlogPosts = [];

class BlogService {
  async getPosts({ category, target_pet_type, search, limit = 10, page = 1 }) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    try {
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('is_published', true);

      if (category) {
        query = query.eq('category', category);
      }
      if (target_pet_type && target_pet_type !== 'all') {
        query = query.or(`target_pet_type.eq.${target_pet_type},target_pet_type.eq.all`);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data, count, error } = await query;
      if (!error && data) {
        return {
          posts: data,
          pagination: {
            total: count !== null ? count : data.length,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil((count !== null ? count : data.length) / limitNum) || 0
          }
        };
      }
    } catch {
      // Fallback
    }

    return {
      posts: [],
      pagination: {
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0
      }
    };
  }

  async getPostBySlug(slug) {
    try {
      const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (!error && post) {
        // Tăng lượt xem
        await supabase
          .from('blog_posts')
          .update({ views_count: (post.views_count || 0) + 1 })
          .eq('id', post.id);

        const { data: related } = await supabase
          .from('blog_posts')
          .select('*')
          .neq('id', post.id)
          .eq('is_published', true)
          .limit(3);

        return {
          ...post,
          views_count: (post.views_count || 0) + 1,
          related_posts: related || []
        };
      }
    } catch {
      // Fallback
    }

    const memPost = memoryBlogPosts.find(b => b.slug === slug);
    if (!memPost) throw new Error('Không tìm thấy bài viết!');
    return memPost;
  }

  async getAllPostsAdmin() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch {
      // Fallback
    }
    return memoryBlogPosts;
  }

  async createPost(postData) {
    const slugify = (text) =>
      text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    const crypto = require('crypto');
    const slug = postData.slug || `${slugify(postData.title || 'bai-viet')}-${Date.now().toString().slice(-4)}`;
    const newPost = {
      id: (postData.id && postData.id.includes('-')) ? postData.id : crypto.randomUUID(),
      title: postData.title,
      slug,
      summary: postData.summary || '',
      content: postData.content || '',
      thumbnail_url: postData.thumbnail_url || '',
      youtube_url: postData.youtube_url || '',
      category: postData.category || 'Kiến thức nuôi',
      tags: Array.isArray(postData.tags) ? postData.tags : (postData.tags ? postData.tags.split(',').map(t => t.trim()) : []),
      target_pet_type: postData.target_pet_type || 'all',
      is_published: postData.is_published !== undefined ? postData.is_published : true,
      views_count: 0,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([newPost])
        .select()
        .single();
      if (!error && data) {
        memoryBlogPosts.unshift(data);
        return data;
      }
    } catch {
      // Fallback
    }

    memoryBlogPosts.unshift(newPost);
    return newPost;
  }

  async updatePost(id, updateData) {
    const payload = { ...updateData, updated_at: new Date().toISOString() };
    if (updateData.tags && typeof updateData.tags === 'string') {
      payload.tags = updateData.tags.split(',').map(t => t.trim());
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const idx = memoryBlogPosts.findIndex(b => b.id === id);
        if (idx !== -1) memoryBlogPosts[idx] = data;
        return data;
      }
    } catch {
      // Fallback
    }

    const index = memoryBlogPosts.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Không tìm thấy bài viết để cập nhật!');
    }
    const updated = { ...memoryBlogPosts[index], ...payload };
    memoryBlogPosts[index] = updated;
    return updated;
  }

  async togglePostPublish(id) {
    try {
      const { data: current } = await supabase
        .from('blog_posts')
        .select('is_published')
        .eq('id', id)
        .single();

      if (current) {
        const nextState = !current.is_published;
        const { data, error } = await supabase
          .from('blog_posts')
          .update({ is_published: nextState, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          const idx = memoryBlogPosts.findIndex(b => b.id === id);
          if (idx !== -1) memoryBlogPosts[idx] = data;
          return data;
        }
      }
    } catch {
      // Fallback
    }

    const index = memoryBlogPosts.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error('Không tìm thấy bài viết!');
    }
    memoryBlogPosts[index].is_published = !memoryBlogPosts[index].is_published;
    memoryBlogPosts[index].updated_at = new Date().toISOString();
    return memoryBlogPosts[index];
  }

  async deletePost(id) {
    try {
      await supabase.from('blog_posts').delete().eq('id', id);
    } catch {
      // Fallback
    }

    const index = memoryBlogPosts.findIndex(b => b.id === id);
    if (index !== -1) {
      memoryBlogPosts.splice(index, 1);
    }
    return true;
  }
}

module.exports = new BlogService();
