/**
 * Thư viện chuẩn đánh giá thể trạng (Body Condition Score) và gợi ý khẩu phần
 */

// Tiêu chuẩn cân nặng trung bình của các giống chó mèo phổ biến (kg)
const BREED_WEIGHT_STANDARDS = {
  // Mèo
  'Mèo Anh lông ngắn': { min: 4.0, max: 7.0, ideal: 5.2 },
  'Mèo Anh lông dài': { min: 4.0, max: 7.5, ideal: 5.5 },
  'Mèo Ba Tư': { min: 3.5, max: 6.5, ideal: 4.8 },
  'Mèo Mướp / Mèo ta': { min: 3.0, max: 5.0, ideal: 4.0 },
  'Mèo Xiêm': { min: 2.5, max: 4.5, ideal: 3.5 },
  'Mèo Ragdoll': { min: 4.5, max: 9.0, ideal: 6.5 },
  'Mèo Maine Coon': { min: 5.5, max: 11.0, ideal: 8.0 },
  'Mèo Munchkin': { min: 2.5, max: 4.5, ideal: 3.5 },

  // Chó
  'Poodle (Toy)': { min: 2.0, max: 4.5, ideal: 3.2 },
  'Poodle (Mini)': { min: 4.5, max: 7.5, ideal: 6.0 },
  'Poodle (Standard)': { min: 20.0, max: 32.0, ideal: 25.0 },
  'Corgi': { min: 10.0, max: 14.0, ideal: 12.0 },
  'Golden Retriever': { min: 25.0, max: 34.0, ideal: 29.5 },
  'Chó Cỏ / Chó ta': { min: 10.0, max: 18.0, ideal: 14.0 },
  'Pug': { min: 6.0, max: 9.0, ideal: 7.5 },
  'Phốc Sóc (Pomeranian)': { min: 1.5, max: 3.5, ideal: 2.5 },
  'Shiba Inu': { min: 8.0, max: 11.5, ideal: 9.5 },
  'Chó Phốc (Pinscher)': { min: 3.5, max: 5.5, ideal: 4.5 }
};

/**
 * Đánh giá sơ bộ tình trạng cơ thể
 */
