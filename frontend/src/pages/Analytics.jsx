import React, { useState, useEffect } from 'react';
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
import analyticsService from '../services/analyticsService';
import '../styles/analytics.css';

export default function Analytics() {
    const [timeframe, setTimeframe] = useState('30d');
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                const data = await analyticsService.getAnalyticsData();
                setAnalyticsData(data);
                setError(null);
            } catch (err) {
                setError(err.message || "Failed to load analytics");
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    // ==========================================
    // BACKEND SERVICE DATA MAPPINGS
    // ==========================================
    const executiveKPIs = analyticsData?.executive_kpis || [];
    const maintenanceTrends = analyticsData?.maintenance_trends || [];
    const alertDistribution = analyticsData?.alert_distribution || {};
    const machineHotspots = analyticsData?.machine_hotspots || [];
    const telemetryTrends = analyticsData?.telemetry_trends || [];
    const ragPerformance = analyticsData?.rag_performance || {};
    const knowledgeBaseData = analyticsData?.knowledge_base_data || {};
    const workOrderAnalytics = analyticsData?.work_order_analytics || {};
    const inventoryRisks = analyticsData?.inventory_risks || [];
    const aiInsights = analyticsData?.ai_insights || [];
    const factoryPerformance = analyticsData?.factory_performance || [];

    if (loading) {
        return (
            <div className="an-loading">
                Loading Analytics Dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="an-error">
                <h3>Analytics Unavailable</h3>
                <p>{error}</p>
            </div>
        );
    }

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
                                    {kpi.trend?.startsWith('+') ? <FiTrendingUp /> : <FiTrendingDown />} {kpi.trend}
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
                            {alertDistribution.severity?.map((sev, idx) => (
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
                                {alertDistribution.recurringCodes?.map((rc, idx) => (
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
                                {trend.bars?.map((heightVal, bIdx) => (
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
                        {ragPerformance.metrics?.map((rm, idx) => (
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
                        {ragPerformance.insights?.map((ins, idx) => (
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
                        {knowledgeBaseData.stats?.map((stat, idx) => (
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
                            <div className="an-kb-progress-bar" style={{ width: `${knowledgeBaseData.progress || 0}%` }}></div>
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
                                {workOrderAnalytics.statusDistribution?.map((dist, idx) => (
                                    <div key={idx} className="an-wo-composite-segment" style={{ width: `${dist.pct}%`, backgroundColor: dist.color }} title={`${dist.state}: ${dist.count} tickets`}></div>
                                ))}
                            </div>
                            <div className="an-wo-composite-legend">
                                {workOrderAnalytics.statusDistribution?.map((dist, idx) => (
                                    <div key={idx} className="an-wo-legend-row">
                                        <span className="legend-dot" style={{ backgroundColor: dist.color }}></span>
                                        <span>{dist.state} (<strong>{dist.count}</strong>)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="an-wo-load-departments">
                            <h5>Department Workload Index</h5>
                            {workOrderAnalytics.departments?.map((dept, idx) => (
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