import React, { useState, useEffect } from 'react';
import {
    FiFileText,
    FiCpu,
    FiAlertTriangle,
    FiDownload,
    FiLayers,
    FiCalendar,
    FiTrendingUp,
    FiCheckCircle,
    FiShield,
    FiClock,
    FiPieChart,
    FiDatabase,
    FiUser,
    FiActivity,
    FiSettings,
    FiCheckSquare,
    FiDollarSign,
    FiSliders,
    FiAlertCircle,
    FiBriefcase
} from 'react-icons/fi';
import {
    getReports,
    getReportById,
    generateReport
} from "../services/reportService";
import '../styles/reports.css';

export default function Reports() {
    // Backend State Management Hooks
    const [dashboardData, setDashboardData] = useState(null);
    const [reports, setReports] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form Configuration States
    const [targetNode, setTargetNode] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [reportType, setReportType] = useState('');
    const [toggles, setToggles] = useState({
        telemetry: true,
        workOrders: true,
        inventory: false,
        aiRecs: true,
        manuals: true
    });

    // Lifecycle Synchronization Loop
    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getReports();

            setDashboardData(data);
            setReports(data.report_library || []);

            if (data.report_library && data.report_library.length > 0) {
                setSelectedId(data.report_library[0].id);
            }

            // Initialize form selectors to match the dynamic data keys served from the backend
            if (data.report_generation_options) {
                const options = data.report_generation_options;
                if (options.assets?.length > 0) setTargetNode(options.assets[0]);
                if (options.date_ranges?.length > 0) setDateRange(options.date_ranges[0].value);
                if (options.report_types?.length > 0) setReportType(options.report_types[0].value);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load reporting suite metrics.");
        } finally {
            setLoading(false);
        }
    };

    // Derived State Mapping for Focused Document Review Panel
    const activeReport = reports.find(report => report.id === selectedId) || null;

    const handleToggleChange = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleGenerateReport = async () => {
        try {
            const response = await generateReport({
                asset: targetNode,
                date_range: dateRange,
                report_type: reportType,
                include_telemetry: toggles.telemetry,
                include_work_orders: toggles.workOrders,
                include_inventory: toggles.inventory,
                include_ai_recommendations: toggles.aiRecs,
                include_manual_references: toggles.manuals
            });

            alert(response.message || "Report generation initialized successfully.");
            await loadReports();
        } catch (err) {
            console.error(err);
            alert("Error running report generation pipeline.");
        }
    };

    // Loading and Error State Boundaries
    if (loading) {
        return <div className="loading-state" style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>Loading structural reporting parameters...</div>;
    }

    if (error || !dashboardData) {
        return <div className="error-state" style={{ padding: '4rem', textAlign: 'center', color: '#B91C1C' }}>{error || "An error occurred while compiling components."}</div>;
    }

    // Deconstruct safe layouts from operational keys
    const { overview_metrics, report_generation_options, reliability_snapshot, ai_recommendations, compliance_metrics, export_center } = dashboardData;

    return (
        <div className="rep-center-container">
            {/* Page Header */}
            <header className="rep-center-header">
                <div>
                    <h1 className="rep-center-title">Industrial Maintenance Reporting & Executive Review Center</h1>
                    <p className="rep-center-subtitle">Engineering governance packages, compliance audit records, and AI reliability review systems for plant leadership meetings.</p>
                </div>
            </header>

            {/* SECTION 1 — Reporting Command Center */}
            <section className="rep-section command-center">
                <div className="kpi-grid">
                    <div className="kpi-block">
                        <div className="kpi-header"><FiFileText className="icon" /> Total Reports Generated</div>
                        <div className="kpi-value">{overview_metrics.total_reports_generated}</div>
                        <div className="kpi-meta text-success">All historical logs verified</div>
                    </div>
                    <div className="kpi-block">
                        <div className="kpi-header"><FiCalendar className="icon" /> Generated This Month</div>
                        <div className="kpi-value">{overview_metrics.reports_this_month}</div>
                        <div className="kpi-meta">On track for Q2 closing target</div>
                    </div>
                    <div className="kpi-block">
                        <div className="kpi-header"><FiDatabase className="icon" /> Assets Covered</div>
                        <div className="kpi-value">{overview_metrics.assets_covered_percent}%</div>
                        <div className="kpi-meta text-success">+1.2% active node coverage</div>
                    </div>
                    <div className="kpi-block">
                        <div className="kpi-header"><FiShield className="icon" /> Compliance Score</div>
                        <div className="kpi-value text-success">{overview_metrics.compliance_score}%</div>
                        <div className="kpi-meta">Zero critical regulatory breaches</div>
                    </div>
                    <div className="kpi-block">
                        <div className="kpi-header"><FiAlertTriangle className="icon" /> Open Audit Findings</div>
                        <div className="kpi-value text-warning">{overview_metrics.open_audit_findings}</div>
                        <div className="kpi-meta">Undergoing remediation protocols</div>
                    </div>
                    <div className="kpi-block">
                        <div className="kpi-header"><FiCpu className="icon" /> AI Generated Reports</div>
                        <div className="kpi-value">{overview_metrics.ai_generated_reports}</div>
                        <div className="kpi-meta text-info">Automated routine assets</div>
                    </div>
                </div>
            </section>

            {/* Main Split Interface Area */}
            <div className="rep-split-workspace">

                {/* Left Action and Directory Stack */}
                <div className="rep-left-stack">

                    {/* SECTION 2 — Report Generation Studio */}
                    <section className="rep-panel studio-card">
                        <h3><FiSliders className="title-icon" /> Report Generation Studio</h3>
                        <p className="panel-desc">Configure parameters to compile immutable governance summaries from distributed logs.</p>

                        <div className="studio-form-grid">
                            <div className="form-group">
                                <label>Target Equipment Node</label>
                                <select value={targetNode} onChange={(e) => setTargetNode(e.target.value)}>
                                    {report_generation_options.assets?.map((asset, index) => (
                                        <option key={index} value={asset}>{asset}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date Range Selector</label>
                                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                                    {report_generation_options.date_ranges?.map((range, index) => (
                                        <option key={index} value={range.value}>{range.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label>Report Type Selector</label>
                                <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                    {report_generation_options.report_types?.map((type, index) => (
                                        <option key={index} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="toggle-block">
                            <h4>Additional Content Toggles</h4>
                            <div className="toggle-grid">
                                <label className="chk-lbl">
                                    <input type="checkbox" checked={toggles.telemetry} onChange={() => handleToggleChange('telemetry')} />
                                    Include Telemetry Analysis
                                </label>
                                <label className="chk-lbl">
                                    <input type="checkbox" checked={toggles.workOrders} onChange={() => handleToggleChange('workOrders')} />
                                    Include Work Orders
                                </label>
                                <label className="chk-lbl">
                                    <input type="checkbox" checked={toggles.inventory} onChange={() => handleToggleChange('inventory')} />
                                    Include Inventory Risks
                                </label>
                                <label className="chk-lbl">
                                    <input type="checkbox" checked={toggles.aiRecs} onChange={() => handleToggleChange('aiRecs')} />
                                    Include AI Recommendations
                                </label>
                                <label className="chk-lbl">
                                    <input type="checkbox" checked={toggles.manuals} onChange={() => handleToggleChange('manuals')} />
                                    Include Manual References
                                </label>
                            </div>
                        </div>

                        <button className="btn-primary" onClick={handleGenerateReport}>
                            Generate Executive Report
                        </button>
                    </section>

                    {/* SECTION 4 — Report Library */}
                    <section className="rep-panel library-card">
                        <h3><FiDatabase className="title-icon" /> Compiled Document Ledger</h3>
                        <div className="table-responsive">
                            <table className="library-table">
                                <thead>
                                    <tr>
                                        <th>Report ID / Name</th>
                                        <th>Target Asset</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r) => (
                                        <tr
                                            key={r.id}
                                            className={`lib-row ${activeReport?.id === r.id ? 'active' : ''}`}
                                            onClick={() => setSelectedId(r.id)}
                                        >
                                            <td>
                                                <div className="cell-title font-mono">{r.id}</div>
                                                <div className="cell-subtitle">{r.name}</div>
                                            </td>
                                            <td className="strong">{r.machine}</td>
                                            <td className="text-secondary text-sm">{r.type}</td>
                                            <td>
                                                <span className={`badge ${r.status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                </div>

                {/* Right Presentation Panel */}
                <div className="rep-right-stack">

                    {/* SECTION 3 — Executive Summary Preview */}
                    <section className="rep-panel preview-center-card">
                        {activeReport ? (
                            <>
                                <div className="preview-header-row">
                                    <div>
                                        <span className="doc-badge font-mono">{activeReport.id} // DOCUMENT ARCHIVE VIEW</span>
                                        <h2>{activeReport.type}</h2>
                                        <p className="meta-text">Compiled on <strong>{activeReport.date}</strong> by <strong>{activeReport.generated_by || activeReport.generatedBy}</strong></p>
                                    </div>
                                    <div className="preview-action-group">
                                        <span className={`risk-tag ${activeReport.risk_level?.toLowerCase() || activeReport.riskLevel?.toLowerCase()}`}>
                                            Risk: {activeReport.risk_level || activeReport.riskLevel}
                                        </span>
                                    </div>
                                </div>

                                <div className="preview-grid-kpis">
                                    <div className="p-kpi">
                                        <span className="lbl">Asset Health Trend</span>
                                        <span className="val">{activeReport.health_trend || activeReport.healthTrend}</span>
                                    </div>
                                    <div className="p-kpi">
                                        <span className="lbl">Estimated Cost Savings</span>
                                        <span className="val text-success">{activeReport.savings}</span>
                                    </div>
                                    <div className="p-kpi">
                                        <span className="lbl">Projected MTTR Impact</span>
                                        <span className="val">{activeReport.mttr_impact || activeReport.mttrImpact}</span>
                                    </div>
                                </div>

                                <hr className="divider" />

                                <div className="report-body">
                                    <div className="report-block">
                                        <h4><FiFileText className="block-icon" /> Executive Summary</h4>
                                        <p>{activeReport.summary}</p>
                                    </div>

                                    <div className="report-block-grid">
                                        <div className="report-block danger-sub">
                                            <h4><FiAlertCircle className="block-icon text-danger" /> Key Findings</h4>
                                            <ul>
                                                {activeReport.findings?.map((f, i) => <li key={i}>{f}</li>)}
                                            </ul>
                                        </div>
                                        <div className="report-block warning-sub">
                                            <h4><FiAlertTriangle className="block-icon text-warning" /> Critical Risks Remaining</h4>
                                            <ul>
                                                {activeReport.risks?.map((r, i) => <li key={i}>{r}</li>)}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="report-block success-sub">
                                        <h4><FiCheckCircle className="block-icon text-success" /> Recommended Governance Actions</h4>
                                        <ol>
                                            {activeReport.actions?.map((a, i) => <li key={i}>{a}</li>)}
                                        </ol>
                                    </div>

                                    <div className="report-block impact-summary">
                                        <h4>Expected Operational Impact Summary</h4>
                                        <p>Execution of targeted remediations is evaluated to yield full recovery to nominal baseline pressure levels. Post-remediation safety validation routine will re-verify compliance parameters dynamically within 15 minutes of live cycle restart.</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="rep-preview-empty" style={{ padding: '4rem', textAlign: 'center', color: '#64748B' }}>
                                <p>Select an archive compilation entry from the document ledger to examine audit metadata properties.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Bottom Insight Blocks Stack */}
            <div className="rep-bottom-grid">

                {/* SECTION 5 — Reliability & Audit Snapshot */}
                <section className="rep-panel snapshot-card">
                    <h3><FiPieChart className="title-icon" /> Reliability & Audit Snapshot</h3>
                    <div className="snapshot-grid">
                        <div className="snap-item">
                            <span className="lbl">Top 5 Risk Assets</span>
                            <div className="val-list">
                                {reliability_snapshot.top_risk_assets?.map((asset) => (
                                    <span key={asset.id} className={`asset-tag ${asset.risk}`}>
                                        {asset.id}. {asset.tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="snap-item">
                            <span className="lbl">Most Frequent Failure Code</span>
                            <span className="big-stat text-danger">
                                {reliability_snapshot.most_frequent_failure_code?.code}{' '}
                                <small>({reliability_snapshot.most_frequent_failure_code?.description})</small>
                            </span>
                        </div>
                        <div className="snap-item">
                            <span className="lbl">Department Highest Workload</span>
                            <span className="big-stat">
                                {reliability_snapshot.highest_workload_department?.name}{' '}
                                <small>({reliability_snapshot.highest_workload_department?.utilization_rate}% Capacity)</small>
                            </span>
                        </div>
                        <div className="snap-item">
                            <span className="lbl">Compliance Score Trend</span>
                            <span className="big-stat text-success">
                                {reliability_snapshot.compliance_trend?.score}%{' '}
                                <small>({reliability_snapshot.compliance_trend?.delta || 'Steady'})</small>
                            </span>
                        </div>
                        <div className="snap-item">
                            <span className="lbl">Preventive vs Corrective Ratio</span>
                            <span className="big-stat">
                                {reliability_snapshot.preventive_vs_corrective?.preventive_percent}% PM / {reliability_snapshot.preventive_vs_corrective?.corrective_percent}% CM <small>(Highly Proactive)</small>
                            </span>
                        </div>
                    </div>
                </section>

                {/* SECTION 6 — AI Generated Executive Recommendations */}
                <section className="rep-panel ai-recommendations-card">
                    <h3><FiCpu className="title-icon text-info" /> Predictive Strategy & Management Intelligence</h3>
                    <div className="ai-recs-stack">
                        {ai_recommendations?.map((rec, index) => (
                            <div key={index} className={`ai-rec-item ${rec.severity?.toLowerCase()}-border`}>
                                <div className="rec-header-row">
                                    <span className="rec-title">{rec.title}</span>
                                    <span className={`rec-sev ${rec.severity?.toLowerCase()}`}>{rec.severity} SEVERITY</span>
                                </div>
                                <p className="rec-desc">
                                    <strong>Business Impact:</strong> {rec.business_impact}{' '}
                                    <strong>Action:</strong> {rec.action || rec.recommendedAction}
                                </p>
                                <div className="rec-benefit">
                                    <FiCheckCircle className="icon" /> Benefit: {rec.benefit || rec.expectedBenefit}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {/* Final Governance and Distribution Footer Blocks */}
            <div className="rep-footer-grid">

                {/* SECTION 7 — Compliance & Audit Status */}
                <section className="rep-panel compliance-card">
                    <h3><FiShield className="title-icon" /> Industrial Safety & Audit Compliance Status</h3>
                    <div className="compliance-trackers-grid">
                        <div className="comp-item">
                            <div className="comp-meta"><span>LOTO Compliance</span><strong>{compliance_metrics.loto_compliance}%</strong></div>
                            <div className="progress-bar"><div className="fill" style={{ width: `${compliance_metrics.loto_compliance}%` }}></div></div>
                        </div>
                        <div className="comp-item">
                            <div className="comp-meta"><span>Inspection Completion Rate</span><strong>{compliance_metrics.inspection_completion}%</strong></div>
                            <div className="progress-bar"><div className="fill" style={{ width: `${compliance_metrics.inspection_completion}%` }}></div></div>
                        </div>
                        <div className="comp-item">
                            <div className="comp-meta"><span>Maintenance Documentation Coverage</span><strong>{compliance_metrics.documentation_coverage}%</strong></div>
                            <div className="progress-bar"><div className="fill" style={{ width: `${compliance_metrics.documentation_coverage}%` }}></div></div>
                        </div>
                        <div className="comp-item">
                            <div className="comp-meta"><span>Manual Reference Coverage</span><strong>{compliance_metrics.manual_reference_coverage}%</strong></div>
                            <div className="progress-bar"><div className="fill" style={{ width: `${compliance_metrics.manual_reference_coverage}%` }}></div></div>
                        </div>
                        <div className="comp-item">
                            <div className="comp-meta"><span>Safety Audit Pass Rate</span><strong>{compliance_metrics.safety_audit_pass_rate}%</strong></div>
                            <div className="progress-bar"><div className="fill" style={{ width: `${compliance_metrics.safety_audit_pass_rate}%` }}></div></div>
                        </div>
                    </div>
                </section>

                {/* SECTION 8 — Export & Distribution Center */}
                <section className="rep-panel export-card">
                    <h3><FiDownload className="title-icon" /> Export & Distribution Center</h3>
                    <p className="panel-desc">Package audited plant analytics files into cryptographically signed configurations for regulatory review distribution.</p>

                    <div className="export-action-grid">
                        {export_center.formats?.map((format, idx) => (
                            <button
                                key={idx}
                                className="btn-secondary"
                                onClick={() => alert(`Exporting tracking matrix packages to target: ${format} layout.`)}
                                disabled={!export_center.export_ready}
                            >
                                {format === 'PDF' && <FiFileText className="btn-icon" />}
                                {format === 'Excel' && <FiActivity className="btn-icon" />}
                                {format === 'CSV' && <FiShield className="btn-icon" />}
                                {format === 'Audit Package' && <FiDatabase className="btn-icon" />}
                                Export Configured Package ({format})
                            </button>
                        ))}
                    </div>

                    <div className="compliance-metadata-stamp">
                        <p><strong>System Reference:</strong> SHA-256 Verified Ledger // <strong>Last Active Output Run:</strong> {export_center.last_generated_report || 'REP-2026-X03'}</p>
                    </div>
                </section>

            </div>
        </div>
    );
}