import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import HistoryChart from './HistoryChart';

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

function App() {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);

  // 1. ดึงข้อมูล
  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:3000/greenhouses');
      setGreenhouses(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Functions (เหมือนเดิม)
  const createGreenhouse = async () => {
    const name = prompt("ตั้งชื่อโรงเรือน:");
    if (name) {
      await axios.post('http://localhost:3000/greenhouses', { name });
      fetchData();
    }
  };

  const createDevice = async (ghId: number) => {
    const name = prompt("ชื่ออุปกรณ์:");
    if (!name) return;
    const type = prompt("ประเภท (FAN, PUMP, LIGHT):", "FAN");
    if (type) {
      await axios.post('http://localhost:3000/devices', {
        name, type: type.toUpperCase(), greenhouseId: ghId
      });
      fetchData();
    }
  };

  const toggleDevice = async (id: number, status: boolean) => {
    await axios.patch(`http://localhost:3000/devices/${id}`, { is_active: !status });
    fetchData();
  };

  return (
    <div style={{ padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      
      <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>
        🌿 Smart Farm Dashboard
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button 
          onClick={createGreenhouse}
          style={{ 
            padding: '12px 24px', 
            fontSize: '16px', 
            backgroundColor: '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50px', 
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          + เพิ่มโรงเรือนใหม่
        </button>
      </div>

      {greenhouses.map((gh) => (
        <div key={gh.id} style={{ 
          backgroundColor: 'white',
          border: '1px solid #e0e0e0', 
          margin: '0 auto 30px auto', 
          padding: '25px', 
          borderRadius: '16px', 
          maxWidth: '800px',
          boxShadow: '0 10px 15px rgba(0,0,0,0.05)'
        }}>
          
          {/* หัวข้อโรงเรือน */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: '#34495e', fontSize: '30px' }}>🏡 {gh.name}</h2>
            <span style={{ fontSize: '14px', color: '#bdc3c7', backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '10px' }}>
              ID: {gh.id}
            </span>
          </div>

          {/* 👇👇👇 กล่องแสดงผล อุณหภูมิ & ความชื้น (Highlight) 👇👇👇 */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
            
            {/* กล่องอุณหภูมิ (สีแดง) */}
            <div style={{ 
              flex: 1, 
              backgroundColor: '#ffebee', // สีพื้นหลังแดงอ่อน
              color: '#c62828',           // สีตัวหนังสือแดงเข้ม
              padding: '20px', 
              borderRadius: '12px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.8 }}>อุณหภูมิ (Temperature)</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>🌡️ {gh.temp}°C</div>
            </div>

            {/* กล่องความชื้น (สีฟ้า) */}
            <div style={{ 
              flex: 1, 
              backgroundColor: '#e3f2fd', // สีพื้นหลังฟ้าอ่อน
              color: '#1565c0',           // สีตัวหนังสือฟ้าเข้ม
              padding: '20px', 
              borderRadius: '12px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '14px', marginBottom: '5px', opacity: 0.8 }}>ความชื้น (Humidity)</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>💧 {gh.humidity}%</div>
            </div>

          </div>
          {/* 👆👆👆 จบส่วนกล่องสวยๆ 👆👆👆 */}

          <h4 style={{ color: '#7f8c8d', marginBottom: '10px' }}>⚙️ ควบคุมอุปกรณ์</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {gh.devices.map((device) => (
              <button
                key={device.id}
                onClick={() => toggleDevice(device.id, device.is_active)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: device.is_active ? '#2ecc71' : '#ecf0f1', // เขียว หรือ เทา
                  color: device.is_active ? 'white' : '#7f8c8d',
                  fontWeight: 'bold',
                  transition: '0.3s',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                {device.type === 'FAN' ? '💨' : device.type === 'PUMP' ? '💦' : '💡'} 
                {device.name}
                <span style={{ fontSize: '10px', marginLeft: '5px', opacity: 0.8 }}>
                  {device.is_active ? 'ON' : 'OFF'}
                </span>
              </button>
            ))}
            
            <button 
              onClick={() => createDevice(gh.id)}
              style={{ padding: '10px 20px', borderRadius: '8px', border: '2px dashed #bdc3c7', backgroundColor: 'transparent', cursor: 'pointer', color: '#95a5a6' }}
            >
              + เพิ่ม
            </button>
          </div>

          <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
          
          {/* กราฟ */}
          <HistoryChart ghId={gh.id} />

        </div>
      ))}
    </div>
  );
}

export default App;