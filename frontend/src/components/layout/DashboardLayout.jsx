import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            {/* Fixed Navigation Sidebar */}
            <Sidebar />

            <div className="main-wrapper">
                {/* Fixed Top Controls Bar */}
                <Topbar />

                {/* Dynamic Center Workspace */}
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;