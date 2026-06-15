import React from 'react';

import DashboardLayout from '../components/layout/DashboardLayout';

import SystemOverview from '../components/dashboard/SystemOverview';
import MachineHealthMatrix from '../components/dashboard/MachineHealthMatrix';
import LiveVitals from '../components/dashboard/LiveVitals';

import DiagnosticFlow from '../components/dashboard/DiagnosticFlow';
import ActiveAlerts from '../components/dashboard/ActiveAlerts';

import PredictiveMaintenance from '../components/dashboard/PredictiveMaintenance';
import WorkOrders from '../components/dashboard/WorkOrders';
import ActivityFeed from '../components/dashboard/ActivityFeed';

const Dashboard = () => {
    return (
        <DashboardLayout>
            <div className="dashboard-container">

                {/* TOP SECTION */}
                <div className="dashboard-top-row">
                    <SystemOverview />
                    <MachineHealthMatrix />
                    <LiveVitals />
                </div>

                {/* MIDDLE SECTION */}
                <div className="dashboard-middle-row">
                    <DiagnosticFlow />
                    <ActiveAlerts />
                </div>

                {/* BOTTOM SECTION */}
                <div className="dashboard-bottom-row">
                    <PredictiveMaintenance />
                    <WorkOrders />
                    <ActivityFeed />
                </div>

            </div>
        </DashboardLayout>
    );
};

export default Dashboard;