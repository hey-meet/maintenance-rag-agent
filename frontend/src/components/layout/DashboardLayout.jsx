import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper">
                <Topbar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;