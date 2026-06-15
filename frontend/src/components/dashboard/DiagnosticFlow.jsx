import React, { useMemo } from 'react';
import { FiActivity, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { LuBrain } from 'react-icons/lu';
import { TbWaveSawTool } from 'react-icons/tb';

const DiagnosticFlow = () => {
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

    // Generate 28 unique waves with organic, non-repeating patterns - FAST FLOW SPEEDS
    const waveLayers = useMemo(() => {
        const width = 1200;
        const samples = 240; // Higher resolution for smoother curves
        const WAVE_COUNT = 28;

        // Color gradients for multi-stop organic feel
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

        // Helper: generate random float between min and max
        const rand = (min, max) => min + Math.random() * (max - min);

        // Generate complex wave path with multiple harmonics for organic movement
        const generateOrganicWavePath = (
            yBase,
            ampTotal,
            components,
            width,
            samples
        ) => {
            const step = width / samples;
            let d = '';

            for (let i = 0; i <= samples; i++) {
                const x = i * step;
                const t = i / samples; // 0 to 1

                // Sum all harmonic components
                let yOffset = 0;
                for (const comp of components) {
                    yOffset += Math.sin(t * Math.PI * 2 * comp.freq + comp.phase) * (ampTotal * comp.ampWeight);
                }

                // Add micro detail with higher frequency cosine wave
                const microDetail = Math.cos(t * Math.PI * 12.7 + components[0]?.phase || 0) * (ampTotal * 0.08);
                const subtleDrift = Math.sin(t * Math.PI * 1.3) * 2.5;

                const y = yBase + yOffset + microDetail + subtleDrift;

                d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
            }
            return d;
        };

        // Create wave configs
        const waves = [];

        for (let i = 0; i < WAVE_COUNT; i++) {
            // Base vertical position - spread across whole height (60 to 130)
            const yBase = rand(50, 130);

            // Total amplitude (wave intensity)
            const ampTotal = rand(4, 16);

            // Generate 3-5 harmonic components with random frequencies for organic uniqueness
            const numComponents = Math.floor(rand(3, 6));
            const components = [];
            for (let c = 0; c < numComponents; c++) {
                components.push({
                    freq: rand(0.4, 5.8),      // Wide frequency range for rich texture
                    ampWeight: rand(0.2, 0.9),  // Varied influence
                    phase: rand(0, Math.PI * 2)
                });
            }

            // Sort by frequency for smoother combined wave
            components.sort((a, b) => a.freq - b.freq);

            // Select gradient based on wave depth (foreground/background)
            let gradientUrl = '';
            let opacity = 0;
            let strokeWidth = 0;
            let blurAmount = 0;
            let isBlurred = false;

            // Categorize waves into depth layers
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

            // ========== FASTER SPEEDS FOR VISIBLE DATA FLOW ==========
            // Background: slower but still fast enough (2.5 - 4.5 seconds)
            // Midground: faster (1.8 - 3.2 seconds)
            // Foreground: fastest (1.0 - 2.2 seconds)
            let duration = 0;
            if (layerType === 'background') duration = rand(2.5, 4.5);
            else if (layerType === 'midground') duration = rand(1.8, 3.2);
            else duration = rand(1.0, 2.2);

            // Generate unique path
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

    return (
        <div className="diagnostic-flow diagflow">
            <style>{`
                .diagflow {
                    position: relative;
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

                .diagflow-step--primary .diagflow-step__icon {
                    color: #587a5e;
                }

                .diagflow-step--secondary .diagflow-step__icon {
                    color: #5f6f5f;
                }

                .diagflow-step--neutral .diagflow-step__icon {
                    color: #6d6a63;
                }

                .diagflow-step--warning .diagflow-step__icon {
                    color: var(--warning-text);
                }

                .diagflow-step--success .diagflow-step__icon {
                    color: var(--success-text);
                }

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

                /* Breathing effect container */
                .wave-group-dynamic {
                    transform-origin: center;
                    animation: breatheScale 6s ease-in-out infinite alternate;
                }

                /* Width pulse animation for dynamic width change */
                .wave-width-pulse {
                    transform-origin: center;
                    animation: widthPulse 14s ease-in-out infinite alternate;
                }

                /* Individual wave layer styling */
                .diagflow-wave-layer {
                    fill: none;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                    vector-effect: non-scaling-stroke;
                    will-change: transform;
                    animation: flowHorizontal linear infinite;
                }

                /* Blurred background waves */
                .diagflow-wave-blurred {
                    filter: url(#waveBlur);
                }

                /* Foreground waves with subtle glow */
                .diagflow-wave-foreground {
                    filter: drop-shadow(0 0 2px rgba(79, 122, 89, 0.2));
                }

                /* Energy pulse overlay - faster travel for data flow */
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
                }

                .diagflow-metric__note {
                    font-size: 0.72rem;
                    color: var(--text-secondary);
                }

                @keyframes diagflowDash {
                    from { stroke-dashoffset: 0; }
                    to { stroke-dashoffset: -180; }
                }

                /* Horizontal flow animation - continuous ribbon effect - FASTER for data flow */
                @keyframes flowHorizontal {
                    0% {
                        transform: translateX(0px);
                    }
                    100% {
                        transform: translateX(-180px);
                    }
                }

                /* Breathing effect - density increases/decreases */
                @keyframes breatheScale {
                    0% {
                        transform: scaleY(0.98) scaleX(1);
                        opacity: 0.92;
                    }
                    100% {
                        transform: scaleY(1.04) scaleX(1.01);
                        opacity: 1;
                    }
                }

                /* Dynamic width pulse */
                @keyframes widthPulse {
                    0% {
                        transform: scaleX(1);
                    }
                    50% {
                        transform: scaleX(1.02);
                    }
                    100% {
                        transform: scaleX(0.99);
                    }
                }

                /* Energy pulse traveling across waves - FASTER */
                @keyframes pulseSweep {
                    0% {
                        transform: translateX(-100%);
                    }
                    40% {
                        transform: translateX(20%);
                    }
                    60% {
                        transform: translateX(40%);
                    }
                    100% {
                        transform: translateX(120%);
                    }
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
                    .diagflow-steps {
                        gap: 10px;
                    }

                    .diagflow-step__label {
                        font-size: 0.75rem;
                    }
                }

                @media (max-width: 820px) {
                    .diagflow-steps {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .diagflow-connector-svg {
                        display: none;
                    }

                    .diagflow-wave-shell {
                        height: 170px;
                    }

                    .diagflow-metrics {
                        grid-template-columns: 1fr;
                    }

                    .diagflow-metric + .diagflow-metric {
                        border-left: none;
                        border-top: 1px solid var(--border-secondary);
                    }
                }

                @media (max-width: 520px) {
                    .diagflow-steps {
                        grid-template-columns: 1fr;
                    }

                    .diagflow-wave-shell {
                        height: 160px;
                    }

                    .diagflow-step {
                        flex-direction: row;
                        justify-content: flex-start;
                        text-align: left;
                    }
                }
            `}</style>

            <div className="section-header">
                <h2 className="section-title">AI Diagnostic Flow</h2>
                <span className="flow-status">Predictive Analysis Active</span>
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

                        {/* Multi-stop gradient definitions for organic wave colors */}
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

                        {/* Blur filter for atmospheric depth */}
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

                        {/* Breathing & width pulse effect applied to entire wave group */}
                        <g className="wave-group-dynamic">
                            <g className="wave-width-pulse">
                                {/* Background blurred waves - atmospheric depth, medium speed */}
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
                                            values="0 0; -180 0"
                                            keyTimes="0;1"
                                            dur={`${layer.duration * 1.2}s`}
                                            repeatCount="indefinite"
                                        />
                                    </g>
                                ))}

                                {/* Midground waves - organic texture, fast speed */}
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
                                            values="0 0; -200 0"
                                            keyTimes="0;1"
                                            dur={`${layer.duration}s`}
                                            repeatCount="indefinite"
                                        />
                                    </g>
                                ))}

                                {/* Foreground waves - sharp, vibrant, high detail, VERY FAST */}
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
                                            values="0 0; -240 0"
                                            keyTimes="0;1"
                                            dur={`${layer.duration * 0.85}s`}
                                            repeatCount="indefinite"
                                        />
                                    </g>
                                ))}
                            </g>
                        </g>
                    </g>
                </svg>

                {/* Energy pulse overlay - traveling across waves, visibly fast */}
                <div className="energy-pulse">
                    <div className="energy-pulse-gradient"></div>
                </div>
            </div>

            <div className="diagflow-metrics">
                <div className="diagflow-metric metric">
                    <span className="diagflow-metric__label metric-label">Signal Confidence</span>
                    <span className="diagflow-metric__value metric-value">94%</span>
                </div>

                <div className="diagflow-metric metric">
                    <span className="diagflow-metric__label metric-label">Anomaly Score</span>
                    <span className="diagflow-metric__value metric-value">0.023</span>
                </div>

                <div className="diagflow-metric metric">
                    <span className="diagflow-metric__label metric-label">RUL Estimate</span>
                    <span className="diagflow-metric__value metric-value">328 hrs</span>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticFlow;  