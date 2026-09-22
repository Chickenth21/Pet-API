const supabase = require('../utils/supabaseClient');

let memoryClicks = [
  { id: 'clk-1', product_id: 'p1', platform: 'shopee', user_id: null, clicked_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'clk-2', product_id: 'p1', platform: 'shopee', user_id: null, clicked_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'clk-3', product_id: 'p3', platform: 'tiktok', user_id: null, clicked_at: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 'clk-4', product_id: 'p2', platform: 'shopee', user_id: null, clicked_at: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 'clk-5', product_id: 'p4', platform: 'tiktok', user_id: null, clicked_at: new Date(Date.now() - 3600000 * 24).toISOString() }
];

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
    const totalClicks = memoryClicks.length;
    const shopeeClicks = memoryClicks.filter(c => c.platform === 'shopee').length;
    const tiktokClicks = memoryClicks.filter(c => c.platform === 'tiktok').length;

    // Nhóm theo sản phẩm
    const productCounts = {};
    memoryClicks.forEach(c => {
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
