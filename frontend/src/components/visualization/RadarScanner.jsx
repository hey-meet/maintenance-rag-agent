import React, { useState, useEffect } from "react";

const RadarScanner = () => {
    // PART 9: Alert Mode Controller 
    // True triggers industrial alarm styling across nodes, targets, core states, and sweep indicators.
    const [criticalAlert, setCriticalAlert] = useState(true);

    const systems = [
        { title: "Telemetry Network", status: "ONLINE", normalStatus: "ONLINE" },
        { title: "AI Agent Core", status: criticalAlert ? "ANALYZING" : "ACTIVE", normalStatus: "ACTIVE" },
        { title: "Fault Detection", status: criticalAlert ? "FAULT DETECTED" : "MONITORING", normalStatus: "MONITORING" },
        { title: "Manual Retrieval", status: "INDEXED", normalStatus: "INDEXED" }
    ];

    return (
        <div className="radar-command-center">
            <style>{`
                .radar-command-center {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    width: 100%;
                    position: relative;
                }

                .scanner-main {
                    display: grid;
                    grid-template-columns: 170px 1fr;
                    gap: 12px;
                    align-items: center;
                    flex: 1;
                }

                .status-panel {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 22px;
                    z-index: 2;
                }

                .status-item {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #5f8c66;
                    margin-top: 5px;
                    box-shadow: 0 0 0 5px rgba(95,140,102,.08);
                    transition: all 0.3s ease;
                }

                .status-item:nth-child(3) .status-dot {
                    background: ${criticalAlert ? "#ef4444" : "#5f8c66"};
                    box-shadow: ${criticalAlert ? "0 0 10px #ef4444, 0 0 0 5px rgba(239,68,68,.12)" : "0 0 0 5px rgba(95,140,102,.08)"};
                    animation: ${criticalAlert ? "industrialAlarmBlink 1s infinite alternate" : "none"};
                }

                .status-item:nth-child(2) .status-dot {
                    background: ${criticalAlert ? "#f59e0b" : "#5f8c66"};
                    box-shadow: ${criticalAlert ? "0 0 8px #f59e0b, 0 0 0 5px rgba(245,158,11,.1)" : "0 0 0 5px rgba(95,140,102,.08)"};
                }

                .status-title {
                    font-size: .75rem;
                    text-transform: uppercase;
                    letter-spacing: .8px;
                    color: #8b8b8b;
                    font-weight: 600;
                }

                .status-value {
                    font-size: 1rem;
                    color: #567b5d;
                    font-weight: 600;
                    margin-top: 4px;
                    transition: color 0.3s ease;
                }

                .status-item:nth-child(3) .status-value {
                    color: ${criticalAlert ? "#ef4444" : "#567b5d"};
                }
                
                .status-item:nth-child(2) .status-value {
                    color: ${criticalAlert ? "#d97706" : "#567b5d"};
                }

                .scanner-wrapper {
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 420px;
                }

                .scanner-svg {
                    width: 100%;
                    max-width: 680px;
                    height: auto;
                }

                /* PART 2: Node State Controls */
                .orbit-node {
                    animation: pulseNode 3s ease-in-out infinite;
                    transition: fill 0.3s ease;
                }

                .orbit-node:nth-child(odd) {
                    animation-delay: 1s;
                }

                .normal-node { fill: #698f69; }
                .warning-node { fill: #f59e0b; }
                
                .alert-node { 
                    fill: #ef4444; 
                    animation: industrialAlarmBlink 0.6s infinite alternate !important;
                }

                .rotating-ring {
                    transform-origin: center;
                    animation: rotateSlow 80s linear infinite;
                }

                .rotating-ring-reverse {
                    transform-origin: center;
                    animation: rotateReverse 120s linear infinite;
                }

                .sweep-sector {
                    transform-origin: center;
                    animation: sweepRotate 12s linear infinite;
                }

                .core-pulse {
                    animation: corePulse 3s ease-in-out infinite;
                }

                .telemetry-line {
                    stroke-dasharray: 4;
                    animation: telemetryMove 3s linear infinite;
                }

                /* PART 8: Micro Telemetry Data Streams */
                .pulse-bit {
                    font-family: monospace;
                    font-size: 11px;
                    font-weight: bold;
                    fill: #78936f;
                    opacity: 0;
                    animation: telemetryPulseTrain 3s linear infinite;
                }

                .scan-progress {
                    margin-top: 8px;
                }

                .scan-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: .95rem;
                    color: #666;
                    font-weight: 600;
                }

                .progress-track {
                    height: 6px;
                    border-radius: 20px;
                    background: #e9ece7;
                    overflow: hidden;
                }

                .progress-fill {
                    width: 78%;
                    height: 100%;
                    background: ${criticalAlert ? "#ef4444" : "#79966f"};
                    border-radius: 20px;
                    transition: background-color 0.3s ease;
                }

                /* PART 3: Targets and Lock-On Layout Elements */
                .radar-target {
                    transition: opacity 0.3s ease;
                }
                .target-dot {
                    transition: fill 0.3s ease;
                }
                .target-label {
                    font-family: monospace;
                    font-size: 11px;
                    font-weight: bold;
                    fill: #666;
                }
                .target-critical .target-dot {
                    fill: #ef4444;
                    animation: targetFlash 0.5s infinite alternate;
                }
                .target-critical .target-label {
                    fill: #ef4444;
                    font-weight: 900;
                }

                /* PART 4: Lock Wave Expansion Ring */
                .lock-ring {
                    transform-origin: 350px 350px;
                    animation: lockPulse 4s infinite linear;
                }

                /* PART 6: Floating Industrial Diagnostic Overlay */
                .radar-alert-zone {
                    position: absolute;
                    top: 14px;
                    right: 14px;
                    width: 145px;
                    background: rgba(253, 248, 248, 0.95);
                    border: 1px solid #dc2626;
                    box-shadow: 0 0 10px rgba(220, 38, 38, 0.15), inset 0 0 0 1px rgba(255,255,255,0.8);
                    border-radius: 6px;
                    padding: 8px 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    z-index: 10;
                    animation: overlayPanelPulse 2s infinite ease-in-out;
                }
                .alert-zone-title {
                    font-size: 0.62rem;
                    font-weight: 800;
                    color: #dc2626;
                    letter-spacing: 0.5px;
                }
                .alert-zone-meta {
                    font-family: monospace;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #262626;
                    line-height: 1.2;
                }

                @keyframes rotateSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes rotateReverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }

                @keyframes sweepRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes pulseNode {
                    0%, 100% { opacity: .6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }

                @keyframes corePulse {
                    0%, 100% { opacity: .9; }
                    50% { opacity: 1; }
                }

                @keyframes telemetryMove {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -30; }
                }

                @keyframes industrialAlarmBlink {
                    0% { opacity: 0.3; filter: drop-shadow(0 0 1px rgba(239,68,68,0.2)); }
                    100% { opacity: 1; filter: drop-shadow(0 0 6px rgba(239,68,68,0.8)); }
                }

                @keyframes targetFlash {
                    0% { opacity: 0.4; r: 4px; }
                    100% { opacity: 1; r: 7px; }
                }

                @keyframes lockPulse {
                    0% { r: 85px; opacity: 0.8; stroke: #ef4444; stroke-width: 1.5px; }
                    50% { r: 260px; opacity: 0.3; stroke: #f59e0b; stroke-width: 1px; }
                    100% { r: 340px; opacity: 0; stroke: #5f8c66; stroke-width: 0.5px; }
                }

                @keyframes overlayPanelPulse {
                    0%, 100% { border-color: #dc2626; box-shadow: 0 0 10px rgba(220, 38, 38, 0.15); }
                    50% { border-color: #ef4444; box-shadow: 0 0 14px rgba(239, 68, 68, 0.3); }
                }

                @keyframes telemetryPulseTrain {
                    0% { opacity: 0; transform: translate(0, 0); }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { opacity: 0; transform: translate(15px, -15px); }
                }
            `}</style>

            {/* PART 6: Floating Industrial Warning Alert Box Overlay */}
            {criticalAlert && (
                <div className="radar-alert-zone" onClick={() => setCriticalAlert(!criticalAlert)}>
                    <span className="alert-zone-title">▲ CRITICAL FAULT</span>
                    <div className="alert-zone-meta">ID: PUMP-01</div>
                    <div className="alert-zone-meta">CODE: E-404</div>
                    <div className="alert-zone-meta">VAL: 105°C</div>
                </div>
            )}

            <div className="scanner-main">
                <div className="status-panel">
                    {systems.map((item) => (
                        <div key={item.title} className="status-item">
                            <div className="status-dot" />
                            <div>
                                <div className="status-title">{item.title}</div>
                                <div className="status-value">{item.status}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="scanner-wrapper">
                    <svg className="scanner-svg" viewBox="0 0 700 700">
                        <defs>
                            {/* PART 7: Radial Sweep Highlights Map */}
                            <linearGradient id="sweepGradient">
                                <stop offset="0%" stopColor={criticalAlert ? "rgba(239,68,68,0.26)" : "rgba(104,145,106,0.22)"} />
                                <stop offset="40%" stopColor={criticalAlert ? "rgba(245,158,11,0.12)" : "rgba(104,145,106,0.1)"} />
                                <stop offset="100%" stopColor="rgba(104,145,106,0)" />
                            </linearGradient>
                        </defs>

                        {/* Lock Wave Expansion Scan Ring */}
                        {criticalAlert && <circle className="lock-ring" cx="350" cy="350" r="135" fill="none" stroke="none" />}

                        <g className="sweep-sector">
                            <path
                                d="M350 350 L350 20 A330 330 0 0 1 620 160 Z"
                                fill="url(#sweepGradient)"
                            />
                        </g>

                        {/* Radar Reticle Rings */}
                        <circle cx="350" cy="350" r="85" fill="none" stroke="#d6ddd5" />
                        <circle cx="350" cy="350" r="135" fill="none" stroke="#d6ddd5" />
                        <circle cx="350" cy="350" r="185" fill="none" stroke="#d6ddd5" />
                        <circle cx="350" cy="350" r="235" fill="none" stroke="#d6ddd5" />
                        <circle cx="350" cy="350" r="275" fill="none" stroke="#cfd8ce" />
                        <circle cx="350" cy="350" r="305" fill="none" stroke="#dfe7de" />
                        <circle cx="350" cy="350" r="330" fill="none" stroke="#dfe7de" />

                        {/* Radar Azimuth Gridlines */}
                        <line x1="350" y1="20" x2="350" y2="680" stroke="#e6ebe5" />
                        <line x1="20" y1="350" x2="680" y2="350" stroke="#e6ebe5" />
                        <line x1="115" y1="115" x2="585" y2="585" stroke="#e6ebe5" />
                        <line x1="585" y1="115" x2="115" y2="585" stroke="#e6ebe5" />

                        {/* PART 3: Static Asset Monitoring Targets Map */}
                        <g className={`radar-target ${criticalAlert ? 'target-critical' : ''}`} transform="translate(180, 210)">
                            <circle className="target-dot" cx="0" cy="0" r="5" fill="#698f69" />
                            <text className="target-label" x="9" y="4">PUMP-01</text>
                        </g>

                        <g className="radar-target" transform="translate(480, 190)">
                            <circle className="target-dot" cx="0" cy="0" r="4.5" fill="#698f69" />
                            <text className="target-label" x="9" y="4">CNC-03</text>
                        </g>

                        <g className="radar-target" transform="translate(230, 490)">
                            <circle className="target-dot" cx="0" cy="0" r="4.5" fill="#698f69" />
                            <text className="target-label" x="9" y="4">LATHE-01</text>
                        </g>

                        <g className="radar-target" transform="translate(510, 440)">
                            <circle className="target-dot" cx="0" cy="0" r="4" fill="#b7a07b" />
                            <text className="target-label" x="9" y="4">R-02</text>
                        </g>

                        {/* Orbiting Ring Node Configurations */}
                        <g className="rotating-ring">
                            <circle className={`orbit-node ${criticalAlert ? 'alert-node' : 'normal-node'}`} cx="350" cy="45" r="6" />
                            <circle className="orbit-node normal-node" cx="655" cy="350" r="6" />
                            <circle className="orbit-node normal-node" cx="350" cy="655" r="6" />
                            <circle className="orbit-node warning-node" cx="45" cy="350" r="6" />
                        </g>

                        <g className="rotating-ring-reverse">
                            <circle className="orbit-node warning-node" cx="550" cy="145" r="4" />
                            <circle className="orbit-node normal-node" cx="150" cy="555" r="4" />
                            <circle className="orbit-node normal-node" cx="550" cy="555" r="4" />
                            <circle className={`orbit-node ${criticalAlert ? 'alert-node' : 'normal-node'}`} cx="150" cy="145" r="4" />
                        </g>

                        {/* Shaded Target Zones */}
                        <path d="M350 350 L350 165 A185 185 0 0 1 500 230 Z" fill={criticalAlert ? "rgba(239,68,68,.08)" : "rgba(104,145,106,.22)"} />
                        <path d="M350 350 L350 115 A235 235 0 0 1 500 170 Z" fill="rgba(104,145,106,.12)" />

                        {/* PART 5: Central Instrumentation Control Core */}
                        <g className="core-pulse">
                            <circle
                                cx="350"
                                cy="350"
                                r="105"
                                fill="white"
                                stroke={criticalAlert ? "#fca5a5" : "#d8e0d6"}
                                strokeWidth="2"
                            />

                            <text
                                x="350"
                                y="325"
                                textAnchor="middle"
                                fontSize="14"
                                fontWeight="800"
                                fill="#8a8a8a"
                                letterSpacing="1px"
                            >
                                AI AGENT CORE
                            </text>

                            <text
                                x="350"
                                y="372"
                                textAnchor="middle"
                                fontSize="26"
                                fontWeight="800"
                                fill={criticalAlert ? "#ef4444" : "#5f8c66"}
                                letterSpacing="-0.5px"
                            >
                                {criticalAlert ? "FAULT DETECTED" : "MONITORING"}
                            </text>

                            {/* Signal Waveform Line */}
                            <path
                                className="telemetry-line"
                                d="M300 410 L322 410 L332 396 L344 420 L356 398 L370 410 L400 410"
                                fill="none"
                                stroke={criticalAlert ? "#ef4444" : "#78936f"}
                                strokeWidth="3"
                            />

                            {/* PART 8: Micro Telemetry Data Bit Pulses */}
                            <text className="pulse-bit" x="325" y="392">E-404</text>
                            <text className="pulse-bit" x="358" y="392" style={{ animationDelay: '1.5s' }}>SYS</text>
                        </g>
                    </svg>
                </div>
            </div>

            <div className="scan-progress">
                <div className="scan-header" />
                <div className="progress-track">
                    <div className="progress-fill" />
                </div>
            </div>
        </div>
    );
};

export default RadarScanner;