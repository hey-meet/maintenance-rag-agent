import React, { useEffect, useState } from 'react';
import "../../styles/LiveVitals.css";

const LiveVitals = ({ data }) => {
    const [vitalsList, setVitalsList] = useState([]);

    useEffect(() => {
        const telemetry = data?.telemetry || {};
        const temp = parseFloat(telemetry.telemetry_metrics?.temperature) || 0;
        const press = parseFloat(telemetry.telemetry_metrics?.pressure) || 0;
        const machineId = telemetry.machine_id || 'N/A';
        const errorCode = telemetry.error_code || '0x00';

        // Derive mechanical metrics dynamically for an authentic control console feel
        const derivedLoad = temp > 0 ? Math.min(Math.round((temp / 110) * 100), 100) : 0;
        const derivedVib = press > 0 ? (press * 0.032).toFixed(1) : '0.0';

        // Determine specific structural alert states for instrumentation matching
        const getTempStatus = (t) => t > 85 ? 'danger' : t > 70 ? 'warning' : 'optimal';
        const getPressStatus = (p) => p > 130 ? 'danger' : p > 100 ? 'warning' : 'optimal';
        const getCodeStatus = (c) => c !== '0x00' && c !== 'NONE' && c !== '0' ? 'danger' : 'optimal';

        const updatedVitals = [
            {
                label: 'Machine Ident',
                value: machineId,
                unit: 'NODE',
                status: 'optimal',
                type: 'panel',
                meta: 'SYS-MAIN'
            },
            {
                label: 'Core Temperature',
                value: temp || '0',
                unit: '°C',
                status: getTempStatus(temp),
                type: 'gauge',
                pct: Math.min((temp / 120) * 100, 100)
            },
            {
                label: 'Hydraulic Pressure',
                value: press || '0',
                unit: 'PSI',
                status: getPressStatus(press),
                type: 'gauge',
                pct: Math.min((press / 150) * 100, 100)
            },
            {
                label: 'Computed Load',
                value: derivedLoad,
                unit: '%',
                status: derivedLoad > 85 ? 'danger' : derivedLoad > 70 ? 'warning' : 'optimal',
                type: 'wave'
            },
            {
                label: 'Structural Vibration',
                value: derivedVib,
                unit: 'mm/s',
                status: parseFloat(derivedVib) > 4.5 ? 'danger' : parseFloat(derivedVib) > 3.0 ? 'warning' : 'optimal',
                type: 'wave'
            },
            {
                label: 'Diagnostic Registry',
                value: errorCode,
                unit: 'HEX',
                status: getCodeStatus(errorCode),
                type: 'badge',
                meta: errorCode === '0x00' ? 'SYSTEM NOMINAL' : 'HARDWARE FAULT'
            }
        ];

        setVitalsList(updatedVitals);
    }, [data]);

    return (
        <div className="live-vitals-panel">
            <div className="section-header">
                <h2 className="section-title">Live Telemetry Vitals</h2>
                <span className="live-indicator">● LIVE</span>
            </div>

            <div className="vitals-grid">
                {vitalsList.map((vital, idx) => (
                    <div key={idx} className={`telemetry-card ${vital.status}`}>
                        <div className="telemetry-card-header">
                            <span className="telemetry-label">{vital.label}</span>
                            <div className="telemetry-pulse-container">
                                <span className="telemetry-indicator"></span>
                            </div>
                        </div>

                        <div className="telemetry-body">
                            <span className="telemetry-value">{vital.value}</span>
                            <span className="telemetry-unit">{vital.unit}</span>
                        </div>

                        <div className="telemetry-visualization">
                            {vital.type === 'gauge' && (
                                <div className="telemetry-bar-bg">
                                    <div
                                        className="telemetry-bar-fill"
                                        style={{ width: `${vital.pct}%` }}
                                    />
                                </div>
                            )}

                            {vital.type === 'wave' && (
                                <div className="telemetry-wave-container">
                                    <svg className="telemetry-wave" viewBox="0 0 100 20">
                                        <path
                                            d="M0,10 Q12.5,0 25,10 T50,10 T75,10 T100,10"
                                            fill="none"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                </div>
                            )}

                            {(vital.type === 'panel' || vital.type === 'badge') && (
                                <div className="telemetry-meta-tag">
                                    <span>{vital.meta}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveVitals;