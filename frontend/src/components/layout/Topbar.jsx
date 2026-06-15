import React from 'react';

const Topbar = () => {
    return (
        <header className="topbar">
            {/* Left Section */}
            <div className="topbar-left">
                <button className="mobile-menu-toggle" aria-label="Menu">
                    ☰
                </button>
                <div className="breadcrumb-area">
                    <span className="page-title">Dashboard</span>
                    <span className="breadcrumb">/ Overview</span>
                </div>
            </div>

            {/* Center Section - Search */}
            <div className="search-area">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search work orders, assets, or alerts..."
                    aria-label="Search"
                />
            </div>

            {/* Right Section */}
            <div className="topbar-right">
                <button className="notification-btn" aria-label="Notifications">
                    <span className="notification-icon">🔔</span>
                    <span className="notification-badge"></span>
                </button>

                <button className="settings-btn" aria-label="Settings">
                    <span className="settings-icon">⚙️</span>
                </button>

                <div className="user-profile">
                    <div className="user-avatar">JD</div>
                    <div className="user-info">
                        <div className="user-name">John Davis</div>
                        <div className="user-role">Maintenance Supervisor</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Topbar;