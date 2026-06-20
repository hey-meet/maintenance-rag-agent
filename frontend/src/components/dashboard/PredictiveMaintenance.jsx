import React from 'react';

const PredictiveMaintenance = ({ data }) => {
    // Generate prescription recommendations from inventory metrics risk assessments
    const recommendations = data?.slice(0, 3).map((part, index) => {
        let riskText = "Available Inventory";

        // Map backend stock thresholds to explicit prescriptive constraints
        if (part.status?.toLowerCase() === 'out of stock' || part.current_stock === 0) {
            riskText = "Out of Stock Risk";
        } else if (part.status?.toLowerCase() === 'low stock' || part.current_stock <= part.minimum_stock) {
            riskText = "Low Stock Risk";
        }

        return {
            id: index,
            title: part.part_name,
            risk: riskText
        };
    }) || [];

    return (
        <div className="predictive-maintenance">
            <div className="pm-header">
                <h3>PRESCRIPTIVE MAINTENANCE</h3>
            </div>
            <div className="pm-content">
                <div className="reliability-section">
                    <div className="reliability-score">
                        <span className="score-value">92%</span>
                        <span className="score-label">AI Recommendation Confidence</span>
                    </div>
                </div>
                <div className="maintenance-list">
                    {recommendations.length === 0 ? (
                        <div className="maintenance-item">
                            <span className="item-title">No Inventory Risks Identified</span>
                            <span className="item-due">All Parts Nominal</span>
                        </div>
                    ) : (
                        recommendations.map(task => (
                            <div key={task.id} className="maintenance-item">
                                <span className="item-title">{task.title}</span>
                                <span className="item-due">{task.risk}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="pm-footer">
                <button className="footer-button">View Prescriptive Report →</button>
            </div>
        </div>
    );
};

export default PredictiveMaintenance;