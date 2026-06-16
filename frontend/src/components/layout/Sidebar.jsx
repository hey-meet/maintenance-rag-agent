import React from "react";
import {
    RiDashboardLine,
    RiRobot2Line,
    RiAlarmWarningLine,
    RiToolsLine,
    RiArchiveDrawerLine,
    RiFileUploadLine,
    RiBarChartBoxLine,
    RiFileChartLine,
    RiSettings4Line,
    RiSettings5Line,
} from "react-icons/ri";

// Fixed: Changed from '../' to '../../' to correctly match your project structure
import gearsBg from "../../assets/images/gears.png";

const Sidebar = () => {
    const menuItems = [
        {
            label: "Dashboard",
            icon: <RiDashboardLine />,
            active: true,
        },
        {
            label: "AI Assistant",
            icon: <RiRobot2Line />,
        },
        {
            label: "Alerts",
            icon: <RiAlarmWarningLine />,
        },
        {
            label: "Work Orders",
            icon: <RiToolsLine />,
        },
        {
            label: "Inventory",
            icon: <RiArchiveDrawerLine />,
        },
        {
            label: "Upload Manuals",
            icon: <RiFileUploadLine />,
        },
        {
            label: "Analytics",
            icon: <RiBarChartBoxLine />,
        },
        {
            label: "Reports",
            icon: <RiFileChartLine />,
        },
        {
            label: "Settings",
            icon: <RiSettings4Line />,
        },
    ];

    // Isolated styles block specifically scoped using inline React structures
    const sidebarInlineStyle = {
        width: "260px",
        minWidth: "260px",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        padding: "22px 14px",
        overflow: "hidden",
        backgroundColor: "rgba(22, 22, 22, 0.4)",
        backgroundImage: `url(${gearsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
    };

    return (
        <>
            <style>{`
                /* Scoped directly by nesting inside a unique container namespace */
                .isolated-sidebar-container .sidebar-logo {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  position: relative;
                  z-index: 2;
                  padding: 8px 10px 18px;
                  border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .isolated-sidebar-container .logo-icon {
                  width: 42px;
                  height: 42px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 12px;
                  background: rgba(255,255,255,0.06);
                  border: 1px solid rgba(255,255,255,0.08);
                  color: #f2f2f2;
                  font-size: 22px;
                }

                .isolated-sidebar-container .logo-content h3 {
                  margin: 0;
                  color: #ffffff;
                  font-size: 17px;
                  font-weight: 700;
                  letter-spacing: 0.8px;
                  line-height: 1.1;
                }

                .isolated-sidebar-container .logo-content span {
                  display: block;
                  margin-top: 4px;
                  color: rgba(255,255,255,0.52);
                  font-size: 10px;
                  font-weight: 500;
                  letter-spacing: 1.8px;
                }

                .isolated-sidebar-container .sidebar-menu {
                  position: relative;
                  z-index: 2;
                  margin-top: 24px;
                }

                .isolated-sidebar-container .menu-section-title {
                  padding: 0 12px;
                  margin-bottom: 12px;
                  color: rgba(255,255,255,0.42);
                  font-size: 11px;
                  font-weight: 700;
                  letter-spacing: 2.4px;
                  text-transform: uppercase;
                }

                .isolated-sidebar-container .menu-item {
                  display: flex;
                  align-items: center;
                  gap: 14px;
                  height: 48px;
                  padding: 0 16px;
                  border-radius: 14px;
                  color: rgba(255,255,255,0.70);
                  cursor: pointer;
                  transition: all 250ms ease;
                }

                .isolated-sidebar-container .menu-item:not(:last-child) {
                  margin-bottom: 6px;
                }

                .isolated-sidebar-container .menu-item:hover {
                  background: rgba(255,255,255,0.04);
                  color: rgba(255,255,255,0.95);
                  transform: translateX(3px);
                }

                .isolated-sidebar-container .menu-item.active {
                  background: rgba(255,255,255,0.06);
                  border: 1px solid rgba(255,255,255,0.08);
                  color: #ffffff;
                  box-shadow: 0 8px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.05);
                }

                .isolated-sidebar-container .menu-icon {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 20px;
                  opacity: 0.8;
                }

                .isolated-sidebar-container .menu-item.active .menu-icon {
                  opacity: 1;
                }

                .isolated-sidebar-container .menu-label {
                  font-size: 14px;
                  font-weight: 500;
                }

                .isolated-sidebar-container .sidebar-art-space {
                  flex: 1;
                  min-height: 280px;
                }

                @media (max-width: 1024px) {
                  .isolated-sidebar-container {
                    width: 250px !important;
                    min-width: 250px !important;
                  }
                }

                @media (max-width: 768px) {
                  .isolated-sidebar-container {
                    position: fixed !important;
                    left: 0;
                    top: 0;
                    z-index: 999;
                  }
                }
            `}</style>

            <aside className="isolated-sidebar-container" style={sidebarInlineStyle}>
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <RiSettings5Line />
                    </div>

                    <div className="logo-content">
                        <h3>MAINTENANCE</h3>
                        <span>COMMAND CENTER</span>
                    </div>
                </div>

                <nav className="sidebar-menu">
                    <div className="menu-section-title">CORE</div>

                    {menuItems.map((item) => (
                        <div
                            key={item.label}
                            className={`menu-item ${item.active ? "active" : ""}`}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-label">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-art-space" />
            </aside>
        </>
    );
};

export default Sidebar;
