import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReadyToSell from './pages/ReadyToSell';
import ActivatedQRs from './pages/ActivatedQRs';
import ViewActivatedQR from './pages/ViewActivatedQR';
import BuyBulkTags from './pages/BuyBulkTags';
import MyBulkOrders from './pages/MyBulkOrders';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex justify-center items-center">Loading...</div>;
  if (!token) return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/ready" 
        element={
          <ProtectedRoute>
            <ReadyToSell />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/activated" 
        element={
          <ProtectedRoute>
            <ActivatedQRs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/activated/:id" 
        element={
          <ProtectedRoute>
            <ViewActivatedQR />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/buy-bulk" 
        element={
          <ProtectedRoute>
            <BuyBulkTags />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/my-orders" 
        element={
          <ProtectedRoute>
            <MyBulkOrders />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-center" />
      </Router>
    </AuthProvider>
  );
}

export default App;
