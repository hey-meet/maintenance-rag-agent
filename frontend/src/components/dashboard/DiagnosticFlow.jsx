import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    FiUploadCloud, FiAlignLeft, FiHash, FiDatabase, FiSearch,
    FiFileText, FiFilter, FiCpu, FiMessageSquare, FiBookOpen
} from 'react-icons/fi';

const AgenticRAGDiagnosticFlow = () => {
    // Simulated state for animated glows and light pulses
    const [activeStage, setActiveStage] = useState(0);
    const [pulseTrigger, setPulseTrigger] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStage(prev => (prev + 1) % 10); // cycle through 10 stages
            setPulseTrigger(prev => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const ragStages = [
        { id: 0, label: 'Manual Upload', subtext: 'SOURCE_DOC.PDF', icon: FiUploadCloud, grid: '1 / 1' },
        { id: 1, label: 'Chunking', subtext: 'TEXT_SPLITTER', icon: FiAlignLeft, grid: '2 / 1' },
        { id: 2, label: 'Embedding', subtext: 'TEXT-EMBED-3', icon: FiHash, grid: '3 / 1' },
        { id: 3, label: 'Vector Store', subtext: 'CHROMADB', icon: FiDatabase, grid: '2 / 2' },
        { id: 4, label: 'Query Gen', subtext: 'ALERT_TRIGGERED', icon: FiSearch, grid: '1 / 2' },
        { id: 5, label: 'Semantic Retriever', subtext: 'HYBRID_SEARCH', icon: FiFilter, grid: '1 / 3' },
        { id: 6, label: 'Context Builder', subtext: 'RERANK_N_PACK', icon: FiBookOpen, grid: '2 / 3' },
        { id: 7, label: 'Citation Engine', subtext: 'SOURCE_VERIFY', icon: FiFileText, grid: '3 / 3' },
        { id: 8, label: 'LLM Reasoning', subtext: 'GPT-4-TURBO', icon: FiCpu, grid: '2 / 4' },
        { id: 9, label: 'Response', subtext: 'PRESCRIPTIVE_MTX', icon: FiMessageSquare, grid: '2 / 5' }
    ];

    // Connectors definition (source ID, target ID, connection type)
    const connectors = [
        [0, 1], [1, 2], [2, 3], // Main ingestion
        [4, 5], [3, 5],         // Retrieval inputs
        [5, 6], [6, 7], [7, 6], // Context and Citation
        [6, 8], [8, 9]          // Reasoning to response
    ];

    // --- ENHANCED EMBEDDING-SPACE SILK RIBBONS CONFIGURATION ---
    const EMBEDDING_PATHS = useMemo(() => {
        return Array.from({ length: 55 }).map((_, i) => {
            let layer = 'midground';
            let strokeColor = 'rgba(79, 122, 89, 0.28)';
            let strokeWidth = 0.6;

            if (i % 3 === 0) {
                layer = 'background';
                strokeColor = 'rgba(142, 168, 142, 0.14)';
                strokeWidth = 0.35;
            } else if (i % 7 === 0) {
                layer = 'foreground';
                strokeColor = 'rgba(68, 110, 78, 0.45)';
                strokeWidth = 1.3;
            } else if (i % 4 === 0) {
                strokeColor = 'rgba(79, 122, 89, 0.38)';
                strokeWidth = 0.85;
            }

            return {
                id: i,
                layer,
                strokeColor,
                strokeWidth,
                baseYOffset: (i - 27.5) * 2.8,
                freq1: 0.12 + (i % 7) * 0.03,
                freq2: 0.28 + (i % 5) * 0.05,
                freq3: 0.05 + (i % 3) * 0.02,
                amp1: 14 + (i % 4) * 5,
                amp2: 5 + (i % 6) * 2,
                speed1: 0.003 + (i % 5) * 0.0012,
                speed2: 0.006 + (i % 4) * 0.0018,
                phaseOffset: i * 12.5
            };
        });
    }, []);

    // Explicitly requested data stream labels mapped with structured spacing limits
    const metadataPackets = useMemo(() => {
        const labels = [
            'manual.pdf', 'chunk_014', 'chunk_086', 'chunk_214', 'embedding',
            'vector_id', 'semantic search', 'similarity=0.97', 'top_k=5',
            'distance=0.042', 'cosine=0.94', 'retriever', 'context', 'citation',
            'page_118', 'query', 'HPX-103', 'motor_manual.pdf', 'rerank',
            'evidence', 'llm', 'response'
        ];

        return labels.map((text, idx) => ({
            text,
            // Vertical allocation tracking layers to avoid heavy aesthetic collisions
            baseTop: 18 + ((idx * 28) % 145),
            speed: 0.45 + ((idx % 4) * 0.12),
            delay: idx * 160
        }));
    }, []);

    // Small high-speed light particles travelling through paths
    const ribbonParticles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            targetRibbon: (i * 3.5) % 55 | 0,
            speed: 1.6 + (i % 3) * 0.4,
            delay: i * 200,
            radius: 1.2 + (i % 2) * 0.6
        }));
    }, []);

    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const requestRef = useRef(null);
    const timeRef = useRef(0);

    useEffect(() => {
        const width = 1200;
        const height = 180;
        const samples = 90;

        const animate = () => {
            timeRef.current += 1;
            const t = timeRef.current;

            if (svgRef.current) {
                // 1. Calculate & Mutate Organic Harmonious Silk Wave Ribbons
                const paths = svgRef.current.querySelectorAll('.vector-path');
                paths.forEach((path, idx) => {
                    const cfg = EMBEDDING_PATHS[idx];
                    if (!cfg) return;

                    let d = '';
                    const p1 = t * cfg.speed1 + cfg.phaseOffset;
                    const p2 = t * cfg.speed2 - cfg.phaseOffset * 0.4;
                    const breathing = 0.85 + Math.sin(t * 0.01 + idx) * 0.15;

                    for (let i = 0; i <= samples; i++) {
                        const progress = i / samples;
                        const x = progress * width;

                        const wave1 = Math.sin(progress * Math.PI * 2 * cfg.freq1 + p1);
                        const wave2 = Math.cos(progress * Math.PI * 4 * cfg.freq2 + p2);
                        const wave3 = Math.sin(progress * Math.PI * 1 * cfg.freq3 + p1 * 0.5);
                        const combinedWave = (wave1 * cfg.amp1) + (wave2 * cfg.amp2) + (wave3 * 6);

                        const convergence = 1.0 - Math.pow(Math.abs(progress - 0.55), 2) * 2.2;
                        const currentAmplitude = combinedWave * Math.max(0.15, convergence) * breathing;

                        const y = (height / 2) + cfg.baseYOffset + currentAmplitude;

                        d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }
                    path.setAttribute('d', d);
                });

                // 2. Animate Internal Ribbon Wave Light Particles
                const particles = svgRef.current.querySelectorAll('.ribbon-particle');
                particles.forEach((particle, idx) => {
                    const pCfg = ribbonParticles[idx];
                    const cfg = EMBEDDING_PATHS[pCfg.targetRibbon];
                    if (!cfg) return;

                    const containerWidth = containerRef.current?.clientWidth || 1200;
                    const totalDistance = (t * pCfg.speed + pCfg.delay) % (containerWidth + 100);
                    const progress = Math.min(1, Math.max(0, totalDistance / containerWidth));

                    const x = progress * width;
                    const p1 = t * cfg.speed1 + cfg.phaseOffset;
                    const p2 = t * cfg.speed2 - cfg.phaseOffset * 0.4;
                    const breathing = 0.85 + Math.sin(t * 0.01 + pCfg.targetRibbon) * 0.15;

                    const wave1 = Math.sin(progress * Math.PI * 2 * cfg.freq1 + p1);
                    const wave2 = Math.cos(progress * Math.PI * 4 * cfg.freq2 + p2);
                    const wave3 = Math.sin(progress * Math.PI * 1 * cfg.freq3 + p1 * 0.5);
                    const combinedWave = (wave1 * cfg.amp1) + (wave2 * cfg.amp2) + (wave3 * 6);
                    const convergence = 1.0 - Math.pow(Math.abs(progress - 0.55), 2) * 2.2;

                    const y = (height / 2) + cfg.baseYOffset + (combinedWave * Math.max(0.15, convergence) * breathing);

                    particle.setAttribute('cx', x.toFixed(1));
                    particle.setAttribute('cy', y.toFixed(1));

                    if (progress < 0.1) {
                        particle.setAttribute('opacity', (progress / 0.1) * 0.6);
                    } else if (progress > 0.85) {
                        particle.setAttribute('opacity', Math.max(0, (1 - progress) / 0.15 * 0.6));
                    } else {
                        particle.setAttribute('opacity', 0.6);
                    }
                });
            }

            // 3. Coordinate Streaming Text Metadata Label Shifts
            if (containerRef.current) {
                const textNodes = containerRef.current.querySelectorAll('.rag-metadata-packet');
                const containerWidth = containerRef.current.clientWidth || 1200;

                textNodes.forEach((node, idx) => {
                    const config = metadataPackets[idx];
                    const totalOffset = (t * config.speed + config.delay) % (containerWidth + 250);
                    const currentX = totalOffset - 120;
                    const currentY = config.baseTop + Math.sin((t * 0.015) + idx) * 5;

                    node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

                    if (currentX < 120) {
                        node.style.opacity = Math.max(0, Math.min(0.38, (currentX / 120) * 0.38));
                    } else if (currentX > containerWidth - 180) {
                        const fadeFactor = (containerWidth - currentX) / 180;
                        node.style.opacity = Math.max(0, Math.min(0.38, fadeFactor * 0.38));
                    } else {
                        node.style.opacity = 0.38;
                    }
                });
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [EMBEDDING_PATHS, metadataPackets, ribbonParticles]);

    return (
        <div className="agentic-rag-flow ragflow">
            <style>{`
                .ragflow {
                    position: relative;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .section-header {
                    margin-bottom: 20px;
                }
                .section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #111;
                    margin: 0;
                }
                .rag-graph-container {
                    position: relative;
                    padding: 10px;
                    background: #fff;
                    border-radius: 16px;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .rag-graph-nodes {
                    display: grid;
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                    grid-template-rows: repeat(3, 80px);
                    gap: 15px;
                    position: relative;
                    z-index: 2;
                }
                .rag-node {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    background: linear-gradient(180deg, #FAF8F5 0%, #F4F0EA 100%);
                    border: 1px solid rgba(220, 214, 203, 0.7);
                    border-radius: 12px;
                    padding: 8px;
                    transition: all 0.3s ease;
                    position: relative;
                }
                .rag-node--active {
                    border-color: #4F7A59;
                    box-shadow: 0 0 15px rgba(79, 122, 89, 0.2);
                    transform: translateY(-2px);
                    animation: nodeBreathing 3s ease-in-out infinite;
                }
                .rag-node__icon {
                    font-size: 1.2rem;
                    color: #555;
                    margin-bottom: 4px;
                }
                .rag-node--active .rag-node__icon {
                    color: #4F7A59;
                }
                .rag-node__label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #333;
                    line-height: 1.2;
                }
                .rag-node__subtext {
                    font-size: 0.6rem;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 2px;
                }
                .rag-graph-connectors {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    z-index: 1;
                    pointer-events: none;
                }
                .connector-line {
                    stroke: rgba(79, 122, 89, 0.2);
                    stroke-width: 1;
                    fill: none;
                }
                .pulse-circle {
                    fill: #4F7A59;
                    opacity: 0;
                }
                .pulse-active {
                    animation: pulseAnimation 3s linear infinite;
                }
                .rag-visual-shell {
                    position: relative;
                    margin-top: 24px;
                    height: 180px;
                    overflow: hidden;
                    border-radius: 16px;
                    border: 1px solid rgba(226, 220, 211, 0.6);
                    background: linear-gradient(180deg, #FAF8F5 0%, #F4F0EA 100%);
                }
                .rag-visual-svg {
                    width: 100%; height: 100%;
                    mask-image: linear-gradient(to right, transparent 0%, white 12%, white 88%, transparent 100%);
                }
                .vector-path {
                    fill: none;
                    stroke-linecap: round;
                    vector-effect: non-scaling-stroke;
                }
                .ribbon-particle {
                    fill: #4F7A59;
                    filter: drop-shadow(0px 0px 3px rgba(79, 122, 89, 0.6));
                }
                .rag-metadata-packet {
                    position: absolute;
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                    font-size: 10px;
                    font-weight: 500;
                    color: #3b5c43;
                    white-space: nowrap;
                    pointer-events: none;
                    letter-spacing: 0.2px;
                    will-change: transform, opacity;
                }
                @keyframes nodeBreathing {
                    0%, 100% { box-shadow: 0 0 10px rgba(79, 122, 89, 0.15); }
                    50% { box-shadow: 0 0 20px rgba(79, 122, 89, 0.3); }
                }
                @keyframes pulseAnimation {
                    0% { offset-distance: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { offset-distance: 100%; opacity: 0; }
                }
            `}</style>

            <div className="section-header">
                <h2 className="section-title">Agentic RAG Knowledge Pipeline</h2>
            </div>

            <div className="rag-graph-container">
                {/* SVG Connectors with light pulses */}
                <svg className="rag-graph-connectors" viewBox="0 0 1000 240" preserveAspectRatio="none">
                    <defs>
                        {connectors.map(([source, target], idx) => {
                            const sNode = ragStages[source];
                            const tNode = ragStages[target];
                            const x1 = (parseInt(sNode.grid.split('/')[1]) - 0.5) * 200;
                            const y1 = (parseInt(sNode.grid.split('/')[0]) - 0.5) * 80;
                            const x2 = (parseInt(tNode.grid.split('/')[1]) - 0.5) * 200;
                            const y2 = (parseInt(tNode.grid.split('/')[0]) - 0.5) * 80;
                            const pathD = `M ${x1} ${y1} C ${x1 + 100} ${y1}, ${x2 - 100} ${y2}, ${x2} ${y2}`;

                            return (
                                <React.Fragment key={`conn-def-${idx}`}>
                                    <path id={`path-${idx}`} d={pathD} className="connector-line" />
                                    <circle r="3" className={`pulse-circle ${idx % 3 === pulseTrigger % 3 ? 'pulse-active' : ''}`}>
                                        <animateMotion dur="3s" repeatCount="indefinite" path={pathD} />
                                    </circle>
                                </React.Fragment>
                            );
                        })}
                    </defs>
                    {connectors.map((_, idx) => (
                        <use key={`conn-use-${idx}`} href={`#path-${idx}`} />
                    ))}
                </svg>

                {/* Nodes Grid */}
                <div className="rag-graph-nodes">
                    {ragStages.map((stage) => {
                        const Icon = stage.icon;
                        const isActive = stage.id === activeStage;
                        return (
                            <div
                                key={stage.id}
                                className={`rag-node ${isActive ? 'rag-node--active' : ''}`}
                                style={{ gridArea: stage.grid }}
                            >
                                <Icon className="rag-node__icon" />
                                <div className="rag-node__label">{stage.label}</div>
                                <div className="rag-node__subtext">{stage.subtext}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* In-Wave Premium Flowing Embedding-Space Section */}
            <div ref={containerRef} className="rag-visual-shell">
                <svg
                    ref={svgRef}
                    className="rag-visual-svg"
                    viewBox="0 0 1200 180"
                    preserveAspectRatio="none"
                >
                    {/* Layered Silk Ribbon Waves */}
                    {EMBEDDING_PATHS.map((config) => (
                        <path
                            key={`vec-${config.id}`}
                            className="vector-path"
                            stroke={config.strokeColor}
                            strokeWidth={config.strokeWidth}
                        />
                    ))}

                    {/* Fine Moving Light Nodes */}
                    {ribbonParticles.map((pt) => (
                        <circle
                            key={`part-${pt.id}`}
                            className="ribbon-particle"
                            r={pt.radius}
                        />
                    ))}
                </svg>

                {/* Flowing Data Space Text Metadata Labels */}
                {metadataPackets.map((packet, idx) => (
                    <div key={`meta-${idx}`} className="rag-metadata-packet">
                        {packet.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgenticRAGDiagnosticFlow;