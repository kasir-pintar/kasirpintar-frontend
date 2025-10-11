// LOKASI: src/services/promotion.js
import api from './api';

export const getAllPromotions = async () => {
  try {
    const response = await api.get('/promotions/');
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil data promosi:", error);
    // PERBAIKAN: .message -> .error
    throw error.response?.data?.error || "Gagal menghubungi layanan promosi.";
  }
};

export const getPromotionById = async (promoId) => {
  try {
    const response = await api.get(`/promotions/${promoId}`);
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil detail promosi:", error);
    // PERBAIKAN: .message -> .error
    throw error.response?.data?.error || "Gagal menghubungi layanan promosi.";
  }
};

export const createPromotion = async (promotionData) => {
  try {
    const response = await api.post('/promotions/', promotionData);
    return response.data;
  } catch (error) {
    console.error("Gagal membuat promosi:", error);
    // PERBAIKAN: .message -> .error
    throw error.response?.data?.error || "Gagal menghubungi layanan promosi.";
  }
};

export const updatePromotionStatus = async (promoId, status) => {
  try {
    const response = await api.patch(`/promotions/${promoId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Gagal memperbarui status promosi:", error);
    // PERBAIKAN: .message -> .error
    throw error.response?.data?.error || "Gagal menghubungi layanan promosi.";
  }
};

export const applyVoucher = async (code) => {
  try {
    const response = await api.post('/cashier/vouchers/apply', { code });
    return response.data;
  } catch (error) {
    console.error("Gagal menerapkan voucher:", error);
    // PERBAIKAN: .message -> .error
    throw error.response?.data?.error || "Voucher tidak valid atau terjadi kesalahan.";
  }
};