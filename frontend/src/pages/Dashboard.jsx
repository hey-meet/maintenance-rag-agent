import React, { useEffect, useState } from 'react';

import SystemOverview from '../components/dashboard/SystemOverview';
import MachineHealthMatrix from '../components/dashboard/MachineHealthMatrix';
import LiveVitals from '../components/dashboard/LiveVitals';

import DiagnosticFlow from '../components/dashboard/DiagnosticFlow';
import ActiveAlerts from '../components/dashboard/ActiveAlerts';

import PredictiveMaintenance from '../components/dashboard/PredictiveMaintenance';
import WorkOrders from '../components/dashboard/WorkOrders';
import ActivityFeed from '../components/dashboard/ActivityFeed';

import telemetryService from '../services/telemetryService';

const Dashboard = () => {

    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const data =
                    await telemetryService.getDashboardData();

                console.log("Dashboard Data:", data);

                setDashboardData(data);

            } catch (error) {

                console.error(error);

            }

        };

        loadDashboard();

    }, []);

    return (
        <div className="dashboard-container">

            <div className="dashboard-top-row">
                <SystemOverview />
                <MachineHealthMatrix />
                <LiveVitals />
            </div>

            <div className="dashboard-middle-row">
                <DiagnosticFlow />

                <ActiveAlerts
                    dashboardData={dashboardData}
                />
            </div>

            <div className="dashboard-bottom-row">
                <PredictiveMaintenance />
                <WorkOrders
                    dashboardData={dashboardData}
                />
                <ActivityFeed
                    dashboardData={dashboardData}
                />
            </div>

        </div>
    );
};

export default Dashboard;