function evaluateBodyCondition({ species, breed, weight, ageMonths = 12 }) {
  const numWeight = parseFloat(weight);
  if (!numWeight || isNaN(numWeight)) {
    return {
      status: 'insufficient_data',
      label: 'Chưa đủ dữ liệu',
      color: 'gray',
      description: 'Vui lòng nhập số cân nặng hợp lệ để hệ thống phân tích.'
    };
  }

  // Lấy chuẩn theo giống nếu có
  let standard = BREED_WEIGHT_STANDARDS[breed];
  if (!standard) {
    // Ước lượng chung theo loài
    if (species === 'cat') {
      standard = { min: 3.5, max: 5.5, ideal: 4.5 };
    } else {
      // Chó chung (mặc định size vừa)
      standard = { min: 8.0, max: 16.0, ideal: 12.0 };
    }
  }

  // Điều chỉnh nếu là thú cưng còn non (< 12 tháng)
  let idealWeight = standard.ideal;
  let minWeight = standard.min;
  let maxWeight = standard.max;

  if (ageMonths && ageMonths < 12) {
    const growthRatio = Math.max(0.3, Math.min(1.0, ageMonths / 12));
    idealWeight *= growthRatio;
    minWeight *= growthRatio;
    maxWeight *= growthRatio;
  }

  const ratio = numWeight / idealWeight;

  if (ratio < 0.85) {
    return {
      status: 'underweight',
      label: 'Thiếu cân',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Cơ thể gầy, xương sườn dễ nhìn thấy. Cần tăng cường dinh dưỡng giàu đạm và kiểm tra ký sinh trùng.',
      idealRange: `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`,
      dietAdvice: {
        calorieAdjustment: '+15% đến +20%',
        foodPortion: 'Tăng 15% lượng hạt/pate mỗi ngày, chia thành 3-4 bữa nhỏ.',
        recommendation: 'Bổ sung pate ức gà, thịt bò nạc, dầu cá hồi dưỡng da lông và men vi sinh hỗ trợ tiêu hóa.'
      }
    };
  } else if (ratio < 0.95) {
    return {
      status: 'at_risk_underweight',
      label: 'Nguy cơ thiếu cân',
      badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      description: 'Hơi mảnh mai, cần bổ sung thêm lượng thức ăn và theo dõi sự phát triển cơ bắp.',
      idealRange: `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`,
      dietAdvice: {
        calorieAdjustment: '+10%',
        foodPortion: 'Tăng nhẹ lượng thức ăn hàng ngày khoảng 5-10g.',
        recommendation: 'Duy trì chế độ ăn giàu dinh dưỡng và bổ sung thêm snack thưởng giàu protein.'
      }
    };
  } else if (ratio <= 1.10) {
    return {
      status: 'normal',
      label: 'Cân nặng lý tưởng',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Cơ thể cân đối, săn chắc. Hãy tiếp tục duy trì chế độ dinh dưỡng và vận động hiện tại!',
      idealRange: `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`,
      dietAdvice: {
        calorieAdjustment: '0% (Duy trì chuẩn)',
        foodPortion: 'Giữ nguyên định lượng khuyến cáo theo hướng dẫn trên bao bì.',
        recommendation: 'Duy trì giờ ăn cố định, cung cấp đủ nước sạch mỗi ngày.'
      }
    };
  } else if (ratio <= 1.25) {
    return {
      status: 'at_risk_overweight',
      label: 'Nguy cơ thừa cân',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Bắt đầu tích lũy mỡ dưới da, khó sờ thấy xương sườn. Cần kiểm soát lượng bánh thưởng.',
      idealRange: `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`,
      dietAdvice: {
        calorieAdjustment: '-10%',
        foodPortion: 'Giảm 10% lượng thức ăn mỗi bữa hoặc chuyển sang dòng hạt kiểm soát cân nặng (Weight Care).',
        recommendation: 'Cắt giảm bánh thưởng vặt có đường hoặc tinh bột, tăng thời gian chơi đùa 15-20 phút/ngày.'
      }
    };
  } else {
    return {
      status: 'obese',
      label: 'Có dấu hiệu béo phì',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'Lớp mỡ dày bao phủ ngực và hông, dáng đi nặng nề. Có nguy cơ ảnh hưởng tim mạch và khớp xương.',
      idealRange: `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg`,
      dietAdvice: {
        calorieAdjustment: '-15% đến -20%',
        foodPortion: 'Áp dụng chế độ ăn kiêng chuyên biệt với thực phẩm giàu chất xơ, ít chất béo.',
        recommendation: 'Tuyệt đối không cho ăn thức ăn dầu mỡ của người. Tăng cường vận động nhẹ nhàng và nên khám bác sĩ thú y.'
      }
    };
  }
}

/**
 * Phân tích xu hướng biến động cân nặng từ lịch sử
 */
function analyzeWeightTrend(records = []) {
  if (!records || records.length < 2) {
    return {
      trend: 'stable',
      rateText: 'Chưa đủ dữ liệu so sánh',
      warning: null
    };
  }

  // Sắp xếp theo ngày tăng dần
  const sorted = [...records].sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date));
  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  const diff = Number(latest.weight) - Number(previous.weight);
  const percentChange = (diff / Number(previous.weight)) * 100;

  let trend = 'stable';
  let warning = null;

  if (percentChange > 8) {
    trend = 'rapid_increase';
    warning = `⚠️ Cảnh báo: Tăng cân nhanh (+${percentChange.toFixed(1)}% so với lần đo trước). Cần xem lại khẩu phần!`;
  } else if (percentChange < -8) {
    trend = 'rapid_decrease';
    warning = `⚠️ Cảnh báo: Sụt cân đột ngột (${percentChange.toFixed(1)}%). Nên đưa bé đi kiểm tra sức khỏe tại phòng khám thú y!`;
  } else if (diff > 0) {
    trend = 'increasing';
  } else if (diff < 0) {
    trend = 'decreasing';
  }

  return {
    trend,
    diff: diff.toFixed(2),
    percentChange: percentChange.toFixed(1),
    rateText: diff > 0 ? `+${diff.toFixed(2)} kg` : `${diff.toFixed(2)} kg`,
    warning
  };
}

module.exports = {
  evaluateBodyCondition,
  analyzeWeightTrend,
  BREED_WEIGHT_STANDARDS
};
