// LOKASI: src/routes/App.jsx
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
import UserManagementPage from '../pages/UserManagementPage/UserManagementPage';
import OperationalReportPage from '../pages/OperationalReportPage/OperationalReportPage';
import PromotionPage from '../pages/PromotionPage/PromotionPage';
import MenuManagementPage from '../pages/MenuManagementPage/MenuManagementPage';
// import OutletManagementPage from '../pages/OutletManagementPage/OutletManagementPage'; // <-- DIHAPUS UNTUK SEMENTARA

// Layout
import MainLayout from '../layouts/MainLayout';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/login" />;
  }

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
        {/* Rute Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rute Khusus Kasir (juga bisa diakses admin/manager) */}
        <Route path="/cashier" element={<PrivateRoute allowedRoles={['cashier', 'admin', 'manager']}><CashierPage /></PrivateRoute>} />

        {/* Rute untuk Admin & Manajer */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'manager']}><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardIndexPage />} />
          <Route path="/transactions" element={<TransactionHistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<OperationalReportPage />} />
          <Route path="/promotions" element={<PromotionPage />} />
          <Route path="/management/menus" element={<MenuManagementPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Route>
        
        {/* Rute HANYA UNTUK ADMIN */}
        <Route element={<PrivateRoute allowedRoles={['admin']}><MainLayout /></PrivateRoute>}>
           {/* <Route path="/admin/outlets" element={<OutletManagementPage />} /> */} {/* <-- DIHAPUS UNTUK SEMENTARA */}
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;