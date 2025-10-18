// LOKASI: src/routes/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

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
import ProfilePage from '../pages/ProfilePage/ProfilePage'; // <-- IMPORT BARU

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
        <Route path="/cashier" element={<PrivateRoute allowedRoles={['cashier', 'admin', 'branch_manager']}><CashierPage /></PrivateRoute>} />
        
        {/* --- GRUP RUTE BARU UNTUK PROFIL --- */}
        {/* Diletakkan di sini agar bisa diakses semua peran yang menggunakan MainLayout */}
        <Route element={<PrivateRoute allowedRoles={['admin', 'branch_manager', 'cashier']}><MainLayout /></PrivateRoute>}>
            <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['admin', 'branch_manager']}><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardIndexPage />} />
          <Route path="/transactions" element={<TransactionHistoryPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<OperationalReportPage />} />
          <Route path="/promotions" element={<PromotionPage />} />
          <Route path="/management/menus" element={<MenuManagementPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Route>
        
        <Route element={<PrivateRoute allowedRoles={['admin']}><MainLayout /></PrivateRoute>}>
           {/* Rute khusus admin bisa ditambahkan di sini nanti */}
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;