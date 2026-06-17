// Inventory.jsx
import React, { useState, useMemo } from 'react';
import {
    FiBox,
    FiAlertTriangle,
    FiXCircle,
    FiCheckCircle,
    FiSearch,
    FiFilter,
    FiCpu,
    FiTruck,
    FiTrendingUp,
    FiRefreshCw
} from 'react-icons/fi';
import '../styles/inventory.css';

const MOCK_INVENTORY = [
    {
        id: 'PART-992-A',
        name: 'Nitrile Seal Kit P04-S',
        code: 'SK-NIT-04',
        category: 'Hydraulics',
        stock: 14,
        minStock: 15,
        status: 'low_stock',
        location: 'Bay 3, Shelf B',
        vendor: 'Fluitronics Corp.',
        compatibleMachines: ['Hydraulic Press P-04', 'Hydraulic Press P-05'],
        leadTime: '3 Days',
        unitCost: '$42.50'
    },
    {
        id: 'PART-881-C',
        name: 'Ceramic Bearing Set C12-BRG',
        code: 'BRG-CER-12',
        category: 'Mechanical',
        stock: 0,
        minStock: 4,
        status: 'out_of_stock',
        location: 'Bay 1, Secure Cage',
        vendor: 'Apex Precision Rotors',
        compatibleMachines: ['CNC Milling Unit C-12', 'CNC Lathe L-09'],
        leadTime: '7 Days',
        unitCost: '$310.00'
    },
    {
        id: 'PART-109-M',
        name: '400A Vacuum Contactor',
        code: 'CON-VAC-400',
        category: 'Electrical',
        stock: 3,
        minStock: 2,
        status: 'in_stock',
        location: 'Bay 4, Cabinet E',
        vendor: 'Schneider heavy Indus.',
        compatibleMachines: ['Induction Furnace F-01', 'Substation Transformer S-02'],
        leadTime: '12 Days',
        unitCost: '$1,250.00'
    },
    {
        id: 'PART-304-X',
        name: 'Shielded Multi-Core Harness',
        code: 'WR-SHD-M3',
        category: 'Robotics',
        stock: 8,
        minStock: 5,
        status: 'in_stock',
        location: 'Bay 2, Drawer 12',
        vendor: 'RoboWire Systems',
        compatibleMachines: ['Robotic Arm Assembly R-02', 'Pick & Place Unit PP-01'],
        leadTime: '5 Days',
        unitCost: '$85.00'
    },
    {
        id: 'PART-055-K',
        name: 'Coolant Radiator Gasket K8',
        code: 'GSK-RAD-K8',
        category: 'Cooling',
        stock: 1,
        minStock: 5,
        status: 'low_stock',
        location: 'Bay 3, Shelf E',
        vendor: 'Thermal Dynamics Ltd.',
        compatibleMachines: ['Rotary Compressor K-08'],
        leadTime: '4 Days',
        unitCost: '$18.00'
    }
];

