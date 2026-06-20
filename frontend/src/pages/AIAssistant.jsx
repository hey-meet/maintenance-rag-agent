// AIAssistant.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCpu, FiZap, FiAlertTriangle, FiCheckCircle, FiTool,
    FiDatabase, FiLayers, FiBookmark, FiFileText, FiClock,
    FiShield, FiSliders, FiTerminal, FiPackage, FiClipboard, FiMail,
    FiActivity
} from 'react-icons/fi';
import aiAssistantService from "../services/aiAssistantService";
import '../styles/aiAssistant.css';

// Importing the local machine screen asset cleanly for the bundler context
import machineScreenBg from '../assets/images/machinescreen.png';

export default function AIAssistant() {
    const [agentState, setAgentState] = useState('idle');
    const [systemAlerts, setSystemAlerts] = useState([]);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [pipelineProgress, setPipelineProgress] = useState([]);
    const [activeMemory, setActiveMemory] = useState(null);
    const [isBlinking, setIsBlinking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Flyaway flying packet animation states
    const [flyingPacket, setFlyingPacket] = useState(null);

    // Operational Environment Metrics State Layer
    const [dashboardSummary, setDashboardSummary] = useState({
        active_alerts: 0,
        open_work_orders: 0,
        vector_chunks: 0,
        agent_health: "stable"
    });

    const avatarRef = useRef(null);
    const activeAlertRef = useRef(null);

    // Initial Orchestration Loop: Fetch current Agent telemetry & alert list in parallel
    useEffect(() => {
        const syncSystemContext = async () => {
            try {
                const [statusData, alertsData] = await Promise.all([
                    aiAssistantService.getStatus(),
                    aiAssistantService.getAlerts()
                ]);

                if (statusData) {
                    setDashboardSummary({
                        active_alerts: statusData.active_alerts,
                        open_work_orders: statusData.open_work_orders,
                        vector_chunks: statusData.vector_chunks,
                        agent_health: statusData.agent_health
                    });
                    setAgentState(statusData.state || 'idle');
                }

                if (alertsData && alertsData.length > 0) {
                    setSystemAlerts(alertsData);
                    setSelectedAlert(alertsData[0]); // Default to first incoming alert node
                }
            } catch (error) {
                console.error("Operational Context Synchronization Aborted:", error);
            }
        };

        syncSystemContext();
    }, []);

    // Biological Optical Micro-Blinking Loop
    useEffect(() => {
        let blinkTimeout;
        const triggerBlinkLoop = () => {
            const randomDelay = Math.random() * (8000 - 4000) + 4000;
            blinkTimeout = setTimeout(() => {
                setIsBlinking(true);
                setTimeout(() => {
                    setIsBlinking(false);
                }, 140);
                triggerBlinkLoop();
            }, randomDelay);
        };
        triggerBlinkLoop();
        return () => clearTimeout(blinkTimeout);
    }, []);

    // Trigger transmission packet flyaway followed by backend pipeline synthesis
    const executeMaintenancePipeline = async () => {
        if (!selectedAlert || isLoading) return;

        setIsLoading(true);
        setPipelineProgress([]);
        setActiveMemory(null);

        // Calculate locations relative to viewport space for flying graphic tracking bounds
        if (activeAlertRef.current && avatarRef.current) {
            const startRect = activeAlertRef.current.getBoundingClientRect();
            const endRect = avatarRef.current.getBoundingClientRect();

            setFlyingPacket({
                startX: startRect.left + startRect.width / 2,
                startY: startRect.top + startRect.height / 2,
                endX: endRect.left + endRect.width / 2,
                endY: endRect.top + endRect.height / 2
            });
        }

        // Wait for flying packet animation to land safely in Core Intellect Pod
        setTimeout(async () => {
            setFlyingPacket(null);
            await runCorePipelineSequencing();
        }, 850);
    };

    // Sequential steps mapping UI states seamlessly to the active backend logs
    const runCorePipelineSequencing = async () => {
        try {
            // Step 1: Ingest alert safely into processing engine
            const processRes = await aiAssistantService.queryAgent(selectedAlert.id);
            if (processRes && processRes.state) {
                setAgentState(processRes.state); // Shifts layout expression smoothly to 'thinking'
            }

            // Step 2: Extract real-time pipeline telemetry log strings
            const initialLogs = await aiAssistantService.getPipelineLogs();
            setPipelineProgress(initialLogs || []);

            // Artificial intervals to let the mechanical face cycle beautifully through its states
            await new Promise(r => setTimeout(r, 1200));
            setAgentState('retrieving');

            await new Promise(r => setTimeout(r, 1200));
            setAgentState('analyzing');

            // Step 3: Fetch ultimate structural prescriptive decisions & load memory array
            const memoryRes = await aiAssistantService.getMemory();
            await new Promise(r => setTimeout(r, 800));

            setAgentState('completed');
            setActiveMemory(memoryRes);

            // Dynamically increment working parameter states on dashboard
            setDashboardSummary(prev => ({ ...prev, open_work_orders: prev.open_work_orders + 1 }));

        } catch (error) {
            console.error("Pipeline breakdown sequence logged:", error);
            setAgentState('attention');
            setPipelineProgress([{ timestamp: "ERR", message: "Pipeline processing sequence critically suspended." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const getFaceExpressionProps = () => {
        switch (agentState) {
            case 'thinking': return { glowColor: "rgba(245, 158, 11, 0.4)", eyeScaleY: 0.8, mouthType: "thinking" };
            case 'retrieving': return { glowColor: "rgba(6, 182, 212, 0.5)", eyeScaleY: 1.0, mouthType: "scanning" };
            case 'analyzing': return { glowColor: "rgba(168, 85, 247, 0.45)", eyeScaleY: 0.7, mouthType: "thinking" };
            case 'completed': return { glowColor: "rgba(34, 197, 94, 0.55)", eyeScaleY: 1.05, mouthType: "smile" };
            case 'attention': return { glowColor: "rgba(239, 68, 68, 0.5)", eyeScaleY: 0.85, mouthType: "neutral" };
            default: return { glowColor: "rgba(6, 182, 212, 0.2)", eyeScaleY: 1.0, mouthType: "neutral" };
        }
    };

    const expression = getFaceExpressionProps();

    return (
        <div className="ai-mission-control theme-dark-industrial">

            {/* FLYING TELEMETRY DATA PACKET PORTAL LAYER */}
            <AnimatePresence>
                {flyingPacket && (
                    <motion.div
                        className="flying-error-packet"
                        initial={{
                            position: 'fixed',
                            left: flyingPacket.startX,
                            top: flyingPacket.startY,
                            x: '-50%', y: '-50%',
                            scale: 1, opacity: 1, zIndex: 9999
                        }}
                        animate={{
                            left: flyingPacket.endX,
                            top: flyingPacket.endY,
                            scale: [1, 1.4, 0.6],
                            opacity: [1, 1, 0.8],
                            rotate: 360
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        <FiMail />
                        <span className="packet-glow-node" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOP METRICS MONITORING BAR */}
            <header className="control-center-header">
                <div className="system-identity">
                    <FiActivity className="pulse-icon-fast" />
                    <div>
                        <h1>PRESCRIPTIVE MAINTENANCE CORE SUPERVISOR</h1>
                        <p className="system-status-string">
                            Agent Matrix: <span className="text-cyan">RAG-Engine v4.9</span> //
                            Operational Posture: <span className={`status-pill ${agentState}`}>{agentState.toUpperCase()}</span>
                        </p>
                    </div>
                </div>
                <div className="quick-telemetry-strip">
                    <div className="t-block"><span className="lbl">Telemetry Risks:</span> <span className="val text-orange">{dashboardSummary.active_alerts} High-Priority</span></div>
                    <div className="t-block"><span className="lbl">Open Work Orders:</span> <span className="val">{dashboardSummary.open_work_orders} Active</span></div>
                    <div className="t-block"><span className="lbl">Core Knowledge:</span> <span className="val text-cyan">{dashboardSummary.vector_chunks?.toLocaleString()} Chunks</span></div>
                </div>
            </header>

            <div className="operations-grid">

                {/* COLUMN 1: INTELLECT AVATAR CORE ASSET */}
                <div className="panel-pane avatar-pipeline-panel">
                    <div className="panel-pane avatar-housing" ref={avatarRef}>
                        <div className="panel-header-sub">
                            <h3><FiCpu /> Core Intellect Asset</h3>
                            <span className="live-tag">{dashboardSummary.agent_health?.toUpperCase()}</span>
                        </div>

                        <div className="avatar-frame-wrapper">
                            <motion.div
                                className="living-companion-head-chassis"
                                style={{ width: '170px', height: '140px', margin: '0 auto', position: 'relative' }}
                                animate={{ y: ['idle', 'attention'].includes(agentState) ? [0, -6, 0] : [0, -2, 0] }}
                                transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }}
                            >
                                <svg viewBox="0 0 180 145" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                    <defs>
                                        <linearGradient id="robotChassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#1e293b" />
                                            <stop offset="100%" stopColor="#0f172a" />
                                        </linearGradient>
                                        <radialGradient id="eyeLumenGlow" cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor="#ffffff" />
                                            <stop offset="40%" stopColor={agentState === 'attention' ? '#ef4444' : agentState === 'thinking' ? '#f59e0b' : '#06b6d4'} />
                                            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                                        </radialGradient>
                                    </defs>
                                    <rect x="20" y="10" width="140" height="120" rx="28" fill="none" style={{ filter: `drop-shadow(0 0 20px ${expression.glowColor})` }} />
                                    <rect x="16" y="6" width="148" height="128" rx="32" fill="url(#robotChassisGrad)" stroke="#334155" strokeWidth="2" />
                                    <rect x="24" y="14" width="132" height="112" rx="22" fill="#020617" />
                                    <g transform="translate(56, 60)">
                                        <motion.ellipse cx="0" cy="0" rx="13" ry="13" fill="url(#eyeLumenGlow)" animate={{ scaleY: isBlinking ? 0 : expression.eyeScaleY }} />
                                    </g>
                                    <g transform="translate(124, 60)">
                                        <motion.ellipse cx="0" cy="0" rx="13" ry="13" fill="url(#eyeLumenGlow)" animate={{ scaleY: isBlinking ? 0 : expression.eyeScaleY }} />
                                    </g>
                                    <g transform="translate(90, 102)">
                                        {expression.mouthType === "smile" && <path d="M -10,-2 Q 0,6 10,-2" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />}
                                        {expression.mouthType === "neutral" && <line x1="-8" y1="0" x2="8" y2="0" stroke={agentState === 'attention' ? '#ef4444' : '#38bdf8'} strokeWidth="3" strokeLinecap="round" />}
                                        {expression.mouthType === "thinking" && <motion.line x1="-6" y1="0" x2="6" y2="0" stroke="#f59e0b" strokeWidth="3" animate={{ scaleX: [0.7, 1.2, 0.7] }} transition={{ repeat: Infinity, duration: 1.2 }} />}
                                    </g>
                                </svg>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: OPERATOR INTERACTIVE COMMAND CONSOLE */}
                <div className="panel-pane interaction-stream-panel">
                    <div className="console-workspace-wrapper">
                        <div className="workspace-header">
                            <FiTerminal /> <h4>OPERATOR SCHEDULING INTERFACE</h4>
                        </div>

                        <div className="alert-inspection-deck">
                            <h5>Selected Risk Ingestion Node</h5>
                            <div className="alerts-vertical-container">
                                {systemAlerts.length === 0 ? (
                                    <p className="fallback-txt">// No active telemetry alerts logged in buffer queue...</p>
                                ) : (
                                    systemAlerts.map(alert => (
                                        <div
                                            key={alert.id}
                                            ref={selectedAlert?.id === alert.id ? activeAlertRef : null}
                                            className={`alert-selection-row ${selectedAlert?.id === alert.id ? 'active' : ''}`}
                                            onClick={() => !isLoading && setSelectedAlert(alert)}
                                        >
                                            <div className="badge-side"><FiAlertTriangle className={`ico-${alert.severity}`} /></div>
                                            <div className="info-side">
                                                <div className="top-line"><strong>{alert.id}</strong> — <span className="comp-lbl">{alert.component}</span></div>
                                                <div className="bot-line">{alert.issue}</div>
                                            </div>
                                            <span className="time-lbl">{alert.timestamp}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Pipeline Screen Terminal Output */}
                        <div
                            className="pipeline-terminal-output custom-machine-screen"
                            style={{ backgroundImage: `url(${machineScreenBg})` }}
                        >
                            <h5><FiSliders /> Real-Time Core Pipeline Logs</h5>
                            <div className="terminal-log-scroller">
                                {pipelineProgress.length === 0 ? (
                                    <p className="fallback-txt">// System awaiting operator deployment pipeline initialization...</p>
                                ) : (
                                    pipelineProgress.map((step, idx) => (
                                        <div key={idx} className="terminal-line">
                                            <span className="timestamp">[{step.timestamp}]</span>
                                            <span className="chevron"> &gt;&gt; </span>
                                            <span className="msg">{step.message}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="console-actions-housing">
                            <button
                                className="action-trigger-btn primary deployment-btn"
                                onClick={executeMaintenancePipeline}
                                disabled={!selectedAlert || isLoading}
                            >
                                <FiZap /> SEND TO AGENT CORE & RUN PIPELINE
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: REAL-TIME PRESCRIPTIVE CONTEXT */}
                <div className="panel-pane context-memory-panel">
                    <div className="panel-header-sub">
                        <h3><FiBookmark /> Prescriptive Inference Matrix</h3>
                    </div>

                    {activeMemory ? (
                        <div className="memory-scroller">
                            <div className="memory-card action-plan-card">
                                <h4><FiTool /> Prescriptive Steps</h4>
                                <ol className="action-step-list">
                                    {activeMemory.recommended_steps?.map((step, i) => <li key={i}>{step}</li>)}
                                </ol>
                                <div className="meta-metrics-grid">
                                    <div>
                                        <span className="meta-lbl"><FiClock /> Target MTTR</span>
                                        <span className="meta-val">{activeMemory.estimated_time}</span>
                                    </div>
                                    <div>
                                        <span className="meta-lbl"><FiShield /> Unit Assign</span>
                                        <span className="meta-val text-truncate">{activeMemory.department}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="memory-card inventory-validation-card">
                                <h4><FiPackage /> Logistics Inventory Verification</h4>
                                <div className="parts-allocation-list">
                                    <div><strong>Authorized Tools:</strong> {activeMemory.required_tools?.join(', ') || "Standard Kit"}</div>
                                    <div className="margin-top-xs"><strong>Required Assemblies:</strong> {activeMemory.required_parts?.join(', ') || "None"}</div>
                                </div>
                                <div className="inventory-status-bar status-ok">
                                    <FiDatabase /> Depot Status: {activeMemory.inventory_status}
                                </div>
                            </div>

                            <div className="quick-actions-grid">
                                <button className="action-trigger-btn primary"><FiClipboard /> Deploy Work Order ({activeMemory.work_order})</button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state-fallback">
                            <FiLayers className="fallback-ico" />
                            <p>No active operational data context loaded. Trigger a pipeline sequence execution to generate target engineering parameters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}