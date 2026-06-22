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
                {/* Statistics items removed successfully */}
            </div>
        </div>
    );
};

export default SystemOverview;