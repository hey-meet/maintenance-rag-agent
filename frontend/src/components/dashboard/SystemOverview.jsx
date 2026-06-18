import React from 'react';
import RadarScanner from '../visualization/RadarScanner';
import SystemScanBar from '../visualization/SystemScanBar';

const SystemOverview = () => {
    return (
        <div className="system-overview">
            <div className="overview-card scanner-card">
                <div className="card-header">
                    <h3 className="card-title">AI Radar Scanner</h3>
                    <span className="badge active">Live</span>
                </div>
                <RadarScanner />
                <SystemScanBar progress={78} />
            </div>
            <div className="overview-stats">
                <div className="stat-item">
                    <span className="stat-label">Active Assets</span>
                    <span className="stat-value">24</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Critical Alerts</span>
                    <span className="stat-value warning">3</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">AI Predictions</span>
                    <span className="stat-value">92%</span>
                </div>
            </div>
        </div>
    );
};

export default SystemOverview;