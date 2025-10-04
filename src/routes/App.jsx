// LOKASI: src/App.jsx (FINAL DENGAN HAK AKSES KASIR)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import LandingPage from '../pages/Landing/Landing';
import LoginPage from '../pages/Login/Login';
import CashierPage from '../pages/Cashier/Cashier';
import DashboardPage from '../pages/Dashboard/Dashboard';
import TransactionHistoryPage from '../pages/TransactionHistory/TransactionHistory';
import UserManagementPage from '../pages/UserManagement/UserManagement';

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
        <Route path="/dashboard" element={<PrivateRoute allowedRoles={['admin', 'manager']}><DashboardPage /></PrivateRoute>} />
        
        {/* --- PERUBAHAN DI BARIS INI --- */}
        <Route path="/transactions" element={<PrivateRoute allowedRoles={['admin', 'manager', 'cashier']}><TransactionHistoryPage /></PrivateRoute>} />

        <Route path="/admin/users" element={<PrivateRoute allowedRoles={['admin']}><UserManagementPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;