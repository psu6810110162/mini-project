import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HistoryChart from './HistoryChart';

// --- Interfaces ---
interface Device {
  id: number;
  name: string;
  type: string;
  is_active: boolean;
}
interface Greenhouse {
  id: number;
  name: string;
  temp: number;
  humidity: number;
  devices: Device[];
}

const DashboardPage = () => {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || 'USER';

  // State Modal
  const [showGhModal, setShowGhModal] = useState(false);
  const [newGhName, setNewGhName] = useState('');
  const [showDevModal, setShowDevModal] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState('FAN');
  const [selectedGhId, setSelectedGhId] = useState<number | null>(null);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // --- 🛠️ ฟังก์ชันดึงข้อมูล (แก้ให้ตัวเลขขยับแล้ว) ---
  const fetchData = async () => {
    try {
      // 1. ดึงรายชื่อโรงเรือน
      const res = await axios.get('http://localhost:3000/greenhouses', authConfig);
      const ghList = res.data;

      // 2. ดึงค่าล่าสุดมาอัปเดตกล่องตัวเลข
      const updatedList = await Promise.all(ghList.map(async (gh: Greenhouse) => {
        try {
          // ใช้ URL เดียวกับที่กราฟใช้เพื่อให้ได้ข้อมูลล่าสุด
          const historyRes = await axios.get(`http://localhost:3000/greenhouses/${gh.id}/history`, authConfig);
          const readings = historyRes.data;

          if (readings && readings.length > 0) {
            const latest = readings[0]; // Backend ส่ง DESC มา ค่าล่าสุดอยู่ตำแหน่งที่ 0
            return { 
              ...gh, 
              temp: latest.temp, 
              humidity: latest.humidity 
            };
          }
        } catch (err) {
          console.error(`Error fetching latest data for GH ${gh.id}`);
        }
        return gh;
      }));

      setGreenhouses(updatedList);
    } catch (error) { 
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
  if (!token) {
    window.location.href = '/login'; 
    return;
  }
  
  fetchData(); // ดึงครั้งแรกทันทีที่เปิดหน้า

  // ⏱️ ตั้งให้ดึงข้อมูลใหม่ทุก 2 วินาที (เร็วกว่าการสุ่มของหลังบ้านนิดหน่อยเพื่อให้ข้อมูลสดเสมอ)
  const interval = setInterval(fetchData, 2000); 
  
  return () => clearInterval(interval);
}, [token]);

  // --- Actions ---
  const saveGreenhouse = async () => {
    if (!newGhName) return alert("กรุณาใส่ชื่อโรงเรือน");
    try {
      await axios.post('http://localhost:3000/greenhouses', { name: newGhName }, authConfig);
      setShowGhModal(false);
      setNewGhName('');
      fetchData();
    } catch (err) { alert("เกิดข้อผิดพลาดในการบันทึก"); }
  };

  const openAddDeviceModal = (ghId: number) => {
    setSelectedGhId(ghId);
    setNewDevName('');
    setNewDevType('FAN');
    setShowDevModal(true);
  };

  const saveDevice = async () => {
    if (!newDevName || selectedGhId === null) return alert("ข้อมูลไม่ครบ");
    try {
      await axios.post('http://localhost:3000/devices', {
        name: newDevName, type: newDevType, greenhouseId: selectedGhId
      }, authConfig);
      setShowDevModal(false);
      fetchData();
    } catch (err) { alert("เกิดข้อผิดพลาด"); }
  };

  const toggleDevice = async (id: number, status: boolean) => {
    try {
      await axios.patch(`http://localhost:3000/devices/${id}/toggle`, {}, authConfig);
      fetchData();
  } catch (err) {
    console.error("กดเปิดปิดไม่ได้:", err);
    alert("เกิดข้อผิดพลาดในการสั่งงานอุปกรณ์");
  }
};

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* --- ✨ New Header Section --- */}
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={{ flex: 1 }}>
            <h1 style={brandTitleStyle}>🌿 Smart Farm Monitoring</h1>
            <p style={brandSubtitleStyle}>ระบบบริหารจัดการสภาพแวดล้อมและอุปกรณ์อัตโนมัติ</p>
          </div>
          <div style={userActionStyle}>
             <span style={roleBadgeStyle}>{userRole}</span>
             <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} style={logoutBtnStyle}>ออกจากระบบ</button>
          </div>
        </div>
        
        <div style={actionRowStyle}>
          <div style={innerActionRowStyle}>
            {userRole === 'ADMIN' && (
              <button onClick={() => setShowGhModal(true)} style={addGhButtonStyle}>
                + เพิ่มโรงเรือนใหม่
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <div style={containerStyle}>
        <div style={gridContainerStyle}>
          {greenhouses.map((gh) => (
            <div key={gh.id} style={cardStyle}>
              
              <div style={cardHeaderStyle}>
                <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '26px' }}>🏡 {gh.name}</h3>
                <span style={idBadgeStyle}>Device ID: {gh.id}</span>
              </div>

              {/* Sensor Display */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                <div style={sensorBoxStyle('#fff5f5', '#e53e3e')}>
                  <span style={sensorLabelStyle}>อุณหภูมิ</span>
                  <strong style={sensorValueStyle}>{gh.temp ?? '--'}°C</strong>
                </div>
                <div style={sensorBoxStyle('#e3f2fd', '#1565c0')}>
                  <span style={sensorLabelStyle}>ความชื้น</span>
                  <strong style={sensorValueStyle}>{gh.humidity ?? '--'}%</strong>
                </div>
              </div>

              {/* Device Controls */}
              <div style={{ marginBottom: '20px' }}>
                <p style={controlHeaderStyle}>อุปกรณ์ควบคุม</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {gh.devices?.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => toggleDevice(device.id, device.is_active)}
                      style={{
                        ...deviceButtonStyle,
                        backgroundColor: device.is_active ? '#2ecc71' : '#fff',
                        color: device.is_active ? '#fff' : '#7f8c8d',
                        borderColor: device.is_active ? '#2ecc71' : '#dcdde1'
                      }}
                    >
                      {device.type === 'FAN' ? '💨' : device.type === 'PUMP' ? '💦' : '💡'} 
                      <span style={{ marginLeft: '6px' }}>{device.name}</span>
                    </button>
                  ))}
                  {userRole === 'ADMIN' && (
                      <button onClick={() => openAddDeviceModal(gh.id)} style={addDeviceBtnStyle}>+</button>
                  )}
                </div>
              </div>

              {/* Chart Section */}
              <div style={chartWrapperStyle}>
                 <HistoryChart ghId={gh.id} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Modals (Keep your existing modals logic) --- */}
      {showGhModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>🏠 สร้างโรงเรือนใหม่</h3>
            <input type="text" placeholder="ชื่อโรงเรือน..." value={newGhName} onChange={(e) => setNewGhName(e.target.value)} style={inputStyle} />
            <div style={actionBtnContainer}>
              <button onClick={() => setShowGhModal(false)} style={cancelButtonStyle}>ยกเลิก</button>
              <button onClick={saveGreenhouse} style={saveButtonStyle}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {showDevModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>⚙️ เพิ่มอุปกรณ์ใหม่</h3>
            <label style={labelStyle}>ชื่ออุปกรณ์:</label>
            <input type="text" placeholder="เช่น พัดลม 1" value={newDevName} onChange={(e) => setNewDevName(e.target.value)} style={inputStyle} />
            <label style={{...labelStyle, marginTop: '15px'}}>ประเภท:</label>
            <select value={newDevType} onChange={(e) => setNewDevType(e.target.value)} style={inputStyle}>
              <option value="FAN">💨 พัดลม</option>
              <option value="PUMP">💦 ปั๊มน้ำ</option>
              <option value="LIGHT">💡 หลอดไฟ</option>
            </select>
            <div style={actionBtnContainer}>
              <button onClick={() => setShowDevModal(false)} style={cancelButtonStyle}>ยกเลิก</button>
              <button onClick={saveDevice} style={saveButtonStyle}>บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 🎨 STYLES (ปรับปรุงใหม่ทั้งหมด) ---
const headerStyle: React.CSSProperties = {
  backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0',
  padding: '40px 0 0 0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
};
const headerInnerStyle: React.CSSProperties = {
  maxWidth: '1400px', width: '95%', margin: '0 auto', display: 'flex', 
  justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '30px'
};
const brandTitleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: '800', color: '#1a1a1a', margin: 0 };
const brandSubtitleStyle: React.CSSProperties = { fontSize: '16px', color: '#95a5a6', margin: '5px 0 0 0' };
const userActionStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px' };
const roleBadgeStyle: React.CSSProperties = { backgroundColor: '#3498db', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };
const logoutBtnStyle: React.CSSProperties = { backgroundColor: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' };

const actionRowStyle: React.CSSProperties = { backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '15px 0' };
const innerActionRowStyle: React.CSSProperties = { maxWidth: '1400px', width: '95%', margin: '0 auto' };
const addGhButtonStyle: React.CSSProperties = { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(39, 174, 96, 0.2)' };

const containerStyle: React.CSSProperties = { maxWidth: '1400px', width: '95%', margin: '0 auto', padding: '40px 0' };
const gridContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '30px' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minHeight: '680px', border: '1px solid #f0f0f0' };
const cardHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const idBadgeStyle: React.CSSProperties = { color: '#bdc3c7', fontSize: '12px', fontWeight: 'bold' };

const sensorBoxStyle = (bg: string, col: string): React.CSSProperties => ({ flex: 1, backgroundColor: bg, color: col, padding: '20px', borderRadius: '20px', textAlign: 'center' });
const sensorLabelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.7, display: 'block', marginBottom: '5px' };
const sensorValueStyle: React.CSSProperties = { fontSize: '36px', fontWeight: '800' };

const controlHeaderStyle: React.CSSProperties = { margin: '0 0 12px 0', fontSize: '12px', color: '#95a5a6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' };
const deviceButtonStyle: React.CSSProperties = { padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', border: '1px solid', transition: 'all 0.2s' };
const addDeviceBtnStyle: React.CSSProperties = { width: '42px', height: '42px', border: '2px dashed #dcdde1', background: 'none', borderRadius: '12px', color: '#bdc3c7', fontSize: '20px', cursor: 'pointer' };
const chartWrapperStyle: React.CSSProperties = { width: '100%', height: '350px', marginTop: 'auto', borderTop: '1px solid #f9f9f9', paddingTop: '20px' };

// Modal Styles (Remain similar to your original for functionality)
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '35px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', marginTop: '10px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333' };
const actionBtnContainer: React.CSSProperties = { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' };
const saveButtonStyle: React.CSSProperties = { padding: '10px 25px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const cancelButtonStyle: React.CSSProperties = { padding: '10px 25px', backgroundColor: '#f1f2f6', color: '#7f8c8d', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default DashboardPage;