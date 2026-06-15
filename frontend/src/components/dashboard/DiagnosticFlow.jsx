import React from 'react';
import DataWaveCanvas from '../visualization/DataWaveCanvas';

const DiagnosticFlow = () => {
    return (
        <div className="diagnostic-flow">
            <div className="section-header">
                <h2 className="section-title">AI Diagnostic Flow</h2>
                <span className="flow-status">Predictive Analysis Active</span>
            </div>
            <div className="wave-container">
                <DataWaveCanvas />
            </div>
            <div className="diagnostic-metrics">
                <div className="metric">
                    <span className="metric-label">Signal Confidence</span>
                    <span className="metric-value">94%</span>
                </div>
                <div className="metric">
                    <span className="metric-label">Anomaly Score</span>
                    <span className="metric-value">0.023</span>
                </div>
                <div className="metric">
                    <span className="metric-label">RUL Estimate</span>
                    <span className="metric-value">328 hrs</span>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticFlow;