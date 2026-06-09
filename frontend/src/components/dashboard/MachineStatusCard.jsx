import React from "react";

function MachineStatusCard({ title, value }) {
    return (
        <div className="stat-card">
            <h3>{title}</h3>
            <span>{value}</span>
        </div>
    );
}

export default MachineStatusCard;