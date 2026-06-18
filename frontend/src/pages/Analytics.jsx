// Analytics.jsx
import React, { useState } from 'react';
import {
    FiTrendingUp,
    FiClock,
    FiCheckCircle,
    FiActivity,
    FiDownload,
    FiCalendar,
    FiCpu,
    FiAlertTriangle
} from 'react-icons/fi';
import '../styles/analytics.css';

export default function Analytics() {
    const [timeframe, setTimeframe] = useState('30d');

    return (
        <div className="an-container">
            <header className="an-header">
                <div>
                    <h1 className="an-title">Analytics</h1>
                    <p className="an-subtitle">Operational intelligence, predictive telemetry, and maintenance performance metrics</p>
                </div>
                <div className="an-actions">
                    <div className="an-select-wrapper">
                        <FiCalendar className="an-icon-inline" />
                        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last Quarter</option>
                        </select>
                    </div>
                    <button className="an-btn-secondary">
                        <FiDownload /> Export Dataset
                    </button>
                </div>
            </header>

            {/* KPI Dashboard Grid */}
            <section className="an-kpi-grid">
                <div className="an-kpi-card">
                    <span className="an-kpi-lbl">Mean Time to Repair (MTTR)</span>
                    <div className="an-kpi-value-row">
                        <h3 className="an-kpi-val">2.4 <span className="an-kpi-unit">hrs</span></h3>
                        <span className="an-trend-badge decrease"><FiClock /> -14%</span>
                    </div>
                    <p className="an-kpi-desc">Average resolution time across critical asset alerts</p>
                </div>

                <div className="an-kpi-card">
                    <span className="an-kpi-lbl">Alert Volume Trend</span>
                    <div className="an-kpi-value-row">
                        <h3 className="an-kpi-val">38 <span className="an-kpi-unit">Incidents</span></h3>
                        <span className="an-trend-badge stable"><FiActivity /> Stable</span>
                    </div>
                    <p className="an-kpi-desc">Total logged warnings and failures in active period</p>
                </div>

                <div className="an-kpi-card">
                    <span className="an-kpi-lbl">RAG Retrieval Accuracy</span>
                    <div className="an-kpi-value-row">
                        <h3 className="an-kpi-val">94.8%</h3>
                        <span className="an-trend-badge increase"><FiTrendingUp /> +2.1%</span>
                    </div>
                    <p className="an-kpi-desc">AI vector search precision on technical documentation</p>
                </div>

                <div className="an-kpi-card">
                    <span className="an-kpi-lbl">Overall Fleet Health Score</span>
                    <div className="an-kpi-value-row">
                        <h3 className="an-kpi-val text-success">91.2<span className="an-kpi-unit">/100</span></h3>
                        <span className="an-trend-badge increase"><FiCheckCircle /> Optimal</span>
                    </div>
                    <p className="an-kpi-desc">Composite operational index across monitored nodes</p>
                </div>
            </section>

            {/* Main Analytics Data Visualization Matrix */}
            <div className="an-charts-matrix">
                {/* Mock Chart Block 1: Maintenance Frequency */}
                <div className="an-chart-block">
                    <div className="an-chart-head">
                        <h4>Maintenance Timeline Trend</h4>
                        <span className="an-chart-sub">Daily tracked operational disruptions vs preventative executions</span>
                    </div>
                    <div className="an-mock-visualization-bar-chart">
                        <div className="an-bar-column"><div className="an-bar-fill primary" style={{ height: '65%' }}></div><span className="an-bar-lbl">W22</span></div>
                        <div className="an-bar-column"><div className="an-bar-fill primary" style={{ height: '42%' }}></div><span className="an-bar-lbl">W23</span></div>
                        <div className="an-bar-column"><div className="an-bar-fill primary" style={{ height: '88%' }}></div><span className="an-bar-lbl">W24</span></div>
                        <div className="an-bar-column"><div className="an-bar-fill primary" style={{ height: '55%' }}></div><span className="an-bar-lbl">W25</span></div>
                        <div className="an-bar-column"><div className="an-bar-fill primary" style={{ height: '30%' }}></div><span className="an-bar-lbl">W26</span></div>
                    </div>
                </div>

                {/* Mock Chart Block 2: Severity Metrics Breakdown */}
                <div className="an-chart-block">
                    <div className="an-chart-head">
                        <h4>Alert Severity Segmentation</h4>
                        <span className="an-chart-sub">Proportional volume of cataloged events</span>
                    </div>
                    <div className="an-mock-visualization-donut">
                        <div className="an-donut-graphic">
                            <div className="an-donut-center">
                                <span className="an-donut-total">38</span>
                                <span className="an-donut-lbl">Events</span>
                            </div>
                        </div>
                        <div className="an-donut-legend">
                            <div className="an-legend-item"><span className="legend-dot danger"></span> <span>Critical Issues (12%)</span></div>
                            <div className="an-legend-item"><span className="legend-dot warning"></span> <span>Warnings Flags (38%)</span></div>
                            <div className="an-legend-item"><span className="legend-dot primary"></span> <span>Nominal Traces (50%)</span></div>
                        </div>
                    </div>
                </div>

                {/* Mock Chart Block 3: Chronic Asset Failures */}
                <div className="an-chart-block full-width">
                    <div className="an-chart-head">
                        <h4>Top Failing Machine Infrastructures</h4>
                        <span className="an-chart-sub">Identified nodes exhibiting highest frequency variance limits</span>
                    </div>
                    <div className="an-horizontal-bars">
                        <div className="an-h-bar-row">
                            <span className="an-h-lbl">Hydraulic Press P-04</span>
                            <div className="an-h-track"><div className="an-h-fill danger" style={{ width: '78%' }}></div></div>
                            <span className="an-h-val">14 Alerts</span>
                        </div>
                        <div className="an-h-bar-row">
                            <span className="an-h-lbl">CNC Milling Unit C-12</span>
                            <div className="an-h-track"><div className="an-h-fill warning" style={{ width: '52%' }}></div></div>
                            <span className="an-h-val">9 Alerts</span>
                        </div>
                        <div className="an-h-bar-row">
                            <span className="an-h-lbl">Rotary Compressor K-08</span>
                            <div className="an-h-track"><div className="an-h-fill sage" style={{ width: '34%' }}></div></div>
                            <span className="an-h-val">6 Alerts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Telemetry Performance Snapshot Table */}
            <div className="an-snapshot-section">
                <h3 className="an-section-title">Recent System Performance Snapshots</h3>
                <div className="an-table-wrapper">
                    <table className="an-table">
                        <thead>
                            <tr>
                                <th>Monitored Node Component</th>
                                <th>Peak Thermal Level</th>
                                <th>Mean Vibration Multiplier</th>
                                <th>AI Diagnostic Reliability</th>
                                <th>Operational Integrity Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="strong"><FiCpu className="table-inline-icon" /> Hydraulic Press P-04</td>
                                <td>94°C</td>
                                <td>2.4 mm/s</td>
                                <td>96.2%</td>
                                <td><span className="an-status-tag danger">Out of Bounds</span></td>
                            </tr>
                            <tr>
                                <td className="strong"><FiCpu className="table-inline-icon" /> CNC Milling Unit C-12</td>
                                <td>82°C</td>
                                <td>4.1 mm/s</td>
                                <td>94.5%</td>
                                <td><span className="an-status-tag warning">Impaired Parameters</span></td>
                            </tr>
                            <tr>
                                <td className="strong"><FiCpu className="table-inline-icon" /> Induction Furnace F-01</td>
                                <td>1420°C</td>
                                <td>0.8 mm/s</td>
                                <td>98.1%</td>
                                <td><span className="an-status-tag success">Nominal Alignment</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}