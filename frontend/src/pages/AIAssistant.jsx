// AIAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCpu, FiSend, FiBookmark, FiFileText, FiAlertTriangle,
    FiCheckCircle, FiTool, FiDatabase, FiLayers, FiSettings,
    FiActivity, FiTrendingUp, FiClipboard, FiPackage, FiClock
} from 'react-icons/fi';
import aiAssistantService from "../services/aiAssistantService";
import '../styles/aiAssistant.css';

// Fallback arrays to preserve stable presentation states if server configurations are offline
const FALLBACK_SUGGESTED_PROMPTS = [
    'Isolate diagnostic steps for hydraulic pump error code E-HYD-402',
    'Compile thermal risk analysis summary for Induction Furnace F-01'
];

export default function AIAssistant() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'System Initialization Complete. Prescriptive Maintenance RAG Core Active. Monitoring operational telemetry metrics...',
            payload: null
        }
    ]);
    const [inputVal, setInputVal] = useState('');

    // Agent Cognitive States: 'idle' | 'thinking' | 'retrieving' | 'analyzing' | 'completed'
    const [agentState, setAgentState] = useState('idle');
    const [activeMemory, setActiveMemory] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

    // Explicit Blinking Frame Loop Controller State
    const [isBlinking, setIsBlinking] = useState(false);
    const avatarRef = useRef(null);

    // Live API Aggregation State Layers
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedPrompts, setSuggestedPrompts] = useState(FALLBACK_SUGGESTED_PROMPTS);
    const [dashboardSummary, setDashboardSummary] = useState({
        active_alerts: 3,
        open_work_orders: 14,
        vector_chunks: 42890,
        inventory_risks: 2
    });
    const [agentStatus, setAgentStatus] = useState({ state: "idle" });

    // Initial load orchestrator assembling backend service states in parallel paths
    useEffect(() => {
        const fetchSystemEnvironmentContext = async () => {
            try {
                const [statusRes, dashboardRes, promptsRes, memoryRes] = await Promise.all([
                    aiAssistantService.getStatus(),
                    aiAssistantService.getDashboardSummary(),
                    aiAssistantService.getSuggestedPrompts(),
                    aiAssistantService.getMemory()
                ]);

                if (statusRes) setAgentStatus(statusRes);
                if (dashboardRes) setDashboardSummary(dashboardRes);
                if (promptsRes && Array.isArray(promptsRes)) setSuggestedPrompts(promptsRes);
                if (memoryRes) {
                    setActiveMemory({
                        recommended_steps: memoryRes.manual_context?.active_section ? [memoryRes.manual_context.active_section] : [],
                        estimated_time: "Pending Analysis",
                        department: memoryRes.active_work_order?.assigned_team || "Pending Route Assignment",
                        required_tools: [],
                        required_parts: memoryRes.inventory_context?.required_part ? [memoryRes.inventory_context.required_part] : [],
                        inventory_status: memoryRes.inventory_context?.stock_status ? `${memoryRes.inventory_context.stock_status.toUpperCase()} (${memoryRes.inventory_context.available_units || 0} units)` : "UNVERIFIED",
                        manual_reference: {
                            docId: memoryRes.manual_context?.document_id || "OM-CORE-SYS",
                            page: "N/A",
                            section: memoryRes.manual_context?.active_section || "General Maintenance Core"
                        },
                        work_order: memoryRes.active_work_order?.work_order_id || "WO-PENDING"
                    });
                }
            } catch (error) {
                console.error("Operational Context Synch Aborted:", error);
            }
        };

        fetchSystemEnvironmentContext();
    }, []);

    // Natural Eye Blinking Subsystem Loop (Triggers every 4-8 seconds randomly)
    useEffect(() => {
        let blinkTimeout;
        const triggerBlinkLoop = () => {
            const randomDelay = Math.random() * (8000 - 4000) + 4000;
            blinkTimeout = setTimeout(() => {
                setIsBlinking(true);
                // Standard organic biological duration window for optical closures
                setTimeout(() => {
                    setIsBlinking(false);
                    // Occasional double blink generation for life-like fidelity mechanics
                    if (Math.random() > 0.75) {
                        setTimeout(() => {
                            setIsBlinking(true);
                            setTimeout(() => setIsBlinking(false), 120);
                        }, 140);
                    }
                }, 140);
                triggerBlinkLoop();
            }, randomDelay);
        };
        triggerBlinkLoop();
        return () => clearTimeout(blinkTimeout);
    }, []);

    // Track mouse position relative to center of avatar eye frame with spring bounds
    useEffect(() => {
        const handleMouseMove = (e) => {
            setLastInteractionTime(Date.now());
            if (!avatarRef.current) return;
            const rect = avatarRef.current.getBoundingClientRect();
            const avatarCenterX = rect.left + rect.width / 2;
            const avatarCenterY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.clientY - avatarCenterY, e.clientX - avatarCenterX);

            // Subtle, controlled premium companion bounds mapping (Max radius scale: 3px)
            const maxRadius = 3;
            const distance = Math.min(maxRadius, Math.hypot(e.clientX - avatarCenterX, e.clientY - avatarCenterY) / 60);

            setMousePos({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Attention sub-system: Pivot focus to interface inputs and suggested actions if operator sits idle
    useEffect(() => {
        const interval = setInterval(() => {
            const idleDuration = Date.now() - lastInteractionTime;
            if (idleDuration > 10000 && agentState === 'idle') {
                // Alternates optical vector coordinates gently toward control inputs (Bottom/Center areas)
                const focalTarget = idleDuration % 20000 > 10000 ? { x: 1.5, y: 2.2 } : { x: -1.8, y: 1.5 };
                setMousePos(focalTarget);
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [lastInteractionTime, agentState]);

    const executeAgentPipeline = async (queryText) => {
        if (!queryText.trim() || isLoading) return;

        setLastInteractionTime(Date.now());
        setIsLoading(true);

        const userMsg = { role: 'user', text: queryText, payload: null };
        setMessages(prev => [...prev, userMsg]);
        setInputVal('');

        try {
            setAgentState('thinking');
            await new Promise(r => setTimeout(r, 1400));

            setAgentState('retrieving');
            await new Promise(r => setTimeout(r, 1600));

            setAgentState('analyzing');
            const result = await aiAssistantService.queryAgent(queryText);
            await new Promise(r => setTimeout(r, 1500));

            setAgentState('completed');

            const finalPayload = {
                analysis: result.analysis,
                severity: result.severity,
                department: result.department,
                estimated_time: result.estimated_time,
                recommended_steps: result.recommended_steps,
                required_tools: result.required_tools,
                required_parts: result.required_parts,
                manual_reference: {
                    docId: result.manual_reference?.docId || "UNKNOWN",
                    page: result.manual_reference?.page || "N/A",
                    section: result.manual_reference?.section || "Unspecified"
                },
                inventory_status: result.inventory_status,
                work_order: result.work_order
            };

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: finalPayload.analysis,
                payload: finalPayload
            }]);
            setActiveMemory(finalPayload);

        } catch (error) {
            console.error("RAG Operations Core Pipeline Interrupted:", error);
            setAgentState('idle');
            setMessages(prev => [...prev, {
                role: "assistant",
                text: "Unable to retrieve maintenance intelligence from backend services.",
                payload: null
            }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => setAgentState('idle'), 3000);
        }
    };

    // Configuration profile mapping states smoothly to industrial hardware aesthetics
    const getFaceExpressionProps = () => {
        switch (agentState) {
            case 'thinking':
                return {
                    browY: 1, browRotate: 5, eyeScaleY: 0.8,
                    glowColor: "rgba(245, 158, 11, 0.35)", // Premium Soft Amber
                    mouthType: "thinking", headScale: 0.99
                };
            case 'retrieving':
                return {
                    browY: -1, browRotate: 0, eyeScaleY: 1.0,
                    glowColor: "rgba(6, 182, 212, 0.45)", // Deep Cyan Pulse
                    mouthType: "scanning", headScale: 1.01
                };
            case 'analyzing':
                return {
                    browY: 2, browRotate: -6, eyeScaleY: 0.75,
                    glowColor: "rgba(168, 85, 247, 0.4)", // Muted Core Purple
                    mouthType: "thinking", headScale: 1.0
                };
            case 'completed':
                return {
                    browY: -1, browRotate: 0, eyeScaleY: 1.05,
                    glowColor: "rgba(34, 197, 94, 0.5)", // Soft Operational Green
                    mouthType: "smile", headScale: 1.02
                };
            case 'idle':
            default:
                // Check if global dashboard inventory/alerts present critical status to shift posture contextually
                const standardGlow = dashboardSummary.active_alerts > 4 ? "rgba(239, 68, 68, 0.25)" : "rgba(6, 182, 212, 0.18)";
                return {
                    browY: 0, browRotate: 0, eyeScaleY: 1.0,
                    glowColor: standardGlow,
                    mouthType: "neutral", headScale: 1.0
                };
        }
    };

    const expression = getFaceExpressionProps();

    return (
        <div className="ai-mission-control theme-dark-industrial">

            {/* TOP COMMAND METRICS BAR */}
            <header className="control-center-header">
                <div className="system-identity">
                    <FiActivity className="pulse-icon-fast" />
                    <div>
                        <h1>CORE AGENT OPERATIONS CENTER</h1>
                        <p className="system-status-string">System Latency: <span className="text-green">14ms</span> // Retrieval Match Core: <span className="text-cyan">Cosine Sub-Space v4</span></p>
                    </div>
                </div>

                <div className="quick-telemetry-strip">
                    <div className="t-block"><span className="lbl">Active Alerts:</span> <span className="val text-orange">{dashboardSummary.active_alerts} Critical</span></div>
                    <div className="t-block"><span className="lbl">Open Work Orders:</span> <span className="val">{dashboardSummary.open_work_orders} Pending</span></div>
                    <div className="t-block"><span className="lbl">Indexed Vectors:</span> <span className="val text-cyan">{dashboardSummary.vector_chunks?.toLocaleString()} Chunks</span></div>
                </div>
            </header>

            {/* MAIN CORE WORKSPACE ARCHITECTURE Layout Split */}
            <div className="operations-grid">

                {/* COLUMN 1: INTELLECT AVATAR & REASONING PIPELINE VISUALIZATION */}
                <div className="panel-pane avatar-pipeline-panel">
                    <div className="pane-section avatar-housing">
                        <h3>Agent Core Intellect</h3>

                        {/* ================= PREMIUM REBUILT COMPANION AVATAR INTERFACE ================= */}
                        <div className="avatar-frame-wrapper" ref={avatarRef} style={{ position: 'relative', padding: '16px 0' }}>
                            <motion.div
                                className={`living-companion-head-chassis state-${agentState}`}
                                style={{
                                    width: '180px',
                                    height: '145px',
                                    margin: '0 auto',
                                    position: 'relative'
                                }}
                                animate={{
                                    y: agentState === 'idle' ? [0, -5, 0] : [0, -1, 0],
                                    rotate: agentState === 'idle' ? [0, 1, -1, 0] : 0,
                                    scale: expression.headScale
                                }}
                                transition={{
                                    y: { repeat: Infinity, duration: agentState === 'idle' ? 4.5 : 2, ease: "easeInOut" },
                                    rotate: { repeat: Infinity, duration: 8, ease: "easeInOut" },
                                    scale: { type: "spring", stiffness: 100, damping: 15 }
                                }}
                            >
                                <svg viewBox="0 0 180 145" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                    <defs>
                                        {/* Outer Metallic Shell Shield Finish */}
                                        <linearGradient id="robotChassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#f3f4f6" />
                                            <stop offset="35%" stopColor="#e5e7eb" />
                                            <stop offset="100%" stopColor="#9ca3af" />
                                        </linearGradient>

                                        {/* Deep Glass Matrix Core Display Plate */}
                                        <linearGradient id="glassDisplayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#070b14" />
                                            <stop offset="100%" stopColor="#111827" />
                                        </linearGradient>

                                        {/* Soft High-End Bezel Shadow Occlusion */}
                                        <radialGradient id="innerBezelGlow" cx="50%" cy="40%" r="60%">
                                            <stop offset="70%" stopColor="#000000" stopOpacity="0" />
                                            <stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
                                        </radialGradient>

                                        {/* Screen Reflection Curve Overlays */}
                                        <linearGradient id="screenGlossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                                            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.04" />
                                            <stop offset="31%" stopColor="#ffffff" stopOpacity="0" />
                                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                                        </linearGradient>

                                        {/* Pure Cyan Luminescent Emission Iris Filter */}
                                        <radialGradient id="eyeLumenGlow" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#ffffff" />
                                            <stop offset="25%" stopColor="#22d3ee" stopOpacity="1" />
                                            <stop offset="70%" stopColor="#0891b2" stopOpacity="0.5" />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                                        </radialGradient>
                                    </defs>

                                    {/* Ambient Screen Shadow Glow Emission Base Overlay */}
                                    <rect x="22" y="12" width="136" height="116" rx="26" fill="none"
                                        style={{ filter: `drop-shadow(0px 0px 18px ${expression.glowColor})`, opacity: 0.85 }} />

                                    {/* Left and Right Hardware Acoustic Ear Modules */}
                                    <rect x="8" y="52" width="9" height="36" rx="4.5" fill="#9ca3af" stroke="#4b5563" strokeWidth="1" />
                                    <rect x="163" y="52" width="9" height="36" rx="4.5" fill="#9ca3af" stroke="#4b5563" strokeWidth="1" />

                                    {/* Main Floating Shell Pod Base Assembly */}
                                    <rect x="16" y="6" width="148" height="128" rx="32" fill="url(#robotChassisGrad)" stroke="#374151" strokeWidth="1.5" />

                                    {/* Inner Core Premium Glass Face Panel (70% Canvas Space Focus) */}
                                    <rect x="24" y="14" width="132" height="112" rx="22" fill="url(#glassDisplayGrad)" />
                                    <rect x="24" y="14" width="132" height="112" rx="22" fill="url(#innerBezelGlow)" />

                                    {/* Dynamic Core Screen State Soft Micro-Reflection Grid Lines */}
                                    {agentState === 'retrieving' && (
                                        <motion.line x1="28" y1="18" x2="148" y2="18" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="2.5"
                                            animate={{ y: [0, 100, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
                                    )}

                                    {/* --- EXPRESSIVE OPTICAL ASSEMBLY LAYERS --- */}
                                    {/* LEFT OPTIC ASSEMBLY */}
                                    <g transform="translate(58, 62)">
                                        {/* Dynamic Eyebrow Control Node */}
                                        <motion.line
                                            x1="-14" y1="-18" x2="12" y2="-18"
                                            stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round"
                                            animate={{ y: expression.browY, rotate: -expression.browRotate }}
                                            transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                        />

                                        {/* Moving Iris Matrix Viewport Frame */}
                                        <motion.g animate={{ x: mousePos.x, y: mousePos.y }}>
                                            <motion.ellipse
                                                cx="0" cy="0" rx="14" ry="14"
                                                fill="url(#eyeLumenGlow)"
                                                animate={{ scaleY: isBlinking ? 0 : expression.eyeScaleY }}
                                                transition={isBlinking ? { duration: 0.08 } : { type: "spring", stiffness: 150, damping: 12 }}
                                            />
                                            {/* Micro Refractive Optical Highlight Pin */}
                                            {!isBlinking && <circle cx="-4" cy="-4" r="2.5" fill="#ffffff" opacity="0.9" />}
                                        </motion.g>
                                    </g>

                                    {/* RIGHT OPTIC ASSEMBLY */}
                                    <g transform="translate(122, 62)">
                                        {/* Dynamic Eyebrow Control Node */}
                                        <motion.line
                                            x1="-12" y1="-18" x2="14" y2="-18"
                                            stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round"
                                            animate={{ y: expression.browY, rotate: expression.browRotate }}
                                            transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                        />

                                        {/* Moving Iris Matrix Viewport Frame */}
                                        <motion.g animate={{ x: mousePos.x, y: mousePos.y }}>
                                            <motion.ellipse
                                                cx="0" cy="0" rx="14" ry="14"
                                                fill="url(#eyeLumenGlow)"
                                                animate={{ scaleY: isBlinking ? 0 : expression.eyeScaleY }}
                                                transition={isBlinking ? { duration: 0.08 } : { type: "spring", stiffness: 150, damping: 12 }}
                                            />
                                            {/* Micro Refractive Optical Highlight Pin */}
                                            {!isBlinking && <circle cx="-4" cy="-4" r="2.5" fill="#ffffff" opacity="0.9" />}
                                        </motion.g>
                                    </g>

                                    {/* --- premium vocal mouth matrix expressions --- */}
                                    <g transform="translate(90, 100)">
                                        {expression.mouthType === "smile" && (
                                            <motion.path d="M -11,-3 Q 0,7 11,-3" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                                        )}
                                        {expression.mouthType === "neutral" && (
                                            <line x1="-8" y1="0" x2="8" y2="0" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="2.5" strokeLinecap="round" />
                                        )}
                                        {expression.mouthType === "thinking" && (
                                            <motion.line x1="-6" y1="0" x2="6" y2="0" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"
                                                animate={{ scaleX: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} />
                                        )}
                                        {expression.mouthType === "scanning" && (
                                            <motion.path d="M -12,0 L 12,0" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 2"
                                                animate={{ x: [-1.5, 1.5, -1.5] }} transition={{ repeat: Infinity, duration: 0.4, ease: "linear" }} />
                                        )}
                                    </g>

                                    {/* Premium Curved High-Gloss Diagonal Face Plate Lens Reflection overlay */}
                                    <rect x="24" y="14" width="132" height="112" rx="22" fill="url(#screenGlossGrad)" pointerEvents="none" />
                                </svg>
                            </motion.div>

                            {/* MODERN BREATHING DOTS STATE CONTROLLER INDICATOR GRID */}
                            <div className="voice-assistant-matrix-dots" style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
                                {[0, 1, 2].map((dotIndex) => (
                                    <motion.span
                                        key={dotIndex}
                                        style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: agentState === 'thinking' ? '#f59e0b' :
                                                agentState === 'retrieving' ? '#22d3ee' :
                                                    agentState === 'analyzing' ? '#a855f7' :
                                                        agentState === 'completed' ? '#22c55e' : 'rgba(6, 182, 212, 0.4)'
                                        }}
                                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.15, 0.9] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.2,
                                            delay: dotIndex * 0.2,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Agent Pipeline Visual Sequence Tracker */}
                    <div className="pane-section pipeline-tracker-housing">
                        <h3>Cognitive Pipeline Sequence</h3>
                        <div className="pipeline-vertical-stepper">
                            {[
                                { key: 'thinking', label: 'Alert Captured / Intention Node Built' },
                                { key: 'retrieving', label: 'Vector Index Lookup & Chunk Retrieval' },
                                { key: 'analyzing', label: 'Synthesizing Prescriptive Action Path' },
                                { key: 'completed', label: 'Work Order & Inventory Cross-Matched' }
                            ].map((step, idx) => (
                                <div key={idx} className={`pipeline-step ${agentState === step.key ? 'active-running' : ''}`}>
                                    <div className="step-bullet">
                                        {agentState === step.key ? <div className="spinner" /> : <FiCheckCircle />}
                                    </div>
                                    <div className="step-details">
                                        <p className="step-label">{step.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: PRIMARY INTERACTIVE STREAM (CHAT COMM CELL) */}
                <div className="panel-pane interaction-stream-panel">
                    <div className="chat-scroller">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`stream-row-card ${msg.role === 'user' ? 'user-card' : 'agent-card'}`}
                                >
                                    <div className="card-meta">
                                        <span className="sender-tag">{msg.role === 'user' ? '// OPERATOR' : '// COGNITIVE CORE'}</span>
                                    </div>
                                    <div className="card-body">
                                        <p>{msg.text}</p>

                                        {msg.payload && (
                                            <div className="payload-inline-summary">
                                                <div className="mini-badge-row">
                                                    <span className="p-badge critical"><FiAlertTriangle /> {msg.payload.severity}</span>
                                                    <span className="p-badge"><FiClipboard /> {msg.payload.work_order}</span>
                                                    <span className="p-badge text-green"><FiPackage /> {msg.payload.inventory_status}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="dock-controls-housing">
                        <div className="suggested-pills-row">
                            {suggestedPrompts.map((p, idx) => (
                                <button
                                    key={idx}
                                    className="pill-btn"
                                    onClick={() => executeAgentPipeline(p)}
                                    disabled={isLoading}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <form className="chat-input-dock" onSubmit={(e) => { e.preventDefault(); executeAgentPipeline(inputVal); }}>
                            <input
                                type="text"
                                placeholder="State manual validation criteria, component breakdown query, or fault mitigation request..."
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                                className="dock-input-field"
                                disabled={isLoading || agentState !== 'idle'}
                            />
                            <button type="submit" className="dock-send-btn" disabled={isLoading || agentState !== 'idle'}>
                                <FiSend /> RUN PIPELINE
                            </button>
                        </form>
                    </div>
                </div>

                {/* COLUMN 3: REAL-TIME PRESCRIPTIVE CONTEXT & MEMORY PANEL */}
                <div className="panel-pane context-memory-panel">
                    <h3>Active Knowledge State Matrix</h3>

                    {activeMemory ? (
                        <div className="memory-scroller">
                            <div className="memory-card action-plan-card">
                                <h4><FiTool /> Prescriptive Action Checklist</h4>
                                <ol className="action-step-list">
                                    {activeMemory.recommended_steps?.map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ol>
                                <div className="meta-metrics-grid">
                                    <div>
                                        <span className="meta-lbl"><FiClock /> Est. Repair Time</span>
                                        <span className="meta-val">{activeMemory.estimated_time}</span>
                                    </div>
                                    <div>
                                        <span className="meta-lbl"><FiSettings /> Target Department</span>
                                        <span className="meta-val text-truncate">{activeMemory.department}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="memory-card inventory-validation-card">
                                <h4><FiPackage /> Logistics & Part Inventory Verification</h4>
                                <div className="parts-allocation-list">
                                    <div><strong>Required Tools:</strong> {activeMemory.required_tools?.join(', ') || "None"}</div>
                                    <div className="margin-top-xs"><strong>Required Assemblies:</strong> {activeMemory.required_parts?.join(', ') || "None"}</div>
                                </div>
                                <div className={`inventory-status-bar status-${activeMemory.inventory_status?.includes('AVAILABLE') ? 'ok' : 'risk'}`}>
                                    <FiDatabase /> Status: {activeMemory.inventory_status}
                                </div>
                            </div>

                            <div className="memory-card reference-manual-card">
                                <h4><FiBookmark /> Indexed Technical Context Layer</h4>
                                <div className="manual-reference-pill">
                                    <FiFileText />
                                    <span>{activeMemory.manual_reference?.docId} • <strong>{activeMemory.manual_reference?.page}</strong> ({activeMemory.manual_reference?.section})</span>
                                </div>
                            </div>

                            <div className="quick-actions-grid">
                                <button className="action-trigger-btn primary"><FiClipboard /> Deploy Work Order ({activeMemory.work_order})</button>
                                <button className="action-trigger-btn"><FiFileText /> Open Manual Source</button>
                                <button className="action-trigger-btn"><FiTrendingUp /> View System Analytics</button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state-fallback">
                            <FiLayers className="fallback-ico" />
                            <p>No active operational context loaded. Initiate a prompt inquiry to run prescriptive diagnostics.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}