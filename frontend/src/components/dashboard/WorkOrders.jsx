import React from 'react';

const WorkOrders = ({ dashboardData }) => {

    const orders =
        dashboardData?.work_orders || [];

    const summary = [
        {
            label: 'Total',
            value: orders.length
        },
        {
            label: 'Pending',
            value: orders.filter(
                o => o.status === 'Pending'
            ).length
        },
        {
            label: 'In Prog',
            value: orders.filter(
                o => o.status === 'In Progress'
            ).length
        },
        {
            label: 'Done',
            value: orders.filter(
                o => o.status === 'Completed'
            ).length
        }
    ];

    const getStatusClass = (status) => {

        const normalized =
            status.toLowerCase().replace(/\s+/g, '-');

        if (normalized === 'pending')
            return 'status-on-hold';

        if (normalized === 'in-progress')
            return 'status-in-progress';

        if (normalized === 'completed')
            return 'status-completed';

        return 'status-on-hold';
    };

    return (
        <div className="work-orders">

            <div className="orders-header">
                <h3>WORK ORDERS</h3>

                <span className="alert-count">
                    {orders.length} Active
                </span>
            </div>

            <div className="orders-summary">

                {summary.map((item) => (

                    <div
                        key={item.label}
                        className="summary-item"
                    >
                        <span className="summary-label">
                            {item.label}
                        </span>

                        <span className="summary-value">
                            {item.value}
                        </span>
                    </div>

                ))}

            </div>

            <div className="orders-table">

                {orders.length === 0 ? (

                    <div className="order-row">

                        <div className="order-info">
                            No Work Orders Available
                        </div>

                    </div>

                ) : (

                    orders.map((order) => (

                        <div
                            key={order.id}
                            className="order-row"
                        >

                            <div className="order-info">

                                <span className="order-id">
                                    {order.id}
                                </span>

                                <span className="order-title">
                                    {order.machine}
                                </span>

                            </div>

                            <div
                                className={`order-status ${getStatusClass(
                                    order.status
                                )}`}
                            >
                                {order.status}
                            </div>

                        </div>

                    ))

                )}

            </div>

            <div className="orders-footer">
                <button
                    className="footer-button"
                    type="button"
                >
                    View All Work Orders →
                </button>
            </div>

        </div>
    );
};

export default WorkOrders;