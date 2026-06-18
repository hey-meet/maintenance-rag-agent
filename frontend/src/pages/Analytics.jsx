import React, { useState } from 'react';
import {
    FiTrendingUp,
    FiTrendingDown,
    FiClock,
    FiCheckCircle,
    FiActivity,
    FiDownload,
    FiCalendar,
    FiCpu,
    FiAlertTriangle,
    FiLayers,
    FiFileText,
    FiSettings,
    FiBox,
    FiSliders,
    FiZap,
    FiShield,
    FiSearch
} from 'react-icons/fi';
import '../styles/analytics.css';

export default function Analytics() {
    const [timeframe, setTimeframe] = useState('30d');

    // ==========================================
    // LOCAL MOCK DATASETS (FUTURE BACKEND BINDINGS)
    // ==========================================

    const executiveKPIs = [
        { id: 'fhi', label: 'Fleet Health Index', value: '91.2%', trend: '+1.4%', status: 'optimal', desc: 'vs Last Period Target (90.0%)' },
        { id: 'mttr', label: 'Mean Time To Repair (MTTR)', value: '2.4 hrs', trend: '-14.0%', status: 'optimal', desc: 'Average critical asset resolution' },
        { id: 'aca', label: 'Active Critical Alerts', value: '14 Nodes', trend: '+2 Nodes', status: 'danger', desc: 'Requires immediate intervention' },
        { id: 'ra', label: 'Retrieval Accuracy (RAG)', value: '94.8%', trend: '+2.1%', status: 'optimal', desc: 'Vector precision on documentation' },
        { id: 'wocr', label: 'Work Order Completion', value: '88.5%', trend: '+0.7%', status: 'stable', desc: 'Target execution efficiency' },
        { id: 'irc', label: 'Inventory Risk Count', value: '3 Items', trend: '-1 Item', status: 'stable', desc: 'Critical spares below fallback limit' }
    ];

    const maintenanceTrends = [
        { week: 'W22', preventive: 65, corrective: 25, emergency: 10 },
        { week: 'W23', preventive: 70, corrective: 20, emergency: 10 },
        { week: 'W24', preventive: 55, corrective: 30, emergency: 15 },
        { week: 'W25', preventive: 80, corrective: 15, emergency: 5 },
        { week: 'W26', preventive: 75, corrective: 22, emergency: 3 }
    ];

    const alertDistribution = {
        severity: [
            { label: 'Critical', count: 14, percent: 20, class: 'danger' },
            { label: 'High', count: 22, percent: 32, class: 'warning' },
            { label: 'Medium', count: 25, percent: 36, class: 'primary' },
            { label: 'Low', count: 8, percent: 12, class: 'sage' }
        ],
        recurringCodes: [
            { code: 'E-4042', desc: 'Hydraulic Pressure Transient Fault', count: 42 },
            { code: 'E-1108', desc: 'Spindle Thermal Delta Threshold Exceeded', count: 29 },
            { code: 'E-8821', desc: 'RAG Retrieval Incomplete Match Context', count: 18 },
            { code: 'E-7112', desc: 'Synchronizer Phase Variance Shift', count: 11 }
        ]
    };

    const machineHotspots = [
        { name: 'Hydraulic Press P-04', health: 64, alerts: 14, downtime: '12.4h', risk: 'Critical', riskClass: 'danger' },
        { name: 'CNC Milling Unit C-12', health: 78, alerts: 9, downtime: '6.2h', risk: 'High', riskClass: 'warning' },
        { name: 'Rotary Compressor K-08', health: 89, alerts: 6, downtime: '2.1h', risk: 'Medium', riskClass: 'primary' },
        { name: 'Induction Furnace F-01', health: 96, alerts: 2, downtime: '0.0h', risk: 'Low', riskClass: 'sage' },
        { name: 'Robotic Arm Assembly R-02', health: 92, alerts: 4, downtime: '1.5h', risk: 'Low', riskClass: 'sage' }
    ];

    const telemetryTrends = [
        { metric: 'Thermal Core Levels', status: 'Spike Detected', val: '94°C', dev: '+12%', state: 'danger', bars: [60, 62, 65, 88, 94] },
        { metric: 'Manifold Pressure Index', status: 'Nominal Range', val: '4.2 bar', dev: '-2%', state: 'sage', bars: [45, 44, 43, 42, 42] },
        { metric: 'Spindle Rotary Speed (RPM)', status: 'Fluctuation Present', val: '14,200', dev: '+7%', state: 'warning', bars: [70, 75, 62, 85, 78] },
        { metric: 'Mean Axis Vibration Multiplier', status: 'Threshold Exceeded', val: '4.1 mm/s', dev: '+24%', state: 'danger', bars: [35, 42, 55, 72, 89] }
    ];

    const ragPerformance = {
        metrics: [
            { label: 'Retrieval Accuracy', val: '94.8%', trend: '+2.1%', state: 'increase' },
            { label: 'Avg Context Score', val: '0.892', trend: '+0.04', state: 'increase' },
            { label: 'Manual Coverage', val: '98.2%', trend: 'Static', state: 'stable' },
            { label: 'Indexed Chunks', val: '142,840', trend: '+12.4k', state: 'increase' },
            { label: 'Query Success Rate', val: '99.1%', trend: '+0.3%', state: 'increase' },
            { label: 'Avg Retrieval Latency', val: '240ms', trend: '-45ms', state: 'decrease' }
        ],
        insights: [
            'Vector space query alignment improved following embedding indexing run on 2026-06-15.',
            'Unmapped technical structures detected inside mechanical schematics sections for Subsystem-B.'
        ]
    };

    const knowledgeBaseData = {
        stats: [
            { label: 'Total Manuals Saved', val: '412 Docs' },
            { label: 'Indexed Manuals', val: '408 Docs' },
            { label: 'Pages Processed', val: '34,150 Pages' },
            { label: 'Generated Chunks', val: '142,840 Chunks' }
        ],
        progress: 99.0
    };

    const workOrderAnalytics = {
        statusDistribution: [
            { state: 'Open', count: 12, pct: 20, color: 'var(--danger-color)' },
            { state: 'In Progress', count: 28, pct: 46, color: 'var(--warning-color)' },
            { state: 'Completed', count: 16, pct: 26, color: 'var(--primary-color)' },
            { state: 'On Hold', count: 5, pct: 8, color: 'var(--text-muted)' }
        ],
        departments: [
            { name: 'Hydraulics Subsystems', load: 42 },
            { name: 'Electrical Infrastructures', load: 28 },
            { name: 'Mechanical Actuators', load: 18 },
            { name: 'Robotics Kinematics', load: 12 }
        ]
    };

    const inventoryRisks = [
        { part: 'Piston Seal Kit H-04', status: 'Low Stock', stock: '2 units', leadTime: '14 Days', risk: 'High' },
        { part: 'Carbide Inserts CNMG-12', status: 'Out Of Stock', stock: '0 units', leadTime: '4 Days', risk: 'Critical' },
        { part: 'Rotary Shaft Bearing B-88', status: 'Critical Spare Threshold', stock: '1 unit', leadTime: '22 Days', risk: 'High' }
    ];

    const aiInsights = [
        { type: 'critical', text: 'Hydraulic Press P-04 has generated 42% of all critical alert telemetries recorded this month.', action: 'Triggering Predictive Run' },
        { type: 'optimal', text: 'Current preventative maintenance matrix cycle has successfully reduced global MTTR by 14.0%.', action: 'Strategy Validated' },
        { type: 'warning', text: 'CNC Unit C-12 vibration anomalies show structural multi-point increasing trending models.', action: 'Review Vector Manuals' },
        { type: 'warning', text: 'Critical spare inventory shortage may impact 2 active downstream high-priority work orders.', action: 'Procurement Flagged' }
    ];

    const factoryPerformance = [
        { area: 'Stamping Line A', availability: '94.2%', reliability: '91.5%', cost: '$14,200', risk: 'Low', riskState: 'sage' },
        { area: 'Machining Block B', availability: '88.1%', reliability: '84.2%', cost: '$31,800', risk: 'High', riskState: 'warning' },
        { area: 'Assembly Enclosure C', availability: '98.5%', reliability: '97.1%', cost: '$5,400', risk: 'Minimal', riskState: 'sage' },
        { area: 'Foundry Cluster D', availability: '82.4%', reliability: '79.8%', cost: '$44,000', risk: 'Critical', riskState: 'danger' }
    ];

    return (
        <div className="an-container">
            {/* Header Module */}
            <header className="an-header">
                <div>
                    <h1 className="an-title">Prescriptive Maintenance Analytics Center</h1>
                    <p className="an-subtitle">Industry 5.0 Operational Intelligence, Predictive Telemetry Diagnostics, and RAG Optimization Vector Metrics</p>
                </div>
                <div className="an-actions">
                    <div className="an-select-wrapper">
                        <FiCalendar className="an-icon-inline" />
                        <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                            <option value="7d">Real-time (7 Days)</option>
                            <option value="30d">Operational Cycle (30 Days)</option>
                            <option value="90d">Quarterly Evaluation (90 Days)</option>
                        </select>
                    </div>
                    <button className="an-btn-secondary">
                        <FiDownload /> Export Telemetry Dataset
                    </button>
                </div>
            </header>

            {/* SECTION 1: EXECUTIVE OPERATIONS OVERVIEW */}
            <section className="an-section-wrapper">
                <h2 className="an-mod-title"><FiSliders /> Executive Operations Overview</h2>
                <div className="an-kpi-grid">
                    {executiveKPIs.map((kpi) => (
                        <div key={kpi.id} className="an-kpi-card">
                            <span className="an-kpi-lbl">{kpi.label}</span>
                            <div className="an-kpi-value-row">
                                <h3 className={`an-kpi-val ${kpi.status === 'danger' ? 'text-danger' : kpi.status === 'optimal' ? 'text-success' : ''}`}>
                                    {kpi.value}
                                </h3>
                                <span className={`an-trend-badge ${kpi.status}`}>
                                    {kpi.trend.startsWith('+') ? <FiTrendingUp /> : <FiTrendingDown />} {kpi.trend}
                                </span>
                            </div>
                            <p className="an-kpi-desc">{kpi.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* INTERMEDIATE GRAPHICAL SPLIT BLOCK */}
            <div className="an-grid-two-column">

                {/* SECTION 2: MAINTENANCE PERFORMANCE ANALYTICS */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Maintenance Strategy & Performance Timeline</h4>
                        <span className="an-chart-sub">Weekly analysis tracking strategic transformation efficiency (Preventative vs Corrective vs Emergency Execution)</span>
                    </div>
                    <div className="an-stacked-bar-chart">
                        <div className="an-chart-axis-y">
                            <span>100%</span><span>50%</span><span>0%</span>
                        </div>
                        <div className="an-chart-bars-wrapper">
                            {maintenanceTrends.map((data, idx) => (
                                <div key={idx} className="an-stacked-column">
                                    <div className="an-stacked-bar-group">
                                        <div className="an-bar-segment p-pm" style={{ height: `${data.preventive}%` }} title={`Preventive: ${data.preventive}%`}></div>
                                        <div className="an-bar-segment p-cm" style={{ height: `${data.corrective}%` }} title={`Corrective: ${data.corrective}%`}></div>
                                        <div className="an-bar-segment p-em" style={{ height: `${data.emergency}%` }} title={`Emergency: ${data.emergency}%`}></div>
                                    </div>
                                    <span className="an-bar-label">{data.week}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="an-chart-legend">
                        <span className="legend-item"><span className="legend-dot pm"></span> Preventive PM</span>
                        <span className="legend-item"><span className="legend-dot cm"></span> Corrective CM</span>
                        <span className="legend-item"><span className="legend-dot em"></span> Emergency EM</span>
                    </div>
                </section>

                {/* SECTION 3: ALERT INTELLIGENCE CENTER */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Failure Patterns & Alert Intelligence</h4>
                        <span className="an-chart-sub">Proportional severity analysis evaluated against recurring engineering fault definitions</span>
                    </div>
                    <div className="an-alert-center-layout">
                        <div className="an-severity-split">
                            <h5>Proportional Severity</h5>
                            {alertDistribution.severity.map((sev, idx) => (
                                <div key={idx} className="an-severity-progress-row">
                                    <div className="an-progress-lbl"><span>{sev.label}</span><span>{sev.count} ({sev.percent}%)</span></div>
                                    <div className="an-progress-track">
                                        <div className={`an-progress-bar ${sev.class}`} style={{ width: `${sev.percent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="an-dividing-line"></div>
                        <div className="an-recurring-codes">
                            <h5>Top Critical Recurring Codes</h5>
                            <ul className="an-code-list">
                                {alertDistribution.recurringCodes.map((rc, idx) => (
                                    <li key={idx} className="an-code-item">
                                        <div className="an-code-meta">
                                            <span className="an-badge-code">{rc.code}</span>
                                            <span className="an-code-desc">{rc.desc}</span>
                                        </div>
                                        <span className="an-code-count"><strong>{rc.count}</strong> events</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            {/* SECTION 4: MACHINE FAILURE HOTSPOTS */}
            <section className="an-section-wrapper">
                <div className="an-section-header">
                    <h2 className="an-mod-title"><FiCpu /> Machine Reliability & Failure Hotspots</h2>
                    <span className="an-section-subtitle-text">Prioritized structural index ordered by cross-node downtime impacts and algorithmic risk vectors</span>
                </div>
                <div className="an-table-wrapper">
                    <table className="an-table">
                        <thead>
                            <tr>
                                <th>Machine Asset Component</th>
                                <th>Health Score Index</th>
                                <th>Logged Active Warnings</th>
                                <th>Accumulated Downtime</th>
                                <th>Assigned Risk Threshold</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machineHotspots.map((machine, idx) => (
                                <tr key={idx}>
                                    <td className="strong">{machine.name}</td>
                                    <td>
                                        <div className="an-table-progress-container">
                                            <span className="an-progress-numeric-val">{machine.health}%</span>
                                            <div className="an-table-progress-track">
                                                <div className={`an-table-progress-bar ${machine.health > 85 ? 'good' : machine.health > 70 ? 'warn' : 'bad'}`} style={{ width: `${machine.health}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{machine.alerts} Alert Telemetries</td>
                                    <td>{machine.downtime}</td>
                                    <td><span className={`an-status-tag ${machine.riskClass}`}>{machine.risk}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECTION 5: TELEMETRY ANALYTICS */}
            <section className="an-section-wrapper">
                <h2 className="an-mod-title"><FiActivity /> High-Frequency Telemetry Trends & Anomalies</h2>
                <div className="an-telemetry-grid">
                    {telemetryTrends.map((trend, idx) => (
                        <div key={idx} className="an-telemetry-card">
                            <div className="an-tel-header">
                                <div>
                                    <h5>{trend.metric}</h5>
                                    <span className={`an-tel-status-lbl ${trend.state}`}>{trend.status}</span>
                                </div>
                                <div className="an-tel-values">
                                    <span className="an-tel-current">{trend.val}</span>
                                    <span className={`an-tel-deviation ${trend.state}`}>{trend.dev}</span>
                                </div>
                            </div>
                            <div className="an-tel-sparkline">
                                {trend.bars.map((heightVal, bIdx) => (
                                    <div key={bIdx} className="an-tel-spark-column">
                                        <div className={`an-tel-spark-fill ${trend.state}`} style={{ height: `${heightVal}%` }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* AI SYSTEM DUO GRID: RAG PERFORMANCE & KNOWLEDGE BASE */}
            <div className="an-grid-two-column">

                {/* SECTION 6: RAG PERFORMANCE ANALYTICS */}
                <section className="an-card-block specialized-rag-panel">
                    <div className="an-card-head-iconified">
                        <FiSearch className="panel-icon text-accent" />
                        <div>
                            <h4>Industrial AI Retrieval (RAG) Performance Analytics</h4>
                            <span className="an-chart-sub">Vector metrics confirming reliability of semantic manual lookup operations</span>
                        </div>
                    </div>
                    <div className="an-rag-metrics-grid">
                        {ragPerformance.metrics.map((rm, idx) => (
                            <div key={idx} className="an-rag-sub-card">
                                <span className="an-rag-label-text">{rm.label}</span>
                                <div className="an-rag-value-row">
                                    <span className="an-rag-value-text">{rm.val}</span>
                                    <span className={`an-rag-trend ${rm.state}`}>{rm.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="an-rag-system-logs">
                        <h5>Algorithmic Optimization Logs</h5>
                        {ragPerformance.insights.map((ins, idx) => (
                            <div key={idx} className="an-rag-log-item">
                                <span className="an-log-dot"></span><p>{ins}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 7: KNOWLEDGE BASE ANALYTICS */}
                <section className="an-card-block">
                    <div className="an-card-head-iconified">
                        <FiFileText className="panel-icon text-accent" />
                        <div>
                            <h4>Knowledge Base Vectorization Footprint</h4>
                            <span className="an-chart-sub">Ingestion telemetry metrics mapping corporate tech documentation indexes</span>
                        </div>
                    </div>
                    <div className="an-kb-stats-grid">
                        {knowledgeBaseData.stats.map((stat, idx) => (
                            <div key={idx} className="an-kb-stat-box">
                                <span className="an-kb-lbl-txt">{stat.label}</span>
                                <h4 className="an-kb-val-txt">{stat.val}</h4>
                            </div>
                        ))}
                    </div>
                    <div className="an-kb-progress-section">
                        <div className="an-kb-progress-meta">
                            <span>Global Pipeline Vectorization Progress</span>
                            <strong>{knowledgeBaseData.progress}% Ingested</strong>
                        </div>
                        <div className="an-kb-progress-track">
                            <div className="an-kb-progress-bar" style={{ width: `${knowledgeBaseData.progress}%` }}></div>
                        </div>
                    </div>
                </section>
            </div>

            {/* WORK OPERATIONS AND LOGISTICS DUO GRID */}
            <div className="an-grid-two-column">

                {/* SECTION 8: WORK ORDER ANALYTICS */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Maintenance Resource Allocation & Work Orders</h4>
                        <span className="an-chart-sub">Active status allocations map across targeted technical engineering departments</span>
                    </div>
                    <div className="an-wo-layout">
                        <div className="an-wo-distribution-donut-mock">
                            <h5>Distribution</h5>
                            <div className="an-wo-bar-composite-track">
                                {workOrderAnalytics.statusDistribution.map((dist, idx) => (
                                    <div key={idx} className="an-wo-composite-segment" style={{ width: `${dist.pct}%`, backgroundColor: dist.color }} title={`${dist.state}: ${dist.count} tickets`}></div>
                                ))}
                            </div>
                            <div className="an-wo-composite-legend">
                                {workOrderAnalytics.statusDistribution.map((dist, idx) => (
                                    <div key={idx} className="an-wo-legend-row">
                                        <span className="legend-dot" style={{ backgroundColor: dist.color }}></span>
                                        <span>{dist.state} (<strong>{dist.count}</strong>)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="an-wo-load-departments">
                            <h5>Department Workload Index</h5>
                            {workOrderAnalytics.departments.map((dept, idx) => (
                                <div key={idx} className="an-dept-row">
                                    <div className="an-dept-meta"><span>{dept.name}</span><span>{dept.load}% Load</span></div>
                                    <div className="an-dept-track"><div className="an-dept-fill" style={{ width: `${dept.load}%` }}></div></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* SECTION 9: INVENTORY RISK ANALYTICS */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Predictive Inventory Logistics & Spares Risk</h4>
                        <span className="an-chart-sub">Deficit warnings triggered based on active predictive component replacement requirements</span>
                    </div>
                    <div className="an-inventory-list">
                        {inventoryRisks.map((item, idx) => (
                            <div key={idx} className="an-inventory-item-row">
                                <div className="an-inv-main">
                                    <FiBox className="an-inv-icon" />
                                    <div>
                                        <span className="an-inv-name">{item.part}</span>
                                        <span className="an-inv-meta-sub">Current Stock: <strong>{item.stock}</strong> | Supply Lead Time: {item.leadTime}</span>
                                    </div>
                                </div>
                                <span className={`an-status-tag ${item.risk === 'Critical' ? 'danger' : 'warning'}`}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* SECTION 10: AI OPERATIONS INSIGHTS */}
            <section className="an-section-wrapper telemetry-insights-panel">
                <div className="an-insights-header">
                    <div className="an-title-combo">
                        <FiZap className="insights-lightning" />
                        <h2 className="an-mod-title text-gradient">Prescriptive GenAI Operational Recommendations</h2>
                    </div>
                    <span className="an-badge-live">Live LLM Pipeline Ready</span>
                </div>
                <div className="an-insights-container-grid">
                    {aiInsights.map((insight, idx) => (
                        <div key={idx} className={`an-insight-card-item ${insight.type}`}>
                            <div className="an-insight-body">
                                <FiAlertTriangle className="insight-warning-icon" />
                                <p className="an-insight-text-content">{insight.text}</p>
                            </div>
                            <div className="an-insight-footer-action">
                                <span className="an-action-call-text">{insight.action}</span>
                                <span className="an-arrow-indicator">→</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 11: FACTORY PERFORMANCE SUMMARY */}
            <section className="an-section-wrapper last-table-section">
                <h2 className="an-mod-title"><FiShield /> Factory Operational Perimeter & Performance Matrix</h2>
                <div className="an-table-wrapper">
                    <table className="an-table summary-variant">
                        <thead>
                            <tr>
                                <th>Plant Area Perimeter Segment</th>
                                <th>Availability Ratio</th>
                                <th>Reliability Probability</th>
                                <th>Allocated Maintenance Cost</th>
                                <th>Aggregated Risk Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {factoryPerformance.map((fp, idx) => (
                                <tr key={idx}>
                                    <td className="strong">{fp.area}</td>
                                    <td>{fp.availability}</td>
                                    <td>{fp.reliability}</td>
                                    <td>{fp.cost}</td>
                                    <td><span className={`an-status-tag ${fp.riskState}`}>{fp.risk}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}