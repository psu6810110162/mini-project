import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage'; 
import RegisterPage from './pages/RegisterPage';

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={(t) => setToken(t)} />} 
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/dashboard" 
          element={token ? <DashboardPage /> : <Navigate to="/login" replace />} 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;