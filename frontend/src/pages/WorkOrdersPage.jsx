// WorkOrdersPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import workOrderService from "../services/workOrderService";
import {
    FiPlus,
    FiLayers,
    FiClock,
    FiAlertCircle,
    FiCheckCircle,
    FiSearch,
    FiFilter,
    FiUser,
    FiCalendar,
    FiTool,
    FiCpu,
    FiFileText,
    FiArrowRight,
    FiAlertTriangle
} from 'react-icons/fi';
import '../styles/workOrdersPage.css';

// Local data retained strictly as an engineering fallback reference
const MOCK_ORDERS = [
    {
        work_order_id: 'WO-2026-801',
        machine_id: 'Hydraulic Press P-04',
        error_code: 'E-4042: Main pressure line micro-fracture & seal structural fault',
        priority: 'critical',
        status: 'in_progress',
        assigned_department: 'Hydraulics & Heavy Mechanical',
        due_date: '2026-06-18',
        estimated_time: '4.5 hours',
        // Future AI Agent Output Field
        recommended_steps: [
            'Isolate hydraulic press fluid line V-12 and bleed remaining system pressure.',
            'Degrease assembly casing to expose the micro-fracture boundary.',
            'Execute precision TIG weld overlay along the structural fault line.',
            'Replace high-pressure nitrile seals on primary manifold ports.'
        ],
        // Future AI Agent Output Field
        required_tools: ['TIG Welder', 'Flaw Detector', 'Hydraulic Torque Wrench'],
        // Future AI Agent Output Field
        required_parts: ['Nitrile Seal Kit P04-S', 'ISO 46 Hydraulic Fluid (20L)'],
        // Future AI Agent Output Field
        manual_reference: {
            source: 'SOP-MAINT-HYD-04',
            page: '42',
            section: 'Sec. 4.2: High-Pressure Containment Remediation'
        }
    }
];

export default function WorkOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Search & Filter state
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Shared orchestrator to ingest fresh operational records from the backend matrix
    const fetchAndSetWorkOrders = async (shouldSetDefaultSelection = false) => {
        try {
            const data = await workOrderService.getWorkOrders();
            console.log("Work Orders:", data);

            const fetchedOrders = data.work_orders || [];
            setOrders(fetchedOrders);

            if (shouldSetDefaultSelection && fetchedOrders.length > 0) {
                setSelectedOrderId(fetchedOrders[0].work_order_id);
            }
        } catch (error) {
            console.error("Failed to load operational execution records from backend matrix:", error);
            // Fallback architecture to maintain interface structural integrity if service errors out
            setOrders(MOCK_ORDERS);
            if (shouldSetDefaultSelection && MOCK_ORDERS.length > 0) {
                setSelectedOrderId(MOCK_ORDERS[0].work_order_id);
            }
        }
    };

    // Lifecycle Hook: Asynchronous Backend Ingestion Engine
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await fetchAndSetWorkOrders(true);
            setLoading(false);
        };
        loadInitialData();
    }, []);

    // Persistent Persistence Workflow for Work Order Completion
    const handleSignalOrderCompletion = async (workOrderId) => {
        try {
            await workOrderService.completeWorkOrder(workOrderId);
            // Reload operational dashboard from database tracking cluster post-completion
            await fetchAndSetWorkOrders(false);
        } catch (error) {
            console.error("Failed to signal order completion sequence on backend persistence matrix:", error);
        }
    };

    // KPI Computations based on live runtime data state
    const metrics = useMemo(() => {
        return {
            total: orders.length,
            inProgress: orders.filter(o => o.status === 'in_progress').length,
            onHold: orders.filter(o => o.status === 'on_hold').length,
            completed: orders.filter(o => o.status === 'completed').length,
        };
    }, [orders]);

    // Main Filter Matrix - Hardened against missing/undefined backend fields
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = (order.machine_id || "").toLowerCase().includes(search.toLowerCase()) ||
                (order.work_order_id || "").toLowerCase().includes(search.toLowerCase()) ||
                (order.assigned_department || "").toLowerCase().includes(search.toLowerCase()) ||
                (order.error_code || "").toLowerCase().includes(search.toLowerCase());
            const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            return matchesSearch && matchesPriority && matchesStatus;
        });
    }, [orders, search, priorityFilter, statusFilter]);

    const selectedOrder = orders.find(o => o.work_order_id === selectedOrderId) || filteredOrders[0];

    // Engineering Gateway Layout: Pipeline Processing Interceptor
    if (loading) {
        return (
            <div className="ops-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', fontSize: '1.1rem', letterSpacing: '0.05em', color: 'var(--text-muted, #8a8a8a)' }}>
                Loading Work Orders...
            </div>
        );
    }

    return (
        <div className="ops-container">
            {/* View Header */}
            <header className="ops-header">
                <div className="ops-title-block">
                    <h1 className="ops-title">Work Orders</h1>
                    <p className="ops-subtitle">Tracking, structural scheduling, technician routing, and asset remediation execution</p>
                </div>
                <button className="ops-cta-btn" onClick={() => alert('Initializing Prescriptive Maintenance Order Wizard...')}>
                    <FiPlus /> Create Work Order
                </button>
            </header>

            {/* KPI Summary Matrix */}
            <section className="ops-kpi-row">
                <div className="ops-card" onClick={() => setStatusFilter('all')}>
                    <div className="ops-icon-box total">
                        <FiLayers />
                    </div>
                    <div className="ops-data">
                        <span className="ops-label">Total Work Orders</span>
                        <h3 className="ops-value">{metrics.total}</h3>
                    </div>
                </div>

                <div className="ops-card" onClick={() => setStatusFilter('in_progress')}>
                    <div className="ops-icon-box progress">
                        <FiClock />
                    </div>
                    <div className="ops-data">
                        <span className="ops-label">In Progress</span>
                        <h3 className="ops-value text-progress">{metrics.inProgress}</h3>
                    </div>
                </div>

                <div className="ops-card" onClick={() => setStatusFilter('on_hold')}>
                    <div className="ops-icon-box hold">
                        <FiAlertCircle />
                    </div>
                    <div className="ops-data">
                        <span className="ops-label">On Hold</span>
                        <h3 className="ops-value text-hold">{metrics.onHold}</h3>
                    </div>
                </div>

                <div className="ops-card" onClick={() => setStatusFilter('completed')}>
                    <div className="ops-icon-box done">
                        <FiCheckCircle />
                    </div>
                    <div className="ops-data">
                        <span className="ops-label">Completed</span>
                        <h3 className="ops-value text-done">{metrics.completed}</h3>
                    </div>
                </div>
            </section>

            {/* Filter and Command Strip */}
            <div className="ops-filter-strip">
                <div className="ops-search-wrapper">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by asset, order ID, error code, department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="ops-controls">
                    <div className="ops-select">
                        <FiFilter className="ctrl-icon" />
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                            <option value="all">All Priorities</option>
                            <option value="critical">Critical Only</option>
                            <option value="high">High Priority</option>
                            <option value="medium">Medium Priority</option>
                        </select>
                    </div>

                    <div className="ops-select">
                        <FiLayers className="ctrl-icon" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All Statuses</option>
                            <option value="in_progress">In Progress</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {(search || priorityFilter !== 'all' || statusFilter !== 'all') && (
                        <button className="ops-clear-btn" onClick={() => {
                            setSearch('');
                            setPriorityFilter('all');
                            setStatusFilter('all');
                        }}>
                            Reset View Matrix
                        </button>
                    )}
                </div>
            </div>

            {/* Workspace Configuration */}
            <div className="ops-workspace">
                {/* Master Panel (Table View) */}
                <div className="ops-master-panel">
                    {filteredOrders.length === 0 ? (
                        <div className="ops-empty-state">
                            <FiCheckCircle className="empty-icon" />
                            <h4>No Operational Orders Found</h4>
                            <p>Adjust your parameter configuration or initiate a new scheduled maintenance task sequence.</p>
                        </div>
                    ) : (
                        <div className="ops-table-scroller">
                            <table className="ops-table">
                                <thead>
                                    <tr>
                                        <th>Order Identification</th>
                                        <th>Industrial Asset</th>
                                        <th>Task Urgency</th>
                                        <th>Status Matrix</th>
                                        <th>Assigned Department</th>
                                        <th>Target Execution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => {
                                        const isSelected = selectedOrder?.work_order_id === order.work_order_id;
                                        return (
                                            <tr
                                                key={order.work_order_id}
                                                className={`ops-row ${isSelected ? 'row-active' : ''}`}
                                                onClick={() => setSelectedOrderId(order.work_order_id)}
                                            >
                                                <td className="font-mono">{order.work_order_id}</td>
                                                <td className="font-strong">{order.machine_id}</td>
                                                <td>
                                                    <span className={`priority-tag p-${order.priority}`}>
                                                        {order.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-pill s-${order.status}`}>
                                                        {(order.status || '').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-muted text-sm">
                                                    <div className="tech-cell"><FiUser /> {order.assigned_department}</div>
                                                </td>
                                                <td className="text-muted text-sm font-mono">
                                                    <div className="date-cell"><FiCalendar /> {order.due_date}</div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Panel (Selected Work Order Overview) */}
                <div className="ops-detail-panel">
                    {selectedOrder ? (
                        <div className="inspect-card">
                            <div className="inspect-header">
                                <div>
                                    <span className="inspect-id font-mono">{selectedOrder.work_order_id}</span>
                                    <h3 className="inspect-title">{selectedOrder.machine_id}</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span className={`status-pill s-${selectedOrder.status}`}>
                                        {(selectedOrder.status || '').replace('_', ' ')}
                                    </span>
                                    <span className="font-mono text-muted text-xs" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <FiClock /> Time: {selectedOrder?.estimated_time || "Unknown"}
                                    </span>
                                </div>
                            </div>

                            <div className="inspect-summary">
                                <span className="summary-lbl">Error Code / Diagnostic Output</span>
                                <p className="summary-txt font-mono" style={{ color: 'var(--text-bright, #fff)', fontSize: '0.9rem' }}>
                                    {selectedOrder.error_code}
                                </p>
                            </div>

                            <hr className="inspect-divider" />

                            <div className="inspect-section">
                                <h4 className="section-header"><FiTool /> Recommended Steps</h4>
                                <ol className="step-list">
                                    {selectedOrder.recommended_steps?.map((step, idx) => (
                                        <li key={idx} className="step-item">
                                            <span className="step-num">{idx + 1}</span>
                                            <p className="step-text">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="inspect-grid-blocks">
                                <div className="block-group">
                                    <h4 className="section-header"><FiCpu /> Required Tooling</h4>
                                    <ul className="bullet-list">
                                        {selectedOrder.required_tools?.map((tool, i) => <li key={i}>{tool}</li>)}
                                    </ul>
                                </div>

                                <div className="block-group">
                                    <h4 className="section-header"><FiLayers /> Required Spares</h4>
                                    <ul className="bullet-list">
                                        {selectedOrder.required_parts?.map((part, i) => <li key={i}>{part}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div className="inspect-doc-box">
                                <div className="doc-meta" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <FiFileText className="doc-icon" style={{ marginTop: '2px' }} />
                                    <div>
                                        <span className="doc-lbl" style={{ display: 'block', marginBottom: '4px' }}>
                                            Manual Reference Matrix
                                        </span>
                                        {selectedOrder?.manual_reference && (
                                            <div className="text-muted text-xs" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span><strong>Source:</strong> <span className="font-mono">{selectedOrder?.manual_reference?.source || 'N/A'}</span></span>
                                                <span><strong>Page:</strong> <span className="font-mono">{selectedOrder?.manual_reference?.page || '--'}</span></span>
                                                <span><strong>Section:</strong> <span className="font-mono">{selectedOrder?.manual_reference?.section || 'N/A'}</span></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="doc-action-btn"
                                    onClick={() => alert(`Retrieving documentation package from RAG Storage: ${selectedOrder?.manual_reference?.source || 'Unknown'}`)}
                                    style={{ alignSelf: 'flex-end' }}
                                >
                                    Open Plan <FiArrowRight />
                                </button>
                            </div>

                            {selectedOrder.status !== 'completed' && (
                                <div className="inspect-footer">
                                    <button
                                        className="complete-action-btn"
                                        onClick={() => handleSignalOrderCompletion(selectedOrder.work_order_id)}
                                    >
                                        Signal Order Completion
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="inspect-empty">
                            <FiAlertTriangle className="inspect-empty-icon" />
                            <p>Select an operational execution record to compile system engineering details layout.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
