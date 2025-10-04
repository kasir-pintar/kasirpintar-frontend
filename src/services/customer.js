// LOKASI: src/services/customer.js
import api from './api';

// Fungsi untuk mencari pelanggan berdasarkan query
export const searchCustomers = async (query) => {
    const response = await api.get(`/cashier/customers?search=${query}`);
    return response.data;
};

// Fungsi untuk membuat pelanggan baru
export const createCustomer = async (customerData) => {
    const response = await api.post('/cashier/customers', customerData);
    return response.data;
};