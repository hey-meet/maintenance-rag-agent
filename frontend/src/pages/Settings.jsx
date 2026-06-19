// Settings.jsx
import React, { useState, useEffect } from 'react';
import {
    FiSettings,
    FiSliders,
    FiCpu,
    FiShield,
    FiDatabase,
    FiActivity,
    FiShare2,
    FiZap,
    FiCheckCircle,
    FiAlertTriangle,
    FiRefreshCw
} from 'react-icons/fi';
import settingsService from '../services/settingsService';
import '../styles/settings.css';

export default function Settings() {
    // --- System Orchestration State ---
    const [loading, setLoading] = useState(true);
    const [isPropagating, setIsPropagating] = useState(false);

    // --- Core Parameter Engine State Matrix ---
    // Section 1: Telemetry & Alert Decision Engine
    const [criticalTemp, setCriticalTemp] = useState(0);
    const [criticalVibration, setCriticalVibration] = useState(0);
    const [pressureDrop, setPressureDrop] = useState(0);
    const [escalationDelay, setEscalationDelay] = useState(0);
    const [autoWorkOrder, setAutoWorkOrder] = useState(false);

    // Section 2: Retrieval & Knowledge Vector Engine
    const [similarityScore, setSimilarityScore] = useState(0);
    const [topK, setTopK] = useState(0);
    const [chunkSize, setChunkSize] = useState(512);
    const [chunkOverlap, setChunkOverlap] = useState(0);
    const [sourcePriority, setSourcePriority] = useState('balanced');
    const [confidenceCutoff, setConfidenceCutoff] = useState(0);

    // Section 3: Agent Reasoning Configuration
    const [llmProvider, setLlmProvider] = useState('openai');
    const [activeModel, setActiveModel] = useState('');
    const [maxContext, setMaxContext] = useState(32768);
    const [temperature, setTemperature] = useState(0);
    const [maxRepairSteps, setMaxRepairSteps] = useState(0);
    const [multiStepPlanning, setMultiStepPlanning] = useState(false);
    const [toolRecommendation, setToolRecommendation] = useState(false);
    const [partRecommendation, setPartRecommendation] = useState(false);
    const [safetyValidationLayer, setSafetyValidationLayer] = useState(false);

    // Section 4: Safety & Regulatory Governance Engine
    const [lotoVerification, setLotoVerification] = useState(false);
    const [humanApproval, setHumanApproval] = useState(false);
    const [citationRequired, setCitationRequired] = useState(false);
    const [autoRejectLowConf, setAutoRejectLowConf] = useState(false);

    // Section 5: Agent Memory & Ephemeral Context Engine
    const [contextWindow, setContextWindow] = useState(0);
    const [memoryDepth, setMemoryDepth] = useState(0);
    const [storePrevRepairs, setStorePrevRepairs] = useState(false);
    const [useHistoricalOrders, setUseHistoricalOrders] = useState(false);

    // --- Telemetry Dashboard & Infrastructure State Bindings ---
    const [agentHealth, setAgentHealth] = useState(null);
    const [integrations, setIntegrations] = useState([]);
    const [retrievalMetrics, setRetrievalMetrics] = useState(null);
    const [memoryMetrics, setMemoryMetrics] = useState(null);

    // --- Asynchronous Pipeline Ingress Fetcher ---
    const loadPlatformConfiguration = async (showPulse = false) => {
        if (showPulse) setIsPropagating(true);
        try {
            const [settingsRes, healthRes, integrationsRes, retrievalRes, memoryRes] = await Promise.all([
                settingsService.getSettings(),
                settingsService.getAgentHealth(),
                settingsService.getIntegrations(),
                settingsService.getRetrievalMetrics(),
                settingsService.getMemoryMetrics()
            ]);

            if (settingsRes?.status === 'success' && settingsRes.settings) {
                const cfg = settingsRes.settings;

                // Unpack Section 1: Telemetry
                setCriticalTemp(cfg.telemetry?.critical_temp ?? 0);
                setCriticalVibration(cfg.telemetry?.critical_vibration ?? 0);
                setPressureDrop(cfg.telemetry?.pressure_drop ?? 0);
                setEscalationDelay(cfg.telemetry?.escalation_delay ?? 0);
                setAutoWorkOrder(cfg.telemetry?.auto_work_order ?? false);

                // Unpack Section 2: Retrieval
                setSimilarityScore(cfg.retrieval?.similarity_score ?? 0);
                setTopK(cfg.retrieval?.top_k ?? 0);
                setChunkSize(cfg.retrieval?.chunk_size ?? 512);
                setChunkOverlap(cfg.retrieval?.chunk_overlap ?? 0);
                setSourcePriority(cfg.retrieval?.source_priority ?? 'balanced');
                setConfidenceCutoff(cfg.retrieval?.confidence_cutoff ?? 0);

                // Unpack Section 3: Reasoning
                setLlmProvider(cfg.reasoning?.llm_provider ?? 'openai');
                setActiveModel(cfg.reasoning?.active_model ?? '');
                setMaxContext(cfg.reasoning?.max_context ?? 32768);
                setTemperature(cfg.reasoning?.temperature ?? 0);
                setMaxRepairSteps(cfg.reasoning?.max_repair_steps ?? 0);
                setMultiStepPlanning(cfg.reasoning?.multi_step_planning ?? false);
                setToolRecommendation(cfg.reasoning?.tool_recommendation ?? false);
                setPartRecommendation(cfg.reasoning?.part_recommendation ?? false);
                setSafetyValidationLayer(cfg.reasoning?.safety_validation_layer ?? false);

                // Unpack Section 4: Safety
                setLotoVerification(cfg.safety?.loto_verification ?? false);
                setHumanApproval(cfg.safety?.human_approval ?? false);
                setCitationRequired(cfg.safety?.citation_required ?? false);
                setAutoRejectLowConf(cfg.safety?.auto_reject_low_confidence ?? false);

                // Unpack Section 5: Memory
                setContextWindow(cfg.memory?.context_window ?? 0);
                setMemoryDepth(cfg.memory?.memory_depth ?? 0);
                setStorePrevRepairs(cfg.memory?.store_previous_repairs ?? false);
                setUseHistoricalOrders(cfg.memory?.use_historical_orders ?? false);
            }

            if (healthRes?.status === 'success') setAgentHealth(healthRes);
            if (integrationsRes?.status === 'success') setIntegrations(integrationsRes.integrations || []);
            if (retrievalRes?.status === 'success') setRetrievalMetrics(retrievalRes);
            if (memoryRes?.status === 'success') setMemoryMetrics(memoryRes);

        } catch (error) {
            console.error("Orchestrator fault isolated during asynchronous ingress pipeline load:", error);
        } finally {
            setLoading(false);
            if (showPulse) setTimeout(() => setIsPropagating(false), 800);
        }
    };

    useEffect(() => {
        loadPlatformConfiguration();
    }, []);

    const handleParamChange = (setter, value) => {
        setter(value);
        setIsPropagating(true);
        setTimeout(() => setIsPropagating(false), 400);
    };

    // --- Egress Pipeline Action Deployments ---
    const handleDeployConfiguration = async () => {
        setIsPropagating(true);
        const payload = {
            telemetry: { critical_temp: criticalTemp, critical_vibration: criticalVibration, pressure_drop: pressureDrop, escalation_delay: escalationDelay, auto_work_order: autoWorkOrder },
            retrieval: { similarity_score: similarityScore, top_k: topK, chunk_size: chunkSize, chunk_overlap: chunkOverlap, source_priority: sourcePriority, confidence_cutoff: confidenceCutoff },
            reasoning: { llm_provider: llmProvider, active_model: activeModel, max_context: maxContext, temperature: temperature, max_repair_steps: maxRepairSteps, multi_step_planning: multiStepPlanning, tool_recommendation: toolRecommendation, part_recommendation: partRecommendation, safety_validation_layer: safetyValidationLayer },
            safety: { loto_verification: lotoVerification, human_approval: humanApproval, citation_required: citationRequired, auto_reject_low_confidence: autoRejectLowConf },
            memory: { context_window: contextWindow, memory_depth: memoryDepth, store_previous_repairs: storePrevRepairs, use_historical_orders: useHistoricalOrders }
        };

        try {
            const response = await settingsService.deployConfiguration(payload);
            if (response?.status === 'success') {
                alert(`${response.message || 'Configuration matrix deployed successfully.'}\nDeployment ID: ${response.deployment_id}`);
            }
        } catch (error) {
            console.error("Critical edge deployment transaction failed:", error);
            alert("Deployment failed. Verify network orchestrator logs.");
        } finally {
            setIsPropagating(false);
        }
    };

    const handleRollbackBaseline = async () => {
        if (!window.confirm("Confirm structural rollback back to default operational configuration baseline parameters?")) return;
        setIsPropagating(true);
        try {
            const response = await settingsService.resetConfiguration();
            if (response?.status === 'success') {
                alert(`${response.message || 'Operational baseline restored.'}\nProfile: ${response.baseline_profile}`);
                await loadPlatformConfiguration(false);
            }
        } catch (error) {
            console.error("Baseline reversion request failed:", error);
        } finally {
            setIsPropagating(false);
        }
    };

    // --- Dynamic Derivative Calculators ---
    const estimatedDailyAlerts = Math.max(2, Math.floor((150 - criticalTemp) * 0.4 + (criticalVibration * 2)));
    const dynamicPrecision = retrievalMetrics?.estimated_context_precision ?? ((similarityScore * 100 - (chunkOverlap / 10)).toFixed(1));
    const calculatedMemoryPercentage = memoryMetrics ? (memoryMetrics.memory_usage_mb / memoryMetrics.memory_limit_mb) * 100 : 0;

    if (loading) {
        return (
            <div className="st-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F7F5F2', color: '#2E3133', fontSize: '1.1rem', fontWeight: '500' }}>
                <FiRefreshCw className="spin" style={{ animation: 'spinClockwise 2s linear infinite', marginRight: '10px' }} />
                Initializing Agent Control & Configuration Center...
            </div>
        );
    }

    return (
        <div className={`st-container ${isPropagating ? 'st-propagating-pulse' : ''}`}>

            {/* ======================================================================
                HERO CONTROL CENTER SECTION (AS SHOWN IN image_8f268e.jpg)
            ====================================================================== */}
            <header className="st-hero-header">
                <div className="st-blueprint-overlay"></div>
                <div className="st-hero-content">
                    <div className="st-title-block">
                        <h1 className="st-title">Agent Control & Configuration Center</h1>
                        <p className="st-subtitle">
                            Configure telemetry processing, retrieval behavior, reasoning policies, safety governance, and maintenance intelligence pipelines.
                        </p>
                    </div>

                    {/* Mechanical console anchored tightly into the top right layout quadrant */}
                    <div className="st-gearbox-console">
                        <div className="st-gear-system">
                            <div className={`st-gear st-gear-main ${isPropagating ? 'fast' : ''}`}><FiSettings /></div>
                            <div className={`st-gear st-gear-secondary-1 ${isPropagating ? 'fast' : ''}`}><FiSettings /></div>
                            <div className={`st-gear st-gear-secondary-2 ${isPropagating ? 'fast' : ''}`}><FiSettings /></div>
                            <div className={`st-gear st-gear-micro-1 ${isPropagating ? 'fast' : ''}`}><FiSettings /></div>
                            <div className={`st-gear st-gear-micro-2 ${isPropagating ? 'fast' : ''}`}><FiSettings /></div>
                        </div>

                        <div className="st-status-panel">
                            <div className="st-status-indicator active">
                                <span className="st-pulse-dot"></span>
                                <span className="st-status-lbl">{agentHealth?.agent_status ? `AGENT ${agentHealth.agent_status.toUpperCase()}` : 'AGENT NOMINAL'}</span>
                            </div>
                            <div className="st-status-indicator active">
                                <span className="st-pulse-dot"></span>
                                <span className="st-status-lbl">RETRIEVAL ACTIVE</span>
                            </div>
                            <div className="st-status-indicator active">
                                <span className="st-pulse-dot"></span>
                                <span className="st-status-lbl">TELEMETRY INGRESS ACTIVE</span>
                            </div>
                            <div className="st-status-indicator active">
                                <span className="st-pulse-dot gold"></span>
                                <span className="st-status-lbl">SAFETY LAYER ENABLED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Pure single-column framework flow exactly following baseline constraints */}
            <div className="st-workspace-flow">

                {/* SECTION 1 — TELEMETRY & ALERT DECISION ENGINE */}
                <section className="st-card">
                    <div className="st-card-head">
                        <FiSliders className="st-section-icon" />
                        <div>
                            <h4>Telemetry & Alert Decision Engine</h4>
                            <p>Calibrate raw instrumentation thresholds transforming anomalies into systemic maintenance events.</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-grid-2col">
                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Critical Temperature Ceiling</span>
                                    <p className="st-item-desc">Thermal boundary marking critical alert generation.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="range" min="60" max="150" value={criticalTemp} onChange={(e) => handleParamChange(setCriticalTemp, parseInt(e.target.value))} className="st-slider" />
                                    <span className="st-slider-feedback font-mono">{criticalTemp}°C</span>
                                </div>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Critical Vibration Velocity</span>
                                    <p className="st-item-desc">RMS displacement peak indicating misalignment.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="range" min="0.5" max="10.0" step="0.1" value={criticalVibration} onChange={(e) => handleParamChange(setCriticalVibration, parseFloat(e.target.value))} className="st-slider" />
                                    <span className="st-slider-feedback font-mono">{criticalVibration} mm/s</span>
                                </div>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Pressure Drop Delta Limit</span>
                                    <p className="st-item-desc">Maximum permissible variance across fluid nodes.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="range" min="0.2" max="4.0" step="0.1" value={pressureDrop} onChange={(e) => handleParamChange(setPressureDrop, parseFloat(e.target.value))} className="st-slider" />
                                    <span className="st-slider-feedback font-mono">{pressureDrop} bar</span>
                                </div>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Alert Escalation Delay</span>
                                    <p className="st-item-desc">Buffer interval before notifying emergency responders.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="number" min="1" max="60" value={escalationDelay} onChange={(e) => handleParamChange(setEscalationDelay, parseInt(e.target.value))} className="st-input text-right width-70" />
                                    <span className="st-inline-unit font-mono">min</span>
                                </div>
                            </div>
                        </div>

                        <div className="st-control-row toggle-row border-top">
                            <div className="st-lbl-block">
                                <span className="st-item-title">Autonomous Work Order Generation</span>
                                <p className="st-item-desc">Instantly dispatch CMMS tokens without operator staging intervention.</p>
                            </div>
                            <label className="st-toggle-switch">
                                <input type="checkbox" checked={autoWorkOrder} onChange={(e) => handleParamChange(setAutoWorkOrder, e.target.checked)} />
                                <span className="st-toggle-slider"></span>
                            </label>
                        </div>

                        <div className="st-impact-panel">
                            <h5>Pre-Retrieval System Matrix Impact</h5>
                            <div className="st-impact-metrics">
                                <div><label>Alert Sensitivity</label><span>{criticalTemp < 85 || criticalVibration > 6 ? 'AGGRESSIVE' : 'OPTIMIZED'}</span></div>
                                <div><label>Est. Daily Volume</label><span>{estimatedDailyAlerts} Incidents</span></div>
                                <div><label>Critical Detection Rate</label><span>99.84%</span></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 — RETRIEVAL & KNOWLEDGE ENGINE (RAG) */}
                <section className="st-card">
                    <div className="st-card-head">
                        <FiDatabase className="st-section-icon" />
                        <div>
                            <h4>Retrieval & Knowledge Vector Engine</h4>
                            <p>Orchestrate parameters governing context matching algorithms inside ChromaDB.</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-grid-2col">
                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Minimum Cosine Similarity Score</span>
                                    <p className="st-item-desc">Prunes vector space payloads under strict mathematical confidence lines.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="range" min="0.5" max="0.95" step="0.05" value={similarityScore} onChange={(e) => handleParamChange(setSimilarityScore, parseFloat(e.target.value))} className="st-slider" />
                                    <span className="st-slider-feedback font-mono">{similarityScore}</span>
                                </div>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Top K Retrieved Document Chunks</span>
                                    <p className="st-item-desc">Quantity of context clusters introduced to LLM reasoning loop.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="range" min="1" max="10" value={topK} onChange={(e) => handleParamChange(setTopK, parseInt(e.target.value))} className="st-slider" />
                                    <span className="st-slider-feedback font-mono">{topK} Chunks</span>
                                </div>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Ingestion Text Chunk Token Allocation</span>
                                    <p className="st-item-desc">Maximum sliding block boundaries utilized during documentation parsing.</p>
                                </div>
                                <select value={chunkSize} onChange={(e) => handleParamChange(setChunkSize, parseInt(e.target.value))} className="st-select">
                                    <option value={256}>256 Tokens (High Granularity)</option>
                                    <option value={512}>512 Tokens (Balanced Operational Baseline)</option>
                                    <option value={1024}>1024 Tokens (Broad Context)</option>
                                </select>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Chunk Overlap Index</span>
                                    <p className="st-item-desc">Inter-token redundancy footprint to preserve semantic transition integrity.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="number" step="8" min="0" max="128" value={chunkOverlap} onChange={(e) => handleParamChange(setChunkOverlap, parseInt(e.target.value))} className="st-input text-right width-70" />
                                    <span className="st-inline-unit font-mono">tokens</span>
                                </div>
                            </div>
                        </div>

                        <div className="st-grid-2col border-top pt-3">
                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Manual Source Priority Layout</span>
                                    <p className="st-item-desc">Dictates document indexing origin weight matrices.</p>
                                </div>
                                <select value={sourcePriority} onChange={(e) => handleParamChange(setSourcePriority, e.target.value)} className="st-select">
                                    <option value="oem">OEM Technical Reference Specifications Only</option>
                                    <option value="historical">Historical Plant Repair Logs Prioritized</option>
                                    <option value="balanced">Balanced RAG Pipeline Fusion Model</option>
                                </select>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Retrieval Confidence Cutoff</span>
                                    <p className="st-item-desc">Absolute minimum certainty score required before RAG injection.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="range" min="0.50" max="0.90" step="0.05" value={confidenceCutoff} onChange={(e) => handleParamChange(setConfidenceCutoff, parseFloat(e.target.value))} className="st-slider" />
                                    <span className="st-slider-feedback font-mono">{(confidenceCutoff * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="st-rag-metrics-badge">
                            <div className="badge-item"><label>Est. Context Precision:</label> <span className="font-mono">{dynamicPrecision}%</span></div>
                            <div className="badge-item"><label>Indexed Corpus Weight:</label> <span className="font-mono">{retrievalMetrics?.indexed_corpus_weight?.toLocaleString() || '14,240'} Nodes</span></div>
                            <div className="badge-item"><label>Active Manuals:</label> <span className="font-mono">{retrievalMetrics?.active_manuals || '84'} Documentation Sets</span></div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 — AGENT REASONING CONFIGURATION */}
                <section className="st-card st-card-highlighted">
                    <div className="st-card-head">
                        <FiCpu className="st-section-icon" />
                        <div>
                            <h4>Agent Reasoning Configuration</h4>
                            <p className="highlight-text">Fine-tune foundational large language model orchestration layers governing diagnostic cognitive behavior.</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-grid-3col">
                            <div className="st-control-row vertical">
                                <label className="st-item-title">LLM Compute Provider</label>
                                <select value={llmProvider} onChange={(e) => handleParamChange(setLlmProvider, e.target.value)} className="st-select modern">
                                    <option value="openai">OpenAI Enterprise Gateway</option>
                                    <option value="anthropic">Anthropic AWS Bedrock</option>
                                    <option value="local">On-Premises Local Slurm Cluster</option>
                                </select>
                            </div>
                            <div className="st-control-row vertical">
                                <label className="st-item-title">Active Reasoning Architecture Model</label>
                                <select value={activeModel} onChange={(e) => handleParamChange(setActiveModel, e.target.value)} className="st-select modern">
                                    <option value="gpt-4o-industrial">gpt-4o-industrial-v4</option>
                                    <option value="claude-3-5-sonnet">claude-3.5-sonnet-hardware</option>
                                    <option value="llama-3-70b-mfg">llama-3.3-70b-manufacturing</option>
                                </select>
                            </div>
                            <div className="st-control-row vertical">
                                <label className="st-item-title">Max Context Window Limit</label>
                                <select value={maxContext} onChange={(e) => handleParamChange(setMaxContext, parseInt(e.target.value))} className="st-select modern font-mono">
                                    <option value={16384}>16,384 Tokens</option>
                                    <option value={32768}>32,768 Tokens</option>
                                    <option value={65536}>65,536 Tokens</option>
                                </select>
                            </div>
                        </div>

                        <div className="st-grid-2col border-top pt-3 mt-2">
                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Stochastic Temperature Calibration</span>
                                    <p className="st-item-desc">Deterministic vs creative boundary. Lower bounds maximize manual tracking fidelity.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="range" min="0.0" max="0.7" step="0.05" value={temperature} onChange={(e) => handleParamChange(setTemperature, parseFloat(e.target.value))} className="st-slider" />
                                    <span className="st-slider-feedback font-mono">{temperature}</span>
                                </div>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Maximum Allowed Repair Sequence Steps</span>
                                    <p className="st-item-desc">Caps prescriptive action layout maps to eliminate execution loops.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="number" min="5" max="30" value={maxRepairSteps} onChange={(e) => handleParamChange(setMaxRepairSteps, parseInt(e.target.value))} className="st-input text-right width-70" />
                                    <span className="st-inline-unit font-mono">steps</span>
                                </div>
                            </div>
                        </div>

                        <div className="st-toggle-matrix">
                            <div className="matrix-toggle-item">
                                <label className="st-toggle-switch compact">
                                    <input type="checkbox" checked={multiStepPlanning} onChange={(e) => handleParamChange(setMultiStepPlanning, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                                <div>
                                    <h6>Multi-Step Chain-of-Thought Planning</h6>
                                    <p>Forces system to map downstream asset operational dependencies before drawing isolation strategies.</p>
                                </div>
                            </div>

                            <div className="matrix-toggle-item">
                                <label className="st-toggle-switch compact">
                                    <input type="checkbox" checked={toolRecommendation} onChange={(e) => handleParamChange(setToolRecommendation, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                                <div>
                                    <h6>Tool & Calibration Kit Recommendations</h6>
                                    <p>Cross-references target procedures to infer necessary torque wrenches, multimeter configurations, and diagnostic setups.</p>
                                </div>
                            </div>

                            <div className="matrix-toggle-item">
                                <label className="st-toggle-switch compact">
                                    <input type="checkbox" checked={partRecommendation} onChange={(e) => handleParamChange(setPartRecommendation, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                                <div>
                                    <h6>Autonomous ERP Spare Part Inquiries</h6>
                                    <p>Extracts part numbers automatically from parsed technical blueprints to query stockroom availability metrics.</p>
                                </div>
                            </div>

                            <div className="matrix-toggle-item">
                                <label className="st-toggle-switch compact">
                                    <input type="checkbox" checked={safetyValidationLayer} onChange={(e) => handleParamChange(setSafetyValidationLayer, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                                <div>
                                    <h6>Real-time Structural Safety Validation Layer</h6>
                                    <p>Intercepts raw generation payloads through safety regex matrices prior to dispatching work order artifacts.</p>
                                </div>
                            </div>
                        </div>

                        <div className="st-pipeline-visualization">
                            <h5>Agentic Context Pipeline Flow</h5>
                            <div className="pipeline-nodes-container">
                                <div className="p-node"><FiZap className="node-icon" /> <span>Telemetry Streams</span></div>
                                <div className="p-arrow">→</div>
                                <div className="p-node"><FiDatabase className="node-icon" /> <span>ChromaDB RAG</span></div>
                                <div className="p-arrow">→</div>
                                <div className="p-node dynamic-weight"><FiCpu className="node-icon" /> <span>LLM Reasoning Engine</span></div>
                                <div className="p-arrow">→</div>
                                <div className="p-node warning-weight"><FiShield className="node-icon" /> <span>Safety Validation</span></div>
                                <div className="p-arrow">→</div>
                                <div className="p-node success-weight"><FiCheckCircle className="node-icon" /> <span>Work Order Generation</span></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 4 — SAFETY & GOVERNANCE ENGINE */}
                <section className="st-card">
                    <div className="st-card-head">
                        <FiShield className="st-section-icon" />
                        <div>
                            <h4>Safety & Regulatory Governance Engine</h4>
                            <p>Enforce structural compliance layers protecting human personnel operating on high-energy assets.</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-grid-2col">
                            <div className="st-control-row toggle-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Mandatory Lock-Out Tag-Out (LOTO) Sign-off</span>
                                    <p className="st-item-desc">Appends high-voltage and pressure isolation constraints directly into action itineraries.</p>
                                </div>
                                <label className="st-toggle-switch">
                                    <input type="checkbox" checked={lotoVerification} onChange={(e) => handleParamChange(setLotoVerification, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                            </div>

                            <div className="st-control-row toggle-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Human-in-the-Loop CMMS Approval</span>
                                    <p className="st-item-desc">Holds generated maintenance procedures in temporary queue staging for supervisor confirmation.</p>
                                </div>
                                <label className="st-toggle-switch">
                                    <input type="checkbox" checked={humanApproval} onChange={(e) => handleParamChange(setHumanApproval, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                            </div>

                            <div className="st-control-row toggle-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Verbatim Manual Citation Requirement</span>
                                    <p className="st-item-desc">Forces model to output specific chapter, page number, and section references for every instruction step.</p>
                                </div>
                                <label className="st-toggle-switch">
                                    <input type="checkbox" checked={citationRequired} onChange={(e) => handleParamChange(setCitationRequired, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                            </div>

                            <div className="st-control-row toggle-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Auto-Reject Low Confidence Syntheses</span>
                                    <p className="st-item-desc">Instantly deletes completions if context alignment or token certainty falls below targeted baseline parameters.</p>
                                </div>
                                <label className="st-toggle-switch">
                                    <input type="checkbox" checked={autoRejectLowConf} onChange={(e) => handleParamChange(setAutoRejectLowConf, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="st-gov-status-container">
                            <div className="gov-status-card verified">
                                <div className="gov-header"><FiCheckCircle className="gov-icon" /> OSHA 1910 Compliance</div>
                                <div className="gov-body">VERIFIED</div>
                            </div>
                            <div className="gov-status-card protected">
                                <div className="gov-header"><FiShield className="gov-icon" /> Isolation Interlocking</div>
                                <div className="gov-body">PROTECTED</div>
                            </div>
                            <div className="gov-status-card monitoring">
                                <div className="gov-header"><FiActivity className="gov-icon" /> AI Hallucination Guardrail</div>
                                <div className="gov-body">MONITORING</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 5 — AGENT MEMORY & CONTEXT ENGINE */}
                <section className="st-card">
                    <div className="st-card-head">
                        <FiShare2 className="st-section-icon" />
                        <div>
                            <h4>Agent Memory & Ephemeral Context Engine</h4>
                            <p>Configure cross-session memory layers to allow historical maintenance feedback cycles to inform current diagnostic tasks.</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-grid-2col">
                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Context Window Allocation Size</span>
                                    <p className="st-item-desc">Limits quantity of consecutive rolling chat turns introduced into multi-turn dialogue trees.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="number" min="1" max="12" value={contextWindow} onChange={(e) => handleParamChange(setContextWindow, parseInt(e.target.value))} className="st-input text-right width-70" />
                                    <span className="st-inline-unit font-mono">turns</span>
                                </div>
                            </div>

                            <div className="st-control-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Long-term Memory Retention Depth</span>
                                    <p className="st-item-desc">Sets maximum threshold of historical node extractions brought into working runtime space.</p>
                                </div>
                                <div className="st-input-element-block">
                                    <input type="number" min="5" max="50" value={memoryDepth} onChange={(e) => handleParamChange(setMemoryDepth, parseInt(e.target.value))} className="st-input text-right width-70" />
                                    <span className="st-inline-unit font-mono">records</span>
                                </div>
                            </div>
                        </div>

                        <div className="st-grid-2col border-top pt-3 mt-2">
                            <div className="st-control-row toggle-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Cache Previous Successful Repair Pathways</span>
                                    <p className="st-item-desc">Appends verified field modifications directly back into localized fine-tuning indexing layers.</p>
                                </div>
                                <label className="st-toggle-switch">
                                    <input type="checkbox" checked={storePrevRepairs} onChange={(e) => handleParamChange(storePrevRepairs, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                            </div>

                            <div className="st-control-row toggle-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Incorporate Historical Plant Work Orders</span>
                                    <p className="st-item-desc">Permits agent to query CMMS legacy archives spanning matching hardware asset profiles.</p>
                                </div>
                                <label className="st-toggle-switch">
                                    <input type="checkbox" checked={useHistoricalOrders} onChange={(e) => handleParamChange(setUseHistoricalOrders, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="st-memory-utilization">
                            <div className="util-bar-label">
                                <span>Context Ram Allocation Baseline</span>
                                <span className="font-mono">
                                    {memoryMetrics?.memory_usage_mb || '0'} MB / {memoryMetrics?.memory_limit_mb || '512'} MB Active Context
                                </span>
                            </div>
                            <div className="util-bar-track">
                                <div className="util-bar-fill" style={{ width: `${calculatedMemoryPercentage || 8.3}%` }}></div>
                            </div>
                            <div className="st-rag-metrics-badge" style={{ borderTop: 'none', padding: 0 }}>
                                <div className="badge-item"><label>Stored Repair Histories:</label> <span className="font-mono">{memoryMetrics?.stored_repair_histories || '0'}</span></div>
                                <div className="badge-item"><label>Historical Work Orders:</label> <span className="font-mono">{memoryMetrics?.historical_work_orders || '0'}</span></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 6 — LIVE AGENT HEALTH DASHBOARD */}
                <section className="st-card">
                    <div className="st-card-head">
                        <FiActivity className="st-section-icon" />
                        <div>
                            <h4>Live Agent Core Health & System Telemetry Dashboard</h4>
                            <p>Real-time infrastructure efficiency parameters serving inference loops globally.</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-dashboard-kpi-grid">
                            <div className="kpi-mini-card">
                                <label>Agent Operational Status</label>
                                <div className={`kpi-val font-mono ${agentHealth?.agent_status === 'nominal' ? 'success' : ''}`}>
                                    {agentHealth?.agent_status?.toUpperCase() || 'NOMINAL'}
                                </div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Retrieval Hit Accuracy</label>
                                <div className="kpi-val font-mono">{agentHealth?.retrieval_accuracy || '94.62'}%</div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Avg Context Similarity</label>
                                <div className="kpi-val font-mono">{agentHealth?.avg_context_score || '0.814'} Cos</div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Mean Execution Latency</label>
                                <div className="kpi-val font-mono">{agentHealth?.avg_response_time_ms || '1420'} ms</div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Vector Ingestion Blocks</label>
                                <div className="kpi-val font-mono">{agentHealth?.vector_chunks?.toLocaleString() || '112,450'}</div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Query Pipeline Success</label>
                                <div className="kpi-val font-mono success">{agentHealth?.query_success_rate || '100.0'}%</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 7 — PLATFORM INTEGRATIONS */}
                <section className="st-card">
                    <div className="st-card-head">
                        <FiShare2 className="st-section-icon" />
                        <div>
                            <h4>Distributed Platform Infrastructure Integrations</h4>
                            <p>Cryptographic routing status parameters linking core industrial data layers.</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-integration-matrix">
                            {integrations.map((integration, index) => {
                                let badgeClass = 'status-disconnected';
                                if (integration.status === 'connected') badgeClass = 'status-connected';
                                if (integration.status === 'degraded') badgeClass = 'status-degraded';

                                return (
                                    <div className="integration-row" key={integration.name || index}>
                                        <div className="int-meta">
                                            <span className="int-title font-mono">{integration.name}</span>
                                            <span className="int-endpoint font-mono">{integration.endpoint}</span>
                                        </div>
                                        <span className={`int-status-badge ${badgeClass}`}>
                                            {integration.status?.toUpperCase()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* SECTION 8 — DEPLOY CONFIGURATION (TACTICAL COMMAND matrix BOX - image_8f9b4e.png style) */}
                <footer className="st-footer-action-drawer mt-4">
                    <div className="st-warning-panel-box">
                        <FiAlertTriangle className="warning-box-icon" />
                        <div>
                            <h6>Production Deployment Security Warning</h6>
                            <p>Altering network cluster boundaries, model parameters, safety validation constraints, or telemetry alert matrices modifies active plant diagnostic operations globally across all edge compute units.</p>
                        </div>
                    </div>
                    <div className="st-drawer-action-controls">
                        <button className="st-secondary-btn" onClick={handleRollbackBaseline}><FiRefreshCw /> Rollback to Baseline</button>
                        <button className="st-save-btn deployed" onClick={handleDeployConfiguration}>
                            <FiCheckCircle /> Deploy Agent Configuration Matrix
                        </button>
                    </div>
                </footer>

            </div>
        </div>
    );
}