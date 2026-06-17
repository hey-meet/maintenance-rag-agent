import React from 'react';

const ActivityFeed = ({ dashboardData }) => {

    const activities =
        dashboardData?.activity_feed || [];

    const getDotColor = (event) => {

        const text = event.toLowerCase();

        if (text.includes('alert'))
            return 'danger';

        if (text.includes('query'))
            return 'info';

        if (text.includes('retrieved'))
            return 'warning';

        return 'success';
    };

    return (
        <div className="activity-feed">

            <div className="feed-header">
                <h3>LIVE ACTIVITY FEED</h3>
            </div>

            <div className="activity-list">

                {activities.length === 0 ? (

                    <div className="activity-item">
                        <div className="activity-text">
                            No Activity Available
                        </div>
                    </div>

                ) : (

                    activities.map((activity, index) => (

                        <div
                            key={index}
                            className="activity-item"
                        >

                            <div
                                className={`activity-dot dot-${getDotColor(
                                    activity.event
                                )}`}
                            ></div>

                            <div className="activity-time">
                                {activity.time}
                            </div>

                            <div className="activity-text">
                                {activity.event}
                            </div>

                        </div>

                    ))

                )}

            </div>

            <div className="feed-footer">
                <button className="footer-button">
                    View All Activity →
                </button>
            </div>

        </div>
    );
};

export default ActivityFeed;