import React, { useEffect, useState } from 'react';

import SystemOverview from '../components/dashboard/SystemOverview';
import MachineHealthMatrix from '../components/dashboard/MachineHealthMatrix';
import LiveVitals from '../components/dashboard/LiveVitals';

import DiagnosticFlow from '../components/dashboard/DiagnosticFlow';
import ActiveAlerts from '../components/dashboard/ActiveAlerts';

import PredictiveMaintenance from '../components/dashboard/PredictiveMaintenance';
import WorkOrders from '../components/dashboard/WorkOrders';
import ActivityFeed from '../components/dashboard/ActivityFeed';

import dashboardService from "../services/dashboardService";

const Dashboard = () => {

    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const data =
                    await dashboardService.getDashboardData();

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
                <SystemOverview
                    data={dashboardData?.systemOverview}
                />
                <MachineHealthMatrix
                    data={dashboardData?.machineHealthMatrix}
                />
                <LiveVitals
                    data={dashboardData?.liveVitals}
                />
            </div>

            <div className="dashboard-middle-row">
                <DiagnosticFlow
                    data={dashboardData?.diagnosticFlow}
                />

                <ActiveAlerts
                    data={dashboardData?.activeAlerts}
                />
            </div>

            <div className="dashboard-bottom-row">
                <PredictiveMaintenance
                    data={dashboardData?.predictiveMaintenance}
                />
                <WorkOrders
                    data={dashboardData?.workOrders}
                />
                <ActivityFeed
                    data={dashboardData?.activityFeed}
                />
            </div>

        </div>
    );
};

export default Dashboard;