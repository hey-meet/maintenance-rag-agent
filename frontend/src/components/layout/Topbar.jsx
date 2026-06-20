import React from "react";
// Absolute paths relative to project root
import maintenanceImg from "/src/assets/images/blueprint2.png";
import blueprintImg from "/src/assets/images/blueprint.png";

const Topbar = () => {
    return (
        <header className="topbar">
            {/* BACKGROUND IMAGES */}
            <div className="topbar-bg-left">
                <img src={maintenanceImg} alt="" />
            </div>

            <div className="topbar-bg-right">
                <img src={blueprintImg} alt="" />
            </div>

            {/* LEFT SECTION - SYSTEM IDENTITY */}
            <div className="topbar-left">
                <h1 className="system-identity-title">
                    AI Prescriptive Maintenance Core
                </h1>
                <div className="system-status-group">
                    <div className="agent-status-indicator active">
                        <span className="status-dot"></span>
                        <span className="status-label">AI Agent Active</span>
                    </div>
                    <span className="status-divider">|</span>
                    <span className="system-ready-text">System Ready</span>
                </div>
            </div>

            {/* CENTER SECTION - UNIFIED COMMAND DIRECTIVE */}
            <div className="topbar-center">
                <p className="system-directive-statement">
                    Continuous machine intelligence monitoring, anomaly detection, and prescriptive action generation to reduce unplanned downtime.
                </p>
            </div>

            {/* RIGHT SECTION - METRICS & TELEMETRY */}
            <div className="topbar-right">
                <div className="telemetry-block border-right">
                    <span className="telemetry-label">SYSTEM TIME</span>
                    <span className="telemetry-value text-glow">10:42 AM</span>
                    <span className="telemetry-subtext">20 June 2026</span>
                </div>

                <div className="telemetry-block">
                    <span className="telemetry-label">SYSTEM UPTIME</span>
                    <span className="telemetry-value">99.4%</span>
                    <div className="operational-status-tag">
                        <span className="pulse-dot"></span>
                        <span className="status-tag-text">OPERATIONAL</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;