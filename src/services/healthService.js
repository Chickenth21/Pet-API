const supabase = require('../utils/supabaseClient');
const petService = require('./petService');
const { evaluateBodyCondition, analyzeWeightTrend } = require('../utils/bodyConditionScorer');

// Bộ nhớ đệm dự phòng
let memoryRecords = [];

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

      if (!error && data) records = data;
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
