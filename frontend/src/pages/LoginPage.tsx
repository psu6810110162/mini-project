import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ยิง API Login
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password,
      });

      console.log("Login Success:", response.data);

      const token = response.data.access_token;
      const role = response.data.user.role;

      // เก็บและอัปเดต auth state ผ่าน Context
      login(token, role);
      
      // เก็บลง LocalStorage สำหรับ DashboardPage ใช้
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', response.data.user.username);
      
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>🌿 Log in to Smart Farm.</h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>ชื่อผู้ใช้</label>
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
            <label style={labelStyle}>รหัสผ่าน</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="password"
              required 
            />
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#7f8c8d' }}>
            ยังไม่มีบัญชี?
            <span 
              onClick={() => navigate('/register')}
              style={{ color: '#27ae60', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
            >
              สมัครสมาชิก
            </span>
          </p>
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
  backgroundColor: 'white', padding: '40px', borderRadius: '15px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px'
};
const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '5px', color: '#7f8c8d', fontWeight: 'bold'
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', borderRadius: '8px',
  border: '1px solid #bdc3c7', fontSize: '16px', boxSizing: 'border-box'
};
const buttonStyle: React.CSSProperties = {
  width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white',
  border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
  cursor: 'pointer', transition: '0.3s'
};

export default LoginPage;