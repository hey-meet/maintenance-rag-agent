// WorkOrdersPage.jsx
import React, { useState, useMemo } from 'react';
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

// Premium Industrial Mock Data
const MOCK_ORDERS = [
    {
        id: 'WO-2026-801',
        machine: 'Hydraulic Press P-04',
        issue: 'Main pressure line micro-fracture repair & seal replacement',
        priority: 'critical',
        status: 'in_progress',
        technician: 'Marcus Vance (Staff Mechanic)',
        dueDate: '2026-06-18',
        steps: [
            'Isolate hydraulic press fluid line V-12 and bleed remaining system pressure.',
            'Degrease assembly casing to expose the micro-fracture boundary.',
            'Execute precision TIG weld overlay along the structural fault line.',
            'Replace high-pressure nitrile seals on primary manifold ports.'
        ],
        tools: ['TIG Welder', 'Flaw Detector', 'Hydraulic Torque Wrench'],
        parts: ['Nitrile Seal Kit P04-S', 'ISO 46 Hydraulic Fluid (20L)'],
        docRef: 'SOP-MAINT-HYD-04'
    },
    {
        id: 'WO-2026-802',
        machine: 'CNC Milling Unit C-12',
        issue: 'Spindle harmonic resonance bearing swap & recalibration',
        priority: 'high',
        status: 'in_progress',
        technician: 'Elena Rostova (Automation Eng.)',
        dueDate: '2026-06-19',
        steps: [
            'Disassemble spindle housing assembly and extract worn ceramic bearings.',
            'Inspect spindle shaft alignment using digital optical micrometer.',
            'Press-fit premium grade-5 replacement bearing tracks.',
            'Execute baseline vibration calibration sweep at 12,000 RPM.'
        ],
        tools: ['Digital Micrometer', 'Hydraulic Press Tool', 'Vibration Analyzer'],
        parts: ['Ceramic Bearing Set C12-BRG', 'Lithium Complex Grease'],
        docRef: 'CNC-M-TH-09'
    },
    {
        id: 'WO-2026-803',
        machine: 'Robotic Arm Assembly R-02',
        issue: 'Axis 3 servo motor wiring harness continuity fault fix',
        priority: 'medium',
        status: 'on_hold',
        technician: 'Devon Lane (Robotics Tech)',
        dueDate: '2026-06-22',
        steps: [
            'Remove articulating joint safety shielding from Axis 3 framework.',
            'Run complete pin-to-pin continuity trace using analytical multimeter.',
            'Splice and insulate fractured conductor paths within the main loom.',
            'Re-secure flexible conduit bracket to prevent future friction wear.'
        ],
        tools: ['Insulated Wire Strippers', 'Digital Multimeter', 'Heat Shrink Gun'],
        parts: ['Shielded Multi-Core Harness Section', 'Conduit Clamps'],
        docRef: 'ROB-SYS-VOL2'
    },
    {
        id: 'WO-2026-804',
        machine: 'Rotary Compressor K-08',
        issue: 'Post-overheating safety check & radiator flushing',
        priority: 'high',
        status: 'completed',
        technician: 'Marcus Vance (Staff Mechanic)',
        dueDate: '2026-06-16',
        steps: [
            'Drain system cooling lines into designated environmental storage tanks.',
            'Pump heavy descaling solution through internal cooling core matrix.',
            'Verify coolant flow sensor activation rates post-flush.',
            'Re-torque structural casing bolts according to factory spec.'
        ],
        tools: ['Pneumatic Flushing Rig', 'Calibrated Torque Wrench'],
        parts: ['Descaling Agent (5L)', 'Coolant Radiator Gasket K8'],
        docRef: 'COMP-MAINT-01'
    },
    {
        id: 'WO-2026-805',
        machine: 'Induction Furnace F-01',
        issue: 'Secondary pump switchgear contactor replacement',
        priority: 'medium',
        status: 'completed',
        technician: 'Sarah Jenkins (Electrical Lead)',
        dueDate: '2026-06-15',
        steps: [
            'Lock out, tag out (LOTO) main power distribution box sub-panel 4.',
            'Remove pitted and oxidized mechanical contactor assembly blocks.',
            'Install heavy-duty 400A vacuum contactor onto DIN rail mounting.',
            'Test coil engagement sequence under simulated load conditions.'
        ],
        tools: ['LOTO Kit', 'Insulated Screwdriver Set', 'Phase Rotation Meter'],
        parts: ['400A Vacuum Contactor', 'DIN Rail Terminal Blocks'],
        docRef: 'FURN-ELE-P3'
    }
];

