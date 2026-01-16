// src/pages/DashboardPage.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import HistoryChart from '../components/HistoryChart';
import { useAuth } from '../context/AuthContext';

// Interface ให้ TypeScript รู้จักหน้าตาข้อมูล
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
export default function DashboardPage() {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const navigate = useNavigate();
  const { token, role, logout } = useAuth();
  
  // ดึง Role เพื่อเช็คว่าเป็น ADMIN หรือไม่
  const isAdmin = role === 'ADMIN';

  // ฟังก์ชันดึงข้อมูล (Load Data)
  const fetchData = async () => {
    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // 1. ดึงโรงเรือนทั้งหมด
      const res = await axios.get('http://localhost:3000/greenhouses', { headers });
      let ghData = res.data;

      // 2. (ตามสเปค) ดึง History ล่าสุดมาอัปเดตค่า temp/humidity ให้เป็นปัจจุบันที่สุด
      // (ถ้า Backend Update Realtime ในตาราง Greenhouse แล้ว ข้าม loop นี้ได้)
      const updatedGhData = await Promise.all(ghData.map(async (gh: Greenhouse) => {
        try {
          const historyRes = await axios.get(`http://localhost:3000/greenhouses/${gh.id}/history`, { headers });
          if (historyRes.data.length > 0) {
            const latest = historyRes.data[0]; // สมมติ index 0 คือล่าสุด
            return { ...gh, temp: latest.temp, humidity: latest.humidity };
          }
        } catch (e) { /* ignore error if no history */ }
        return gh;
      }));

      setGreenhouses(updatedGhData);

    } catch (error) {
      console.error("Fetch error:", error);
      // ถ้า Token หมดอายุ ให้เด้งออก
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token invalid/expired → logout via context to keep state consistent
        logout();
        navigate('/login');
      }
    }
  };

  // Polling: รันทุก 2 วินาที
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ------------------- ACTIONS (ADMIN ONLY) -------------------

  // สร้างโรงเรือนใหม่
  const handleCreateGreenhouse = async () => {
    const { value: name } = await Swal.fire({
      title: 'ตั้งชื่อโรงเรือนใหม่',
      input: 'text',
      showCancelButton: true,
    });

    if (name) {
      try {
          await axios.post('http://localhost:3000/greenhouses', { name }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchData(); // รีโหลดข้อมูลทันที
        Swal.fire('สำเร็จ', 'สร้างโรงเรือนแล้ว', 'success');
      } catch (err) {
        Swal.fire('Error', 'สร้างไม่สำเร็จ', 'error');
      }
    }
  };

  // เพิ่มอุปกรณ์
  const handleAddDevice = async (ghId: number) => {
    const { value: formValues } = await Swal.fire({
      title: 'เพิ่มอุปกรณ์',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="ชื่ออุปกรณ์ (เช่น พัดลม 1)">' +
        '<select id="swal-input2" class="swal2-input"><option value="FAN">พัดลม (FAN)</option><option value="PUMP">ปั๊มน้ำ (PUMP)</option><option value="LIGHT">ไฟ (LIGHT)</option></select>',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLSelectElement).value
        ]
      }
    });

    if (formValues) {
      try {
        await axios.post('http://localhost:3000/devices', {
          name: formValues[0],
          type: formValues[1],
          greenhouseId: ghId
        }, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
        Swal.fire('สำเร็จ', 'เพิ่มอุปกรณ์แล้ว', 'success');
      } catch (err) {
        Swal.fire('Error', 'เพิ่มไม่สำเร็จ', 'error');
      }
    }
  };

  // ลบโรงเรือน
  const handleDeleteGreenhouse = async (id: number) => {
    const result = await Swal.fire({
        title: 'แน่ใจหรือไม่?',
        text: "ข้อมูลและอุปกรณ์ทั้งหมดจะหายไป!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'ลบเลย!'
    });

    if (result.isConfirmed) {
        try {
            await axios.delete(`http://localhost:3000/greenhouses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            Swal.fire('ลบแล้ว!', 'ไฟล์ของคุณถูกลบแล้ว.', 'success');
        } catch (err) {
            Swal.fire('Error', 'ลบไม่สำเร็จ', 'error');
        }
    }
  };

  // ------------------- ACTIONS (USER & ADMIN) -------------------

  // เปิด/ปิด อุปกรณ์
  const handleToggleDevice = async (deviceId: number) => {
    try {
        await axios.patch(`http://localhost:3000/devices/${deviceId}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // ไม่ต้อง reload ทั้งหน้า เพราะเดี๋ยว polling จะมาอัปเดตสถานะปุ่มเองใน 2 วินาที
        // แต่ถ้าอยากให้ทันใจ ก็เรียก fetchData() เลยก็ได้
        fetchData(); 
    } catch (err) {
        console.error("Toggle error", err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>🌿 Smart Farm Dashboard</h1>
        <div>
           {/* ปุ่มสร้างโรงเรือน (แสดงเฉพาะ ADMIN) */}
           {isAdmin && (
            <button 
                onClick={handleCreateGreenhouse}
                style={{ marginRight: '10px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                + สร้างโรงเรือน
            </button>
           )}
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {greenhouses.map((gh) => (
          <div key={gh.id} style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
            
            {/* Header Card */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0 }}>🏠 {gh.name}</h2>
                {isAdmin && (
                    <button onClick={() => handleDeleteGreenhouse(gh.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️ ลบ</button>
                )}
            </div>

            {/* Sensor Data Display */}
            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0', fontSize: '1.2em' }}>
                <div style={{ color: '#ff7300' }}>
                    🌡️ อุณหภูมิ: <b>{gh.temp?.toFixed(1) || '--'} °C</b>
                </div>
                <div style={{ color: '#387908' }}>
                    💧 ความชื้น: <b>{gh.humidity?.toFixed(1) || '--'} %</b>
                </div>
            </div>

            {/* Devices Control */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>🎮 ควบคุมอุปกรณ์</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {gh.devices && gh.devices.map(device => (
                        <button
                            key={device.id}
                            onClick={() => handleToggleDevice(device.id)}
                            style={{
                                padding: '8px 15px',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                backgroundColor: device.is_active ? '#28a745' : '#6c757d', // เขียวเมื่อเปิด, เทาเมื่อปิด
                                color: 'white',
                                transition: 'background 0.3s'
                            }}
                        >
                            {device.type === 'FAN' ? '🌪️' : device.type === 'PUMP' ? '💦' : '💡'} {device.name} : {device.is_active ? 'ON' : 'OFF'}
                        </button>
                    ))}
                    {isAdmin && (
                        <button onClick={() => handleAddDevice(gh.id)} style={{ padding: '8px 15px', border: '1px dashed #999', borderRadius: '20px', background: 'none', cursor: 'pointer' }}>
                            + เพิ่ม
                        </button>
                    )}
                </div>
            </div>

            {/* History Chart */}
            <HistoryChart greenhouseId={gh.id} />
            
          </div>
        ))}
      </div>
    </div>
  );
}