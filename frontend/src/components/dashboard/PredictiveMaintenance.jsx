import React from 'react';

const PredictiveMaintenance = () => {
    const maintenanceTasks = [
        { id: 1, title: 'CNC-02 Spindle', due: 2, unit: 'days' },
        { id: 2, title: 'MILL-01 Bearing Replacement', due: 5, unit: 'days' },
        { id: 3, title: 'Hydraulic Filter Change', due: 7, unit: 'days' }
    ];

    return (
        <div className="predictive-maintenance">
            <div className="pm-header">
                <h3>PREDICTIVE MAINTENANCE</h3>
            </div>
            <div className="pm-content">
                <div className="reliability-section">
                    <div className="reliability-score">
                        <span className="score-value">85%</span>
                        <span className="score-label">Overall Reliability</span>
                    </div>
                </div>
                <div className="maintenance-list">
                    {maintenanceTasks.map(task => (
                        <div key={task.id} className="maintenance-item">
                            <span className="item-title">{task.title}</span>
                            <span className="item-due">Due in {task.due} {task.unit}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="pm-footer">
                <button className="footer-button">View Prediction Report →</button>
            </div>
        </div>
    );
};

export default PredictiveMaintenance;