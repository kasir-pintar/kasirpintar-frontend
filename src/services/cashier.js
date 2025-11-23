// LOKASI: src/services/cashier.js
import api from './api';

export const fetchMenus = async () => {
    const response = await api.get('/management/menus');
    return response.data;
};

export const createTransaction = async (transactionData) => {
    const response = await api.post('/cashier/transactions', transactionData);
    return response.data; // Pastikan ada return di sini
};