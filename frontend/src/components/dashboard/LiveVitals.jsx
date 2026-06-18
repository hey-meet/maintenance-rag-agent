import React from 'react';
import MiniSparkline from '../visualization/MiniSparkline';

const LiveVitals = () => {
    const vitals = [
        { label: 'Spindle Load', value: '78%', data: [45, 52, 48, 55, 62, 58, 68, 72, 78] },
        { label: 'Temperature', value: '62°C', data: [58, 59, 60, 61, 62, 63, 62, 61, 62] },
        { label: 'Vibration', value: '2.3 mm/s', data: [1.8, 2.0, 2.2, 2.4, 2.3, 2.1, 2.2, 2.3, 2.3] },
        { label: 'Power Draw', value: '4.2 kW', data: [3.8, 4.0, 4.1, 4.2, 4.3, 4.2, 4.1, 4.2, 4.2] },
        { label: 'RPM', value: '12450', data: [12000, 12100, 12250, 12400, 12450, 12480, 12450, 12430, 12450] },
        { label: 'Pressure', value: '86 PSI', data: [82, 84, 85, 86, 87, 86, 85, 86, 86] }
    ];

    return (
        <div className="live-vitals">
            <div className="section-header">
                <h2 className="section-title">Live Telemetry Vitals</h2>
                <span className="live-indicator">● LIVE</span>
            </div>
            <div className="vitals-grid">
                {vitals.map((vital, idx) => (
                    <div key={idx} className="vital-card">
                        <MiniSparkline
                            data={vital.data}
                            label={vital.label}
                            value={vital.value}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveVitals;