// Inventory.jsx
import React, { useState, useMemo, useEffect } from 'react';
import {
    FiBox,
    FiAlertTriangle,
    FiXCircle,
    FiSearch,
    FiFilter,
    FiCpu,
    FiClipboard,
    FiMapPin,
    FiCreditCard,
    FiTruck
} from 'react-icons/fi';
import inventoryService from '../services/inventoryService';
import '../styles/inventory.css';

export default function Inventory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        inventoryService.getInventory()
            .then(response => {
                if (response && response.status === 'success' && response.inventory) {
                    setItems(response.inventory);
                    if (response.inventory.length > 0) {
                        setSelectedId(response.inventory[0].part_id);
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching inventory data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // FIX: Normalizing status matching string structure to automatically sync with backend JSON
    const metrics = useMemo(() => {
        const activeWOSet = new Set();
        items.forEach(item => {
            if (item.linked_work_orders && item.linked_work_orders.length > 0) {
                item.linked_work_orders.forEach(wo => activeWOSet.add(wo));
            }
        });

        return {
            total: items.length,
            low: items.filter(i => i.status && i.status.toLowerCase() === 'low stock').length,
            out: items.filter(i => i.status && i.status.toLowerCase() === 'out of stock').length,
            activeWOs: activeWOSet.size
        };
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.part_name.toLowerCase().includes(search.toLowerCase()) ||
                item.part_code.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, categoryFilter]);

    const selectedItem = items.find(i => i.part_id === selectedId) || filteredItems[0];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Helper utility to correctly dynamic render badge classes matching your CSS names
    const getBadgeClass = (statusStr) => {
        if (!statusStr) return '';
        return statusStr.toLowerCase().replace(/\s+/g, '_');
    };

    if (loading) {
        return (
            <div className="inv-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Inventory...</p>
            </div>
        );
    }

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
                    <div className="tile-icon reserved"><FiClipboard /></div>
                    <div>
                        <span className="tile-lbl">Used In Active Work Orders</span>
                        <h3 className="tile-val text-success">{metrics.activeWOs}</h3>
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
                    {/* FIX: Aligned option values to exactly match JSON dataset categories */}
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="all">All Material Categories</option>
                        <option value="Hydraulic">Hydraulic</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Pneumatic">Pneumatic</option>
                        <option value="Safety">Safety</option>
                        <option value="Control Systems">Control Systems</option>
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
                                            key={item.part_id}
                                            className={`inv-row ${selectedItem?.part_id === item.part_id ? 'active' : ''}`}
                                            onClick={() => setSelectedId(item.part_id)}
                                        >
                                            <td className="strong">{item.part_name}</td>
                                            <td className="mono">{item.part_code}</td>
                                            <td>{item.category}</td>
                                            <td className="strong">{item.current_stock}</td>
                                            <td className="text-secondary">{item.minimum_stock}</td>
                                            <td>
                                                <span className={`inv-badge b-${getBadgeClass(item.status)}`}>
                                                    {item.status}
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
                                <span className="mono text-secondary">{selectedItem.part_id}</span>
                                <h3>{selectedItem.part_name}</h3>
                                <span className={`inv-badge b-${getBadgeClass(selectedItem.status)}`} style={{ display: 'inline-block', marginTop: '4px' }}>
                                    {selectedItem.status}
                                </span>
                            </div>

                            <div className="spec-grid">
                                <div className="spec-cell">
                                    <span className="lbl"><FiMapPin style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Warehouse Coordinates</span>
                                    <span className="val">{selectedItem.warehouse_location}</span>
                                </div>
                                <div className="spec-cell">
                                    <span className="lbl"><FiCreditCard style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Procurement Cost Unit</span>
                                    <span className="val">{formatCurrency(selectedItem.unit_cost_inr)}</span>
                                </div>
                            </div>

                            <hr className="divider" />

                            <div className="detail-section">
                                <h4><FiCpu className="section-icon" /> Compatible Machine Ecosystem</h4>
                                <ul className="machine-tags">
                                    {selectedItem.compatible_machines?.map((m, i) => (
                                        <li key={i} className="m-tag">{m}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="detail-section vendor-box">
                                <h4><FiTruck className="section-icon" /> Primary Procurement Partner</h4>
                                <div className="vendor-info">
                                    <span className="val">{selectedItem.supplier}</span>
                                    <span className="lbl">Acknowledged Lead Time: {selectedItem.lead_time_days} Days</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4><FiClipboard className="section-icon" /> Used In Active Work Orders</h4>
                                {selectedItem.linked_work_orders && selectedItem.linked_work_orders.length > 0 ? (
                                    <ul className="machine-tags" style={{ marginTop: '8px' }}>
                                        {selectedItem.linked_work_orders.map((wo, i) => (
                                            <li key={i} className="m-tag" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>{wo}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '4px' }}>No active prescriptive work orders linking this part asset.</p>
                                )}
                            </div>
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