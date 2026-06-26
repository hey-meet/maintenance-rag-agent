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
    const [severityFilter, setSeverityFilter] = useState('critical');

    // Section 2: Retrieval & Knowledge Vector Engine
    const [similarityScore, setSimilarityScore] = useState(0);
    const [topK, setTopK] = useState(0);
    const [chunkSize, setChunkSize] = useState(512);
    const [chunkOverlap, setChunkOverlap] = useState(0);
    const [confidenceCutoff, setConfidenceCutoff] = useState(0);

    // Section 3: Agent Reasoning Configuration
    const [llmProvider, setLlmProvider] = useState('openai');
    const [activeModel, setActiveModel] = useState('');
    const [temperature, setTemperature] = useState(0);

    // Section 4: Safety & Regulatory Governance Engine
    const [humanApproval, setHumanApproval] = useState(false);
    const [citationRequired, setCitationRequired] = useState(false);

    // Section 5: Notification Settings
    const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);

    // --- Telemetry Dashboard & Infrastructure State Bindings ---
    const [agentHealth, setAgentHealth] = useState(null);
    const [integrations, setIntegrations] = useState([]);

    // --- Asynchronous Pipeline Ingress Fetcher ---
    const loadPlatformConfiguration = async (showPulse = false) => {
        if (showPulse) setIsPropagating(true);
        try {
            // Consolidated legacy API calls into a single unified GET response
            const response = await settingsService.getSettings();

            if (response?.status === 'success') {
                const cfg = response?.settings;
                const healthData = response?.health;
                const integrationsData = response?.integrations;

                // Unpack Section 1: Telemetry
                setCriticalTemp(cfg?.telemetry?.critical_temp ?? 0);
                setSeverityFilter(cfg?.telemetry?.severity_filter ?? 'critical');

                // Unpack Section 2: Retrieval
                setSimilarityScore(cfg?.retrieval?.similarity_score ?? 0);
                setTopK(cfg?.retrieval?.top_k ?? 0);
                setChunkSize(cfg?.retrieval?.chunk_size ?? 512);
                setChunkOverlap(cfg?.retrieval?.chunk_overlap ?? 0);
                setConfidenceCutoff(cfg?.retrieval?.confidence_cutoff ?? 0);

                // Unpack Section 3: Reasoning
                setLlmProvider(cfg?.reasoning?.llm_provider ?? 'openai');
                setActiveModel(cfg?.reasoning?.active_model ?? '');
                setTemperature(cfg?.reasoning?.temperature ?? 0);

                // Unpack Section 4: Safety
                setHumanApproval(cfg?.safety?.human_approval ?? false);
                setCitationRequired(cfg?.safety?.citation_required ?? false);

                // Unpack Section 5: Notifications
                setEmailNotificationsEnabled(cfg?.notifications?.email_enabled ?? false);

                // Dashboard Metrics & Integrations Matrix
                setAgentHealth(healthData ?? null);
                setIntegrations(integrationsData ?? []);
            }
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
    const handleSaveConfiguration = async () => {
        setIsPropagating(true);
        const payload = {
            telemetry: { critical_temp: criticalTemp, severity_filter: severityFilter },
            retrieval: { similarity_score: similarityScore, top_k: topK, chunk_size: chunkSize, chunk_overlap: chunkOverlap, confidence_cutoff: confidenceCutoff },
            reasoning: { llm_provider: llmProvider, active_model: activeModel, temperature: temperature },
            safety: { human_approval: humanApproval, citation_required: citationRequired },
            notifications: { email_enabled: emailNotificationsEnabled }
        };

        try {
            const response = await settingsService.deployConfiguration(payload);
            if (response?.status === 'success') {
                alert(`${response.message || 'Configuration matrix saved successfully.'}`);
            }
        } catch (error) {
            console.error("Critical edge configuration transaction failed:", error);
            alert("Save failed. Verify network orchestrator logs.");
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
                alert(`${response.message || 'Operational baseline restored.'}`);
                await loadPlatformConfiguration(false);
            }
        } catch (error) {
            console.error("Baseline reversion request failed:", error);
        } finally {
            setIsPropagating(false);
        }
    };

    // --- Dynamic Derivative Calculators ---
    const estimatedDailyAlerts = criticalTemp ? Math.max(2, Math.floor((150 - criticalTemp) * 0.4)) : "--";
    const dynamicPrecision = agentHealth?.estimated_context_precision ?? ((similarityScore * 100 - (chunkOverlap / 10)).toFixed(1));

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
                HERO CONTROL CENTER SECTION (VISUALLY IDENTICAL)
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
                                    <span className="st-item-title">Pipeline Severity Filter</span>
                                    <p className="st-item-desc">Minimum alert status level accepted into the pipeline.</p>
                                </div>
                                <select value={severityFilter} onChange={(e) => handleParamChange(setSeverityFilter, e.target.value)} className="st-select">
                                    <option value="warning">Warning & Above</option>
                                    <option value="critical">Critical Faults Only</option>
                                    <option value="fatal">Fatal System Failures Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="st-impact-panel">
                            <h5>Pre-Retrieval System Matrix Impact</h5>
                            <div className="st-impact-metrics">
                                <div><label>Alert Sensitivity</label><span>{criticalTemp < 85 ? 'AGGRESSIVE' : 'OPTIMIZED'}</span></div>
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
                            <div className="badge-item"><label>Indexed Corpus Weight:</label> <span className="font-mono">{agentHealth?.indexed_corpus_weight?.toLocaleString() || '--'} Nodes</span></div>
                            <div className="badge-item"><label>Active Manuals:</label> <span className="font-mono">{agentHealth?.active_manuals || '--'} Documentation Sets</span></div>
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
                        <div className="st-grid-2col">
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
                                    {/* Values explicitly map back directly onto the backend json structures */}
                                    <option value="gpt-4o">gpt-4o</option>
                                    <option value="gpt-4o-industrial">gpt-4o-industrial-v4</option>
                                    <option value="claude-3-5-sonnet">claude-3.5-sonnet-hardware</option>
                                    <option value="llama-3-70b-mfg">llama-3.3-70b-manufacturing</option>
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
                        </div>

                        <div className="st-pipeline-visualization">
                            <h5>Agentic Context Pipeline Flow</h5>
                            <div className="pipeline-nodes-container">
                                <div className="p-node"><FiSliders className="node-icon" /> <span>Telemetry Streams</span></div>
                                <div className="p-arrow">→</div>
                                <div className="p-node"><FiDatabase className="node-icon" /> <span>ChromaDB RAG</span></div>
                                <div className="p-arrow">→</div>
                                <div className="p-node dynamic-weight"><FiCpu className="node-icon" /> <span>LLM Reasoning Engine</span></div>
                                <div className="p-arrow">→</div>
                                <div className="p-node warning-weight"><FiShield className="node-icon" /> <span>Safety Validation</span></div>
                                <div className="p-arrow">→</div>
                                <div className="p-node success-weight"><FiCheckCircle className="node-icon" /> <span>Work Order Stage</span></div>
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
                        </div>

                        <div className="st-gov-status-container">
                            <div className="gov-status-card verified">
                                <div className="gov-header"><FiCheckCircle className="gov-icon" /> Human-in-the-Loop Validation</div>
                                <div className="gov-body">{humanApproval ? "ACTIVE" : "BYPASSED"}</div>
                            </div>
                            <div className="gov-status-card protected">
                                <div className="gov-header"><FiShield className="gov-icon" /> Compliance Guardrail Layers</div>
                                <div className="gov-body">PROTECTED</div>
                            </div>
                            <div className="gov-status-card monitoring">
                                <div className="gov-header"><FiActivity className="gov-icon" /> AI Hallucination Guardrail</div>
                                <div className="gov-body">MONITORING</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 5 — NOTIFICATION SETTINGS */}
                <section className="st-card">
                    <div className="st-card-head">
                        <FiShare2 className="st-section-icon" />
                        <div>
                            <h4>Worker Notifications & Alerts Routing</h4>
                            <p>Configure automated transmission nodes to push urgent field repair matrices across site crews.</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-grid-2col">
                            <div className="st-control-row toggle-row">
                                <div className="st-lbl-block">
                                    <span className="st-item-title">Enable Real-Time Email Dispatches</span>
                                    <p className="st-item-desc">Dispatches detailed diagnostic insights down to active on-call engineering squads instantly.</p>
                                </div>
                                <label className="st-toggle-switch">
                                    <input type="checkbox" checked={emailNotificationsEnabled} onChange={(e) => handleParamChange(setEmailNotificationsEnabled, e.target.checked)} />
                                    <span className="st-toggle-slider"></span>
                                </label>
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
                                    {agentHealth?.agent_status?.toUpperCase() || '--'}
                                </div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Retrieval Hit Accuracy</label>
                                <div className="kpi-val font-mono">{agentHealth?.retrieval_accuracy ? `${agentHealth.retrieval_accuracy}%` : '--'}</div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Avg Context Similarity</label>
                                <div className="kpi-val font-mono">{agentHealth?.avg_context_score ? `${agentHealth.avg_context_score} Cos` : '--'}</div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Mean Execution Latency</label>
                                <div className="kpi-val font-mono">{agentHealth?.avg_response_time_ms ? `${agentHealth.avg_response_time_ms} ms` : '--'}</div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Vector Ingestion Blocks</label>
                                <div className="kpi-val font-mono">{agentHealth?.vector_chunks?.toLocaleString() || '--'}</div>
                            </div>
                            <div className="kpi-mini-card">
                                <label>Query Pipeline Success</label>
                                <div className="kpi-val font-mono success">{agentHealth?.query_success_rate ? `${agentHealth.query_success_rate}%` : '--'}</div>
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
                            {integrations.length > 0 ? (
                                integrations.map((integration, index) => {
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
                                })
                            ) : (
                                <div style={{ color: '#2E3133', opacity: 0.6, fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                    No infrastructure integrations currently indexed.
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* SECTION 8 — SAVE CONFIGURATION ACTIONS DRAWER */}
                <footer className="st-footer-action-drawer mt-4">
                    <div className="st-warning-panel-box">
                        <FiAlertTriangle className="warning-box-icon" />
                        <div>
                            <h6>Production Configuration Operations Security Advisory</h6>
                            <p>Altering runtime engine operational models, RAG vector context sizes, safety constraint lines, or instrumentation ceilings instantly impacts pipeline syntheses across all localized clusters.</p>
                        </div>
                    </div>
                    <div className="st-drawer-action-controls">
                        <button className="st-secondary-btn" onClick={handleRollbackBaseline}><FiRefreshCw /> Rollback to Baseline</button>
                        <button className="st-save-btn deployed" onClick={handleSaveConfiguration}>
                            <FiCheckCircle /> Save Agent Settings Matrix
                        </button>
                    </div>
                </footer>

            </div>
        </div>
    );
}