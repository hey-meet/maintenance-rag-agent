import React from 'react';

const SystemScanBar = ({ progress = 0 }) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const isComplete = clampedProgress === 100;

    return (
        <div className="system-scan-bar">
            <div className="scan-header">
                <span className="scan-label">System Scan In Progress</span>
                <span className="scan-percentage">{clampedProgress}%</span>
            </div>
            <div className="scan-bar">
                <div
                    className={`scan-progress ${isComplete ? 'complete' : ''}`}
                    style={{ width: `${clampedProgress}%` }}
                ></div>
                {!isComplete && <div className="scan-laser"></div>}
            </div>
        </div>
    );
};

export default SystemScanBar;