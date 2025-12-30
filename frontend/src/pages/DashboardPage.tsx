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

  const [showGhModal, setShowGhModal] = useState(false);
  const [newGhName, setNewGhName] = useState('');
  const [showDevModal, setShowDevModal] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState('FAN');
  const [selectedGhId, setSelectedGhId] = useState<number | null>(null);

  // Modal ยืนยันการลบ
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, type: 'GH' | 'DEV', id: number | null}>({
    show: false, type: 'GH', id: null
  });

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/greenhouses', authConfig);
      const ghList = res.data;
      const updatedList = await Promise.all(ghList.map(async (gh: Greenhouse) => {
        try {
          const historyRes = await axios.get(`http://localhost:3000/greenhouses/${gh.id}/history`, authConfig);
          const readings = historyRes.data;
          if (readings && readings.length > 0) {
            const latest = readings[0];
            return { ...gh, temp: latest.temp, humidity: latest.humidity };
          }
        } catch (err) { console.error(err); }
        return gh;
      }));
      setGreenhouses(updatedList);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return; }
    fetchData();
    const interval = setInterval(fetchData, 2000); 
    return () => clearInterval(interval);
  }, [token]);

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      const url = deleteConfirm.type === 'GH' 
        ? `http://localhost:3000/greenhouses/${deleteConfirm.id}`
        : `http://localhost:3000/devices/${deleteConfirm.id}`;
      await axios.delete(url, authConfig);
      setDeleteConfirm({ show: false, type: 'GH', id: null });
      fetchData();
    } catch (err) { alert("ลบไม่สำเร็จ"); }
  };

  const saveGreenhouse = async () => {
    if (!newGhName) return alert("กรุณาใส่ชื่อโรงเรือน");
    try {
      await axios.post('http://localhost:3000/greenhouses', { name: newGhName }, authConfig);
      setShowGhModal(false);
      setNewGhName('');
      fetchData();
    } catch (err) { alert("เกิดข้อผิดพลาด"); }
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

  const toggleDevice = async (id: number) => {
    try {
      await axios.patch(`http://localhost:3000/devices/${id}/toggle`, {}, authConfig);
      fetchData();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', paddingBottom: '60px' }}>
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={{ flex: 1 }}>
            <h1 style={brandTitleStyle}>🌿 Smart Farm Monitoring</h1>
            <p style={brandSubtitleStyle}>ระบบบริหารจัดการและควบคุมอุปกรณ์อัตโนมัติ</p>
          </div>
          <div style={userActionStyle}>
             <span style={roleBadgeStyle}>{userRole}</span>
             <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} style={logoutBtnStyle}>ออกจากระบบ</button>
          </div>
        </div>
        <div style={actionRowStyle}>
          <div style={innerActionRowStyle}>
            {userRole === 'ADMIN' && (
              <button onClick={() => setShowGhModal(true)} style={addGhButtonStyle}>+ เพิ่มโรงเรือนใหม่</button>
            )}
          </div>
        </div>
      </header>

      <div style={containerStyle}>
        <div style={gridContainerStyle}>
          {greenhouses.map((gh) => (
            <div key={gh.id} style={cardStyle}>
              {/* --- ชื่อโรงเรือน ใหญ่ยักษ์ตามคำขอ --- */}
              <div style={cardHeaderStyle}>
                <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '30px', fontWeight: '800' }}>🏡 {gh.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={idBadgeStyle}>ID: {gh.id}</span>
                  {userRole === 'ADMIN' && (
                    <button onClick={() => setDeleteConfirm({show: true, type: 'GH', id: gh.id})} style={deleteBtnStyle}>🗑️</button>
                  )}
                </div>
              </div>

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

              <div style={{ marginBottom: '20px' }}>
                <p style={controlHeaderStyle}>อุปกรณ์ควบคุม</p>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {gh.devices?.map((device) => (
                    <div key={device.id} style={{ position: 'relative' }}>
                      <button
                        onClick={() => toggleDevice(device.id)}
                        style={{
                          ...deviceButtonStyle,
                          backgroundColor: device.is_active ? '#2ecc71' : '#fff',
                          color: device.is_active ? '#fff' : '#7f8c8d',
                          borderColor: device.is_active ? '#2ecc71' : '#dcdde1'
                        }}
                      >
                        {device.type === 'FAN' ? '💨' : device.type === 'PUMP' ? '💦' : '💡'} {device.name}
                      </button>
                      {/* --- ปุ่มลบอุปกรณ์ สีเทา --- */}
                      {userRole === 'ADMIN' && (
                        <span 
                          onClick={() => setDeleteConfirm({show: true, type: 'DEV', id: device.id})} 
                          style={miniDeleteGreyStyle}
                        >×</span>
                      )}
                    </div>
                  ))}
                  {userRole === 'ADMIN' && (
                      <button onClick={() => { setSelectedGhId(gh.id); setShowDevModal(true); }} style={addDeviceBtnStyle}>+</button>
                  )}
                </div>
              </div>
              <div style={chartWrapperStyle}><HistoryChart ghId={gh.id} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ช่องถามลบ (Confirm Modal) --- */}
      {deleteConfirm.show && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{marginTop: 0}}>⚠️ ยืนยันการลบ</h3>
            <p>คุณแน่ใจหรือไม่ว่าต้องการลบ {deleteConfirm.type === 'GH' ? 'โรงเรือน' : 'อุปกรณ์'} นี้?</p>
            <div style={actionBtnContainer}>
              <button onClick={() => setDeleteConfirm({show: false, id: null, type: 'GH'})} style={cancelButtonStyle}>ยกเลิก</button>
              <button onClick={handleConfirmDelete} style={{...saveButtonStyle, backgroundColor: '#e74c3c'}}>ลบเลย</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal เพิ่มโรงเรือน */}
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

      {/* Modal เพิ่มอุปกรณ์ */}
      {showDevModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>⚙️ เพิ่มอุปกรณ์ใหม่</h3>
            <input type="text" placeholder="ชื่ออุปกรณ์..." value={newDevName} onChange={(e) => setNewDevName(e.target.value)} style={inputStyle} />
            <select value={newDevType} onChange={(e) => setNewDevType(e.target.value)} style={{...inputStyle, marginTop: '15px'}}>
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
const headerStyle: React.CSSProperties = { backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0', padding: '40px 0 0 0' };
const headerInnerStyle: React.CSSProperties = { maxWidth: '1400px', width: '95%', margin: '0 auto', display: 'flex', justifyContent: 'space-between' };
const brandTitleStyle: React.CSSProperties = { fontSize: '42px', fontWeight: '800' };
const brandSubtitleStyle: React.CSSProperties = { color: '#95a5a6' };
const userActionStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '15px' };
const roleBadgeStyle: React.CSSProperties = { backgroundColor: '#3498db', color: '#fff', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' };
const logoutBtnStyle: React.CSSProperties = { border: '1px solid #e74c3c', color: '#e74c3c', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', background: 'none' };
const actionRowStyle: React.CSSProperties = { backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0', padding: '15px 0' };
const innerActionRowStyle: React.CSSProperties = { maxWidth: '1400px', width: '95%', margin: '0 auto' };
const addGhButtonStyle: React.CSSProperties = { backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' };
const containerStyle: React.CSSProperties = { maxWidth: '1400px', width: '95%', margin: '0 auto', padding: '40px 0' };
const gridContainerStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '30px' };
const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minHeight: '680px' };
const cardHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' };
const idBadgeStyle: React.CSSProperties = { color: '#bdc3c7', fontSize: '12px' };
const sensorBoxStyle = (bg: string, col: string): React.CSSProperties => ({ flex: 1, backgroundColor: bg, color: col, padding: '20px', borderRadius: '20px', textAlign: 'center' });
const sensorLabelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 'bold' };
const sensorValueStyle: React.CSSProperties = { fontSize: '36px', fontWeight: '800' };
const controlHeaderStyle: React.CSSProperties = { fontSize: '12px', color: '#95a5a6', fontWeight: 'bold', textTransform: 'uppercase' };
const deviceButtonStyle: React.CSSProperties = { padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', border: '1px solid', fontWeight: 'bold' };
const addDeviceBtnStyle: React.CSSProperties = { width: '42px', height: '42px', border: '2px dashed #dcdde1', background: 'none', borderRadius: '12px', cursor: 'pointer' };
const chartWrapperStyle: React.CSSProperties = { marginTop: 'auto', paddingTop: '20px' };
const deleteBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' };
const miniDeleteGreyStyle: React.CSSProperties = { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#bdc3c7', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { backgroundColor: '#fff', padding: '35px', borderRadius: '24px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd' };
const actionBtnContainer: React.CSSProperties = { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '25px' };
const saveButtonStyle: React.CSSProperties = { padding: '10px 25px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const cancelButtonStyle: React.CSSProperties = { padding: '10px 25px', backgroundColor: '#f1f2f6', color: '#7f8c8d', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default DashboardPage;