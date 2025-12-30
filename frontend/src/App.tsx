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
  
  // State Modal
  const [showGhModal, setShowGhModal] = useState(false);
  const [newGhName, setNewGhName] = useState('');
  const [showDevModal, setShowDevModal] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState('FAN');
  const [selectedGhId, setSelectedGhId] = useState<number | null>(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/greenhouses');
      setGreenhouses(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Auto refresh
    return () => clearInterval(interval);
  }, []);

  // Save Greenhouse
  const saveGreenhouse = async () => {
    if (!newGhName) return alert("กรุณาใส่ชื่อโรงเรือน");
    try {
      await axios.post('http://localhost:3000/greenhouses', { name: newGhName });
      setShowGhModal(false);
      setNewGhName('');
      fetchData();
    } catch (err) { alert("เกิดข้อผิดพลาด"); }
  };

  // Open Device Modal
  const openAddDeviceModal = (ghId: number) => {
    setSelectedGhId(ghId);
    setNewDevName('');
    setNewDevType('FAN');
    setShowDevModal(true);
  };

  // Save Device
  const saveDevice = async () => {
    if (!newDevName || selectedGhId === null) return alert("ข้อมูลไม่ครบ");
    try {
      await axios.post('http://localhost:3000/devices', {
        name: newDevName, type: newDevType, greenhouseId: selectedGhId
      });
      setShowDevModal(false);
      fetchData();
    } catch (err) { alert("เกิดข้อผิดพลาด"); }
  };

  // Toggle Device
  const toggleDevice = async (id: number, status: boolean) => {
    await axios.patch(`http://localhost:3000/devices/${id}`, { is_active: !status });
    fetchData();
  };

  return (
    <div style={{ 
      width: '100%',             // บังคับเต็มจอแนวนอน
      minHeight: '100vh',        // สูงเต็มจอแนวตั้ง
      padding: '40px 20px', 
      boxSizing: 'border-box',   // คิดขอบรวมในความกว้าง
      backgroundColor: '#f9f9f9', 
      display: 'flex',           // ใช้ Flexbox จัด layout
      flexDirection: 'column',   // เรียงจากบนลงล่าง
      alignItems: 'center'       // จัดกึ่งกลางแกนขวาง (ซ้าย-ขวา) 👈 ตัวนี้คือพระเอก
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2c3e50', margin: '0 0 20px 0', fontSize: '36px' }}>
          🌿 Smart Farm Dashboard
        </h1>
        <button 
          onClick={() => setShowGhModal(true)}
          style={addButtonStyle}
        >
          + เพิ่มโรงเรือนใหม่
        </button>
      </div>

      {/* List */}
      {greenhouses.map((gh) => (
        <div key={gh.id} style={cardStyle}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#34495e', fontSize: '24px' }}>🏡 {gh.name}</h2>
            <span style={{ color: '#bdc3c7', fontSize: '14px', backgroundColor: '#f5f5f5', padding: '4px 8px', borderRadius: '6px' }}>
              ID: {gh.id}
            </span>
          </div>

          {/* Sensors */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={sensorBoxStyle('#ffebee', '#c62828')}>
              <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>อุณหภูมิ</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>🌡️ {gh.temp}°C</div>
            </div>
            <div style={sensorBoxStyle('#e3f2fd', '#1565c0')}>
              <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>ความชื้น</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>💧 {gh.humidity}%</div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#7f8c8d' }}>⚙️ ควบคุมอุปกรณ์</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {gh.devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => toggleDevice(device.id, device.is_active)}
                  style={{
                    ...deviceButtonStyle,
                    backgroundColor: device.is_active ? '#2ecc71' : '#f1f2f6',
                    color: device.is_active ? 'white' : '#7f8c8d',
                  }}
                >
                  {device.type === 'FAN' ? '💨' : device.type === 'PUMP' ? '💦' : '💡'} 
                  {device.name}
                  <span style={{ fontSize: '11px', opacity: 0.7, marginLeft: '5px' }}>
                    {device.is_active ? 'ON' : 'OFF'}
                  </span>
                </button>
              ))}
              <button onClick={() => openAddDeviceModal(gh.id)} style={addDeviceBtnStyle}>+ เพิ่ม</button>
            </div>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #f0f0f0', margin: '25px 0' }} />
          
          {/* Chart Wrapper: ใส่ความสูงคงที่เพื่อแก้ Error กราฟไม่ขึ้น */}
          <div style={{ width: '100%', height: '300px' }}>
             <HistoryChart ghId={gh.id} />
          </div>
        </div>
      ))}

      {/* --- MODALS --- */}
      {showGhModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>🏠 สร้างโรงเรือนใหม่</h3>
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
            <h3 style={{ marginTop: 0 }}>⚙️ เพิ่มอุปกรณ์ใหม่</h3>
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

// --- STYLES ---
const cardStyle: React.CSSProperties = {
  backgroundColor: 'white', border: '1px solid #e0e0e0', marginBottom: '30px', padding: '30px',
  borderRadius: '20px', width: '100%', maxWidth: '800px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
};
const sensorBoxStyle = (bg: string, col: string): React.CSSProperties => ({
  flex: 1, backgroundColor: bg, color: col, padding: '25px', borderRadius: '16px', textAlign: 'center',
  boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
});
const addButtonStyle: React.CSSProperties = {
  padding: '12px 30px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#27ae60', color: 'white',
  border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.15)', transition: 'transform 0.2s'
};
const deviceButtonStyle: React.CSSProperties = {
  padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center'
};
const addDeviceBtnStyle: React.CSSProperties = {
  padding: '12px 20px', border: '2px dashed #bdc3c7', background: 'transparent', borderRadius: '12px', cursor: 'pointer', color: '#95a5a6', fontWeight: 'bold'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', marginTop: '5px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', outline: 'none'
};
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold', color: '#555' };
const actionBtnContainer: React.CSSProperties = { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' };
const saveButtonStyle: React.CSSProperties = { padding: '10px 25px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const cancelButtonStyle: React.CSSProperties = { padding: '10px 25px', backgroundColor: '#ecf0f1', color: '#7f8c8d', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default DashboardPage;