export default function WorkOrdersPage() {
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [selectedOrderId, setSelectedOrderId] = useState(MOCK_ORDERS[0]?.id || null);

    // Search & Filter state
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // KPI Computations
    const metrics = useMemo(() => {
        return {
            total: orders.length,
            inProgress: orders.filter(o => o.status === 'in_progress').length,
            onHold: orders.filter(o => o.status === 'on_hold').length,
            completed: orders.filter(o => o.status === 'completed').length,
        };
    }, [orders]);

    // Main Filter Matrix
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.machine.toLowerCase().includes(search.toLowerCase()) ||
                order.id.toLowerCase().includes(search.toLowerCase()) ||
                order.technician.toLowerCase().includes(search.toLowerCase());
            const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

            return matchesSearch && matchesPriority && matchesStatus;
        });
    }, [orders, search, priorityFilter, statusFilter]);

    const selectedOrder = orders.find(o => o.id === selectedOrderId) || filteredOrders[0];

    return (
        <div className="ops-container">
            {/* View Header */}
            <header className="ops-header">
                <div className="ops-title-block">
                    <h1 className="ops-title">Work Orders</h1>
                    <p className="ops-subtitle">Tracking, structural scheduling, technician routing, and asset remediation execution</p>
                </div>
                <button className="ops-cta-btn" onClick={() => alert('Initializing Work Order Creation wizard...')}>
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
                        placeholder="Search by asset, order number, technician..."
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
                                        <th>Assigned Personnel</th>
                                        <th>Target Execution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => {
                                        const isSelected = selectedOrder?.id === order.id;
                                        return (
                                            <tr
                                                key={order.id}
                                                className={`ops-row ${isSelected ? 'row-active' : ''}`}
                                                onClick={() => setSelectedOrderId(order.id)}
                                            >
                                                <td className="font-mono">{order.id}</td>
                                                <td className="font-strong">{order.machine}</td>
                                                <td>
                                                    <span className={`priority-tag p-${order.priority}`}>
                                                        {order.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-pill s-${order.status}`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-muted text-sm">
                                                    <div className="tech-cell"><FiUser /> {order.technician}</div>
                                                </td>
                                                <td className="text-muted text-sm font-mono">
                                                    <div className="date-cell"><FiCalendar /> {order.dueDate}</div>
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
                                    <span className="inspect-id font-mono">{selectedOrder.id}</span>
                                    <h3 className="inspect-title">{selectedOrder.machine}</h3>
                                </div>
                                <span className={`status-pill s-${selectedOrder.status}`}>
                                    {selectedOrder.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="inspect-summary">
                                <span className="summary-lbl">Core Directives / Issue Statement</span>
                                <p className="summary-txt">{selectedOrder.issue}</p>
                            </div>

                            <hr className="inspect-divider" />

                            <div className="inspect-section">
                                <h4 className="section-header"><FiTool /> Sequential Resolution Steps</h4>
                                <ol className="step-list">
                                    {selectedOrder.steps.map((step, idx) => (
                                        <li key={idx} className="step-item">
                                            <span className="step-num">{idx + 1}</span>
                                            <p className="step-text">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            <div className="inspect-grid-blocks">
                                <div className="block-group">
                                    <h4 className="section-header"><FiCpu /> Apparatus / Tooling</h4>
                                    <ul className="bullet-list">
                                        {selectedOrder.tools.map((tool, i) => <li key={i}>{tool}</li>)}
                                    </ul>
                                </div>

                                <div className="block-group">
                                    <h4 className="section-header"><FiLayers /> Provisioned Spares</h4>
                                    <ul className="bullet-list">
                                        {selectedOrder.parts.map((part, i) => <li key={i}>{part}</li>)}
                                    </ul>
                                </div>
                            </div>

                            <div className="inspect-doc-box">
                                <div className="doc-meta">
                                    <FiFileText className="doc-icon" />
                                    <div>
                                        <span className="doc-lbl">Engineering Standard Operating Procedure</span>
                                        <span className="doc-val font-mono">{selectedOrder.docRef}</span>
                                    </div>
                                </div>
                                <button className="doc-action-btn" onClick={() => alert(`Retrieving documentation package: ${selectedOrder.docRef}`)}>
                                    Open Plan <FiArrowRight />
                                </button>
                            </div>

                            {selectedOrder.status !== 'completed' && (
                                <div className="inspect-footer">
                                    <button
                                        className="complete-action-btn"
                                        onClick={() => {
                                            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'completed' } : o));
                                        }}
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