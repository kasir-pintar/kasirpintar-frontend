// LOKASI: src/routes/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Import Layouts
import MainLayout from '../layouts/MainLayout';

// Import Pages
import LandingPage from '../pages/Landing/Landing';
import LoginPage from '../pages/Login/Login';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';
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

// PrivateRoute Anda sudah benar, TIDAK PERLU DIUBAH
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* --- Rute Khusus Kasir (Tanpa Sidebar/Layout Utama) --- */}
        <Route path="/cashier" element={
          <PrivateRoute allowedRoles={['admin', 'owner', 'branch_manager', 'cashier']}>
            <CashierPage />
          </PrivateRoute>
        } />
        
        {/* === GRUP RUTE UTAMA DENGAN SIDEBAR (MainLayout) === */}

        {/* --- Level 1: Hanya bisa diakses oleh Owner & Admin --- */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'owner']}><MainLayout /></PrivateRoute>}>
          <Route path="/outlets" element={<OutletManagementPage />} />
        </Route>

        {/* --- Level 2: Bisa diakses oleh Manager, Owner, Admin --- */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'owner', 'branch_manager']}><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardIndexPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          
          {/* --- 🛑 PERBAIKAN 1 🛑 --- */}
          {/* Rute /transactions DIHAPUS DARI SINI */}
          {/* <Route path="/transactions" element={<TransactionHistoryPage />} /> */}
          
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<OperationalReportPage />} />
          <Route path="/promotions" element={<PromotionPage />} />
          <Route path="/management/menus" element={<MenuManagementPage />} />
        </Route>
        
        {/* --- Level 3: Bisa diakses SEMUA peran yang login --- */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'owner', 'branch_manager', 'cashier']}><MainLayout /></PrivateRoute>}>
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* --- 🛑 PERBAIKAN 2 🛑 --- */}
            {/* Rute /transactions DITAMBAHKAN KE SINI */}
            {/* Sekarang SEMUA role yang diizinkan (termasuk kasir) bisa mengaksesnya */}
            <Route path="/transactions" element={<TransactionHistoryPage />} />
        </Route>
        
        {/* Rute fallback jika tidak ada yang cocok */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;