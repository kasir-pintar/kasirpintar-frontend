// LOKASI: src/services/promotion.js (GANTI TOTAL)

import axios from 'axios';

const getAuthToken = () => localStorage.getItem('authToken');

// --- 🛑 PERBAIKAN VITE ADA DI SINI 🛑 ---
const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8080/api'; 
// --- 🛑 AKHIR PERBAIKAN 🛑 ---

const authApi = () => {
    const token = getAuthToken();
    return axios.create({
        baseURL: getApiUrl(),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
};

/**
 * FUNGSI UNTUK CreatePromotionModal
 */
export const createPromotion = async (promotionData) => {
    try {
        const response = await authApi().post('/promotions', promotionData);
        return response.data;
    } catch (error) {
        console.error("Error creating promotion:", error.message || error);
        throw error.response?.data || error;
    }
};

/**
 * FUNGSI UNTUK CashierPage
 */
export const applyVoucher = async (voucherData) => {
    try {
        const response = await authApi().post('/promotions/apply', voucherData); 
        return response.data;
    } catch (error) { 
        console.error("Error applying voucher:", error.message || error);
        throw error.response?.data || error;
    }
}

/**
 * FUNGSI LAINNYA
 */
export const getAllPromotions = async () => {
    try {
        const response = await authApi().get('/promotions');
        return response.data;
    } catch (error) {
        console.error("Error fetching promotions:", error.message || error);
        throw error.response?.data || error;
    }
};

/**
 * FUNGSI UNTUK PromotionPage (dengan 'Id' kecil)
 */
export const getPromotionById = async (id) => {
    try {
        const response = await authApi().get(`/promotions/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching promotion by ID:", error.message || error);
        throw error.response?.data || error;
    }
};

export const updatePromotionStatus = async (id, status) => {
    try {
        const response = await authApi().patch(`/promotions/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating promotion status:", error.message || error);
        throw error.response?.data || error;
    }
};