// LOKASI: src/pages/OperationalReportPage/OperationalReportPage.jsx
import React, { useState, useMemo } from 'react';
import { getBasketAnalysis, getBusyHours } from '../../services/analytics';
import './OperationalReportPage.scss';
import { FaShoppingCart, FaClock } from 'react-icons/fa';

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
    </div>
  );
}

export default OperationalReportPage;