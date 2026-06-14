import React from "react";

const alerts = [
    {
        machine: "PUMP-01",
        message: "Temperature High",
    },
    {
        machine: "MOTOR-02",
        message: "Bearing Warning",
    },
    {
        machine: "HVAC-03",
        message: "Pressure Drop",
    },
];

function AlertFeed() {
    return (
        <div className="dashboard-panel">
            <h3>Recent Alerts</h3>

            {alerts.map((alert, index) => (
                <div key={index} className="panel-item">
                    <strong>{alert.machine}</strong>
                    <p>{alert.message}</p>
                </div>
            ))}
        </div>
    );
}

export default AlertFeed;