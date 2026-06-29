import React, { useState, useEffect } from 'react';
import {
    FiClock,
    FiCheckCircle,
    FiActivity,
    FiCalendar,
    FiCpu,
    FiAlertTriangle,
    FiFileText,
    FiSliders,
    FiBox,
    FiZap,
    FiShield,
    FiTool,
    FiClipboard
} from 'react-icons/fi';
import analyticsService from '../services/analyticsService';
import '../styles/analytics.css';

export default function Analytics() {
    const [timeframe, setTimeframe] = useState('30d');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                const response = await analyticsService.getAnalyticsData();
                if (response && response.status === 'success' && response.analytics) {
                    setAnalytics(response.analytics);
                    setError(null);
                } else {
                    throw new Error("Invalid response format received from server");
                }
            } catch (err) {
                setError(err.message || "Failed to load maintenance analytics");
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="an-loading">
                <div className="an-spinner"></div>
                <p>Loading Prescriptive Maintenance Analytics Center...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="an-error">
                <h3>Analytics Sync Failed</h3>
                <p>{error}</p>
            </div>
        );
    }

    // Extracting fields directly from the reactive payload fallbacks
    const kpis = analytics?.kpiSummary || {};
    const insights = analytics?.dashboardInsights || {};
    const statusDistribution = analytics?.statusDistribution || [];
    const priorityDistribution = analytics?.priorityDistribution || [];
    const departmentDistribution = analytics?.departmentDistribution || [];
    const machineDistribution = analytics?.machineDistribution || [];
    const errorCodeDistribution = analytics?.errorCodeDistribution || [];
    const dailyTrend = analytics?.dailyTrend || [];
    const manualUsage = analytics?.manualUsage || {};
    const spareParts = analytics?.sparePartsAnalytics?.topRequiredSpareParts || [];
    const toolUsage = analytics?.toolUsageAnalytics?.mostFrequentlyRequiredTools || [];
    const recActions = analytics?.recommendationAnalytics?.mostFrequentlyRecommendedRepairActions || [];
    const timeMetrics = analytics?.estimatedMaintenanceTime || {};
    const machineHealth = analytics?.machineHealthRanking || [];
    const ackAnalytics = analytics?.acknowledgementAnalytics || {};
    const recentActivity = analytics?.recentActivityFeed || [];

    // Safe dynamic max calculator for flexible chart bar percentage scalings
    const maxStatusVal = Math.max(...statusDistribution.map(d => d.value), 1);
    const maxDeptVal = Math.max(...departmentDistribution.map(d => d.workOrders), 1);
    const maxDailyVal = Math.max(...dailyTrend.map(d => d.count), 1);
    const maxToolsVal = Math.max(...toolUsage.map(d => d.count), 1);

    // Dynamic color maps for the status tracking segment bar
    const statusColorMap = {
        'Open': '#ff4d4f',
        'In Progress': '#1890ff',
        'Completed': '#52c41a',
        'Pending': '#faad14'
    };

    return (
        <div className="an-container">
            {/* Header Module */}
            <header className="an-header">
                <div>
                    <h1 className="an-title">Prescriptive Maintenance Analytics Center</h1>
                    <p className="an-subtitle">Industry 5.0 Reactive Operational Intelligence, Active Failure Metrics, and Part Deficiency Analytics</p>
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
                </div>
            </header>

            {/* SECTION 1: SYSTEM KPI METRIC CARDS */}
            <section className="an-section-wrapper">
                <h2 className="an-mod-title"><FiSliders /> Executive Operations Overview</h2>
                <div className="an-kpi-grid">
                    <div className="an-kpi-card">
                        <span className="an-kpi-lbl">Total Asset Tickets</span>
                        <div className="an-kpi-value-row">
                            <h3 className="an-kpi-val">{kpis.totalWorkOrders ?? 0}</h3>
                        </div>
                        <p className="an-kpi-desc">Aggregated live and processed maintenance orders within system memory.</p>
                    </div>
                    <div className="an-kpi-card">
                        <span className="an-kpi-lbl">Active Failures (Open / Pending)</span>
                        <div className="an-kpi-value-row">
                            <h3 className="an-kpi-val text-danger">{(kpis.openWorkOrders ?? 0) + (kpis.pendingWorkOrders ?? 0)}</h3>
                        </div>
                        <p className="an-kpi-desc">Requires immediate routing; contains {kpis.criticalPriority ?? 0} critical priority incidents.</p>
                    </div>
                    <div className="an-kpi-card">
                        <span className="an-kpi-lbl">Mean Logged Maintenance Time</span>
                        <div className="an-kpi-value-row">
                            <h3 className="an-kpi-val text-success"><FiClock style={{ fontSize: '1.4rem', marginRight: '4px' }} />{kpis.averageEstimatedMaintenanceTime || "0 Hours"}</h3>
                        </div>
                        <p className="an-kpi-desc">Calculated across total hours accumulated ({timeMetrics.totalHours ?? 0} Hrs total).</p>
                    </div>
                    <div className="an-kpi-card">
                        <span className="an-kpi-lbl">Acknowledgement Success Rate</span>
                        <div className="an-kpi-value-row">
                            <h3 className="an-kpi-val">{ackAnalytics.acknowledgementRate ?? 0}%</h3>
                        </div>
                        <p className="an-kpi-desc">{kpis.acknowledged ?? 0} orders verified; {kpis.pendingAcknowledgement ?? 0} await review.</p>
                    </div>
                </div>
            </section>

            {/* GRAPHICAL SPLIT BLOCK: PROGRESSIVE HISTOGRAMS & LIVE FAULT RECORDS */}
            <div className="an-grid-two-column">
                {/* TIMELINE DISTRIBUTION TREND */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Daily System Ticket Load Timeline</h4>
                        <span className="an-chart-sub">Reactive tracking of generated structural failures over active dates</span>
                    </div>
                    {dailyTrend.length === 0 ? (
                        <div className="an-empty-state">No timeline events recorded in system file.</div>
                    ) : (
                        <div className="an-stacked-bar-chart" style={{ height: '220px', alignItems: 'flex-end' }}>
                            <div className="an-chart-bars-wrapper" style={{ paddingLeft: '20px' }}>
                                {dailyTrend.map((data, idx) => (
                                    <div key={idx} className="an-stacked-column">
                                        <div className="an-stacked-bar-group" style={{ height: '100%', justifyContent: 'flex-end' }}>
                                            <div
                                                className="an-bar-segment p-cm"
                                                style={{ height: `${(data.count / maxDailyVal) * 100}%`, width: '100%', minHeight: '4px' }}
                                                title={`Date: ${data.date} | Orders: ${data.count}`}
                                            ></div>
                                        </div>
                                        <span className="an-bar-label" style={{ fontSize: '10px', transform: 'rotate(-25deg)', whiteSpace: 'nowrap' }}>
                                            {data.date.split('-').slice(1).join('/')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* PROPORTIONAL STATUS BREAKDOWNS */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Failure Allocation & Ticket Lifecycles</h4>
                        <span className="an-chart-sub">System tickets sorted proportionally by normalization variables</span>
                    </div>
                    {statusDistribution.length === 0 ? (
                        <div className="an-empty-state">No valid statuses to distribute.</div>
                    ) : (
                        <div className="an-alert-center-layout" style={{ display: 'block' }}>
                            <div className="an-severity-split" style={{ width: '100%' }}>
                                {statusDistribution.map((status, idx) => {
                                    const percentage = roundToTwo((status.value / kpis.totalWorkOrders) * 100);
                                    return (
                                        <div key={idx} className="an-severity-progress-row">
                                            <div className="an-progress-lbl">
                                                <span>{status.name}</span>
                                                <span>{status.value} Tickets ({percentage}%)</span>
                                            </div>
                                            <div className="an-progress-track">
                                                <div
                                                    className="an-progress-bar"
                                                    style={{
                                                        width: `${(status.value / maxStatusVal) * 100}%`,
                                                        backgroundColor: statusColorMap[status.name] || '#8c8c8c'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* INDUSTRIAL SYSTEM INSIGHT TRACKERS */}
            <div className="an-grid-two-column">
                {/* TOOL LOAD DIAGRAM */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Required Engineering Equipment Profiles</h4>
                        <span className="an-chart-sub">Top operational tools demanded across parsed prescriptive steps</span>
                    </div>
                    {toolUsage.length === 0 ? (
                        <div className="an-empty-state">No tools listed in active records.</div>
                    ) : (
                        <div className="an-wo-load-departments" style={{ width: '100%', padding: '10px 0' }}>
                            {toolUsage.map((tool, idx) => {
                                const loadPct = roundToTwo((tool.count / maxToolsVal) * 100);
                                return (
                                    <div key={idx} className="an-dept-row">
                                        <div className="an-dept-meta">
                                            <span><FiTool style={{ marginRight: '6px', verticalAlign: 'middle' }} /> {tool.tool_name}</span>
                                            <span>{tool.count} Requests</span>
                                        </div>
                                        <div className="an-dept-track">
                                            <div className="an-dept-fill" style={{ width: `${loadPct}%`, backgroundColor: '#1890ff' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* DEPARTMENT DISTRIBUTION HORIZONTAL LOGS */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Department Workload Allocation Metrics</h4>
                        <span className="an-chart-sub">Work order volume tracking active operational pressure indexes</span>
                    </div>
                    {departmentDistribution.length === 0 ? (
                        <div className="an-empty-state">No departments mapped to current assets.</div>
                    ) : (
                        <div className="an-wo-load-departments" style={{ width: '100%', padding: '10px 0' }}>
                            {departmentDistribution.map((dept, idx) => {
                                const loadPct = roundToTwo((dept.workOrders / maxDeptVal) * 100);
                                return (
                                    <div key={idx} className="an-dept-row">
                                        <div className="an-dept-meta">
                                            <span>{dept.department}</span>
                                            <span>{dept.workOrders} Active Tasks</span>
                                        </div>
                                        <div className="an-dept-track">
                                            <div className="an-dept-fill" style={{ width: `${loadPct}%`, backgroundColor: '#faad14' }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* PRIORITY MACHINE HEALTH RISK INDEX */}
            <section className="an-section-wrapper">
                <div className="an-section-header">
                    <h2 className="an-mod-title"><FiCpu /> Machine Reliability & Operational Health Matrix</h2>
                    <span className="an-section-subtitle-text">Prioritized structural safety ranking based on historical machine failures</span>
                </div>
                <div className="an-table-wrapper">
                    <table className="an-table">
                        <thead>
                            <tr>
                                <th>Machine Component ID</th>
                                <th>Total Tracked Incidents</th>
                                <th>Industrial Classification Threat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {machineHealth.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="an-empty-table-state">No equipment logs compiled yet.</td>
                                </tr>
                            ) : (
                                machineHealth.map((machine, idx) => (
                                    <tr key={idx}>
                                        <td className="strong">{machine.machine_id}</td>
                                        <td>{machine.incidentCount} Registered Work Orders</td>
                                        <td>
                                            <span className={`an-status-tag ${machine.status === 'Critical' ? 'danger' :
                                                    machine.status === 'High' ? 'warning' :
                                                        machine.status === 'Medium' ? 'info' : 'success'
                                                }`}>
                                                {machine.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* LOGISTICS VECTOR AND MANUAL UTILITY GRID */}
            <div className="an-grid-two-column">
                {/* MANUAL AND SECTION REFERENCING FEED */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Knowledge Base Semantic Retrieval References</h4>
                        <span className="an-chart-sub">Highest referenced operational manuals matched across vector lookup tasks</span>
                    </div>
                    <div className="an-recurring-codes" style={{ width: '100%' }}>
                        <ul className="an-code-list">
                            {(!manualUsage.mostReferencedManuals || manualUsage.mostReferencedManuals.length === 0) ? (
                                <div className="an-empty-state">No lookup vectors generated yet.</div>
                            ) : (
                                manualUsage.mostReferencedManuals.map((man, idx) => (
                                    <li key={idx} className="an-code-item">
                                        <div className="an-code-meta">
                                            <FiFileText style={{ marginRight: '8px', color: '#1890ff', flexShrink: 0 }} />
                                            <span className="an-code-desc" style={{ fontWeight: 500 }}>{man.manual_id}</span>
                                        </div>
                                        <span className="an-code-count"><strong>{man.count}</strong> citations</span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </section>

                {/* SPARE PARTS DEPRECIATION AND LOGISTICS WARNINGS */}
                <section className="an-card-block">
                    <div className="an-card-head">
                        <h4>Predictive Components & Spares Demand</h4>
                        <span className="an-chart-sub">Frequent replacement constraints compiled directly from technical engine guides</span>
                    </div>
                    <div className="an-inventory-list">
                        {spareParts.length === 0 ? (
                            <div className="an-empty-state">No structural spare parts mapped to current procedures.</div>
                        ) : (
                            spareParts.map((item, idx) => (
                                <div key={idx} className="an-inventory-item-row">
                                    <div className="an-inv-main">
                                        <FiBox className="an-inv-icon" />
                                        <div>
                                            <span className="an-inv-name">{item.part_name}</span>
                                            <span className="an-inv-meta-sub">Requires assignment in upcoming maintenance pipelines</span>
                                        </div>
                                    </div>
                                    <span className="an-status-tag info">{item.count} units requested</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* EXPERT PRESCRIPTIVE INSIGHT CARDS */}
            <section className="an-section-wrapper telemetry-insights-panel">
                <div className="an-insights-header">
                    <div className="an-title-combo">
                        <FiZap className="insights-lightning" />
                        <h2 className="an-mod-title text-gradient">Prescriptive GenAI Operational Recommendations</h2>
                    </div>
                    <span className="an-badge-live">Reactive Insights Ready</span>
                </div>
                <div className="an-insights-container-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    <div className="an-insight-card-item warning">
                        <div className="an-insight-body">
                            <FiAlertTriangle className="insight-warning-icon" />
                            <div>
                                <h5 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>System Optimization Vector</h5>
                                <p className="an-insight-text-content">
                                    The primary error risk profile across active infrastructure is centered on <strong>Error Code {insights.mostFrequentErrorCode || "N/A"}</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="an-insight-footer-action">
                            <span className="an-action-call-text">Worst Machine Root: Node {insights.machineWithHighestFailureCount || "N/A"}</span>
                        </div>
                    </div>

                    <div className="an-insight-card-item info">
                        <div className="an-insight-body">
                            <FiActivity className="insight-warning-icon" style={{ color: '#1890ff' }} />
                            <div>
                                <h5 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Reference Material Footprint</h5>
                                <p className="an-insight-text-content">
                                    Semantic search lookup parameters isolated <strong>{insights.mostReferencedManual || "N/A"}</strong> as the most referenced documentation component.
                                </p>
                            </div>
                        </div>
                        <div className="an-insight-footer-action">
                            <span className="an-action-call-text">System Averages: {insights.averageWorkOrdersPerMachine || 0} Tickets / Machine</span>
                        </div>
                    </div>

                    {insights.peakMaintenanceDay && insights.peakMaintenanceDay.date !== "N/A" && (
                        <div className="an-insight-card-item optimal">
                            <div className="an-insight-body">
                                <FiCheckCircle className="insight-warning-icon" style={{ color: '#52c41a' }} />
                                <div>
                                    <h5 style={{ margin: '0 0 4px 0', fontWeight: 600 }}>Peak Load Point Analysis</h5>
                                    <p className="an-insight-text-content">
                                        The highest operational request pressure spike occurred on <strong>{insights.peakMaintenanceDay.formatted}</strong>.
                                    </p>
                                </div>
                            </div>
                            <div className="an-insight-footer-action">
                                <span className="an-action-call-text">Spike Volume: {insights.peakMaintenanceDay.count || 0} Incident Logs</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* AGGREGATED RECOMMENDED STEPS DICTIONARY */}
            <section className="an-section-wrapper">
                <h2 className="an-mod-title"><FiClipboard /> Recurring Prescriptive Repair Sequences</h2>
                <div className="an-table-wrapper" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="an-table summary-variant">
                        <thead>
                            <tr>
                                <th>Recommended Action Plan</th>
                                <th>Citations & Frequency Across Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recActions.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="an-empty-table-state">No actions indexed from the work order base.</td>
                                </tr>
                            ) : (
                                recActions.map((action, idx) => (
                                    <tr key={idx}>
                                        <td className="strong">{action.action}</td>
                                        <td>Mapped in <strong>{action.count}</strong> structured repairs</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* SECTION 11: RECENT ACTIVITY PERFORMANCE MATRIX */}
            <section className="an-section-wrapper last-table-section">
                <h2 className="an-mod-title"><FiShield /> Reactive System Activity Feed</h2>
                <div className="an-table-wrapper">
                    <table className="an-table summary-variant">
                        <thead>
                            <tr>
                                <th>Work Order Ticket</th>
                                <th>Machine Node</th>
                                <th>Fault Index</th>
                                <th>Department Space</th>
                                <th>Priority</th>
                                <th>Verification Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="an-empty-table-state">No real-time activities verified in data stream.</td>
                                </tr>
                            ) : (
                                recentActivity.map((activity, idx) => (
                                    <tr key={idx}>
                                        <td className="strong">{activity.work_order_id}</td>
                                        <td>{activity.machine_id}</td>
                                        <td><code>{activity.error_code}</code></td>
                                        <td>{activity.assigned_department}</td>
                                        <td>{activity.priority}</td>
                                        <td>
                                            <span className={`an-status-tag ${activity.status === 'Completed' ? 'success' :
                                                    activity.status === 'In Progress' ? 'info' : 'warning'
                                                }`}>
                                                {activity.status} {activity.acknowledged ? '(Verified)' : ''}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

// Inline formatting mathematical safety utility helper
function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2") || 0;
}