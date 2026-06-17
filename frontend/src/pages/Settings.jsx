// Settings.jsx
import React, { useState } from 'react';
import {
    FiSliders,
    FiCpu,
    FiServer,
    FiUser,
    FiKey,
    FiCheckCircle
} from 'react-icons/fi';
import '../styles/settings.css';

export default function Settings() {
    const [criticalTemp, setCriticalTemp] = useState(95);
    const [chunkSize, setChunkSize] = useState(512);
    const [lotoVerification, setLotoVerification] = useState(true);
    const [vectorMatch, setVectorMatch] = useState(0.75);

    return (
        <div className="st-container">
            <header className="st-header">
                <div>
                    <h1 className="st-title">Settings</h1>
                    <p className="st-subtitle">System hardware parameter configuration, core semantic thresholds, and technician routing permissions</p>
                </div>
            </header>

            <div className="st-workspace-flow">
                {/* Section 1: Alert Threshold Core Controls */}
                <div className="st-card">
                    <div className="st-card-head">
                        <FiSliders className="st-section-icon" />
                        <div>
                            <h4>Hardware Alert Threshold Limits</h4>
                            <p>Calibrate system triggering limits for automated incident response routing</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-control-row">
                            <div className="st-lbl-block">
                                <span className="st-item-title">Max Temperature Ceiling Limit</span>
                                <p className="st-item-desc">Triggers critical severity alert line if sustained across monitored sensor nodes</p>
                            </div>
                            <div className="st-input-element-block">
                                <input
                                    type="range"
                                    min="60"
                                    max="150"
                                    value={criticalTemp}
                                    onChange={(e) => setCriticalTemp(parseInt(e.target.value))}
                                    className="st-slider"
                                />
                                <span className="st-slider-feedback font-mono">{criticalTemp}°C</span>
                            </div>
                        </div>

                        <div className="st-control-row">
                            <div className="st-lbl-block">
                                <span className="st-item-title">Mandatory Lock-Out Tag-Out (LOTO) Sign-off</span>
                                <p className="st-item-desc">Force strict isolation verification checklist items inside work order repair plans</p>
                            </div>
                            <div>
                                <label className="st-toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={lotoVerification}
                                        onChange={(e) => setLotoVerification(e.target.checked)}
                                    />
                                    <span className="st-toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: AI Knowledge Retrieval Configurations */}
                <div className="st-card">
                    <div className="st-card-head">
                        <FiCpu className="st-section-icon" />
                        <div>
                            <h4>AI Knowledge Vector Search Configuration</h4>
                            <p>Tune retrieval-augmented context injection hyperparameters</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-control-row">
                            <div className="st-lbl-block">
                                <span className="st-item-title">Minimum Cosine Similarity Score</span>
                                <p className="st-item-desc">Restricts RAG contexts to document fragments matching above this baseline math confidence limit</p>
                            </div>
                            <div className="st-input-element-block">
                                <input
                                    type="range"
                                    min="0.5"
                                    max="0.95"
                                    step="0.05"
                                    value={vectorMatch}
                                    onChange={(e) => setVectorMatch(parseFloat(e.target.value))}
                                    className="st-slider"
                                />
                                <span className="st-slider-feedback font-mono">{vectorMatch}</span>
                            </div>
                        </div>

                        <div className="st-control-row">
                            <div className="st-lbl-block">
                                <span className="st-item-title">Ingestion Text Chunk Token Allocation</span>
                                <p className="st-item-desc">Maximum character sliding block sizes during structural indexing runs</p>
                            </div>
                            <select
                                value={chunkSize}
                                onChange={(e) => setChunkSize(parseInt(e.target.value))}
                                className="st-select"
                            >
                                <option value={256}>256 Tokens (Dense / High Granularity)</option>
                                <option value={512}>512 Tokens (Balanced Operational Baseline)</option>
                                <option value={1024}>1024 Tokens (Broad Structural Layout)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Personnel Configuration Profile Preferences */}
                <div className="st-card">
                    <div className="st-card-head">
                        <FiUser className="st-section-icon" />
                        <div>
                            <h4>Operator Identity & Communications Routing</h4>
                            <p>Manage terminal display parameters and dispatcher targeting keys</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-form-layout-fields">
                            <div className="st-field-pair">
                                <label>Command Center Callsign Profile</label>
                                <input type="text" defaultValue="Sector 4 Central Terminal Dispatcher" className="st-input" />
                            </div>
                            <div className="st-field-pair">
                                <label>System Alert Core Notification Email Routing</label>
                                <input type="email" defaultValue="maint.ops.s4@industrial-core.internal" className="st-input" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: External API Gateway Integration Matrix */}
                <div className="st-card">
                    <div className="st-card-head">
                        <FiServer className="st-section-icon" />
                        <div>
                            <h4>External Edge API Gateway Configuration</h4>
                            <p>Cryptographic endpoint binding layouts connecting asset SCADA pipelines</p>
                        </div>
                    </div>
                    <div className="st-card-body">
                        <div className="st-control-row">
                            <div className="st-lbl-block">
                                <span className="st-item-title">Enterprise SCADA Stream Ingress Binding</span>
                                <p className="st-item-desc">Active telemetry ingestion endpoint URI</p>
                            </div>
                            <input type="text" defaultValue="https://ingress-edge.s4.industrial-core.internal/v1/telemetry" className="st-input wide font-mono" readOnly />
                        </div>

                        <div className="st-control-row">
                            <div className="st-lbl-block">
                                <span className="st-item-title"><FiKey className="inline-ico" /> System Application Secret Signature Token</span>
                                <p className="st-item-desc">Valid for backend validation security contexts</p>
                            </div>
                            <input type="password" value="••••••••••••••••••••••••••••••••••••••••" className="st-input wide font-mono" readOnly />
                        </div>
                    </div>
                </div>

                {/* System Persist Actions Drawer Panel */}
                <div className="st-footer-action-drawer">
                    <p className="st-drawer-disclaimer">Altering network cluster or hardware trigger points modifies plant monitoring routing automation models globally.</p>
                    <button className="st-save-btn" onClick={() => alert('Operational parameter alterations saved successfully.')}>
                        <FiCheckCircle /> Commit Configurations
                    </button>
                </div>
            </div>
        </div>
    );
}