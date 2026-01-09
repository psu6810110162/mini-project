import React, { useEffect, useState } from 'react';
import axios from 'axios';
import HistoryChart from './HistoryChart'; 
import SensorsPage from './SensorsPage'; 
import Swal from 'sweetalert2';

const DashboardPage = () => {
  const [activeMenu, setActiveMenu] = useState<'overview' | 'sensors'>('overview');
  const [greenhouses, setGreenhouses] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  // ดึง Role และแปลงเป็นตัวเล็ก
  const rawRole = localStorage.getItem('role') || '';
  const role = rawRole.toLowerCase(); 
  const username = localStorage.getItem('username') || 'User';

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/greenhouses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGreenhouses(res.data);
    } catch (error) { 
      console.error("Fetch error:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = async (id: number) => {
    try {
      await axios.patch(`http://localhost:3000/devices/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); 
    } catch (error) { Swal.fire('Error', 'ไม่สามารถสั่งงานได้', 'error'); }
  };

  // --- Admin Functions ---

  const handleAddGreenhouse = async () => {
    const { value: name } = await Swal.fire({
      title: 'เพิ่มโรงเรือนใหม่',
      input: 'text',
      inputLabel: 'ชื่อโรงเรือน',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
    });
    if (name) {
      try {
        await axios.post('http://localhost:3000/greenhouses', { name }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
        Swal.fire('สำเร็จ', 'เพิ่มโรงเรือนเรียบร้อย', 'success');
      } catch (err) { Swal.fire('Error', 'เพิ่มไม่สำเร็จ', 'error'); }
    }
  };

  const handleDeleteGreenhouse = async (id: number) => {
    const res = await Swal.fire({
      title: 'ยืนยันการลบโรงเรือน?',
      text: "อุปกรณ์และสถิติทั้งหมดในนี้จะหายไป!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/greenhouses/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
        Swal.fire('ลบแล้ว!', 'ลบโรงเรือนสำเร็จ', 'success');
      } catch (err) { Swal.fire('Error', 'ลบไม่สำเร็จ', 'error'); }
    }
  };

  const handleAddDevice = async (ghId: number) => {
    const { value: formValues } = await Swal.fire({
      title: 'เพิ่มอุปกรณ์',
      html:
        '<input id="devName" class="swal2-input" placeholder="ชื่ออุปกรณ์">' +
        '<select id="devType" class="swal2-input">' +
          '<option value="FAN">พัดลม (FAN)</option>' +
          '<option value="PUMP">ปั๊มน้ำ (PUMP)</option>' +
          '<option value="LIGHT">หลอดไฟ (LIGHT)</option>' +
        '</select>',
      showCancelButton: true,
      confirmButtonColor: '#3498db',
      preConfirm: () => [
        (document.getElementById('devName') as HTMLInputElement).value,
        (document.getElementById('devType') as HTMLSelectElement).value
      ]
    });
    if (formValues && formValues[0]) {
      try {
        await axios.post('http://localhost:3000/devices', {
          name: formValues[0],
          type: formValues[1],
          greenhouseId: ghId
        }, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
        Swal.fire('สำเร็จ', 'เพิ่มอุปกรณ์แล้ว', 'success');
      } catch (err) { Swal.fire('Error', 'เพิ่มอุปกรณ์ไม่ได้', 'error'); }
    }
  };

  const handleDeleteDevice = async (id: number) => {
    const res = await Swal.fire({
      title: 'ลบอุปกรณ์นี้?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
    });
    if (res.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/devices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err) { Swal.fire('Error', 'ลบไม่ได้', 'error'); }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={dashboardContainer}>
      <aside style={sidebarStyle}>
        <div style={logoArea}>🌱 Smart Farm</div>
        <nav style={{ flex: 1 }}>
          <div style={activeMenu === 'overview' ? navItemActive : navItem} onClick={() => setActiveMenu('overview')}>📊 Overview</div>
          <div style={activeMenu === 'sensors' ? navItemActive : navItem} onClick={() => setActiveMenu('sensors')}>🌡️ Sensors</div>
        </nav>
        <button onClick={handleLogout} style={logoutBtn}>Logout</button>
      </aside>

      <main style={mainContent}>
        <header style={headerStyle}>
           <h2 style={{margin:0}}>Smart control panel🟢🔴</h2>
           <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
              {role === 'admin' && (
                <button onClick={handleAddGreenhouse} style={btnAdd}>+ Add GH</button>
              )}
              <div style={userInfo}>👤 {username} <small style={{color:'#95a5a6'}}>({role})</small></div>
           </div>
        </header>

        {activeMenu === 'overview' ? (
          <div>
            {greenhouses.map((gh) => (
              <div key={gh.id} style={greenhouseCard}>
                <div style={cardHeader}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <h3 style={{margin:0}}>🏠 Greenhouse : {gh.name}</h3>
                    {role === 'admin' && (
                      <span onClick={() => handleDeleteGreenhouse(gh.id)} style={{cursor:'pointer', fontSize:'18px'}} title="ลบโรงเรือน">❌</span>
                    )}
                  </div>
                  <div style={statusBadge}>🌡️ {gh.temp}°C | 💧 {gh.humidity}% | ☀️ {gh.light || 0} lx</div>
</div>
                <div style={contentLayout}>
                  <div style={chartSection}><HistoryChart ghId={gh.id} /></div>
                  <div style={deviceSection}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                        <h4 style={{margin:0}}>⚙️Device control</h4>
                        {role === 'admin' && (
                          <button onClick={() => handleAddDevice(gh.id)} style={btnSmallAdd}>+ Add Device</button>
                        )}
                    </div>
                    {gh.devices.map((d: any) => (
                      <div key={d.id} style={deviceItem}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* ปุ่มลบกากบาทวงกลม เฉพาะ Admin */}
                            {role === 'admin' && (
                              <button onClick={() => handleDeleteDevice(d.id)} style={btnDeleteCircle}>✕</button>
                            )}
                            <span style={{fontWeight:500}}>
                              {d.type === 'FAN' && '🪭 '}
                              {d.type === 'PUMP' && '💧 '}
                              {d.type === 'LIGHT' && '💡 '}
                              {d.type === 'LUX_SENSOR' && '☀️ '}
                              {d.name}
                            </span>
                        </div>
                        <button onClick={() => toggleDevice(d.id)} style={d.is_active ? btnOn : btnOff}>
                          {d.is_active ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SensorsPage greenhouses={greenhouses} onRefresh={fetchData} />
        )}
      </main>
    </div>
  );
};

// --- Styles ---
const dashboardContainer: React.CSSProperties = { display: 'flex', height: '100vh', backgroundColor: '#f8f9fa' };
const sidebarStyle: React.CSSProperties = { width: '260px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px' };
const logoArea: React.CSSProperties = { fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', textAlign: 'center', color: '#2ecc71' };
const navItem: React.CSSProperties = { padding: '12px 15px', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer', transition: '0.3s' };
const navItemActive: React.CSSProperties = { ...navItem, backgroundColor: '#34495e', color: '#2ecc71' };
const mainContent: React.CSSProperties = { flex: 1, padding: '30px', overflowY: 'auto' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const userInfo: React.CSSProperties = { backgroundColor: 'white', padding: '10px 20px', borderRadius: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontWeight: 'bold' };
const greenhouseCard: React.CSSProperties = { backgroundColor: 'white', borderRadius: '15px', padding: '25px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' };
const cardHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px', marginBottom: '20px' };
const statusBadge: React.CSSProperties = { fontSize: '18px', fontWeight: 'bold', backgroundColor: '#f1f2f6', padding: '5px 15px', borderRadius: '10px' };
const contentLayout: React.CSSProperties = { display: 'flex', gap: '25px', flexWrap: 'wrap' };
const chartSection: React.CSSProperties = { flex: 2, minWidth: '350px' };
const deviceSection: React.CSSProperties = { flex: 1, minWidth: '250px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px' };
const deviceItem: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const btnOn: React.CSSProperties = { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const btnOff: React.CSSProperties = { backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const logoutBtn: React.CSSProperties = { padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: 'auto', fontWeight: 'bold' };
const btnAdd: React.CSSProperties = { backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(46, 204, 113, 0.3)' };
const btnSmallAdd: React.CSSProperties = { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' };

// สไตล์ใหม่สำหรับปุ่มลบกากบาทวงกลม
const btnDeleteCircle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#ff7675',
  color: 'white',
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '10px',
  cursor: 'pointer',
  padding: 0,
  transition: '0.2s'
};

export default DashboardPage;