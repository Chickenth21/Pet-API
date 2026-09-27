const supabase = require('../utils/supabaseClient');

let memoryClicks = [];

class AffiliateService {
  async trackClick({ productId, platform, userId, ipAddress, userAgent }) {
    const clickRecord = {
      product_id: productId,
      platform,
      user_id: userId || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      clicked_at: new Date().toISOString()
    };

    try {
      await supabase.from('affiliate_clicks').insert([clickRecord]);
    } catch {
      // Fallback
    }

    memoryClicks.push({ id: 'clk-' + Date.now(), ...clickRecord });
    return { success: true };
  }

  async getClickStats() {
    let clicks = [];
    try {
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .select('*');
      if (!error && data) {
        clicks = data;
      }
    } catch {
      clicks = memoryClicks;
    }

    const totalClicks = clicks.length;
    const shopeeClicks = clicks.filter(c => c.platform === 'shopee').length;
    const tiktokClicks = clicks.filter(c => c.platform === 'tiktok').length;

    // Nhóm theo sản phẩm
    const productCounts = {};
    clicks.forEach(c => {
      productCounts[c.product_id] = (productCounts[c.product_id] || 0) + 1;
    });

    return {
      totalClicks,
      shopeeClicks,
      tiktokClicks,
      platformRatio: {
        shopee: totalClicks ? Math.round((shopeeClicks / totalClicks) * 100) : 0,
        tiktok: totalClicks ? Math.round((tiktokClicks / totalClicks) * 100) : 0
      },
      topClickedProducts: Object.entries(productCounts)
        .map(([productId, count]) => ({ productId, count }))
        .sort((a, b) => b.count - a.count)
    };
  }
}

module.exports = new AffiliateService();
