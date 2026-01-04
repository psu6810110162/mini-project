import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const LoginPage: React.FC<LoginProps> = ({ }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ยิงไปที่ API Login ของเพื่อน (Person A)
      // ถ้าเพื่อนยังทำไม่เสร็จ ให้แก้บรรทัดนี้เป็น true เพื่อเทสหน้าเว็บไปก่อน
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password,
      });
      console.log("DATA ที่ได้จาก Backend:", response.data);
      
      // ถ้าล็อกอินผ่าน
      const token = response.data.access_token;
      localStorage.setItem('token', token); // เก็บ Token ไว้
      window.location.reload();// แจ้ง App ว่าผ่านแล้ว
      const role = response.data.user.role; 
      localStorage.setItem("role", role);

    } catch (err) {
      console.error(err);
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (หรือ Backend ยังไม่เปิด)');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>🌿 Log in to Smart Farm.</h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="username"
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="password"
              required 
            />
          </div>

          {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Downloading...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Styles ---
const containerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  height: '100vh', backgroundColor: '#ecf0f1'
};
const cardStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '40px', borderRadius: '10px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px'
};
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '5px', color: '#7f8c8d', fontWeight: 'bold'
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px', borderRadius: '5px',
  border: '1px solid #bdc3c7', fontSize: '16px', boxSizing: 'border-box'
};
const buttonStyle: React.CSSProperties = {
  width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white',
  border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold',
  cursor: 'pointer', transition: '0.3s'
};

export default LoginPage;