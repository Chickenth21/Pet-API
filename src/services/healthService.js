const supabase = require('../utils/supabaseClient');
const petService = require('./petService');
const { evaluateBodyCondition, analyzeWeightTrend } = require('../utils/bodyConditionScorer');

// Bộ nhớ đệm dự phòng
let memoryRecords = [
  {
    id: 'rec-1',
    pet_id: 'pet-1',
    recorded_date: '2026-08-01',
    weight: 4.8,
    height: 26.0,
    body_length: 42.0,
    chest_girth: 35.0,
    current_health_status: 'Rất tốt, nhanh nhẹn',
    activity_level: 'medium',
    daily_food_amount: '55g hạt + 1/2 gói pate',
    symptoms: 'Không có',
    notes: 'Khám định kỳ tại phòng khám thú y',
    body_condition_result: 'normal',
    created_at: '2026-08-01T08:00:00Z'
  },
  {
    id: 'rec-2',
    pet_id: 'pet-1',
    recorded_date: '2026-08-20',
    weight: 5.1,
    height: 26.5,
    body_length: 43.0,
    chest_girth: 36.5,
    current_health_status: 'Bình thường, hơi lười vận động',
    activity_level: 'low',
    daily_food_amount: '60g hạt',
    symptoms: 'Ngủ nhiều trong ngày',
    notes: 'Có dấu hiệu tăng cân nhẹ',
    body_condition_result: 'normal',
    created_at: '2026-08-20T08:00:00Z'
  },
  {
    id: 'rec-3',
    pet_id: 'pet-1',
    recorded_date: '2026-09-15',
    weight: 5.6,
    height: 27.0,
    body_length: 43.5,
    chest_girth: 38.0,
    current_health_status: 'Bình thường, thích nằm điều hòa',
    activity_level: 'low',
    daily_food_amount: '65g hạt + bánh thưởng',
    symptoms: 'Mỡ bụng chảy xệ khi đi lại',
    notes: 'Tăng cân nhanh do ăn vặt nhiều',
    body_condition_result: 'at_risk_overweight',
    created_at: '2026-09-15T08:00:00Z'
  }
];

class HealthService {
  async getRecordsByPet(petId, userId) {
    const pet = await petService.getPetById(petId, userId);

    let records = [];
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('recorded_date', { ascending: true });

      if (!error && data && data.length > 0) records = data;
    } catch {
      // Fallback
    }

    if (records.length === 0) {
      records = memoryRecords.filter(r => r.pet_id === petId);
    }

    // Đánh giá thể trạng cho từng bản ghi nếu chưa có
    const evaluatedRecords = records.map(r => {
      const assessment = evaluateBodyCondition({
        species: pet.species,
        breed: pet.breed,
        weight: r.weight,
        ageMonths: pet.age_months
      });
      return {
        ...r,
        assessment
      };
    });

    const latestRecord = evaluatedRecords[evaluatedRecords.length - 1] || null;
    const trendAnalysis = analyzeWeightTrend(evaluatedRecords);

    // Tính toán đánh giá thể trạng tổng quát hiện tại
    const currentAssessment = latestRecord
      ? latestRecord.assessment
      : evaluateBodyCondition({
          species: pet.species,
          breed: pet.breed,
          weight: pet.initial_weight || 4.5,
          ageMonths: pet.age_months
        });

    return {
      pet,
      records: evaluatedRecords,
      latestRecord,
      currentAssessment,
      trendAnalysis,
      chartData: evaluatedRecords.map(r => ({
        date: r.recorded_date,
        weight: Number(r.weight),
        height: r.height ? Number(r.height) : null,
        condition: r.assessment?.label || 'Chưa rõ'
      }))
    };
  }

  async createRecord(petId, userId, recordData) {
    const pet = await petService.getPetById(petId, userId);

    const assessment = evaluateBodyCondition({
      species: pet.species,
      breed: pet.breed,
      weight: recordData.weight,
      ageMonths: pet.age_months
    });

    const payload = {
      ...recordData,
      pet_id: petId,
      body_condition_result: assessment.status,
      recorded_date: recordData.recorded_date || new Date().toISOString().split('T')[0]
    };

    try {
      const { data, error } = await supabase
        .from('health_records')
        .insert([payload])
        .select('*')
        .single();

      if (!error && data) {
        return { ...data, assessment };
      }
    } catch (e) {
      console.warn('[HealthService] Create fallback to memory:', e.message);
    }

    const newRec = {
      id: 'rec-' + Date.now(),
      ...payload,
      created_at: new Date().toISOString(),
      assessment
    };
    memoryRecords.push(newRec);
    return newRec;
  }

  async deleteRecord(recordId, petId, userId) {
    // Xác thực quyền sở hữu
    await petService.getPetById(petId, userId);

    try {
      await supabase
        .from('health_records')
        .delete()
        .eq('id', recordId)
        .eq('pet_id', petId);
    } catch {
      // Fallback
    }

    memoryRecords = memoryRecords.filter(r => !(r.id === recordId && r.pet_id === petId));
    return { success: true };
  }
}

module.exports = new HealthService();
