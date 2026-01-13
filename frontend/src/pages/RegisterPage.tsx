import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; 

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/auth/register', { username, password });
      await Swal.fire({
        title: "สมัครสมาชิกสำเร็จ!",
        text: "ยินดีด้วย! คุณสามารถเข้าสู่ระบบได้แล้ว",
        icon: "success",
        confirmButtonColor: "#3498db",
        confirmButtonText: "ตกลง",
      });

      navigate('/login');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่';

      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#e74c3c",
      });
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>📝 Register</h2>
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={inputStyle} 
              placeholder="ตั้งชื่อผู้ใช้งาน"
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
              placeholder="ตั้งรหัสผ่าน"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            style={{...buttonStyle, backgroundColor: '#3498db'}} 
            disabled={loading}
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : 'สมัครสมาชิก (Sign Up)'}
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
            มีบัญชีอยู่แล้ว? 
            <span 
              onClick={() => navigate('/login')} 
              style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
            >
              เข้าสู่ระบบ
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = { 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  height: '100vh', 
  backgroundColor: '#ecf0f1' 
};

const cardStyle: React.CSSProperties = { 
  backgroundColor: 'white', 
  padding: '40px', 
  borderRadius: '15px', 
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
  width: '100%', 
  maxWidth: '380px' 
};

const labelStyle: React.CSSProperties = { 
  display: 'block', 
  marginBottom: '8px', 
  color: '#7f8c8d', 
  fontSize: '14px', 
  fontWeight: 'bold' 
};

const inputStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '12px', 
  borderRadius: '8px', 
  border: '1px solid #dcdde1', 
  fontSize: '16px', 
  boxSizing: 'border-box', 
  backgroundColor: '#f9f9f9',
  marginBottom: '10px'
};

const buttonStyle: React.CSSProperties = { 
  width: '100%', 
  padding: '14px', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  fontSize: '16px', 
  fontWeight: 'bold', 
  cursor: 'pointer',
  marginTop: '10px',
  transition: '0.3s'
};

export default RegisterPage;