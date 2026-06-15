import React from 'react';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            {/* Logo Section */}
            <div className="sidebar-brand">
                <h1>MAINTENANCE AI</h1>
                <div className="sub">Command Center</div>
            </div>

            {/* Navigation Section */}
            <nav className="sidebar-menu">
                <div className="menu-section">
                    <div className="menu-section-title">Core</div>

                    <div className="menu-item">
                        <span className="menu-icon">📊</span>
                        <span className="menu-label">Dashboard</span>
                    </div>

                    <div className="menu-item">
                        <span className="menu-icon">⚠️</span>
                        <span className="menu-label">Alerts</span>
                    </div>

                    <div className="menu-item">
                        <span className="menu-icon">🔧</span>
                        <span className="menu-label">Work Orders</span>
                    </div>

                    <div className="menu-item">
                        <span className="menu-icon">📦</span>
                        <span className="menu-label">Inventory</span>
                    </div>

                    <div className="menu-item">
                        <span className="menu-icon">🤖</span>
                        <span className="menu-label">Assistant</span>
                    </div>
                </div>
            </nav>

            {/* System Status Section */}
            <div className="system-status-widget">
                <div className="status-indicator">
                    <span className="status-led"></span>
                    <span className="status-text">API Status: Online</span>
                </div>
                <div className="status-indicator">
                    <span className="status-led"></span>
                    <span className="status-text">Retrieval Status: Active</span>
                </div>
                <div className="status-indicator">
                    <span className="status-led"></span>
                    <span className="status-text">Telemetry Status: Streaming</span>
                </div>
            </div>

            {/* Bottom Decoration Area (gear watermark reserve) */}
            <div className="sidebar-watermark">
                <div className="watermark-icon">⚙️ ⚙️ ⚙️</div>
            </div>
        </aside>
    );
};

export default Sidebar;