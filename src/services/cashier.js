// LOKASI: src/services/cashier.js
import api from './api';

export const fetchMenus = async () => {
    const response = await api.get('/management/menus');
    return response.data;
};

export const createTransaction = async (transactionData) => {
    const response = await api.post('/cashier/transactions', transactionData);
    return response.data;
};

// --- TAMBAHKAN FUNGSI INI ---
export const checkTransactionStatus = async (invoiceNumber) => {
    // Backend menggunakan wildcard route (*invoice), jadi kita kirim invoice apa adanya
    // Contoh URL: /cashier/transactions/status/INV/176...
    const response = await api.get(`/cashier/transactions/status/${invoiceNumber}`);
    return response.data;
};