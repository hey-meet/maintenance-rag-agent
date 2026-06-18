// Reports.jsx
import React, { useState } from 'react';
import {
    FiFileText,
    FiCpu,
    FiAlertTriangle,
    FiDownload,
    FiLayers,
    FiCalendar,
    FiTrendingUp,
    FiCheckCircle
} from 'react-icons/fi';
import '../styles/reports.css';

const MOCK_REPORTS = [
    {
        id: 'REP-2026-04',
        name: 'Q2 Comprehensive Hydraulics Audit',
        machine: 'Hydraulic Press P-04',
        period: '2026 May - June',
        score: '78/100',
        status: 'Ready',
        alerts: 14,
        orders: 4,
        recommendation: 'Complete full teardown of fluid line bypass valve V-12 and execute core pressure recalibration routine.'
    },
    {
        id: 'REP-2026-05',
        name: 'CNC Milling Unit Health Run',
        machine: 'CNC Milling Unit C-12',
        period: '2026 June',
        score: '84/100',
        status: 'Ready',
        alerts: 9,
        orders: 2,
        recommendation: 'Monitor spindle resonance bearing tracks at weekly interval windows. Keep baseline RPM bounded.'
    },
    {
        id: 'REP-2026-06',
        name: 'Induction Thermal Structural Map',
        machine: 'Induction Furnace F-01',
        period: '2026 Full Horizon',
        score: '96/100',
        status: 'Ready',
        alerts: 2,
        orders: 1,
        recommendation: 'System architecture displays high stability metrics. Perform standard clean checks on next down window.'
    }
];

export default function Reports() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [selectedId, setSelectedId] = useState(MOCK_REPORTS[0]?.id || null);

    const activeReport = reports.find(r => r.id === selectedId) || reports[0];

    return (
        <div className="rep-container">
            <header className="rep-header">
                <div>
                    <h1 className="rep-title">Reports</h1>
                    <p className="rep-subtitle">Exportable engineering maintenance summaries, compliance data packages, and asset diagnostics</p>
                </div>
            </header>

            {/* Overview Cards Row */}
            <section className="rep-kpi-row">
                <div className="rep-kpi-card">
                    <span className="rep-kpi-lbl">Reports Generated</span>
                    <h3 className="rep-kpi-val">124</h3>
                </div>
                <div className="rep-kpi-card">
                    <span className="rep-kpi-lbl">Active Nodes Covered</span>
                    <h3 className="rep-kpi-val">18</h3>
                </div>
                <div className="rep-kpi-card">
                    <span className="rep-kpi-lbl">Logged Heavy Exceptions</span>
                    <h3 className="rep-kpi-val text-danger">24</h3>
                </div>
                <div className="rep-kpi-card">
                    <span className="rep-kpi-lbl">PDF Archives Compiled</span>
                    <h3 className="rep-kpi-val text-success">86</h3>
                </div>
            </section>

            {/* Main Split Layout */}
            <div className="rep-workspace">
                <div className="rep-left-column">
                    {/* Interactive Report Generator Form */}
                    <div className="rep-builder-card">
                        <h4><FiLayers /> Formulate Custom Audit Summary</h4>
                        <div className="rep-form-grid">
                            <div className="rep-input-group">
                                <label>Select Target Equipment Node</label>
                                <select defaultValue="p04">
                                    <option value="p04">Hydraulic Press P-04</option>
                                    <option value="c12">CNC Milling Unit C-12</option>
                                    <option value="f01">Induction Furnace F-01</option>
                                </select>
                            </div>

                            <div className="rep-input-group">
                                <label>Target Datetime Bound</label>
                                <select defaultValue="30">
                                    <option value="7">Previous 7 Days Trace</option>
                                    <option value="30">Previous 30 Days Trace</option>
                                    <option value="90">Full Structural Quarter</option>
                                </select>
                            </div>

                            <div className="rep-input-group">
                                <label>Analytical Summary Class</label>
                                <select defaultValue="health">
                                    <option value="health">Asset Health & Degradation</option>
                                    <option value="compliance">Regulatory LOTO Compliance</option>
                                    <option value="vibe">Vibration & Harmonic Resonances</option>
                                </select>
                            </div>
                        </div>
                        <button className="rep-submit-btn" onClick={() => alert('Compiling structural telemetry files...')}>
                            Compile System Summary Package
                        </button>
                    </div>

                    {/* Historical Generated Index */}
                    <div className="rep-list-card">
                        <h4>Compiled Document Ledger</h4>
                        <div className="rep-table-scroller">
                            <table className="rep-table">
                                <thead>
                                    <tr>
                                        <th>Report Classification Label</th>
                                        <th>Target Asset</th>
                                        <th>Chronological Scope</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r) => (
                                        <tr
                                            key={r.id}
                                            className={`rep-row ${activeReport?.id === r.id ? 'active' : ''}`}
                                            onClick={() => setSelectedId(r.id)}
                                        >
                                            <td>
                                                <div className="rep-name-cell">
                                                    <FiFileText className="rep-doc-icon" />
                                                    <div>
                                                        <span className="rep-name-txt">{r.name}</span>
                                                        <span className="rep-id-txt font-mono">{r.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="strong">{r.machine}</td>
                                            <td className="text-secondary">{r.period}</td>
                                            <td><span className="rep-status-badge">{r.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Selected Document Preview Layout Block */}
                <div className="rep-preview-panel">
                    {activeReport ? (
                        <div className="rep-preview-card">
                            <div className="rep-preview-head">
                                <div>
                                    <span className="font-mono text-secondary">{activeReport.id}</span>
                                    <h3>Document Inspection</h3>
                                </div>
                                <button className="rep-download-btn" onClick={() => alert(`Downloading structural package ${activeReport.id}`)}>
                                    <FiDownload /> Export Document
                                </button>
                            </div>

                            <div className="rep-preview-meta-strip">
                                <div className="rep-meta-item">
                                    <span className="lbl">Target Unit</span>
                                    <span className="val strong">{activeReport.machine}</span>
                                </div>
                                <div className="rep-meta-item">
                                    <span className="lbl">Composite Rating</span>
                                    <span className={`val strong ${parseInt(activeReport.score) < 80 ? 'text-warning' : 'text-success'}`}>{activeReport.score}</span>
                                </div>
                            </div>

                            <div className="rep-preview-section">
                                <h5><FiTrendingUp /> Operational Metrics Run</h5>
                                <div className="rep-preview-stats-grid">
                                    <div className="stat-box">
                                        <span className="lbl">Logged Flagged Exceptions</span>
                                        <span className="val text-danger"><FiAlertTriangle /> {activeReport.alerts}</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="lbl">Executed Remediations</span>
                                        <span className="val"><FiCpu /> {activeReport.orders} Orders</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rep-preview-section highlight-box">
                                <h5><FiCheckCircle /> AI Strategy & Recommendation Output</h5>
                                <p className="rep-body-p">{activeReport.recommendation}</p>
                            </div>

                            <div className="rep-preview-footer">
                                <p className="legal-stamp">Certified data compilation matching standard cryptographic telemetry history logs. Immutable file index tracking active.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rep-preview-empty">
                            <p>Select a cataloged file entry from the index to build analytical data preview panels.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}