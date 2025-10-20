import api from './api';
import { format } from 'date-fns';

export const getDashboardSummary = async (startDate, endDate, outletId) => {
  // Siapkan parameter untuk query URL
  const params = new URLSearchParams({
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
  });

  // Jika ada outletId yang dikirim (bukan string kosong), tambahkan ke parameter
  if (outletId) {
    params.append('outlet_id', outletId);
  }

  // Kirim request dengan parameter yang sudah disusun
  const response = await api.get(`/reports/dashboard?${params.toString()}`);
  return response.data;
};