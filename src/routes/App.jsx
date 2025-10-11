// LOKASI: src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Halaman-halaman
import LandingPage from '../pages/Landing/Landing';
import LoginPage from '../pages/Login/Login';
import CashierPage from '../pages/Cashier/Cashier';
import DashboardIndexPage from '../pages/Dashboard/index';
import TransactionHistoryPage from '../pages/TransactionHistory/TransactionHistory';
import AnalyticsPage from '../pages/AnalyticsPage/AnalyticsPage';
import UserManagementPage from '../pages/UserManagement/UserManagement';
import OperationalReportPage from '../pages/OperationalReportPage/OperationalReportPage';
import PromotionPage from '../pages/PromotionPage/PromotionPage'; // <-- IMPORT BARU

// Layout
import MainLayout from '../layouts/MainLayout';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('authToken');
  if (!token) return <Navigate to="/login" />;
  try {
    const userRole = jwtDecode(token).role;
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return userRole === 'cashier' ? <Navigate to="/cashier" /> : <Navigate to="/dashboard" />;
    }
    return children;
  } catch (error) {
    return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cashier" element={<PrivateRoute allowedRoles={['cashier', 'admin', 'manager']}><CashierPage /></PrivateRoute>} />

        {/* Rute di dalam MainLayout untuk Admin & Manager */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'manager']}><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardIndexPage />} />
          <Route path="/transactions" element={<TransactionHistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<OperationalReportPage />} />
          
          {/* --- RUTE BARU DI SINI --- */}
          <Route path="/promotions" element={<PromotionPage />} />
        </Route>
        
        {/* Rute khusus Admin (jika ada, di luar MainLayout) */}
        <Route element={<PrivateRoute allowedRoles={['admin']}><MainLayout /></PrivateRoute>}>
            <Route path="/admin/users" element={<UserManagementPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;