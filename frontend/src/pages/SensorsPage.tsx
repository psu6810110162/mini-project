import React from 'react';

interface SensorsPageProps {
  greenhouses: any[];
  onRefresh: () => void;
}

const SensorsPage: React.FC<SensorsPageProps> = ({ greenhouses, onRefresh }) => {
  const allDevices = greenhouses.flatMap(gh => 
    gh.devices.map((dev: any) => ({ 
      ...dev, 
      ghName: gh.name, 
      ghTemp: gh.temp, 
      ghHum: gh.humidity,
      ghLight: gh.light 
    }))
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'FAN': return '🪭';
      case 'PUMP': return '💧';
      case 'LIGHT': return '💡';
      case 'LUX_SENSOR': return '☀️';
      default: return '⚙️';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'FAN': return '#ff7675'; 
      case 'PUMP': return '#74b9ff';
      case 'LIGHT': 
      case 'LUX_SENSOR': return '#f1c40f'; 
      default: return '#2ecc71';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>🌡️ Live Sensor Monitoring</h2>
        <button onClick={onRefresh} style={btnSync}>🔄 Refresh data</button>
      </header>

      <div style={sensorGrid}>
        {allDevices.map((dev: any) => (
          <div key={dev.id} style={{ ...sensorCard, borderLeft: `5px solid ${getBorderColor(dev.type)}` }}>
            <div style={sensorIcon}>{getIcon(dev.type)}</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0 }}>{dev.name}</h4>
              <small style={{ color: '#95a5a6' }}>Greenhouse: {dev.ghName}</small>
              <div style={{ marginTop: '10px' }}>
                <span style={{ color: dev.is_active ? '#2ecc71' : '#e74c3c', fontWeight: 'bold', fontSize: '13px' }}>
                  {dev.is_active ? '● Running' : '○ Standby'}
                </span>
              </div>
            </div>
            
            {/*  */}
            <div style={sensorValue}>
              {dev.type === 'FAN' && `${dev.ghTemp}°C`}
              {dev.type === 'PUMP' && `${dev.ghHum}%`}
              {(dev.type === 'LIGHT' || dev.type === 'LUX_SENSOR') && `${dev.ghLight || 0}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const sensorGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' };
const sensorCard = { 
  backgroundColor: 'white', 
  padding: '20px', 
  borderRadius: '15px', 
  display: 'flex', 
  alignItems: 'center', 
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease-in-out'
};
const sensorIcon = { fontSize: '28px', marginRight: '15px', backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '12px' };
const sensorValue = { fontSize: '22px', fontWeight: 'bold', color: '#2c3e50', marginLeft: '10px' };

const btnSync: React.CSSProperties = { 
  backgroundColor: '#3498db', 
  color: 'white', 
  border: 'none', 
  padding: '6px 14px',
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: 'bold',
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: '0.3s'
};

export default SensorsPage;