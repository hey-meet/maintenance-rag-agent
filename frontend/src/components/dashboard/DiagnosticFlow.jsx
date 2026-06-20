import React, { useMemo, useState, useEffect } from 'react';
import { FiActivity, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { LuBrain } from 'react-icons/lu';
import { TbWaveSawTool } from 'react-icons/tb';

const DiagnosticFlow = () => {
    // Simulated live telemetry values for counting / pulsing animation
    const [confidence, setConfidence] = useState(94);
    const [anomalyScore, setAnomalyScore] = useState(0.023);
    const [rulEstimate, setRulEstimate] = useState(328);
    const [metricTrigger, setMetricTrigger] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setConfidence(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                return Math.max(92, Math.min(97, prev + change));
            });
            setAnomalyScore(prev => {
                const drift = (Math.random() * 0.004 - 0.002);
                return parseFloat(Math.max(0.018, Math.min(0.029, prev + drift)).toFixed(3));
            });
            setRulEstimate(prev => {
                const jitter = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
                return prev + jitter;
            });
            setMetricTrigger(true);
            const t = setTimeout(() => setMetricTrigger(false), 600);
            return () => clearTimeout(t);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    const workflowSteps = [
        {
            label: 'Data Collection',
            subtext: 'Telemetry Stream',
            icon: FiActivity,
            tone: 'primary'
        },
        {
            label: 'AI Analysis',
            subtext: 'Model Inference',
            icon: LuBrain,
            tone: 'secondary'
        },
        {
            label: 'Pattern Recognition',
            subtext: 'Signal Matching',
            icon: TbWaveSawTool,
            tone: 'neutral'
        },
        {
            label: 'Anomaly Detection',
            subtext: 'Risk Scanning',
            icon: FiAlertTriangle,
            tone: 'warning'
        },
        {
            label: 'Action Recommendation',
            subtext: 'Maintenance Output',
            icon: FiCheckCircle,
            tone: 'success'
        }
    ];

    // Generate 28 unique waves with organic, non-repeating patterns
    const waveLayers = useMemo(() => {
        const width = 1200;
        const samples = 240;
        const WAVE_COUNT = 28;

        const gradients = [
            { id: 'gradForest1', colors: ['#4F7A59', '#8EA88E', '#4F7A59'] },
            { id: 'gradSage1', colors: ['#8EA88E', '#C9D6C8', '#8EA88E'] },
            { id: 'gradMint1', colors: ['#C9D6C8', '#E2EFDA', '#C9D6C8'] },
            { id: 'gradForest2', colors: ['#3B5E43', '#4F7A59', '#6A916D'] },
            { id: 'gradSage2', colors: ['#7C9A7C', '#AEC0A6', '#7C9A7C'] },
            { id: 'gradMint2', colors: ['#B8D0B0', '#D8E8D0', '#B8D0B0'] },
            { id: 'gradTransForest', colors: ['rgba(79,122,89,0)', '#4F7A59', 'rgba(79,122,89,0)'] },
            { id: 'gradTransSage', colors: ['rgba(142,168,142,0)', '#8EA88E', 'rgba(142,168,142,0)'] },
        ];

        const rand = (min, max) => min + Math.random() * (max - min);

        const generateOrganicWavePath = (yBase, ampTotal, components, width, samples) => {
            const step = width / samples;
            let d = '';

            for (let i = 0; i <= samples; i++) {
                const x = i * step;
                const t = i / samples;

                let yOffset = 0;
                for (const comp of components) {
                    yOffset += Math.sin(t * Math.PI * 2 * comp.freq + comp.phase) * (ampTotal * comp.ampWeight);
                }

                const microDetail = Math.cos(t * Math.PI * 12.7 + (components[0]?.phase || 0)) * (ampTotal * 0.08);
                const subtleDrift = Math.sin(t * Math.PI * 1.3) * 2.5;

                const y = yBase + yOffset + microDetail + subtleDrift;

                d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
            }
            return d;
        };

        const waves = [];

        for (let i = 0; i < WAVE_COUNT; i++) {
            const yBase = rand(50, 130);
            const ampTotal = rand(4, 16);

            const numComponents = Math.floor(rand(3, 6));
            const components = [];
            for (let c = 0; c < numComponents; c++) {
                components.push({
                    freq: rand(0.4, 5.8),
                    ampWeight: rand(0.2, 0.9),
                    phase: rand(0, Math.PI * 2)
                });
            }

            components.sort((a, b) => a.freq - b.freq);

            let gradientUrl = '';
            let opacity = 0;
            let strokeWidth = 0;
            let blurAmount = 0;
            let isBlurred = false;

            const layerType = i < 8 ? 'background' : (i < 18 ? 'midground' : 'foreground');

            if (layerType === 'background') {
                gradientUrl = `url(#${i % 2 === 0 ? 'gradTransForest' : 'gradTransSage'})`;
                opacity = rand(0.05, 0.15);
                strokeWidth = rand(0.5, 1.2);
                blurAmount = rand(2, 4);
                isBlurred = true;
            } else if (layerType === 'midground') {
                gradientUrl = `url(#${gradients[Math.floor(rand(0, gradients.length - 2))].id})`;
                opacity = rand(0.12, 0.28);
                strokeWidth = rand(0.8, 1.6);
                blurAmount = rand(0.5, 1.5);
                isBlurred = Math.random() > 0.6;
            } else {
                gradientUrl = `url(#${gradients[Math.floor(rand(0, gradients.length))].id})`;
                opacity = rand(0.2, 0.38);
                strokeWidth = rand(1.2, 2.2);
                blurAmount = 0;
                isBlurred = false;
            }

            let duration = 0;
            if (layerType === 'background') duration = rand(2.5, 4.5);
            else if (layerType === 'midground') duration = rand(1.8, 3.2);
            else duration = rand(1.0, 2.2);

            const path = generateOrganicWavePath(yBase, ampTotal, components, width, samples);

            waves.push({
                id: `wave-${i}`,
                d: path,
                strokeWidth: strokeWidth,
                opacity: opacity,
                gradientUrl: gradientUrl,
                duration: duration,
                blurAmount: blurAmount,
                isBlurred: isBlurred,
                layerType: layerType
            });
        }

        return waves;
    }, []);

    // Moving AI data packets configuration - tuned for Left-to-Right layout
    const telemetryPackets = [
        { text: 'E-404', y: 45, dur: '5s', delay: '0s' },
        { text: 'TEMP:105', y: 75, dur: '4s', delay: '1.5s' },
        { text: 'PUMP-01', y: 115, dur: '6s', delay: '0.5s' },
        { text: 'AI', y: 60, dur: '3.5s', delay: '2.2s' },
        { text: 'ML', y: 135, dur: '4.8s', delay: '1s' },
        { text: '101011', y: 90, dur: '5.5s', delay: '3s' },
        { text: '011001', y: 55, dur: '4.2s', delay: '0.8s' },
        { text: '0xA2', y: 125, dur: '3.8s', delay: '2.7s' },
        { text: 'SIG', y: 70, dur: '5.2s', delay: '1.9s' },
        { text: 'RAG', y: 100, dur: '4.5s', delay: '3.3s' },
        { text: 'FLOW', y: 80, dur: '3.9s', delay: '0.2s' },
        { text: '92%', y: 110, dur: '4.7s', delay: '2.5s' }
    ];

    const signalParticles = [
        { cx: 100, cy: 65, r: 2, delay: '0s', dur: '3s' },
        { cx: 250, cy: 110, r: 3, delay: '0.5s', dur: '2.5s' },
        { cx: 400, cy: 45, r: 1.5, delay: '1.2s', dur: '4s' },
        { cx: 550, cy: 130, r: 2.5, delay: '0.2s', dur: '3.2s' },
        { cx: 700, cy: 75, r: 2, delay: '1.8s', dur: '2.8s' },
        { cx: 850, cy: 95, r: 3, delay: '0.9s', dur: '3.6s' },
        { cx: 1000, cy: 120, r: 1.5, delay: '2.4s', dur: '2.2s' }
    ];

    return (
        <div className="diagnostic-flow diagflow">
            <style>{`
                .diagflow {
                    position: relative;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-md);
                    width: 100%;
                }

                .diagflow-pipeline {
                    position: relative;
                    margin-top: var(--space-md);
                    padding-top: 8px;
                }

                .diagflow-connector-svg {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 16px;
                    width: 100%;
                    height: 70px;
                    overflow: visible;
                    pointer-events: none;
                    z-index: 0;
                }

                .diagflow-connector-line {
                    stroke-dasharray: 1 8;
                    stroke-linecap: round;
                    animation: diagflowDash 18s linear infinite;
                    filter: drop-shadow(0 0 1px rgba(111, 156, 116, 0.12));
                    opacity: 0.9;
                }

                .diagflow-steps {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    gap: 14px;
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
                    width: 54px;
                    height: 54px;
                    border-radius: 14px;
                    display: grid;
                    place-items: center;
                    background: linear-gradient(180deg, #fffaf4 0%, #f5f1ea 100%);
                    border: 1px solid rgba(229, 222, 211, 1);
                    box-shadow:
                        0 1px 0 rgba(255, 255, 255, 0.78) inset,
                        0 6px 14px rgba(0, 0, 0, 0.03);
                    color: var(--text-secondary);
                    transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
                    animation: diagflowNodePulse 4.5s ease-in-out infinite;
                }

                .diagflow-step:hover .diagflow-step__icon {
                    transform: translateY(-1px);
                    box-shadow:
                        0 1px 0 rgba(255, 255, 255, 0.92) inset,
                        0 10px 20px rgba(0, 0, 0, 0.05);
                    border-color: rgba(111, 156, 116, 0.34);
                }

                .diagflow-step__icon svg {
                    width: 22px;
                    height: 22px;
                }

                .diagflow-step--primary .diagflow-step__icon { color: #587a5e; }
                .diagflow-step--secondary .diagflow-step__icon { color: #5f6f5f; }
                .diagflow-step--neutral .diagflow-step__icon { color: #6d6a63; }
                .diagflow-step--warning .diagflow-step__icon { color: var(--warning-text); }
                .diagflow-step--success .diagflow-step__icon { color: var(--success-text); }

                .diagflow-step__label {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    line-height: 1.25;
                    max-width: 100%;
                }

                .diagflow-step__subtext {
                    font-size: 0.68rem;
                    color: var(--text-tertiary);
                    line-height: 1.2;
                    letter-spacing: 0.4px;
                    text-transform: uppercase;
                }

                .diagflow-wave-shell {
                    position: relative;
                    margin-top: var(--space-xl);
                    height: 200px;
                    overflow: hidden;
                    border-radius: 16px;
                    border: 1px solid var(--border-secondary);
                    background:
                        radial-gradient(circle at 18% 24%, rgba(79, 122, 89, 0.12), transparent 34%),
                        radial-gradient(circle at 50% 58%, rgba(142, 168, 142, 0.08), transparent 40%),
                        radial-gradient(circle at 76% 74%, rgba(79, 122, 89, 0.1), transparent 36%),
                        linear-gradient(180deg, rgba(251, 250, 248, 0.98) 0%, rgba(247, 244, 241, 1) 100%);
                    box-shadow:
                        inset 0 0 0 1px rgba(255, 255, 255, 0.58),
                        inset 0 20px 40px rgba(111, 156, 116, 0.03);
                }

                .diagflow-wave-shell::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(180deg,
                            rgba(79, 122, 89, 0.04) 0%,
                            transparent 18%,
                            transparent 82%,
                            rgba(79, 122, 89, 0.04) 100%);
                    pointer-events: none;
                    z-index: 1;
                }

                .diagflow-wave-svg {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: block;
                }

                .wave-group-dynamic {
                    transform-origin: center;
                    animation: breatheScale 6s ease-in-out infinite alternate;
                }

                .wave-width-pulse {
                    transform-origin: center;
                    animation: widthPulse 14s ease-in-out infinite alternate;
                }

                .diagflow-wave-layer {
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    vector-effect: non-scaling-stroke;
                    will-change: transform;
                    animation: flowHorizontal linear infinite;
                }

                .diagflow-wave-blurred { filter: url(#waveBlur); }
                .diagflow-wave-foreground { filter: drop-shadow(0 0 2px rgba(79, 122, 89, 0.2)); }

                .energy-pulse {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 5;
                    mix-blend-mode: overlay;
                    animation: pulseTravel 6s ease-in-out infinite;
                }

                .energy-pulse-gradient {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(79, 122, 89, 0) 20%,
                        rgba(142, 168, 142, 0.35) 45%,
                        rgba(201, 214, 200, 0.5) 50%,
                        rgba(142, 168, 142, 0.35) 55%,
                        rgba(79, 122, 89, 0) 80%,
                        transparent 100%
                    );
                    transform: translateX(-100%);
                    animation: pulseSweep 4s ease-in-out infinite;
                }

                .energy-pulse-secondary {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 4;
                    mix-blend-mode: color-dodge;
                    opacity: 0.4;
                }
                .energy-pulse-secondary-layer {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(226, 239, 218, 0.4), transparent);
                    animation: pulseSweep 7s ease-in-out infinite dashed;
                }
                .signal-sweep-bright {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 6;
                    mix-blend-mode: screen;
                }
                .signal-sweep-bar {
                    width: 60px;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
                    transform: translateX(-150px);
                    animation: fastSweep 3.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
                }

                /* Text packets configured for left to right translation direction */
                .wave-data-text {
                    font-family: monospace;
                    font-size: 10px;
                    font-weight: 600;
                    fill: #4F7A59;
                    letter-spacing: 0.5px;
                    animation: telemetryFlow linear infinite;
                }

                /* Telemetry nodes configured for left to right translation direction */
                .wave-signal-node {
                    fill: #8EA88E;
                    animation: telemetryFlow linear infinite;
                }

                .diagflow-metrics {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 0;
                    margin-top: var(--space-lg);
                    padding-top: var(--space-lg);
                    border-top: 1px solid var(--border-secondary);
                    overflow: hidden;
                    border-radius: 0 0 16px 16px;
                }

                .diagflow-metric {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 18px 12px 16px;
                    text-align: center;
                    background: transparent;
                    transition: transform var(--transition-fast), background var(--transition-fast);
                }

                .diagflow-metric + .diagflow-metric {
                    border-left: 1px solid var(--border-secondary);
                }

                .diagflow-metric:hover {
                    transform: translateY(-1px);
                    background: rgba(251, 250, 248, 0.72);
                }

                .diagflow-metric__label {
                    font-size: 0.72rem;
                    font-weight: 500;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .diagflow-metric__value {
                    font-size: 1.55rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1;
                    transition: color 0.3s ease, text-shadow 0.3s ease;
                }

                .metric-pulse-active {
                    color: #4F7A59;
                    text-shadow: 0 0 8px rgba(79, 122, 89, 0.3);
                }

                @keyframes diagflowDash {
                    from { stroke-dashoffset: -180; }
                    to { stroke-dashoffset: 0; }
                }

                /* Direction inverted: flows smoothly from negative canvas bound to positive limits */
                @keyframes flowHorizontal {
                    0% { transform: translateX(-180px); }
                    100% { transform: translateX(0px); }
                }

                /* Dynamic metrics telemetry items animation configured to process left to right */
                @keyframes telemetryFlow {
                    0% { transform: translateX(-150px); opacity: 0; }
                    8% { opacity: 0.45; }
                    92% { opacity: 0.45; }
                    100% { transform: translateX(1250px); opacity: 0; }
                }

                @keyframes breatheScale {
                    0% {
                        transform: scaleY(0.98) scaleX(1);
                        opacity: 0.92;
                    }
                    100% {
                        transform: scaleY(1.04) scaleX.1.01);
                        opacity: 1;
                    }
                }

                @keyframes widthPulse {
                    0% { transform: scaleX(1); }
                    50% { transform: scaleX(1.02); }
                    100% { transform: scaleX(0.99); }
                }

                @keyframes pulseSweep {
                    0% { transform: translateX(-100%); }
                    40% { transform: translateX(20%); }
                    60% { transform: translateX(40%); }
                    100% { transform: translateX(120%); }
                }

                @keyframes fastSweep {
                    0% { transform: translateX(-150px); }
                    35% { transform: translateX(1350px); }
                    100% { transform: translateX(1350px); }
                }

                @keyframes diagflowNodePulse {
                    0%, 100% {
                        box-shadow:
                            0 1px 0 rgba(255, 255, 255, 0.78) inset,
                            0 6px 14px rgba(0, 0, 0, 0.03);
                    }
                    50% {
                        box-shadow:
                            0 1px 0 rgba(255, 255, 255, 0.92) inset,
                            0 10px 22px rgba(79, 122, 89, 0.12);
                    }
                }

                @media (max-width: 1100px) {
                    .diagflow-steps { gap: 10px; }
                    .diagflow-step__label { font-size: 0.75rem; }
                }

                @media (max-width: 820px) {
                    .diagflow-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .diagflow-connector-svg { display: none; }
                    .diagflow-wave-shell { height: 170px; }
                    .diagflow-metrics { grid-template-columns: 1fr; }
                    .diagflow-metric + .diagflow-metric {
                        border-left: none;
                        border-top: 1px solid var(--border-secondary);
                    }
                }

                @media (max-width: 520px) {
                    .diagflow-steps { grid-template-columns: 1fr; }
                    .diagflow-wave-shell { height: 160px; }
                    .diagflow-step {
                        flex-direction: row;
                        justify-content: flex-start;
                        text-align: left;
                    }
                }
            `}</style>

            <div className="section-header">
                <h2 className="section-title">AI Diagnostic Flow</h2>
            </div>

            <div className="diagflow-pipeline">
                <svg
                    className="diagflow-connector-svg"
                    viewBox="0 0 100 60"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="diagflowLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(198, 186, 168, 0.85)" />
                            <stop offset="48%" stopColor="rgba(79, 122, 89, 0.55)" />
                            <stop offset="100%" stopColor="rgba(198, 186, 168, 0.85)" />
                        </linearGradient>
                    </defs>

                    <path
                        className="diagflow-connector-line"
                        d="M 11 33 H 28"
                        fill="none"
                        stroke="url(#diagflowLineGradient)"
                        strokeWidth="1.4"
                    />
                    <path
                        className="diagflow-connector-line"
                        d="M 31 33 H 48"
                        fill="none"
                        stroke="url(#diagflowLineGradient)"
                        strokeWidth="1.4"
                    />
                    <path
                        className="diagflow-connector-line"
                        d="M 51 33 H 68"
                        fill="none"
                        stroke="url(#diagflowLineGradient)"
                        strokeWidth="1.4"
                    />
                    <path
                        className="diagflow-connector-line"
                        d="M 71 33 H 88"
                        fill="none"
                        stroke="url(#diagflowLineGradient)"
                        strokeWidth="1.4"
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

            <div className="wave-container diagflow-wave-shell">
                <svg
                    className="diagflow-wave-svg"
                    viewBox="0 0 1200 180"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <clipPath id="diagflowWaveClip">
                            <rect x="0" y="0" width="1200" height="180" rx="18" ry="18" />
                        </clipPath>

                        <linearGradient id="gradForest1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4F7A59" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#8EA88E" stopOpacity="1" />
                            <stop offset="100%" stopColor="#4F7A59" stopOpacity="0.9" />
                        </linearGradient>
                        <linearGradient id="gradSage1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8EA88E" stopOpacity="0.85" />
                            <stop offset="40%" stopColor="#C9D6C8" stopOpacity="1" />
                            <stop offset="100%" stopColor="#8EA88E" stopOpacity="0.85" />
                        </linearGradient>
                        <linearGradient id="gradMint1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C9D6C8" stopOpacity="0.8" />
                            <stop offset="60%" stopColor="#E2EFDA" stopOpacity="1" />
                            <stop offset="100%" stopColor="#C9D6C8" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="gradForest2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B5E43" stopOpacity="0.95" />
                            <stop offset="50%" stopColor="#6A916D" stopOpacity="1" />
                            <stop offset="100%" stopColor="#3B5E43" stopOpacity="0.95" />
                        </linearGradient>
                        <linearGradient id="gradSage2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7C9A7C" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#AEC0A6" stopOpacity="1" />
                            <stop offset="100%" stopColor="#7C9A7C" stopOpacity="0.9" />
                        </linearGradient>
                        <linearGradient id="gradMint2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#B8D0B0" stopOpacity="0.85" />
                            <stop offset="50%" stopColor="#D8E8D0" stopOpacity="1" />
                            <stop offset="100%" stopColor="#B8D0B0" stopOpacity="0.85" />
                        </linearGradient>
                        <linearGradient id="gradTransForest" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4F7A59" stopOpacity="0" />
                            <stop offset="50%" stopColor="#4F7A59" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#4F7A59" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradTransSage" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8EA88E" stopOpacity="0" />
                            <stop offset="50%" stopColor="#8EA88E" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#8EA88E" stopOpacity="0" />
                        </linearGradient>

                        <filter id="waveBlur" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
                            <feComponentTransfer in="blur" result="fadedBlur">
                                <feFuncA type="linear" slope="0.7" />
                            </feComponentTransfer>
                        </filter>
                        <filter id="waveBlurDeep" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4.2" result="blur" />
                            <feComponentTransfer in="blur" result="fadedBlur">
                                <feFuncA type="linear" slope="0.5" />
                            </feComponentTransfer>
                        </filter>
                    </defs>

                    <g clipPath="url(#diagflowWaveClip)">
                        <rect x="0" y="0" width="1200" height="180" fill="transparent" />

                        <g className="wave-group-dynamic">
                            <g className="wave-width-pulse">
                                {waveLayers.filter(w => w.layerType === 'background').map((layer) => (
                                    <g
                                        key={layer.id}
                                        className="diagflow-wave-layer diagflow-wave-blurred"
                                        opacity={layer.opacity * 0.8}
                                        style={{ animationDuration: `${layer.duration}s` }}
                                    >
                                        <path
                                            d={layer.d}
                                            stroke={layer.gradientUrl}
                                            strokeWidth={layer.strokeWidth}
                                            fill="none"
                                            filter={layer.blurAmount > 2 ? "url(#waveBlurDeep)" : "url(#waveBlur)"}
                                        />
                                        <animateTransform
                                            attributeName="transform"
                                            type="translate"
                                            values="-180 0; 0 0"
                                            keyTimes="0;1"
                                            dur={`${layer.duration * 1.2}s`}
                                            repeatCount="indefinite"
                                        />
                                    </g>
                                ))}

                                {waveLayers.filter(w => w.layerType === 'midground').map((layer) => (
                                    <g
                                        key={layer.id}
                                        className="diagflow-wave-layer"
                                        opacity={layer.opacity}
                                        style={{ animationDuration: `${layer.duration}s` }}
                                    >
                                        <path
                                            d={layer.d}
                                            stroke={layer.gradientUrl}
                                            strokeWidth={layer.strokeWidth}
                                            fill="none"
                                        />
                                        <animateTransform
                                            attributeName="transform"
                                            type="translate"
                                            values="-200 0; 0 0"
                                            keyTimes="0;1"
                                            dur={`${layer.duration}s`}
                                            repeatCount="indefinite"
                                        />
                                    </g>
                                ))}

                                {waveLayers.filter(w => w.layerType === 'foreground').map((layer) => (
                                    <g
                                        key={layer.id}
                                        className="diagflow-wave-layer diagflow-wave-foreground"
                                        opacity={layer.opacity}
                                        style={{ animationDuration: `${layer.duration}s` }}
                                    >
                                        <path
                                            d={layer.d}
                                            stroke={layer.gradientUrl}
                                            strokeWidth={layer.strokeWidth}
                                            fill="none"
                                        />
                                        <animateTransform
                                            attributeName="transform"
                                            type="translate"
                                            values="-240 0; 0 0"
                                            keyTimes="0;1"
                                            dur={`${layer.duration * 0.85}s`}
                                            repeatCount="indefinite"
                                        />
                                    </g>
                                ))}

                                {/* Embedded telemetry packets processed left-to-right via layout mapping parameters */}
                                {telemetryPackets.map((packet, idx) => (
                                    <text
                                        key={`packet-${idx}`}
                                        x="0"
                                        y={packet.y}
                                        className="wave-data-text"
                                        style={{
                                            animationDuration: packet.dur,
                                            animationDelay: packet.delay
                                        }}
                                    >
                                        {packet.text}
                                    </text>
                                ))}

                                {/* Particle nodes synchronized left-to-right across active flow line arrays */}
                                {signalParticles.map((particle, idx) => (
                                    <circle
                                        key={`particle-${idx}`}
                                        cx={particle.cx}
                                        cy={particle.cy}
                                        r={particle.r}
                                        className="wave-signal-node"
                                        style={{
                                            animationDuration: particle.dur,
                                            animationDelay: particle.delay
                                        }}
                                    />
                                ))}
                            </g>
                        </g>
                    </g>
                </svg>

                {/* Original Energy Pulse Layer */}
                <div className="energy-pulse">
                    <div className="energy-pulse-gradient"></div>
                </div>

                {/* Enhanced secondary components */}
                <div className="energy-pulse-secondary">
                    <div className="energy-pulse-secondary-layer"></div>
                </div>
                <div className="signal-sweep-bright">
                    <div className="signal-sweep-bar"></div>
                </div>
            </div>

            <div className="diagflow-metrics">
                <div className="diagflow-metric metric">
                    <span className="diagflow-metric__label metric-label">Signal Confidence</span>
                    <span className={`diagflow-metric__value metric-value ${metricTrigger ? 'metric-pulse-active' : ''}`}>
                        {confidence}%
                    </span>
                </div>

                <div className="diagflow-metric metric">
                    <span className="diagflow-metric__label metric-label">Anomaly Score</span>
                    <span className={`diagflow-metric__value metric-value ${metricTrigger ? 'metric-pulse-active' : ''}`}>
                        {anomalyScore.toFixed(3)}
                    </span>
                </div>

                <div className="diagflow-metric metric">
                    <span className="diagflow-metric__label metric-label">RUL Estimate</span>
                    <span className={`diagflow-metric__value metric-value ${metricTrigger ? 'metric-pulse-active' : ''}`}>
                        {rulEstimate} hrs
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticFlow;