import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

// กำหนดหน้าตาข้อมูล
interface ChartProps {
  ghId: number; // รับ ID โรงเรือนเข้ามา
}

export default function HistoryChart({ ghId }: ChartProps) {
  const [data, setData] = useState([]);

  // ฟังก์ชันดึงประวัติ
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/greenhouses/${ghId}/history`);
      
      // แปลงข้อมูลนิดหน่อย (กลับด้านข้อมูลให้เวลาเรียงจาก อดีต -> ปัจจุบัน)
      // และแปลงวันที่ให้อ่านง่าย
      const formattedData = res.data.reverse().map((item: any) => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('th-TH'), // แปลงเวลาเป็นไทย
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    // ตั้งเวลาให้ดึงกราฟใหม่ทุก 5 วินาที
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [ghId]);

  return (
    <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
      <h4 style={{ textAlign: 'center' }}>📊 กราฟอุณหภูมิและความชื้น (ย้อนหลัง 20 รายการ)</h4>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* เส้นสีแดง = อุณหภูมิ */}
          <Line type="monotone" dataKey="temp" stroke="#ff0000" name="อุณหภูมิ (°C)" />
          {/* เส้นสีฟ้า = ความชื้น */}
          <Line type="monotone" dataKey="humidity" stroke="#0088fe" name="ความชื้น (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}