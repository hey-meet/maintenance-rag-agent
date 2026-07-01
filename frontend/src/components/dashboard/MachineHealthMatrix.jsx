import React, { useEffect, useState } from 'react';
import "../../styles/MachineHealthMatrix.css";
import machineHealthService from "../../services/machineHealthService";
import machineHealthBg from "../../assets/images/machine_health.png";

const MachineHealthMatrix = () => {
    const [machines, setMachines] = useState([]);

    useEffect(() => {
        const loadMachineHealth = async () => {
            try {
                const data = await machineHealthService.getMachineHealth();
                setMachines(data);
            } catch (error) {
                console.error("Failed to load machine health:", error);
            }
        };
        loadMachineHealth();
    }, []);

    const getZoneClass = (score) => {
        if (score >= 90) return 'zone-green';
        if (score >= 70) return 'zone-yellow';
        if (score >= 50) return 'zone-orange';
        return 'zone-red';
    };

    const getLedClass = (status) => {
        if (status === 'healthy') return 'optimal';
        if (status === 'critical') return 'danger';
        return status;
    };

    const getNeedleRotation = (score) => {
        const minAngle = -90;
        const maxAngle = 90;
        const rotation = minAngle + (score / 100) * (maxAngle - minAngle);
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
                    const zoneClass = getZoneClass(machine.health_score);
                    const ledClass = getLedClass(machine.status);

                    return (
                        <div
                            key={idx}
                            className={`machine-speed-card ${zoneClass}`}
                            style={{
                                /* Lightened overlay to 30%-45% opacity to uncover the blueprint */
                                backgroundImage: `linear-gradient(rgba(58, 61, 63, 0.30), rgba(58, 61, 63, 0.45)), url(${machineHealthBg})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                /* Added multiply blend mode to beautifully marry the blueprint image with the card container */
                                backgroundBlendMode: "multiply",
                                overflow: "hidden"
                            }}
                        >
                            <div className="machine-card-top">
                                {/* Enhanced contrast by making the name brighter */}
                                <span className="machine-card-name" style={{ color: "#f3f4f6", fontWeight: "600" }}>
                                    {machine.machine_id}
                                </span>
                                <div className={`machine-status-led ${ledClass}`} />
                            </div>

                            <div className="machine-speedometer-wrapper">
                                <div className="machine-speedometer">
                                    <div className="machine-gauge-track"></div>
                                    <div
                                        className="machine-needle"
                                        style={{ transform: `rotate(${getNeedleRotation(machine.health_score)})` }}
                                    />
                                    <div className="machine-center-cap" />
                                </div>
                            </div>

                            <div className="machine-card-bottom">
                                {/* Enhanced contrast by boosting the health percentage to pure white */}
                                <span className="machine-health-value" style={{ color: "#ffffff", fontWeight: "700" }}>
                                    {machine.health_score}%
                                </span>
                                <span className={`machine-status-label ${machine.status}`}>
                                    {machine.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="machine-card-details">
                                <span className="machine-detail-item">
                                    {"🌡 "}{machine.temperature}°C
                                </span>
                                <span className="machine-detail-item">
                                    {"⚠ "}{machine.severity}
                                </span>
                                <span className="machine-detail-item machine-error-code">
                                    {machine.error_code}
                                </span>
                                <span className="machine-detail-item">
                                    {machine.active_alerts} active alert{machine.active_alerts !== 1 ? 's' : ''}
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
