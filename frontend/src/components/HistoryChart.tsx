// src/components/HistoryChart.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface HistoryChartProps {
  greenhouseId: number;
}

export default function HistoryChart({ greenhouseId }: HistoryChartProps) {
  const [data, setData] = useState([]);

  const { token, logout } = useAuth();

  const fetchHistory = async () => {
    try {
      // ดึงข้อมูล 20 รายการล่าสุด
      const res = await axios.get(`http://localhost:3000/greenhouses/${greenhouseId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // แปลงข้อมูลให้กราฟเข้าใจง่ายขึ้น (จัด format เวลา)
      const formattedData = res.data.map((item: any) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      })).reverse(); // กลับด้านให้เวลาล่าสุดอยู่ขวาสุด (ถ้า backend ส่ง desc มา)

      setData(formattedData);
    } catch (err: any) {
      console.error("Error fetching history:", err);
      if (err.response?.status === 401) {
        // If token invalid, logout the user
        logout();
      }
    }
  };

  useEffect(() => {
    fetchHistory();
    // Polling: ดึงข้อมูลกราฟทุก 5 วินาที
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [greenhouseId]);

  return (
    <div style={{ width: '100%', height: 250, marginTop: '20px' }}>
      <h4 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>📈 กราฟอุณหภูมิและความชื้น (Real-time)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" style={{ fontSize: '12px' }} />
          <YAxis style={{ fontSize: '12px' }} />
          <Tooltip />
          <Area type="monotone" dataKey="temp" stackId="1" stroke="#ff7300" fill="#ff7300" name="อุณหภูมิ (°C)" />
          <Area type="monotone" dataKey="humidity" stackId="2" stroke="#387908" fill="#387908" name="ความชื้น (%)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}