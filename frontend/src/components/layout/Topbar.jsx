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

            {/* LEFT SECTION */}
            <div className="topbar-left">
                <h1>Good Morning, Meet</h1>

                <div className="agent-status">
                    <span className="status-dot"></span>
                    <span>AI Agent Active</span>
                </div>

                <p className="system-subtitle">
                    Prescriptive Maintenance Intelligence System
                </p>
            </div>

            {/* CENTER SECTION - INTELLIGENT SYSTEM CHIPS */}
            <div className="topbar-center">
                <div className="system-chip">
                    PRESCRIPTIVE MODE
                </div>

                <div className="system-chip">
                    Hydraulic Press P-04
                </div>

                <div className="system-chip warning">
                    E-404 Bearing Overheat
                </div>

                <div className="system-chip success">
                    Recommendation Generated
                </div>
            </div>

            {/* RIGHT SECTION - SYSTEM INFORMATION PANEL */}
            <div className="topbar-right">
                <div className="time-block">
                    <span className="time-label">SYSTEM TIME</span>
                    <span className="time-value">10:42 AM</span>
                </div>

                <div className="date-block">
                    20 June 2026
                </div>

                <div className="uptime-block">
                    <span>UPTIME</span>
                    <strong>99.4%</strong>
                </div>
            </div>
        </header>
    );
};

export default Topbar;