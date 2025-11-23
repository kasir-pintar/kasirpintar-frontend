// LOKASI: src/pages/Dashboard/ManagerDashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Pastikan useNavigate di-import
import { getDashboardSummary } from '../../services/dashboard';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { jwtDecode } from 'jwt-decode'; // Pastikan jwtDecode di-import
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './ManagerDashboard.scss';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function ManagerDashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [managerName, setManagerName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const dashboardRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
        try {
            const decoded = jwtDecode(token);
            setManagerName(decoded.name || 'branch_manager');
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

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Grafik Pendapatan per Hari' },
    },
  };

  const barChartData = useMemo(() => {
    return {
      labels: (summary?.sales_by_day || []).map(sale => new Date(sale.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })),
      datasets: [{
        label: 'Pendapatan (Rp)',
        data: (summary?.sales_by_day || []).map(sale => sale.total),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    };
  }, [summary]);
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Komposisi Metode Pembayaran' },
    },
  };

  const pieChartData = useMemo(() => {
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

  const formatDateRange = () => {
    const start = startDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const end = endDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    if (startDate.toDateString() === endDate.toDateString()) return start;
    return `${start} - ${end}`;
  };

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

      pdf.save(`dashboard-manager-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
      alert('Terjadi kesalahan saat mengekspor PDF. Cek console untuk detail.');
    }
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
          <button className="export-pdf-btn" onClick={exportToPDF}>Export PDF</button>
        </div>
      </header>

      <main className="dashboard-container" ref={dashboardRef}>
        {loading ? <p>Memuat data...</p> : (
          <>
            <div className="summary-cards">
              <div className="card"><h3>Total Pendapatan</h3><p>Rp {(summary?.total_revenue || 0).toLocaleString('id-ID')}</p></div>
              <div className="card"><h3>Total Transaksi</h3><p>{summary?.total_transactions || 0}</p></div>
              <div className="card"><h3>Pelanggan Baru</h3><p>{summary?.new_customers || 0}</p></div>
              <div className="card"><h3>Avg. per Transaksi</h3><p>Rp {(summary?.avg_per_transaction || 0).toLocaleString('id-ID', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p></div>
              <div className="card"><h3>Total Diskon</h3><p>Rp {(summary?.total_discount || 0).toLocaleString('id-ID')}</p></div>
            </div>
            
            <div className="dashboard-main-content">
              <div className="chart-container">
                <h3>Grafik Pendapatan</h3>
                <Bar options={barChartOptions} data={barChartData} />
              </div>
              <div className="secondary-content">
                <div className="pie-chart-container">
                  <h3>Metode Pembayaran</h3>
                  <Pie options={pieChartOptions} data={pieChartData} />
                </div>
                <div className="top-products-container">
                  <h3>Produk Terlaris ({formatDateRange()})</h3>
                  <ul>
                    {(summary?.top_products || []).map((product, index) => (<li key={index}><span className="product-name">{product.name}</span><span className="product-quantity">{product.total_quantity} terjual</span></li>))}
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

export default ManagerDashboardPage;