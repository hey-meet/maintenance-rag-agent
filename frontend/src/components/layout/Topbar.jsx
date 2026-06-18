import React from "react";
import {
    FiBell,
    FiChevronDown,
    FiAlertTriangle,
    FiClipboard,
    FiHeart,
    FiCpu,
} from "react-icons/fi";



const Topbar = () => {
    return (
        <header className="topbar">

            {/* LEFT */}
            <div className="topbar-greeting">
                <h1>Good Morning, Operator</h1>

                <div className="agent-status">
                    <span className="status-dot"></span>
                    <span>AI Maintenance Agent Online</span>
                </div>
            </div>

            {/* CENTER KPI CARDS */}
            <div className="topbar-stats">

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiCpu />
                    </div>

                    <div className="stat-content">
                        <span className="stat-label">Machines</span>
                        <span className="stat-value">12</span>
                    </div>
                </div>

                <div className="stat-divider"></div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <FiAlertTriangle />
                    </div>

                    <div className="stat-content">
                        <span className="stat-label">Alerts</span>
                        <span className="stat-value">3</span>
                    </div>
                </div>

                <div className="stat-divider"></div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiClipboard />
                    </div>

                    <div className="stat-content">
                        <span className="stat-label">Work Orders</span>
                        <span className="stat-value">8</span>
                    </div>
                </div>

                <div className="stat-divider"></div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <FiHeart />
                    </div>

                    <div className="stat-content">
                        <span className="stat-label">Health Score</span>
                        <span className="stat-value">93%</span>
                    </div>
                </div>

            </div>

            {/* RIGHT */}
            <div className="topbar-actions">

                <button className="notification-btn">
                    <FiBell />
                    <span className="notification-count">3</span>
                </button>

                <div className="profile-section">

                    <div className="profile-avatar">
                        <span>O</span>
                    </div>

                    <div className="profile-info">
                        <span className="profile-name">Operator</span>
                        <span className="profile-role">
                            Maintenance Team
                        </span>
                    </div>

                    <FiChevronDown className="profile-arrow" />

                </div>

            </div>

        </header>
    );
};

export default Topbar;