export default function Inventory() {
    const [items, setItems] = useState(MOCK_INVENTORY);
    const [selectedId, setSelectedId] = useState(MOCK_INVENTORY[0]?.id || null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const metrics = useMemo(() => ({
        total: items.length,
        low: items.filter(i => i.status === 'low_stock').length,
        out: items.filter(i => i.status === 'out_of_stock').length,
        reserved: 4 // Static metric for tracking allocation
    }), [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.code.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, categoryFilter]);

    const selectedItem = items.find(i => i.id === selectedId) || filteredItems[0];

    return (
        <div className="inv-container">
            <header className="inv-header">
                <div>
                    <h1 className="inv-title">Inventory</h1>
                    <p className="inv-subtitle">Spare parts, critical apparatus consumables, and warehouse stock telemetry</p>
                </div>
            </header>

            <section className="inv-metrics-grid">
                <div className="metric-tile">
                    <div className="tile-icon total"><FiBox /></div>
                    <div>
                        <span className="tile-lbl">Total Cataloged Items</span>
                        <h3 className="tile-val">{metrics.total}</h3>
                    </div>
                </div>
                <div className="metric-tile">
                    <div className="tile-icon low"><FiAlertTriangle /></div>
                    <div>
                        <span className="tile-lbl">Low Stock Alerts</span>
                        <h3 className="tile-val text-warning">{metrics.low}</h3>
                    </div>
                </div>
                <div className="metric-tile">
                    <div className="tile-icon out"><FiXCircle /></div>
                    <div>
                        <span className="tile-lbl">Out of Stock criticals</span>
                        <h3 className="tile-val text-danger">{metrics.out}</h3>
                    </div>
                </div>
                <div className="metric-tile">
                    <div className="tile-icon reserved"><FiCheckCircle /></div>
                    <div>
                        <span className="tile-lbl">Allocated / Reserved</span>
                        <h3 className="tile-val text-success">{metrics.reserved}</h3>
                    </div>
                </div>
            </section>

            <div className="inv-control-bar">
                <div className="inv-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search parts catalog by name or code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="inv-select-wrapper">
                    <FiFilter className="filter-icon" />
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="all">All Material Categories</option>
                        <option value="Hydraulics">Hydraulics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Robotics">Robotics</option>
                        <option value="Cooling">Cooling</option>
                    </select>
                </div>
            </div>

            <div className="inv-workspace">
                <div className="inv-main-panel">
                    {filteredItems.length === 0 ? (
                        <div className="inv-empty">
                            <FiBox className="empty-icon" />
                            <p>No lineage tracks match chosen filter parameters.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="inv-table">
                                <thead>
                                    <tr>
                                        <th>Part Nomenclature</th>
                                        <th>System Code</th>
                                        <th>Category</th>
                                        <th>Current Stock</th>
                                        <th>Min Level</th>
                                        <th>Status Matrix</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(item => (
                                        <tr
                                            key={item.id}
                                            className={`inv-row ${selectedItem?.id === item.id ? 'active' : ''}`}
                                            onClick={() => setSelectedId(item.id)}
                                        >
                                            <td className="strong">{item.name}</td>
                                            <td className="mono">{item.code}</td>
                                            <td>{item.category}</td>
                                            <td className="strong">{item.stock}</td>
                                            <td className="text-secondary">{item.minStock}</td>
                                            <td>
                                                <span className={`inv-badge b-${item.status}`}>
                                                    {item.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="inv-detail-panel">
                    {selectedItem ? (
                        <div className="item-detail-card">
                            <div className="detail-head">
                                <span className="mono text-secondary">{selectedItem.id}</span>
                                <h3>{selectedItem.name}</h3>
                            </div>

                            <div className="spec-grid">
                                <div className="spec-cell">
                                    <span className="lbl">Warehouse Coordinates</span>
                                    <span className="val">{selectedItem.location}</span>
                                </div>
                                <div className="spec-cell">
                                    <span className="lbl">Procurement Cost Unit</span>
                                    <span className="val">{selectedItem.unitCost}</span>
                                </div>
                            </div>

                            <hr className="divider" />

                            <div className="detail-section">
                                <h4><FiCpu className="section-icon" /> Compatible Machine Ecosystem</h4>
                                <ul className="machine-tags">
                                    {selectedItem.compatibleMachines.map((m, i) => (
                                        <li key={i} className="m-tag">{m}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="detail-section order-suggestion-box">
                                <h4><FiTrendingUp className="section-icon" /> Automated Reorder Insights</h4>
                                {selectedItem.stock <= selectedItem.minStock ? (
                                    <p className="suggestion-alert">
                                        Current stock level violates core thresholds. Recommended deployment trigger replenishment volume: <strong>{(selectedItem.minStock * 3) - selectedItem.stock} units</strong>.
                                    </p>
                                ) : (
                                    <p className="suggestion-nominal">Stock volumes within optimized structural parameters. No purchase request required.</p>
                                )}
                            </div>

                            <div className="detail-section vendor-box">
                                <h4><FiTruck className="section-icon" /> Primary Procurement Partner</h4>
                                <div className="vendor-info">
                                    <span className="val">{selectedItem.vendor}</span>
                                    <span className="lbl">Acknowledged Lead Time: {selectedItem.leadTime}</span>
                                </div>
                            </div>

                            {selectedItem.stock <= selectedItem.minStock && (
                                <button className="reorder-action-btn" onClick={() => alert(`Purchase Order compiled for ${selectedItem.vendor}`)}>
                                    <FiRefreshCw /> Trigger Procurement Reorder
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="detail-empty">
                            <p>Select a storage line asset to inspect supply logistics metrics.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}