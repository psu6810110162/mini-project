import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
// อย่าลืมเช็คชื่อไฟล์ DashboardPage หรือ Dashboard ให้ตรงกับที่น้องมีนะครับ
import Dashboard from './pages/DashboardPage'; 
import RegisterPage from './pages/RegisterPage';

function App() {
  // ดึง token มาเก็บไว้ตั้งแต่เริ่ม
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
  };

  return (
    <Router>
      <Routes>
        {/* หน้า Login: ถ้าล็อกอินแล้วไป Dashboard ถ้ายังให้โชว์หน้า Login */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* หน้า Register */}
        <Route path="/register" element={<RegisterPage />} />

        {/* หน้า Dashboard: ถ้าไม่มี Token ให้กลับไป Login */}
        <Route 
          path="/dashboard" 
          element={token ? <Dashboard /> : <Navigate to="/login" replace />} 
        />

        {/* หน้าแรกและหน้าอื่นๆ */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;