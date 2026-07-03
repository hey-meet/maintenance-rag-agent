import React from 'react';
import { Link } from "react-router-dom";

const ActiveAlerts = ({ data }) => {

    const alerts = data || [];

    return (
        <div className="active-alerts">

            <div className="alerts-header">
                <h3>ACTIVE ALERTS</h3>
                <span className="alert-count">
                    {alerts.length}
                </span>
            </div>

            <div className="alerts-list">

                {alerts.length === 0 ? (

                    <div className="alert-item">
                        <div className="alert-content">
                            <div className="alert-title">
                                No Active Alerts Detected
                            </div>
                            <div className="alert-meta" style={{ marginTop: '4px', fontSize: '0.75rem', color: '#8c8c8c' }}>
                                All monitored assets operating normally.
                            </div>
                        </div>
                    </div>

                ) : (

                    alerts.map((alert, index) => (

                        <div
                            key={index}
                            className="alert-item"
                        >

                            <div className="alert-severity">
                                <span
                                    className={`severity-badge severity-${alert.severity.toLowerCase()}`}
                                >
                                    {alert.severity}
                                </span>
                            </div>

                            <div className="alert-content">

                                <div className="alert-title">
                                    Error Code {alert.error_code}
                                </div>

                                <div className="alert-meta">

                                    <span className="alert-machine">
                                        {alert.machine_id}
                                    </span>

                                    <span className="alert-time">
                                        {alert.temperature}°C
                                    </span>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

            <div className="alerts-footer">
                <Link to="/alerts" className="footer-button">
                    View All Alerts →
                </Link>
            </div>

        </div>
    );
};

export default ActiveAlerts;