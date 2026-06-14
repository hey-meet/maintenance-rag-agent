import React from "react";

const menuItems = [
    "Dashboard",
    "Machines",
    "Manuals",
    "Knowledge Base",
    "Alerts",
    "Settings",
];

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Maintenance AI</h2>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button key={item} className="sidebar-link">
                        {item}
                    </button>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;