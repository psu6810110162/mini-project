import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // เช็คว่าเคยล็อกอินไว้ไหม (กด refresh หน้าเว็บจะไม่หลุด)
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // ถ้าไม่มี Token -> โชว์หน้า Login
  if (!token) {
    return <LoginPage onLoginSuccess={(t) => setToken(t)} />;
  }

  // ถ้ามี Token -> โชว์หน้า Dashboard (พร้อมปุ่ม Logout)
  return (
    <div>
      {/* ปุ่ม Logout ลอยขวาบน */}
      <button 
        onClick={handleLogout}
        style={{
          position: 'fixed', top: '20px', right: '20px',
          padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white',
          border: 'none', borderRadius: '5px', cursor: 'pointer', zIndex: 1000,
          fontWeight: 'bold'
        }}
      >
        🚪 ออกจากระบบ
      </button>

      {/* หน้า Dashboard เดิมของน้อง */}
      <Dashboard />
    </div>
  );
};

export default App;