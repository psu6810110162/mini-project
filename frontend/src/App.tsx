import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage'; 
import RegisterPage from './pages/RegisterPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function AuthRoutes() {
  const { token } = useAuth() as any;

  return (
    <Routes>
      {/* หน้า Login: ถ้าล็อกอินแล้วไป Dashboard ถ้ายังให้โชว์หน้า Login */}
      <Route 
        path="/login" 
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />

      {/* หน้า Register */}
      <Route path="/register" element={<RegisterPage />} />

      {/* หน้า Dashboard: ถ้าไม่มี Token ให้กลับไป Login */}
      <Route 
        path="/dashboard" 
        element={token ? <Dashboard /> : <Navigate to="/login" replace />} 
      />

      {/* หน้าแรกและหน้าอื่นๆ */}
      <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;