import React from 'react';

const CircularGauge = ({ title, value, status: propStatus }) => {
    // Determine status based on value if not explicitly provided
    const getStatus = (val) => {
        if (propStatus) return propStatus;
        if (val >= 90) return 'optimal';
        if (val >= 70) return 'good';
        if (val >= 50) return 'warning';
        return 'critical';
    };

    const status = getStatus(value);

    // Map status to color variable
    const getColorVar = () => {
        switch (status) {
            case 'optimal': return 'var(--success-solid)';
            case 'good': return 'var(--success-solid)';
            case 'warning': return 'var(--warning-solid)';
            case 'critical': return 'var(--danger-solid)';
            default: return 'var(--success-solid)';
        }
    };

    // Map status to display text
    const getStatusText = () => {
        switch (status) {
            case 'optimal': return 'Optimal';
            case 'good': return 'Good';
            case 'warning': return 'Warning';
            case 'critical': return 'Critical';
            default: return 'Optimal';
        }
    };

    const color = getColorVar();
    const statusText = getStatusText();

    // SVG parameters for semicircle
    const width = 140;
    const height = 90;
    const centerX = width / 2; // 70
    const centerY = 65; // Position arc lower
    const radius = 48;

    // Start point (left), end point (right)
    const startX = centerX - radius;
    const startY = centerY;
    const endX = centerX + radius;
    const endY = centerY;

    // Arc path for semicircle (clockwise from left to right)
    const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

    // Calculate circumference of half circle
    const circumference = Math.PI * radius;
    const progressOffset = circumference * (1 - value / 100);

    return (
        <div className="circular-gauge" style={{ width: `${width}px`, margin: '0 auto' }}>
            {title && <div className="gauge-title" style={{
                textAlign: 'center',
                fontSize: 'var(--text-body-small)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-xs)',
                letterSpacing: '0.3px'
            }}>{title}</div>}

            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Background arc */}
                <path
                    d={arcPath}
                    fill="none"
                    stroke="var(--border-secondary)"
                    strokeWidth="10"
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                    d={arcPath}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
            </svg>

            <div className="gauge-center" style={{ textAlign: 'center', marginTop: '-8px' }}>
                <div style={{
                    fontSize: 'var(--text-h3)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--text-primary)',
                    lineHeight: 1
                }}>
                    {value}%
                </div>
                <div style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--text-tertiary)',
                    marginTop: '2px'
                }}>
                    health
                </div>
            </div>

            <div className="gauge-status" style={{
                textAlign: 'center',
                marginTop: 'var(--space-sm)'
            }}>
                <span style={{
                    fontSize: 'var(--text-caption)',
                    fontWeight: 'var(--font-medium)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: status === 'optimal' ? 'var(--success-bg)' :
                        status === 'warning' ? 'var(--warning-bg)' :
                            'var(--danger-bg)',
                    color: status === 'optimal' ? 'var(--success-text)' :
                        status === 'warning' ? 'var(--warning-text)' :
                            'var(--danger-text)'
                }}>
                    {statusText}
                </span>
            </div>
        </div>
    );
};

export default CircularGauge;