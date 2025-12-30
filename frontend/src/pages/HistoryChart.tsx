import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

interface ChartProps {
  ghId: number;
}

export default function HistoryChart({ ghId }: ChartProps) {
  const [data, setData] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/greenhouses/${ghId}/history`);
      const formattedData = res.data.reverse().map((item: any) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [ghId]);

  // 🎨 สร้างกล่อง Tooltip เอง (เวลาเอาเมาส์ชี้)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#555' }}>⏰ {label}</p>
          <div style={{ marginTop: '5px' }}>
            <p style={{ margin: 0, color: '#ff4d4d', fontSize: '14px' }}>
              🌡️ อุณหภูมิ: <b>{payload[0].value}°C</b>
            </p>
            <p style={{ margin: 0, color: '#3498db', fontSize: '14px' }}>
              💧 ความชื้น: <b>{payload[1].value}%</b>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 320, marginTop: '20px' }}>
      <h4 style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '10px' }}>
        📊 กราฟแสดงผลย้อนหลัง (Real-time)
      </h4>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          {/* 1. กำหนดการไล่สี (Gradient) */}
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
          
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12, fill: '#aaa' }} 
            tickLine={false}
            axisLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#aaa' }} 
            tickLine={false}
            axisLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} />

          {/* 2. พื้นที่กราฟ (Area) */}
          <Area 
            type="monotone" 
            dataKey="temp" 
            stroke="#ff4d4d" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTemp)" 
            name="อุณหภูมิ"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area 
            type="monotone" 
            dataKey="humidity" 
            stroke="#3498db" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorHum)" 
            name="ความชื้น"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}