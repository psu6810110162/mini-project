import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // เช็คว่าเคยล็อกอินไว้ไหม
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // --- (ลบฟังก์ชัน handleLogout ตรงนี้ออก เพราะเราจะไปใช้ใน DashboardPage แทน) ---

  // ถ้าไม่มี Token -> โชว์หน้า Login
  if (!token) {
    return <LoginPage onLoginSuccess={(t) => setToken(t)} />;
  }

  // ถ้ามี Token -> โชว์หน้า Dashboard 
  // (เอา <div> และ <button> เดิมออก ให้เหลือแค่หน้า Dashboard เพียวๆ)
  return <Dashboard />;
}

export default App;