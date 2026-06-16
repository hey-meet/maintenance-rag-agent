import React from "react";

function Topbar() {
    return (
        <header className="topbar">
            <div>
                <h1 className="topbar-title">
                    Industrial Maintenance Command Center
                </h1>
                <p className="topbar-subtitle">
                    AI Powered Maintenance Assistant
                </p>
            </div>

            <div className="topbar-user">
                <span>Meet</span>
            </div>
        </header>
    );
}

export default Topbar;