import React from "react";

const activities = [
    "Manual Query Executed",
    "Page Retrieved",
    "Repair Suggestion Generated",
];

function AnalyticsCard() {
    return (
        <div className="dashboard-panel">
            <h3>Retrieval Activity</h3>

            {activities.map((activity, index) => (
                <div key={index} className="panel-item">
                    <p>{activity}</p>
                </div>
            ))}
        </div>
    );
}

export default AnalyticsCard;