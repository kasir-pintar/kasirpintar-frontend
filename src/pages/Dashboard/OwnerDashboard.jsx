// LOKASI: src/pages/Dashboard/OwnerDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getDashboardSummary } from '../../services/dashboard';
import { getAllOutlets } from '../../services/outlet';
import { jwtDecode } from 'jwt-decode';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// --- PERBAIKAN DI SINI ---
import './OwnerDashboard.scss'; 
import { FaStore, FaMoneyBillWave, FaUsers, FaReceipt } from 'react-icons/fa';

function OwnerDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 6)));
  const [endDate, setEndDate] = useState(new Date());
  const [outlets, setOutlets] = useState([]);
  const [selectedOutletId, setSelectedOutletId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            setUserName(decoded.name || 'Pengguna');
            fetchOutlets();
        } catch (e) { console.error("Token tidak valid"); }
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [startDate, endDate, selectedOutletId]);

  const fetchOutlets = async () => {
    try {
        const response = await getAllOutlets();
        setOutlets(response.data.data || []);
    } catch (error) {
        console.error("Gagal memuat daftar outlet:", error);
    }
  };
  
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await getDashboardSummary(startDate, endDate, selectedOutletId);
      setSummary(data);
    } catch (err) {
      console.error("Gagal memuat ringkasan dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>Dashboard Owner</h1>
          <p>Selamat Datang, {userName}!</p>
        </div>
        <div className="header-controls">
          <div className="filter-item">
            <label><FaStore /> Outlet</label>
            <select 
              value={selectedOutletId} 
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="filter-select"
            >
              <option value="">Semua Outlet</option>
              {outlets.map(outlet => (
                <option key={outlet.ID} value={outlet.ID}>{outlet.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Dari Tanggal</label>
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" className="date-input"/>
          </div>
          <div className="filter-item">
            <label>Sampai Tanggal</label>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" className="date-input"/>
          </div>
        </div>
      </header>
      <main className="dashboard-container">
        {loading ? <p>Memuat data...</p> : (
          <div className="summary-cards">
            <div className="card">
              <FaMoneyBillWave className="card-icon revenue" />
              <div className="card-content">
                <h3>Total Pendapatan</h3>
                <p>Rp {(summary?.total_revenue || 0).toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="card">
              <FaReceipt className="card-icon transaction" />
              <div className="card-content">
                <h3>Total Transaksi</h3>
                <p>{summary?.total_transactions || 0}</p>
              </div>
            </div>
            <div className="card">
              <FaUsers className="card-icon customer" />
              <div className="card-content">
                <h3>Pelanggan Baru</h3>
                <p>{summary?.new_customers || 0}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OwnerDashboardPage;