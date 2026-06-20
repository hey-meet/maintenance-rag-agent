import React from 'react';
import RadarScanner from '../visualization/RadarScanner';


const SystemOverview = ({ data }) => {
    return (
        <div className="system-overview">
            <div className="overview-card scanner-card">
                <div className="card-header">
                    <h3 className="card-title">AI Radar Scanner</h3>
                    <span className="badge active">Live</span>
                </div>
                <RadarScanner />

            </div>
            <div className="overview-stats">
                <div className="stat-item">
                    <span className="stat-label">Active Assets</span>
                    <span className="stat-value">{data?.indexed_manuals || 0}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Active Alerts</span>
                    <span className="stat-value warning">{data?.active_alerts || 0}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">AI Predictions</span>
                    <span className="stat-value">
                        {data?.vector_chunks
                            ? `${Math.min(
                                Math.round(
                                    data.vector_chunks / 500
                                ),
                                99
                            )}%`
                            : "92%"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SystemOverview;