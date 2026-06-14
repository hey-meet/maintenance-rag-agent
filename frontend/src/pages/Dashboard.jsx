import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";

function Dashboard() {
    return (
        <DashboardLayout>
            <div className="dashboard-page">

                <section className="dashboard-header">
                    <h2>System Overview</h2>
                    <p>
                        Monitor machinery status, maintenance manuals, alerts, and retrieval activity.
                    </p>
                </section>

                <section className="stats-grid">
                    <div className="stat-card">
                        <h3>Machines</h3>
                        <span>12</span>
                    </div>

                    <div className="stat-card">
                        <h3>Manuals</h3>
                        <span>4</span>
                    </div>

                    <div className="stat-card">
                        <h3>Processed Pages</h3>
                        <span>520</span>
                    </div>

                    <div className="stat-card">
                        <h3>Alerts Today</h3>
                        <span>0</span>
                    </div>
                </section>

                <section className="dashboard-grid">

                    <div className="dashboard-panel">
                        <h3>Recent Alerts</h3>

                        <div className="panel-item">
                            <strong>PUMP-01</strong>
                            <p>Temperature High</p>
                        </div>

                        <div className="panel-item">
                            <strong>MOTOR-02</strong>
                            <p>Bearing Warning</p>
                        </div>

                        <div className="panel-item">
                            <strong>HVAC-03</strong>
                            <p>Pressure Drop</p>
                        </div>
                    </div>

                    <div className="dashboard-panel">
                        <h3>Retrieval Activity</h3>

                        <div className="panel-item">
                            <p>Manual Query Executed</p>
                        </div>

                        <div className="panel-item">
                            <p>Page Retrieved</p>
                        </div>

                        <div className="panel-item">
                            <p>Repair Suggestion Generated</p>
                        </div>
                    </div>

                </section>

            </div>
        </DashboardLayout>
    );
}

export default Dashboard;