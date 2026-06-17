// Alerts.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    FiAlertTriangle,
    FiCheckCircle,
    FiActivity,
    FiSearch,
    FiFilter,
    FiSliders,
    FiCalendar,
    FiArrowRight,
    FiClock,
    FiCpu
} from 'react-icons/fi';
import alertService from '../services/alertService';
import '../styles/alerts.css';

export default function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [selectedAlertId, setSelectedAlertId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [machineFilter, setMachineFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Data Fetching Lifecycle
    useEffect(() => {
        const loadAlerts = async () => {
            try {
                const response = await alertService.getAlerts();
                console.log("Alerts Data:", response);

                const alertsData = response.alerts || [];
                setAlerts(alertsData);

                if (alertsData.length > 0) {
                    setSelectedAlertId(alertsData[0].alert_id);
                }
            } catch (error) {
                console.error("Failed to load alerts:", error);
            } finally {
                setLoading(false);
            }
        };

        loadAlerts();
    }, []);

    // KPI Calculations
    const kpis = useMemo(() => {
        return {
            active: alerts.filter(a => a.status === 'active').length,
            critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
            warning: alerts.filter(a => a.severity === 'warning' && a.status === 'active').length,
            resolved: alerts.filter(a => a.status === 'resolved').length,
        };
    }, [alerts]);

    // Unique lists for machine filters
    const machineOptions = useMemo(() => {
        return ['all', ...new Set(alerts.map(a => a.machine_id))];
    }, [alerts]);

    // Filter Logic
    const filteredAlerts = useMemo(() => {
        return alerts.filter(alert => {
            const matchesSearch = alert.machine_id.toLowerCase().includes(search.toLowerCase()) ||
                alert.error_code.toLowerCase().includes(search.toLowerCase()) ||
                alert.alert_id.toLowerCase().includes(search.toLowerCase());
            const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
            const matchesMachine = machineFilter === 'all' || alert.machine_id === machineFilter;
            const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;

            return matchesSearch && matchesSeverity && matchesMachine && matchesStatus;
        });
    }, [alerts, search, severityFilter, machineFilter, statusFilter]);

    // Derived Selected Alert
    const selectedAlert = alerts.find(a => a.alert_id === selectedAlertId) || filteredAlerts[0];

    const handleOpenAiAnalysis = (alertId) => {
        console.log(`Navigating to AI Assistant for Alert: ${alertId}`);
    };

    // Global loading state shield
    if (loading) {
        return (
            <div className="command-center-container" style={{ padding: '40px', color: 'var(--text-muted, #888)', fontFamily: 'monospace' }}>
                Loading alerts...
            </div>
        );
    }

    return (
        <div className="command-center-container">
            {/* Page Header */}
            <header className="cc-header">
                <div className="cc-title-area">
                    <h1 className="cc-title">Telemetry Alerts</h1>
                    <p className="cc-subtitle">Real-time system health Monitoring and active edge telemetry streaming</p>
                </div>
                <div className="cc-timestamp">
                    <FiClock className="icon" />
                    <span>System Live Status</span>
                </div>
            </header>

            {/* KPI Dashboard Section */}
            <section className="cc-kpi-grid">
                <div className="kpi-card" onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}>
                    <div className="kpi-icon-wrapper active-pulse">
                        <FiActivity className="kpi-icon" />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">Active Alerts</span>
                        <h3 className="kpi-value">{kpis.active}</h3>
                    </div>
                </div>

                <div className="kpi-card" onClick={() => { setSeverityFilter('critical'); setStatusFilter('active'); }}>
                    <div className="kpi-icon-wrapper danger-bg">
                        <FiAlertTriangle className="kpi-icon danger-color" />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">Critical</span>
                        <h3 className="kpi-value value-danger">{kpis.critical}</h3>
                    </div>
                </div>

                <div className="kpi-card" onClick={() => { setSeverityFilter('warning'); setStatusFilter('active'); }}>
                    <div className="kpi-icon-wrapper warning-bg">
                        <FiAlertTriangle className="kpi-icon warning-color" />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">Warning</span>
                        <h3 className="kpi-value value-warning">{kpis.warning}</h3>
                    </div>
                </div>

                <div className="kpi-card" onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}>
                    <div className="kpi-icon-wrapper resolved-bg">
                        <FiCheckCircle className="kpi-icon resolved-color" />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-label">Resolved</span>
                        <h3 className="kpi-value value-success">{kpis.resolved}</h3>
                    </div>
                </div>
            </section>

            {/* Filter Toolbar */}
            <div className="cc-toolbar">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search machine, code, or alert ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <div className="select-wrapper">
                        <FiSliders className="select-icon" />
                        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                            <option value="all">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="warning">Warning</option>
                        </select>
                    </div>

                    <div className="select-wrapper">
                        <FiFilter className="select-icon" />
                        <select value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)}>
                            {machineOptions.map(m => (
                                <option key={m} value={m}>{m === 'all' ? 'All Machines' : m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="select-wrapper">
                        <FiCalendar className="select-icon" />
                        <select defaultValue="all">
                            <option value="all">All Timeframes</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                        </select>
                    </div>

                    {(search || severityFilter !== 'all' || machineFilter !== 'all' || statusFilter !== 'all') && (
                        <button className="reset-btn" onClick={() => {
                            setSearch('');
                            setSeverityFilter('all');
                            setMachineFilter('all');
                            setStatusFilter('all');
                        }}>
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Main Workspace Layout */}
            <div className="cc-workspace">
                {/* Table Panel */}
                <div className="cc-table-panel">
                    {filteredAlerts.length === 0 ? (
                        <div className="empty-state">
                            <FiCheckCircle className="empty-icon" />
                            <h4>No Alerts Flagged</h4>
                            <p>All monitored physical assets and system modules are performing within nominal parameters.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="cc-table">
                                <thead>
                                    <tr>
                                        <th>Machine Asset</th>
                                        <th>Error Code</th>
                                        <th>Core Temp</th>
                                        <th>Severity</th>
                                        <th>Status</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAlerts.map((alert) => {
                                        const isSelected = selectedAlert?.alert_id === alert.alert_id;
                                        return (
                                            <tr
                                                key={alert.alert_id}
                                                className={`clickable-row ${isSelected ? 'row-selected' : ''}`}
                                                onClick={() => setSelectedAlertId(alert.alert_id)}
                                            >
                                                <td className="font-medium">{alert.machine_id}</td>
                                                <td><span className="code-badge">{alert.error_code}</span></td>
                                                <td>{alert.temperature}°C</td>
                                                <td>
                                                    <span className={`severity-badge badge-${alert.severity === 'critical' ? 'danger' : alert.severity}`}>
                                                        {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${alert.status}`}>
                                                        {alert.status}
                                                    </span>
                                                </td>
                                                <td className="text-secondary text-sm">{alert.timestamp}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Telemetry Details Panel */}
                <div className="cc-details-panel">
                    {selectedAlert ? (
                        <div className="details-card">
                            <div className="details-header">
                                <div>
                                    <span className="details-id">{selectedAlert.alert_id}</span>
                                    <h2 className="details-title">{selectedAlert.machine_id}</h2>
                                </div>
                                <span className={`status-badge status-${selectedAlert.status}`}>
                                    {selectedAlert.status}
                                </span>
                            </div>

                            {/* Telemetry Metric Specifications */}
                            <div className="details-section">
                                <h4 className="section-title">Telemetry Parameters</h4>
                                <div className="telemetry-specs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                                    <div className="metric-item-block" style={{ background: 'var(--card-bg-subtle, rgba(255,255,255,0.03))', padding: '12px', borderRadius: '6px' }}>
                                        <span className="lbl" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted, #888)', marginBottom: '4px' }}>Error Code</span>
                                        <span className="val code-badge">{selectedAlert.error_code}</span>
                                    </div>
                                    <div className="metric-item-block" style={{ background: 'var(--card-bg-subtle, rgba(255,255,255,0.03))', padding: '12px', borderRadius: '6px' }}>
                                        <span className="lbl" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted, #888)', marginBottom: '4px' }}>Core Temperature</span>
                                        <span className={`val ${selectedAlert.severity === 'critical' ? 'text-danger' : 'text-warning'}`} style={{ fontWeight: '600' }}>
                                            {selectedAlert.temperature}°C
                                        </span>
                                    </div>
                                    <div className="metric-item-block" style={{ background: 'var(--card-bg-subtle, rgba(255,255,255,0.03))', padding: '12px', borderRadius: '6px' }}>
                                        <span className="lbl" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted, #888)', marginBottom: '4px' }}>Severity Class</span>
                                        <span className="val capitalize" style={{ fontWeight: '500' }}>{selectedAlert.severity}</span>
                                    </div>
                                    <div className="metric-item-block" style={{ background: 'var(--card-bg-subtle, rgba(255,255,255,0.03))', padding: '12px', borderRadius: '6px' }}>
                                        <span className="lbl" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted, #888)', marginBottom: '4px' }}>Timestamp</span>
                                        <span className="val text-sm" style={{ fontFamily: 'monospace' }}>{selectedAlert.timestamp}</span>
                                    </div>
                                </div>
                            </div>

                            {/* RAG Agent Navigation Hook */}
                            <div className="details-footer" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                <button
                                    className="action-btn primary-action"
                                    onClick={() => handleOpenAiAnalysis(selectedAlert.alert_id)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <FiCpu /> Open AI Analysis <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="details-empty-state">
                            <p>Select an incident line-item to initialize technical assessment telemetry panel.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}