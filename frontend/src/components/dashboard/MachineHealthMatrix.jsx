import React from 'react';
import CircularGauge from '../visualization/CircularGauge';

const MachineHealthMatrix = () => {
    const machines = [
        { name: 'CNC Mill', value: 96, status: 'optimal' },
        { name: 'Lathe', value: 89, status: 'good' },
        { name: 'Press Brake', value: 72, status: 'warning' },
        { name: 'Robotic Arm', value: 94, status: 'optimal' },
        { name: 'Conveyor', value: 65, status: 'warning' },
        { name: 'Coolant Pump', value: 45, status: 'danger' }
    ];

    return (
        <div className="machine-health-matrix">
            <div className="section-header">
                <h2 className="section-title">Machine Health Matrix</h2>
                <span className="update-time">Updated just now</span>
            </div>

            <div className="matrix-grid">
                {machines.map((machine, idx) => (
                    <div key={idx} className="matrix-card">
                        <CircularGauge
                            title={machine.name}
                            value={machine.value}
                            status={machine.status}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MachineHealthMatrix;