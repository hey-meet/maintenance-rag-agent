import React from 'react';

const RadarScanner = () => {
    const size = 360;
    const center = size / 2;
    // 6 concentric rings (thin, subtle)
    const radii = [50, 90, 130, 170, 210, 250];
    // Orbit markers (dots)
    const markers = [0, 45, 90, 135, 180, 225, 270, 315];
    // Orbit lines (thin radial lines at marker positions)
    const orbitLines = [0, 45, 90, 135, 180, 225, 270, 315];

    return (
        <div className="radar-scanner" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <defs>
                    {/* Soft sweep gradient (more subtle) */}
                    <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--scanner-primary)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--scanner-primary)" stopOpacity="0" />
                    </linearGradient>
                    {/* Center subtle glow */}
                    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="var(--scanner-primary)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="var(--scanner-primary)" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Circular clip to ensure no square edges */}
                <clipPath id="circleClip">
                    <circle cx={center} cy={center} r={center} />
                </clipPath>

                <g clipPath="url(#circleClip)">
                    {/* Transparent background - just the card shows through */}

                    {/* 6 Thin concentric rings */}
                    {radii.map((r, idx) => (
                        <circle
                            key={idx}
                            cx={center}
                            cy={center}
                            r={r}
                            fill="none"
                            stroke="var(--border-primary)"
                            strokeWidth={idx === 0 ? 0.8 : 0.6}
                            opacity={0.35}
                        />
                    ))}

                    {/* Orbit / radial lines (thin) */}
                    {orbitLines.map((angle) => {
                        const rad = (angle * Math.PI) / 180;
                        const x2 = center + center * Math.cos(rad);
                        const y2 = center + center * Math.sin(rad);
                        return (
                            <line
                                key={`line-${angle}`}
                                x1={center}
                                y1={center}
                                x2={x2}
                                y2={y2}
                                stroke="var(--border-focus)"
                                strokeWidth="0.5"
                                opacity="0.3"
                            />
                        );
                    })}

                    {/* Orbit markers (small dots) */}
                    {markers.map((angle) => {
                        const rad = (angle * Math.PI) / 180;
                        const markerRadius = radii[radii.length - 1] - 4;
                        const x = center + markerRadius * Math.cos(rad);
                        const y = center + markerRadius * Math.sin(rad);
                        return (
                            <circle
                                key={`dot-${angle}`}
                                cx={x}
                                cy={y}
                                r="2.5"
                                fill="var(--scanner-primary)"
                                opacity="0.6"
                            />
                        );
                    })}

                    {/* Rotating sweep beam (soft opacity) */}
                    <g className="radar-sweep-group">
                        <path
                            d={`M ${center} ${center} L ${center + 250} ${center} A 250 250 0 0 1 ${center + 125} ${center + 216.5} Z`}
                            fill="url(#sweepGradient)"
                            opacity="0.3"
                            className="radar-sweep-beam"
                        />
                    </g>

                    {/* Center subtle glow */}
                    <circle cx={center} cy={center} r="40" fill="url(#coreGlow)" />

                    {/* Center core (small dot) */}
                    <circle cx={center} cy={center} r="4" fill="var(--scanner-primary)" opacity="0.8" />

                    {/* Center text: AI AGENT / ACTIVE */}
                    <text
                        x={center}
                        y={center - 8}
                        textAnchor="middle"
                        fill="var(--text-primary)"
                        fontSize="12"
                        fontWeight="600"
                        letterSpacing="1.2"
                        opacity="0.85"
                    >
                        AI AGENT
                    </text>
                    <text
                        x={center}
                        y={center + 8}
                        textAnchor="middle"
                        fill="var(--success-text)"
                        fontSize="10"
                        fontWeight="500"
                        letterSpacing="0.8"
                        opacity="0.9"
                    >
                        ACTIVE
                    </text>
                </g>
            </svg>

            {/* Animation keyframes for sweep rotation */}
            <style>{`
        .radar-sweep-group {
          transform-origin: ${center}px ${center}px;
          animation: sweepRotate 6s linear infinite;
        }
        @keyframes sweepRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Soft pulse on center dot (optional) */
        .radar-scanner circle[fill="var(--scanner-primary)"][r="4"] {
          animation: softPulse 2s ease-in-out infinite;
        }
        @keyframes softPulse {
          0% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.5; transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default RadarScanner;