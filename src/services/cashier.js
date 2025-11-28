// LOKASI: src/services/cashier.js (GANTI TOTAL)

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
 * Mengambil semua menu untuk kasir
 */
export const fetchMenus = async () => {
    try {
        const response = await authApi().get('/management/menus');
        return response.data; 
    } catch (error) {
        console.error("Error fetching menus:", error.message || error);
        throw error.response?.data || error;
    }
};

/**
 * Membuat transaksi baru (Tunai atau QRIS)
 */
export const createTransaction = async (transactionData) => {
    try {
        const response = await authApi().post('/cashier/transactions', transactionData);
        return response.data; // Akan berisi { data, qr_string, midtrans_response }
    } catch (error) {
        console.error("Error creating transaction:", error.message || error);
        throw error.response?.data || error;
    }
};

/**
 * Mengecek status transaksi via polling
 */
export const checkTransactionStatus = async (invoiceNumber) => {
    try {
        const response = await authApi().get(`/cashier/transactions/status/${invoiceNumber}`);
        return response.data; // Akan berisi { status, id, invoice_number }
    } catch (error) {
        console.error("Error checking status:", error.message || error);
        throw error.response?.data || error;
    }
};