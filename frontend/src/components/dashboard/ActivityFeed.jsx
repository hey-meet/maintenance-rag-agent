import React from 'react';

const ActivityFeed = () => {
    const activities = [
        { id: 1, time: '10:42 AM', text: 'AI Agent completed system scan', dotColor: 'success' },
        { id: 2, time: '10:41 AM', text: 'High vibration alert detected', dotColor: 'danger' },
        { id: 3, time: '10:40 AM', text: 'Work order WO-1024 updated', dotColor: 'warning' },
        { id: 4, time: '10:39 AM', text: 'New maintenance manual uploaded', dotColor: 'info' },
        { id: 5, time: '10:37 AM', text: 'Telemetry stream synchronized', dotColor: 'success' }
    ];

    return (
        <div className="activity-feed">
            <div className="feed-header">
                <h3>LIVE ACTIVITY FEED</h3>
            </div>
            <div className="activity-list">
                {activities.map(activity => (
                    <div key={activity.id} className="activity-item">
                        <div className={`activity-dot dot-${activity.dotColor}`}></div>
                        <div className="activity-time">{activity.time}</div>
                        <div className="activity-text">{activity.text}</div>
                    </div>
                ))}
            </div>
            <div className="feed-footer">
                <button className="footer-button">View All Activity →</button>
            </div>
        </div>
    );
};

export default ActivityFeed;