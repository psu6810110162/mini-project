import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
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
      // เอาข้อมูล 12 ล่าสุดมาแสดง
      const formattedData = res.data.reverse().slice(-12).map((item: any) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        // ตรวจสอบว่ามีค่า light ไหม ถ้าไม่มีให้เป็น 0 กันกราฟพัง
        light: item.light || 0, 
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

  // 🔥 ปรับปรุง Tooltip ให้โชว์ 3 ค่า
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          fontSize: '13px'
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#2c3e50' }}>🕒 เวลา {label} น.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={{ color: '#ff7675', fontWeight: '500' }}>🌡️ อุณหภูมิ: {payload[0].value}%</span>
            <span style={{ color: '#74b9ff', fontWeight: '500' }}>💧 ความชื้น: {payload[1].value}%</span>
            {payload[2] && (
              <span style={{ color: '#f1c40f', fontWeight: '500' }}>☀️ แสงแดด: {payload[2].value}%</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 350, backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      <h4 style={{ textAlign: 'left', color: '#2c3e50', marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>
         สถิติสภาพอากาศในโรงเรือน
      </h4>
      
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={5} // ปรับระยะห่างระหว่างแท่งให้พอดี
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 11, fill: '#95a5a6' }} 
            tickLine={false}
            axisLine={false} 
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#95a5a6' }} 
            tickLine={false}
            axisLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8f9fa'}} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />

          {/* แท่งกราฟอุณหภูมิ */}
          <Bar 
            dataKey="temp" 
            name="อุณหภูมิ (%)" 
            fill="#ff7675" 
            radius={[4, 4, 0, 0]} 
            barSize={12}
          />
          
          {/* แท่งกราฟความชื้น */}
          <Bar 
            dataKey="humidity" 
            name="ความชื้น (%)" 
            fill="#74b9ff" 
            radius={[4, 4, 0, 0]} 
            barSize={12}
          />

          {/* 🔥 แท่งกราฟความเข้มแสง (สีเหลือง) */}
          <Bar 
            dataKey="light" 
            name="ความเข้มแสง (%)" 
            fill="#f1c40f" 
            radius={[4, 4, 0, 0]} 
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}