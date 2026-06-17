import React from 'react';

const ActiveAlerts = () => {
    const alerts = [
        {
            id: 1,
            title: 'High Vibration Detected',
            machine: 'CNC-03',
            time: '10:41 AM',
            severity: 'critical'
        },
        {
            id: 2,
            title: 'Temperature Threshold',
            machine: 'MILL-01',
            time: '10:38 AM',
            severity: 'warning'
        },
        {
            id: 3,
            title: 'Tool Wear Detected',
            machine: 'LATHE-01',
            time: '10:35 AM',
            severity: 'warning'
        },
        {
            id: 4,
            title: 'Coolant Flow Drop',
            machine: 'PUMP-01',
            time: '10:32 AM',
            severity: 'critical'
        }
    ];

    return (
        <div className="active-alerts">
            <div className="alerts-header">
                <h3>ACTIVE ALERTS</h3>
                <span className="alert-count">{alerts.length}</span>
            </div>

            <div className="alerts-list">
                {alerts.map(alert => (
                    <div key={alert.id} className="alert-item">
                        <div className="alert-severity">
                            <span className={`severity-badge severity-${alert.severity}`}>
                                {alert.severity.toUpperCase()}
                            </span>
                        </div>
                        <div className="alert-content">
                            <div className="alert-title">{alert.title}</div>
                            <div className="alert-meta">
                                <span className="alert-machine">{alert.machine}</span>
                                <span className="alert-time">{alert.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="alerts-footer">
                <button className="footer-button">
                    View All Alerts →
                </button>
            </div>
        </div>
    );
};

export default ActiveAlerts;