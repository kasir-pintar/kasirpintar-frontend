// LOKASI: src/services/dashboard.js
import api from './api';
import { format } from 'date-fns';

export const getDashboardSummary = async (startDate, endDate) => {
    // Format tanggal ke YYYY-MM-DD
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    const response = await api.get(`/reports/dashboard?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
    return response.data;
};