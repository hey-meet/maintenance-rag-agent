import React from 'react';

const WorkOrders = () => {
    const orders = [
        { id: 'WO-1024', title: 'CNC-03 Spindle Inspection', status: 'In Progress' },
        { id: 'WO-1023', title: 'MILL-01 Bearing Replacement', status: 'In Progress' },
        { id: 'WO-1022', title: 'LATHE-01 Tool Calibration', status: 'On Hold' }
    ];

    const summary = [
        { label: 'Total', value: 8 },
        { label: 'In Prog', value: 3 },
        { label: 'On Hold', value: 2 },
        { label: 'Done', value: 3 }
    ];

    const getStatusClass = (status) => {
        const normalized = status.toLowerCase().replace(/\s+/g, '-');
        if (normalized === 'in-progress') return 'status-in-progress';
        if (normalized === 'on-hold') return 'status-on-hold';
        if (normalized === 'completed') return 'status-completed';
        return 'status-in-progress';
    };

    return (
        <div className="work-orders">
            <div className="orders-header">
                <h3>WORK ORDERS</h3>
                <span className="alert-count">3 Active</span>
            </div>

            <div className="orders-summary">
                {summary.map((item) => (
                    <div key={item.label} className="summary-item">
                        <span className="summary-label">{item.label}</span>
                        <span className="summary-value">{item.value}</span>
                    </div>
                ))}
            </div>

            <div className="orders-table">
                {orders.map((order) => (
                    <div key={order.id} className="order-row">
                        <div className="order-info">
                            <span className="order-id">{order.id}</span>
                            <span className="order-title">{order.title}</span>
                        </div>
                        <div className={`order-status ${getStatusClass(order.status)}`}>
                            {order.status}
                        </div>
                    </div>
                ))}
            </div>

            <div className="orders-footer">
                <button className="footer-button" type="button">
                    View All Work Orders →
                </button>
            </div>
        </div>
    );
};

export default WorkOrders;