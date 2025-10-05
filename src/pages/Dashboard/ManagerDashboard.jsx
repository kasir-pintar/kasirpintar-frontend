// LOKASI: src/pages/Dashboard/ManagerDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react'; // <-- Tambahkan useMemo di import
import { useNavigate } from 'react-router-dom';
import { getDashboardSummary } from '../../services/dashboard';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { jwtDecode } from 'jwt-decode';
import './ManagerDashboard.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [managerName, setManagerName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            setManagerName(decoded.name || 'Manager');
        } catch (e) { console.error("Invalid Token"); }
    }

    if (endDate < startDate) {
      setEndDate(startDate);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary(startDate, endDate);
        setSummary(data);
      } catch (err) {
        setError('Gagal memuat data dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [startDate, endDate]);
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Grafik Pendapatan per Hari' },
    },
  };

  // --- PERBAIKAN UTAMA: GUNAKAN useMemo ---
  const chartData = useMemo(() => {
    return {
      labels: (summary?.sales_by_day || []).map(sale => new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
      datasets: [
        {
          label: 'Pendapatan (Rp)',
          data: (summary?.sales_by_day || []).map(sale => sale.total),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };
  }, [summary]); // Hanya hitung ulang jika 'summary' berubah

  const formatDateRange = () => {
    const start = startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const end = endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    if (start === end) return start;
    return `${start} - ${end}`;
  };

  if (error) return <div className="dashboard-layout"><div className="dashboard-container"><p className="error-message">{error}</p></div></div>;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>Dashboard</h1>
          <p>Selamat Datang, {managerName}!</p>
        </div>
        <div className="header-controls">
          <div className="date-filter">
            <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="dd/MM/yyyy" className="date-input"/>
            <span>sampai</span>
            <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="dd/MM/yyyy" className="date-input"/>
          </div>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      <main className="dashboard-container">
        {loading ? <p>Memuat data...</p> : (
          <>
            <div className="summary-cards">
              <div className="card">
                <h3>Total Pendapatan</h3>
                <p>Rp {(summary?.total_revenue || 0).toLocaleString('id-ID')}</p>
              </div>
              <div className="card">
                <h3>Total Transaksi</h3>
                <p>{summary?.total_transactions || 0}</p>
              </div>
              <div className="card">
                <h3>Pelanggan Baru</h3>
                <p>{summary?.new_customers || 0}</p>
              </div>
            </div>
            
            <div className="dashboard-main-content">
              <div className="chart-container">
                <h3>Grafik Pendapatan</h3>
                <Bar options={chartOptions} data={chartData} />
              </div>
              <div className="top-products-container">
                <h3>Produk Terlaris ({formatDateRange()})</h3>
                <ul>
                  {(summary?.top_products || []).map((product, index) => (
                    <li key={index}>
                      <span className="product-name">{product.name}</span>
                      <span className="product-quantity">{product.total_quantity} terjual</span>
                    </li>
                  ))}
                  {summary?.top_products?.length === 0 && <p className="no-data">Belum ada data penjualan produk pada periode ini.</p>}
                </ul>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ManagerDashboardPage;