import React from 'react';

const MiniSparkline = ({ data = [], label, value }) => {
    // If no data provided, use default telemetry example
    const series = data.length > 0 ? data : [45, 52, 48, 55, 62, 58, 68, 72, 78];

    // SVG dimensions
    const width = 120;
    const height = 36;
    const padding = 4;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    // Find min/max for scaling
    const minVal = Math.min(...series);
    const maxVal = Math.max(...series);
    const range = maxVal - minVal || 1;

    // Generate smoothed path points (Catmull-Rom to cubic bezier conversion)
    const getSmoothPath = (points) => {
        if (points.length < 2) return '';

        const path = [];
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(points.length - 1, i + 2)];

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            path.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
        }

        return `M ${points[0].x} ${points[0].y} ${path.join(' ')}`;
    };

    // Generate scaled points
    const stepX = graphWidth / (series.length - 1);
    const points = series.map((val, idx) => ({
        x: padding + idx * stepX,
        y: padding + graphHeight - ((val - minVal) / range) * graphHeight
    }));

    // Smooth line path
    const smoothLinePath = getSmoothPath(points);

    // Area fill path (line + bottom edges)
    const areaPath = `${smoothLinePath} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-sm)',
            width: '100%'
        }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 'var(--text-caption)',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {label}
                </div>
                <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    {/* Area fill */}
                    <path
                        d={areaPath}
                        fill="var(--scanner-glow)"
                        opacity="0.2"
                    />
                    {/* Smooth line */}
                    <path
                        d={smoothLinePath}
                        fill="none"
                        stroke="var(--scanner-primary)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* End dot */}
                    <circle
                        cx={points[points.length - 1].x}
                        cy={points[points.length - 1].y}
                        r="2.5"
                        fill="var(--scanner-secondary)"
                        stroke="var(--bg-card)"
                        strokeWidth="1"
                    />
                </svg>
            </div>
            <div style={{
                fontSize: 'var(--text-body-base)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap'
            }}>
                {value}
            </div>
        </div>
    );
};

export default MiniSparkline;