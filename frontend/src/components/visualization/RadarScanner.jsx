import React from "react";

const RadarScanner = () => {
    const systems = [
        { title: "Sensor Network", status: "Online" },
        { title: "AI Diagnostics", status: "Active" },
        { title: "Predictive Engine", status: "Running" },
        { title: "Data Stream", status: "Live" }
    ];

    return (
        <div className="radar-command-center">
            <style>{`
                .radar-command-center{
                    display:flex;
                    flex-direction:column;
                    height:100%;
                    width:100%;
                }

                .scanner-main{
                    display:grid;
                    grid-template-columns:170px 1fr;
                    gap:12px;
                    align-items:center;
                    flex:1;
                }

                .status-panel{
                    display:flex;
                    flex-direction:column;
                    justify-content:center;
                    gap:22px;
                }

                .status-item{
                    display:flex;
                    gap:12px;
                    align-items:flex-start;
                }

                .status-dot{
                    width:10px;
                    height:10px;
                    border-radius:50%;
                    background:#5f8c66;
                    margin-top:5px;
                    box-shadow:0 0 0 5px rgba(95,140,102,.08);
                }

                .status-title{
                    font-size:.75rem;
                    text-transform:uppercase;
                    letter-spacing:.8px;
                    color:#8b8b8b;
                    font-weight:600;
                }

                .status-value{
                    font-size:1rem;
                    color:#567b5d;
                    font-weight:600;
                    margin-top:4px;
                }

                .scanner-wrapper{
                    position:relative;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    min-height:420px;
                }

                .scanner-svg{
                    width:100%;
                    max-width:680px;
                    height:auto;
                }

                .orbit-node{
                    animation:pulseNode 3s ease-in-out infinite;
                }

                .orbit-node:nth-child(odd){
                    animation-delay:1s;
                }

                .rotating-ring{
                    transform-origin:center;
                    animation:rotateSlow 80s linear infinite;
                }

                .rotating-ring-reverse{
                    transform-origin:center;
                    animation:rotateReverse 120s linear infinite;
                }

                .sweep-sector{
                    transform-origin:center;
                    animation:sweepRotate 12s linear infinite;
                }

                .core-pulse{
                    animation:corePulse 3s ease-in-out infinite;
                }

                .telemetry-line{
                    stroke-dasharray:4;
                    animation:telemetryMove 3s linear infinite;
                }

                .scan-progress{
                    margin-top:8px;
                }

                .scan-header{
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:10px;
                    font-size:.95rem;
                    color:#666;
                    font-weight:600;
                }

                .progress-track{
                    height:6px;
                    border-radius:20px;
                    background:#e9ece7;
                    overflow:hidden;
                }

                .progress-fill{
                    width:78%;
                    height:100%;
                    background:#79966f;
                    border-radius:20px;
                }

                @keyframes rotateSlow{
                    from{transform:rotate(0deg);}
                    to{transform:rotate(360deg);}
                }

                @keyframes rotateReverse{
                    from{transform:rotate(360deg);}
                    to{transform:rotate(0deg);}
                }

                @keyframes sweepRotate{
                    from{transform:rotate(0deg);}
                    to{transform:rotate(360deg);}
                }

                @keyframes pulseNode{
                    0%,100%{
                        opacity:.6;
                        transform:scale(1);
                    }
                    50%{
                        opacity:1;
                        transform:scale(1.3);
                    }
                }

                @keyframes corePulse{
                    0%,100%{
                        opacity:.9;
                    }
                    50%{
                        opacity:1;
                    }
                }

                @keyframes telemetryMove{
                    from{
                        stroke-dashoffset:0;
                    }
                    to{
                        stroke-dashoffset:-30;
                    }
                }
            `}</style>

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
                    <svg
                        className="scanner-svg"
                        viewBox="0 0 700 700"
                    >
                        <defs>
                            <linearGradient id="sweepGradient">
                                <stop offset="0%" stopColor="rgba(104,145,106,0.22)" />
                                <stop offset="100%" stopColor="rgba(104,145,106,0)" />
                            </linearGradient>
                        </defs>

                        <g className="sweep-sector">
                            <path
                                d="M350 350 L350 20 A330 330 0 0 1 620 160 Z"
                                fill="url(#sweepGradient)"
                            />
                        </g>

                        <circle cx="350" cy="350" r="85" fill="none" stroke="#d6ddd5" />
                        <circle cx="350" cy="350" r="135" fill="none" stroke="#d6ddd5" />
                        <circle cx="350" cy="350" r="185" fill="none" stroke="#d6ddd5" />
                        <circle cx="350" cy="350" r="235" fill="none" stroke="#d6ddd5" />
                        <circle cx="350" cy="350" r="275" fill="none" stroke="#cfd8ce" />
                        <circle cx="350" cy="350" r="305" fill="none" stroke="#dfe7de" />
                        <circle cx="350" cy="350" r="330" fill="none" stroke="#dfe7de" />

                        <line x1="350" y1="20" x2="350" y2="680" stroke="#e6ebe5" />
                        <line x1="20" y1="350" x2="680" y2="350" stroke="#e6ebe5" />
                        <line x1="115" y1="115" x2="585" y2="585" stroke="#e6ebe5" />
                        <line x1="585" y1="115" x2="115" y2="585" stroke="#e6ebe5" />

                        <g className="rotating-ring">
                            <circle className="orbit-node" cx="350" cy="45" r="6" fill="#698f69" />
                            <circle className="orbit-node" cx="655" cy="350" r="6" fill="#698f69" />
                            <circle className="orbit-node" cx="350" cy="655" r="6" fill="#698f69" />
                            <circle className="orbit-node" cx="45" cy="350" r="6" fill="#698f69" />
                        </g>

                        <g className="rotating-ring-reverse">
                            <circle className="orbit-node" cx="550" cy="145" r="4" fill="#b7a07b" />
                            <circle className="orbit-node" cx="150" cy="555" r="4" fill="#b7a07b" />
                            <circle className="orbit-node" cx="550" cy="555" r="4" fill="#698f69" />
                            <circle className="orbit-node" cx="150" cy="145" r="4" fill="#698f69" />
                        </g>

                        <path
                            d="M350 350 L350 165 A185 185 0 0 1 500 230 Z"
                            fill="rgba(104,145,106,.22)"
                        />

                        <path
                            d="M350 350 L350 115 A235 235 0 0 1 500 170 Z"
                            fill="rgba(104,145,106,.12)"
                        />

                        <g className="core-pulse">
                            <circle
                                cx="350"
                                cy="350"
                                r="105"
                                fill="white"
                                stroke="#d8e0d6"
                                strokeWidth="2"
                            />

                            <text
                                x="350"
                                y="325"
                                textAnchor="middle"
                                fontSize="24"
                                fontWeight="700"
                                fill="#4f5650"
                            >
                                AI AGENT
                            </text>

                            <text
                                x="350"
                                y="375"
                                textAnchor="middle"
                                fontSize="42"
                                fontWeight="700"
                                fill="#5f8c66"
                            >
                                ACTIVE
                            </text>

                            <path
                                className="telemetry-line"
                                d="M300 410 L322 410 L332 396 L344 420 L356 398 L370 410 L400 410"
                                fill="none"
                                stroke="#78936f"
                                strokeWidth="3"
                            />
                        </g>
                    </svg>
                </div>
            </div>

            <div className="scan-progress">
                <div className="scan-header">
                </div>

                <div className="progress-track">
                    <div className="progress-fill" />
                </div>
            </div>
        </div>
    );
};

export default RadarScanner;