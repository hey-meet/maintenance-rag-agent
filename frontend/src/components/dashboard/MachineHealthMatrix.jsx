import React, { useEffect, useState } from 'react';
import "../../styles/MachineHealthMatrix.css";


const MachineHealthMatrix = ({ data }) => {
    const [machines, setMachines] = useState([]);

    useEffect(() => {
        const alertsList = data?.alerts || [];

        const mappedMachines = alertsList.map((alert) => {
            const id = alert?.machine_id || 'Unknown Machine';
            const alertStatus = (alert?.status || 'resolved').toLowerCase();
            const type = (alert?.type || 'info').toLowerCase();

            let healthScore = 92;
            let status = 'optimal';

            if (alertStatus === 'active') {
                if (type === 'critical' || type === 'danger' || type === 'error') {
                    healthScore = Math.floor(Math.random() * (55 - 40 + 1)) + 40;
                    status = 'danger';
                } else {
                    healthScore = Math.floor(Math.random() * (80 - 65 + 1)) + 65;
                    status = 'warning';
                }
            } else if (alertStatus === 'warning') {
                healthScore = Math.floor(Math.random() * (80 - 65 + 1)) + 65;
                status = 'warning';
            } else {
                healthScore = Math.floor(Math.random() * (95 - 85 + 1)) + 85;
                status = healthScore >= 90 ? 'optimal' : 'good';
            }

            return {
                name: id,
                value: healthScore,
                status: status
            };
        });

        setMachines(mappedMachines);
    }, [data]);

    const getZoneClass = (value) => {
        if (value >= 90) return 'zone-green';
        if (value >= 70) return 'zone-yellow';
        if (value >= 50) return 'zone-orange';
        return 'zone-red';
    };

    const getNeedleRotation = (value) => {
        const minAngle = -90;
        const maxAngle = 90;
        const rotation = minAngle + (value / 100) * (maxAngle - minAngle);
        return `${rotation}deg`;
    };

    return (
        <div className="machine-matrix-container">
            <div className="machine-matrix-header">
                <h2 className="machine-matrix-title">Machine Health Matrix</h2>
                <span className="machine-matrix-update">Updated just now</span>
            </div>

            <div className="machine-matrix-grid">
                {machines.map((machine, idx) => {
                    const zoneClass = getZoneClass(machine.value);
                    return (
                        <div key={idx} className={`machine-speed-card ${zoneClass}`}>
                            <div className="machine-card-top">
                                <span className="machine-card-name">{machine.name}</span>
                                <div className={`machine-status-led ${machine.status}`} />
                            </div>

                            <div className="machine-speedometer-wrapper">
                                <div className="machine-speedometer">
                                    <div className="machine-gauge-track"></div>
                                    <div
                                        className="machine-needle"
                                        style={{ transform: `rotate(${getNeedleRotation(machine.value)})` }}
                                    />
                                    <div className="machine-center-cap" />
                                </div>
                            </div>

                            <div className="machine-card-bottom">
                                <span className="machine-health-value">{machine.value}%</span>
                                <span className={`machine-status-label ${machine.status}`}>
                                    {machine.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MachineHealthMatrix;