import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiActivity, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { LuBrain } from 'react-icons/lu';
import { TbWaveSawTool } from 'react-icons/tb';

const DiagnosticFlow = () => {
    // Live telemetry states
    const [confidence, setConfidence] = useState(93);
    const [anomalyScore, setAnomalyScore] = useState(0.021);
    const [rulEstimate, setRulEstimate] = useState(336);
    const [metricTrigger, setMetricTrigger] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setConfidence(prev => Math.max(91, Math.min(95, prev + (Math.random() > 0.5 ? 1 : -1))));
            setAnomalyScore(prev => parseFloat(Math.max(0.015, Math.min(0.025, prev + (Math.random() * 0.002 - 0.001))).toFixed(3)));
            setRulEstimate(prev => prev + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0));
            setMetricTrigger(true);
            const t = setTimeout(() => setMetricTrigger(false), 600);
            return () => clearTimeout(t);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const workflowSteps = [
        { label: 'Data Collection', subtext: 'Telemetry Stream', icon: FiActivity, tone: 'primary' },
        { label: 'AI Analysis', subtext: 'Model Inference', icon: LuBrain, tone: 'secondary' },
        { label: 'Pattern Recognition', subtext: 'Signal Matching', icon: TbWaveSawTool, tone: 'neutral' },
        { label: 'Anomaly Detection', subtext: 'Risk Scanning', icon: FiAlertTriangle, tone: 'warning' },
        { label: 'Action Recommendation', subtext: 'Maintenance Output', icon: FiCheckCircle, tone: 'success' }
    ];

    // High-fidelity generative ribbon setup
    const WAVES_CONFIG = useMemo(() => {
        const count = 40;
        return Array.from({ length: count }).map((_, i) => {
            const waveGroup = i % 3;

            let primaryFreq, secondaryFreq, amp;
            if (waveGroup === 0) {
                // Broad, elegant foundational sweeping flows
                primaryFreq = 0.35 + Math.random() * 0.15;
                secondaryFreq = 0.7 + Math.random() * 0.2;
                amp = 18 + Math.random() * 12;
            } else if (waveGroup === 1) {
                // Mid-level accent layers for subtle depth variations
                primaryFreq = 0.6 + Math.random() * 0.2;
                secondaryFreq = 1.2 + Math.random() * 0.3;
                amp = 14 + Math.random() * 10;
            } else {
                // Fine, intricate nested capillary line detail
                primaryFreq = 0.9 + Math.random() * 0.3;
                secondaryFreq = 2.2 + Math.random() * 0.5;
                amp = 8 + Math.random() * 8;
            }

            return {
                phaseOffset: Math.random() * Math.PI * 2,
                speed: 0.007 + Math.random() * 0.009,
                baseAmplitude: amp,
                freq1: primaryFreq,
                freq2: secondaryFreq,
                strokeWidth: 0.35 + Math.random() * 0.65,
                // Soft industrial greens with varying premium translucence
                strokeColor: i % 3 === 0 ? 'rgba(79, 122, 89, 0.24)' : i % 3 === 1 ? 'rgba(110, 138, 114, 0.16)' : 'rgba(142, 168, 142, 0.20)',
                yOffset: (i - 20) * 0.85
            };
        });
    }, []);

    const telemetryItems = useMemo(() => [
        { text: 'E-404', baseTop: 32, speed: 0.65, delay: 0 },
        { text: 'TEMP:105', baseTop: 45, speed: 0.85, delay: 250 },
        { text: 'PUMP-01', baseTop: 76, speed: 0.5, delay: 120 },
        { text: 'AI', baseTop: 36, speed: 0.95, delay: 400 },
        { text: 'ML', baseTop: 68, speed: 0.75, delay: 180 },
        { text: '101011', baseTop: 56, speed: 0.55, delay: 450 },
        { text: 'SIG', baseTop: 52, speed: 0.7, delay: 300 }
    ], []);

    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const requestRef = useRef(null);
    const timeRef = useRef(0);

    useEffect(() => {
        const width = 1200;
        const height = 180;
        const midY = height / 2;
        const samples = 140;

        const animate = () => {
            timeRef.current += 1;
            const t = timeRef.current;

            // Generate ribbon paths dynamically across animation loop frames
            if (svgRef.current) {
                const paths = svgRef.current.querySelectorAll('.premium-silk-path');
                paths.forEach((path, idx) => {
                    const config = WAVES_CONFIG[idx];
                    if (!config) return;

                    let d = '';
                    const currentPhase = t * config.speed - config.phaseOffset;

                    for (let i = 0; i <= samples; i++) {
                        const progress = i / samples;
                        const x = progress * width;

                        // Multi-frequency compound harmonic calculation
                        const layerPrimary = Math.sin(progress * Math.PI * 2 * config.freq1 + currentPhase);
                        const layerSecondary = Math.cos(progress * Math.PI * 2 * config.freq2 - currentPhase * 0.5);

                        const complexWave = (layerPrimary * 0.75) + (layerSecondary * 0.25);
                        const y = midY + config.yOffset + (complexWave * config.baseAmplitude);

                        d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }
                    path.setAttribute('d', d);
                });
            }

            // Move telemetry packet labels continuously left-to-right
            if (containerRef.current) {
                const textNodes = containerRef.current.querySelectorAll('.wave-floating-metric');
                const containerWidth = containerRef.current.clientWidth || 1200;

                textNodes.forEach((node, idx) => {
                    const config = telemetryItems[idx];
                    if (!config) return;

                    const totalOffset = (t * config.speed + config.delay) % (containerWidth + 160);
                    const currentX = totalOffset - 100;
                    const currentY = config.baseTop + Math.sin((t * 0.02) + idx) * 6;

                    node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

                    if (currentX < 100) {
                        node.style.opacity = Math.max(0, Math.min(0.22, (currentX / 100) * 0.22));
                    } else if (currentX > containerWidth - 160) {
                        const fadeFactor = (containerWidth - currentX) / 160;
                        node.style.opacity = Math.max(0, Math.min(0.22, fadeFactor * 0.22));
                    } else {
                        node.style.opacity = 0.22;
                    }
                });
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [WAVES_CONFIG, telemetryItems]);

    return (
        <div className="diagnostic-flow diagflow">
            <style>{`
                .diagflow {
                    position: relative;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    width: 100%;
                }

                .section-title {
                    font-size: 1.65rem;
                    font-weight: 600;
                    color: #111111;
                    margin: 0;
                }

                .diagflow-pipeline {
                    position: relative;
                    margin-top: 16px;
                    padding-top: 8px;
                }

                .diagflow-connector-svg {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 18px;
                    width: 100%;
                    height: 70px;
                    overflow: visible;
                    pointer-events: none;
                    z-index: 0;
                }

                .diagflow-connector-line {
                    stroke-dasharray: 2 10;
                    stroke-linecap: round;
                    animation: diagflowDash 25s linear infinite;
                    opacity: 0.35;
                }

                .diagflow-steps {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    gap: 16px;
                    align-items: start;
                    margin-top: 4px;
                }

                .diagflow-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    min-width: 0;
                    text-align: center;
                }

                .diagflow-step__icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 15px;
                    display: grid;
                    place-items: center;
                    background: linear-gradient(180deg, #FAF8F5 0%, #F4F0EA 100%);
                    border: 1px solid rgba(220, 214, 203, 0.7);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
                    color: #555555;
                    transition: all 0.25s ease;
                }

                .diagflow-step:hover .diagflow-step__icon {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
                    border-color: rgba(79, 122, 89, 0.4);
                }

                .diagflow-step__icon svg {
                    width: 20px;
                    height: 20px;
                }

                .diagflow-step--primary .diagflow-step__icon { color: #4F7A59; }
                .diagflow-step--secondary .diagflow-step__icon { color: #4A574D; }
                .diagflow-step--neutral .diagflow-step__icon { color: #5B5852; }
                .diagflow-step--warning .diagflow-step__icon { color: #C47F2B; }
                .diagflow-step--success .diagflow-step__icon { color: #3B6646; }

                .diagflow-step__label {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: #333333;
                    line-height: 1.3;
                }

                .diagflow-step__subtext {
                    font-size: 0.65rem;
                    color: #888888;
                    line-height: 1.2;
                    text-transform: uppercase;
                }

                .diagflow-wave-shell {
                    position: relative;
                    margin-top: 32px;
                    height: 180px;
                    overflow: hidden;
                    border-radius: 24px;
                    border: 1px solid rgba(226, 220, 211, 0.6);
                    background: linear-gradient(180deg, #FAF8F5 0%, #F4F0EA 100%);
                    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
                }

                .diagflow-wave-svg {
                    width: 100%;
                    height: 100%;
                    display: block;
                    mask-image: linear-gradient(to right, transparent 0%, white 12%, white 88%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, white 12%, white 88%, transparent 100%);
                }

                .premium-silk-path {
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    vector-effect: non-scaling-stroke;
                }

                .wave-floating-metric {
                    position: absolute;
                    top: 0;
                    left: 0;
                    font-family: monospace;
                    font-size: 9px;
                    font-weight: 600;
                    color: #4F7A59;
                    opacity: 0.22;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                    pointer-events: none;
                    will-change: transform, opacity;
                }

                @keyframes diagflowDash {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -240; }
                }

                @media (max-width: 960px) {
                    .diagflow-steps { gap: 8px; }
                    .diagflow-step__label { font-size: 0.75rem; }
                }

                @media (max-width: 768px) {
                    .diagflow-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .diagflow-connector-svg { display: none; }
                }
            `}</style>

            <div className="section-header">
                <h2 className="section-title">AI Diagnostic Flow</h2>
            </div>

            <div className="diagflow-pipeline">
                <svg
                    className="diagflow-connector-svg"
                    viewBox="0 0 1200 60"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <path
                        className="diagflow-connector-line"
                        d="M 120 30 H 1080"
                        fill="none"
                        stroke="#4F7A59"
                        strokeWidth="1.5"
                    />
                </svg>

                <div className="diagflow-steps">
                    {workflowSteps.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.label}
                                className={`diagflow-step diagflow-step--${step.tone}`}
                            >
                                <div className="diagflow-step__icon" aria-hidden="true">
                                    <Icon />
                                </div>
                                <div className="diagflow-step__label">{step.label}</div>
                                <div className="diagflow-step__subtext">{step.subtext}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Wave Canvas Container */}
            <div ref={containerRef} className="diagflow-wave-shell">
                <svg
                    ref={svgRef}
                    className="diagflow-wave-svg"
                    viewBox="0 0 1200 180"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    {WAVES_CONFIG.map((config, idx) => (
                        <path
                            key={`silk-wave-${idx}`}
                            className="premium-silk-path"
                            stroke={config.strokeColor}
                            strokeWidth={config.strokeWidth}
                        />
                    ))}
                </svg>

                {/* Left-to-right micro telemetry packets */}
                {telemetryItems.map((item, idx) => (
                    <div key={`data-pack-${idx}`} className="wave-floating-metric">
                        {item.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DiagnosticFlow;