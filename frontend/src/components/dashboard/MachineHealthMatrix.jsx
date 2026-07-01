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

    const getStatusColor = (status) => {
        if (status === 'healthy') return '#7D9A72';
        if (status === 'warning') return '#D96C4A';
        if (status === 'critical' || status === 'danger') return '#7A2E2E';
        return '#3A3D3F';
    };

    return (
        <div className="machine-matrix-container">
            <div className="machine-matrix-header">
                <h2 className="machine-matrix-title" style={{ color: "#3A3D3F" }}>Machine Health Matrix</h2>
                <span className="machine-matrix-update" style={{ color: "#3A3D3F" }}>Updated just now</span>
            </div>

            <div className="machine-matrix-grid">
                {machines.map((machine, idx) => {
                    const zoneClass = getZoneClass(machine.health_score);
                    const ledClass = getLedClass(machine.status);
                    const statusColor = getStatusColor(machine.status);

                    return (
                        <div
                            key={idx}
                            className={`machine-speed-card ${zoneClass}`}
                            style={{
                                backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.15)), url(${machineHealthBg})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                backgroundBlendMode: "normal",
                                /* FORCE OVERRIDE: Replaces the CSS file's overflow hidden with visible, and adds extra spacing */
                                overflow: "visible !important",
                                padding: "20px 16px 16px 16px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            {/* Flex-shrink structural safety wrapper */}
                            <div style={{ width: "100%", flexShrink: 0 }}>
                                <div className="machine-card-top" style={{ marginBottom: "8px" }}>
                                    <span className="machine-card-name" style={{ color: "#3A3D3F", fontWeight: "600", display: "inline-block" }}>
                                        {machine.machine_id}
                                    </span>
                                    <div className={`machine-status-led ${ledClass}`} />
                                </div>
                            </div>

                            <div className="machine-speedometer-wrapper" style={{ margin: "4px auto" }}>
                                <div className="machine-speedometer">
                                    <div className="machine-gauge-track"></div>
                                    <div
                                        className="machine-needle"
                                        style={{ transform: `rotate(${getNeedleRotation(machine.health_score)})` }}
                                    />
                                    <div className="machine-center-cap" />
                                </div>
                            </div>

                            <div style={{ width: "100%", flexShrink: 0 }}>
                                <div className="machine-card-bottom" style={{ marginBottom: "6px" }}>
                                    <span className="machine-health-value" style={{ color: "#3A3D3F", fontWeight: "700" }}>
                                        {machine.health_score}%
                                    </span>
                                    <span className={`machine-status-label ${machine.status}`} style={{ color: statusColor, fontWeight: "600" }}>
                                        {machine.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="machine-card-details" style={{ color: "#3A3D3F", gap: "2px" }}>
                                    <span className="machine-detail-item" style={{
                                        color:
                                            machine.temperature >= 90
                                                ? "#7A2E2E" // Danger
                                                : machine.temperature >= 70
                                                    ? "#D96C4A" // Warning
                                                    : "#7D9A72" // Success
                                    }}
                                    >
                                        {"🌡 "}{machine.temperature}°C
                                    </span>
                                    <span className="machine-detail-item" style={{ color: statusColor }}>
                                        {"⚠ "}{machine.severity}
                                    </span>
                                    <span className="machine-detail-item machine-error-code" style={{ color: statusColor, wordBreak: "break-all" }}>
                                        {machine.error_code}
                                    </span>
                                    <span className="machine-detail-item">
                                        {machine.active_alerts} active alert{machine.active_alerts !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MachineHealthMatrix;