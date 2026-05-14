import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { setToastCallback } from './api';
import { useEffect } from 'react';

import Layout from './components/Layout/Layout';
import LoginOverlay from './components/LoginOverlay';
import Particles from './components/Particles';

import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Clients from './pages/Clients';
import Products from './pages/Products';
import Warehouses from './pages/Warehouses';
import Employees from './pages/Employees';
import Accounting from './pages/Accounting';
import HistoryModal from './pages/HistoryModal';

import './App.css';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    setToastCallback(showToast);
  }, [showToast]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d3338' }}>
        <div style={{ color: '#fff', fontSize: 18 }}>Загрузка...</div>
      </div>
    );
  }

  return (
    <>
      <Particles />
      <LoginOverlay />
      {isAuthenticated && (
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route element={<Layout />}>
            <Route path="/history" element={<HistoryModal />} />
            <Route path="/main" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/products" element={<Products />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="*" element={<Navigate to="/orders" replace />} />
          </Route>
        </Routes>
      )}
    </>
  );
}
