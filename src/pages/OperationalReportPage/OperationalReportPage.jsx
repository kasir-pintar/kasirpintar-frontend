// LOKASI: src/pages/OperationalReportPage/OperationalReportPage.jsx
import React, { useState, useMemo } from 'react';
import { getBasketAnalysis, getBusyHours, getCustomerSegmentation } from '../../services/analytics';
import './OperationalReportPage.scss';
import { FaShoppingCart, FaClock, FaUsers, FaCrown, FaStar, FaHeart, FaUserPlus, FaUserClock, FaUserSlash } from 'react-icons/fa';

// Komponen Heatmap (tidak berubah)
const BusyHoursHeatmap = ({ data }) => {
  const hours = Array.from({ length: 15 }, (_, i) => i + 9); 
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const { grid, maxCount } = useMemo(() => {
    const grid = Array(7).fill(0).map(() => Array(24).fill(0));
    let maxCount = 0;
    if (data) {
      data.forEach(item => {
        const dayIndex = item.day_of_week - 1;
        grid[dayIndex][item.hour] = item.count;
        if (item.count > maxCount) {
          maxCount = item.count;
        }
      });
    }
    return { grid, maxCount };
  }, [data]);

  const getCellColor = (count) => {
    if (count === 0) return '#eff3f7';
    const intensity = count / maxCount;
    const hue = 120 * (1 - intensity);
    return `hsl(${hue}, 100%, 80%)`;
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-legend">
        <span>Sepi</span>
        <div className="gradient-bar"></div>
        <span>Ramai</span>
      </div>
      <div className="heatmap-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Hari</th>
              {hours.map(hour => <th key={hour}>{String(hour).padStart(2, '0')}:00</th>)}
            </tr>
          </thead>
          <tbody>
            {days.map((dayName, dayIndex) => (
              <tr key={dayName}>
                <td>{dayName}</td>
                {hours.map(hour => {
                  const count = grid[dayIndex][hour] || 0;
                  return (
                    <td 
                      key={`${dayName}-${hour}`} 
                      style={{ backgroundColor: getCellColor(count) }}
                      title={`${count} transaksi`}
                    >
                      {count > 0 ? count : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function OperationalReportPage() {
  const [basketData, setBasketData] = useState(null);
  const [basketLoading, setBasketLoading] = useState(false);
  const [basketError, setBasketError] = useState('');
  
  const [busyHoursData, setBusyHoursData] = useState(null);
  const [busyHoursLoading, setBusyHoursLoading] = useState(false);
  const [busyHoursError, setBusyHoursError] = useState('');

  // State baru untuk segmentasi pelanggan
  const [customerData, setCustomerData] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState('');
  const [activeSegment, setActiveSegment] = useState(null);

  const handleGetBasketAnalysis = async () => {
    try {
      setBasketLoading(true);
      setBasketError('');
      setBasketData(null);
      const analysisResult = await getBasketAnalysis();
      setBasketData(analysisResult);
    } catch (err) {
      setBasketError(err.toString());
    } finally {
      setBasketLoading(false);
    }
  };
  
  const handleGetBusyHours = async () => {
    try {
      setBusyHoursLoading(true);
      setBusyHoursError('');
      setBusyHoursData(null);
      const analysisResult = await getBusyHours();
      setBusyHoursData(analysisResult);
    } catch (err) {
      setBusyHoursError(err.toString());
    } finally {
      setBusyHoursLoading(false);
    }
  };

  // Fungsi baru untuk Analisis Pelanggan
  const handleGetCustomerSegmentation = async () => {
    try {
      setCustomerLoading(true);
      setCustomerError('');
      setCustomerData(null);
      setActiveSegment(null);
      const analysisResult = await getCustomerSegmentation();
      setCustomerData(analysisResult);
    } catch (err) {
      setCustomerError(err.toString());
    } finally {
      setCustomerLoading(false);
    }
  };

  // Mengelompokkan pelanggan berdasarkan segmen
  const customerSegments = useMemo(() => {
    if (!customerData) return {};
    return customerData.reduce((acc, customer) => {
      const segment = customer.segment;
      if (!acc[segment]) {
        acc[segment] = [];
      }
      acc[segment].push(customer);
      return acc;
    }, {});
  }, [customerData]);

  const segmentInfo = {
    "Pelanggan Juara": { icon: <FaCrown />, color: "#ffc107", desc: "Baru saja beli, sering beli, dan total belanja besar. Pelanggan terbaik Anda." },
    "Pelanggan Setia": { icon: <FaStar />, color: "#007bff", desc: "Sering beli, tapi mungkin total belanjanya standar. Tulang punggung bisnis." },
    "Pelanggan Potensial": { icon: <FaHeart />, color: "#28a745", desc: "Baru saja beli, namun belum terlalu sering. Berpotensi menjadi Pelanggan Setia." },
    "Pelanggan Baru": { icon: <FaUserPlus />, color: "#17a2b8", desc: "Hanya pernah melakukan satu kali transaksi. Perlu didorong untuk kembali." },
    "Pelanggan Berisiko": { icon: <FaUserClock />, color: "#fd7e14", desc: "Dulu sering beli, tapi sudah lama tidak kembali. Perlu diaktifkan kembali." },
    "Pelanggan Tidur": { icon: <FaUserSlash />, color: "#dc3545", desc: "Sudah sangat lama tidak kembali. Paling sulit untuk diaktifkan kembali." },
  };

  const segmentOrder = ["Pelanggan Juara", "Pelanggan Setia", "Pelanggan Potensial", "Pelanggan Baru", "Pelanggan Berisiko", "Pelanggan Tidur"];
  
  return (
    <div className="operational-report-container">
      <div className="operational-report-header">
        <h1>Laporan Operasional</h1>
        <p>Analisis data historis untuk menemukan pola dan wawasan operasional.</p>
      </div>

      <div className="basket-analysis-panel card">
        <h3><FaShoppingCart /> Analitik Keranjang Belanja</h3>
        <p>Temukan pasangan produk yang paling sering dibeli bersama oleh pelanggan untuk membuat strategi bundling atau promosi.</p>
        <div className="analysis-controls">
          <button onClick={handleGetBasketAnalysis} disabled={basketLoading}>
            {basketLoading ? 'Menganalisis...' : 'Jalankan Analisis'}
          </button>
        </div>
        
        {basketError && <p className="error-message small">{basketError}</p>}

        {basketData && (
          <div className="analysis-result">
            <h5>Top 10 Pasangan Produk Terlaris</h5>
            {basketData.length > 0 ? (
              <ul className="product-pairs-list">
                {basketData.map((pair, index) => (
                  <li key={index}>
                    <div className="pair-names">
                      <span>{pair.product_1}</span> + <span>{pair.product_2}</span>
                    </div>
                    <div className="pair-frequency">
                      {pair.frequency}x dibeli bersama
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">Tidak ditemukan pasangan produk yang signifikan.</p>
            )}
          </div>
        )}
      </div>

      <div className="busy-hours-panel card">
        <h3><FaClock /> Analitik Waktu Sibuk</h3>
        <p>Visualisasikan jam dan hari paling ramai transaksi untuk membantu optimisasi jadwal staf dan merancang strategi promosi.</p>
        <div className="analysis-controls">
          <button onClick={handleGetBusyHours} disabled={busyHoursLoading}>
            {busyHoursLoading ? 'Menganalisis...' : 'Jalankan Analisis Waktu Sibuk'}
          </button>
        </div>
        
        {busyHoursError && <p className="error-message small">{busyHoursError}</p>}
        
        {busyHoursData && (
          <BusyHoursHeatmap data={busyHoursData} />
        )}
      </div>

      <div className="customer-segmentation-panel card">
        <h3><FaUsers /> Analitik Pelanggan (Segmentasi RFM)</h3>
        <p>Kelompokkan pelanggan Anda ke dalam segmen-segmen berharga untuk strategi marketing yang lebih cerdas dan bertarget.</p>
        <div className="analysis-controls">
          <button onClick={handleGetCustomerSegmentation} disabled={customerLoading}>
            {customerLoading ? 'Menganalisis...' : 'Jalankan Segmentasi Pelanggan'}
          </button>
        </div>
        
        {customerError && <p className="error-message small">{customerError}</p>}
        
        {customerData && (
          <div className="segmentation-results">
            <div className="segment-summary-cards">
              {segmentOrder.map(segmentName => {
                const segment = customerSegments[segmentName] || [];
                const info = segmentInfo[segmentName];
                if (!info) return null;
                return (
                  <div key={segmentName} className={`segment-card ${activeSegment === segmentName ? 'active' : ''}`} onClick={() => setActiveSegment(segmentName)} style={{ borderLeftColor: info.color }}>
                    <div className="segment-card-header">
                      <span className="icon" style={{ backgroundColor: info.color }}>{info.icon}</span>
                      <h5>{segmentName}</h5>
                    </div>
                    <div className="segment-card-body">
                      <span className="count">{segment.length}</span> Pelanggan
                    </div>
                    <div className="segment-card-desc">{info.desc}</div>
                  </div>
                );
              })}
            </div>
            {activeSegment && customerSegments[activeSegment] && (
              <div className="segment-details">
                <h4>Daftar Pelanggan di Segmen "{activeSegment}"</h4>
                <div className="customer-list-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>No. Telepon</th>
                        <th>Transaksi Terakhir</th>
                        <th>Frekuensi</th>
                        <th>Total Belanja (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerSegments[activeSegment].map(customer => (
                        <tr key={customer.customer_id}>
                          <td>{customer.name}</td>
                          <td>{customer.phone_number}</td>
                          <td>{new Date(customer.last_purchase).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                          <td>{customer.frequency}x</td>
                          <td>{customer.monetary.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OperationalReportPage;