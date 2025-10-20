// LOKASI: src/routes/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Import Layouts
import MainLayout from '../layouts/MainLayout';

// Import Pages
import LandingPage from '../pages/Landing/Landing';
import LoginPage from '../pages/Login/Login';
import CashierPage from '../pages/Cashier/Cashier';
import DashboardIndexPage from '../pages/Dashboard/index';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import UserManagementPage from '../pages/UserManagementPage/UserManagementPage';
import OutletManagementPage from '../pages/OutletManagementPage/OutletManagementPage';
import TransactionHistoryPage from '../pages/TransactionHistory/TransactionHistory';
import AnalyticsPage from '../pages/AnalyticsPage/AnalyticsPage';
import OperationalReportPage from '../pages/OperationalReportPage/OperationalReportPage';
import PromotionPage from '../pages/PromotionPage/PromotionPage';
import MenuManagementPage from '../pages/MenuManagementPage/MenuManagementPage';

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
    localStorage.removeItem('authToken');
    return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Rute Publik --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* --- Rute Khusus Kasir (Tanpa Sidebar/Layout Utama) --- */}
        <Route path="/cashier" element={
          <PrivateRoute allowedRoles={['admin', 'owner', 'branch_manager', 'cashier']}>
            <CashierPage />
          </PrivateRoute>
        } />
        
        {/* === GRUP RUTE UTAMA DENGAN SIDEBAR (MainLayout) === */}

        {/* --- Level 1: Hanya bisa diakses oleh Owner & Admin --- */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'owner']}><MainLayout /></PrivateRoute>}>
          {/* Rute /users dipindahkan dari sini */}
          <Route path="/outlets" element={<OutletManagementPage />} />
        </Route>

        {/* --- Level 2: Bisa diakses oleh Manager, Owner, Admin --- */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'owner', 'branch_manager']}><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardIndexPage />} />
          {/* --- PERBAIKAN DI SINI --- */}
          <Route path="/users" element={<UserManagementPage />} /> {/* <-- Rute dipindahkan ke sini */}
          <Route path="/transactions" element={<TransactionHistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<OperationalReportPage />} />
          <Route path="/promotions" element={<PromotionPage />} />
          <Route path="/management/menus" element={<MenuManagementPage />} />
        </Route>
        
        {/* --- Level 3: Bisa diakses SEMUA peran yang login --- */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'owner', 'branch_manager', 'cashier']}><MainLayout /></PrivateRoute>}>
            <Route path="/profile" element={<ProfilePage />} />
        </Route>
        
        {/* Rute fallback jika tidak ada yang cocok */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;