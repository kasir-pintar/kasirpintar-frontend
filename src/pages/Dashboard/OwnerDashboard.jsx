// LOKASI: src/pages/Dashboard/OwnerDashboard.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getDashboardSummary } from '../../services/dashboard';
import { getAllOutlets } from '../../services/outlet';
import { jwtDecode } from 'jwt-decode';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
// --- PERBAIKAN DI SINI ---
import './OwnerDashboard.scss'; 
import { FaStore, FaMoneyBillWave, FaUsers, FaReceipt } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

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
        } catch (e) { console.error("Token tidak valid:", e); }
    }
  }, []);

  const fetchOutlets = async () => {
    try {
        const response = await getAllOutlets();
        setOutlets(response || []);
    } catch (error) {
        console.error("Gagal memuat daftar outlet:", error);
    }
  };
  
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardSummary(startDate, endDate, selectedOutletId);
      setSummary(data);
    } catch (err) {
      console.error("Gagal memuat ringkasan dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedOutletId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const dashboardRef = useRef(null);

  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const element = dashboardRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`dashboard-owner-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      alert('Terjadi kesalahan saat mengekspor PDF. Cek console untuk detail.');
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Grafik Pendapatan per Hari' },
    },
  };

  const barChartDataMemo = useMemo(() => ({
    labels: (summary?.sales_by_day || []).map(sale => new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Pendapatan (Rp)',
      data: (summary?.sales_by_day || []).map(sale => sale.total),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  }), [summary]);

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Komposisi Metode Pembayaran' },
    },
  };

  const pieChartDataMemo = useMemo(() => {
    const labels = (summary?.payment_method_composition || []).map(p => p.payment_method);
    const data = (summary?.payment_method_composition || []).map(p => p.count);
    return {
      labels,
      datasets: [{
        label: 'Jumlah Transaksi',
        data,
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)', 'rgba(255, 99, 132, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      }],
    };
  }, [summary]);

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
                <option key={outlet.ID} value={outlet.ID}>{outlet.Name || outlet.name}</option>
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
            <div className="filter-item">
              <button className="export-pdf-btn" onClick={exportToPDF}>Export PDF</button>
            </div>
        </div>
      </header>
      <main className="dashboard-container" ref={dashboardRef}>
        {loading ? <p>Memuat data...</p> : (
          <>
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
              <div className="card">
                <FaMoneyBillWave className="card-icon avg" />
                <div className="card-content">
                  <h3>Avg. per Transaksi</h3>
                  <p>Rp {(summary?.avg_per_transaction || 0).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              <div className="card">
                <FaReceipt className="card-icon discount" />
                <div className="card-content">
                  <h3>Total Diskon</h3>
                  <p>Rp {(summary?.total_discount || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div className="dashboard-main-content">
              <div className="chart-container">
                <h3>Grafik Pendapatan</h3>
                <Bar options={barChartOptions} data={barChartDataMemo} />
              </div>
              <div className="secondary-content">
                <div className="pie-chart-container">
                  <h3>Metode Pembayaran</h3>
                  <Pie options={pieChartOptions} data={pieChartDataMemo} />
                </div>
                <div className="top-products-container">
                  <h3>Produk Terlaris ({startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} - {endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })})</h3>
                  <ul>
                    {(summary?.top_products || []).map((product, index) => (
                      <li key={index}><span className="product-name">{product.name}</span><span className="product-quantity">{product.total_quantity} terjual</span></li>
                    ))}
                    {summary?.top_products?.length === 0 && <p className="no-data">Belum ada data.</p>}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default OwnerDashboardPage;