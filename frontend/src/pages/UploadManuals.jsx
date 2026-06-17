// UploadManuals.jsx
import React, { useState, useEffect } from 'react';
import {
    FiFileText,
    FiCheckCircle,
    FiLoader,
    FiServer,
    FiSliders,
    FiLayers,
    FiLock,
    FiDatabase,
    FiBarChart2,
    FiEye,
    FiAlertTriangle
} from 'react-icons/fi';
import { getManuals } from '../services/manualService';
import '../styles/uploadManuals.css';

export default function UploadManuals() {
    const [manuals, setManuals] = useState([]);
    const [selectedManual, setSelectedManual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dragActive] = useState(false);

    useEffect(() => {
        const fetchManuals = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getManuals();

                if (data && data.status === 'success' && Array.isArray(data.manuals)) {
                    setManuals(data.manuals);
                    if (data.manuals.length > 0) {
                        setSelectedManual(data.manuals[0]);
                    }
                } else {
                    throw new Error('Invalid schema format received from asset registry.');
                }
            } catch (err) {
                setError(err.message || 'Failed to establish connection with RAG cluster.');
            } finally {
                setLoading(false);
            }
        };

        fetchManuals();
    }, []);

    // Knowledge Base KPIs calculations based on database truth state
    const totalManuals = manuals.length;
    const indexedManuals = manuals.filter(m => m.status === 'indexed').length;
    const processingManuals = manuals.filter(m => m.status === 'indexing').length;
    const totalChunks = manuals.reduce((acc, curr) => acc + (curr.total_chunks || 0), 0);

    if (loading) {
        return (
            <div className="doc-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#3A3D3F' }}>
                    <FiLoader className="spin" style={{ fontSize: '2.5rem', color: '#D96C4A' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, letterSpacing: '0.02em' }}>
                        Synchronizing Knowledge Base Ledger Index...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="doc-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div className="upload-form-card" style={{ maxWidth: '500px', width: '100%', alignItems: 'center', textAlign: 'center', borderColor: '#D96C4A', padding: '2rem' }}>
                    <FiAlertTriangle style={{ fontSize: '3rem', color: '#D96C4A', marginBottom: '0.5rem' }} />
                    <h3 className="card-inner-title" style={{ color: '#D96C4A', marginBottom: '0.5rem' }}>Asset Synchronization Fault</h3>
                    <p className="pipeline-desc" style={{ marginBottom: '1.5rem' }}>{error}</p>
                    <button
                        type="button"
                        className="ingest-submit-btn"
                        style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
                        onClick={() => window.location.reload()}
                    >
                        Retry Protocol Pipeline Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="doc-container">
            <header className="doc-header">
                <div>
                    <h1 className="doc-title">Knowledge Base Management</h1>
                    <p className="doc-subtitle">Manage machine manuals, technical documentation, indexed knowledge assets, and RAG ingestion status.</p>
                </div>
            </header>

            {/* Knowledge Base KPIs Dashboard Banner */}
            <div className="kpi-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="kpi-card" style={{ background: 'var(--card-bg, #1a1f2c)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #2e374a)' }}>
                    <span className="lbl" style={{ fontSize: '0.8rem', color: 'var(--text-muted, #8a99ad)', display: 'block', marginBottom: '0.25rem' }}><FiFileText /> Total Manuals</span>
                    <span className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main, #fff)' }}>{totalManuals}</span>
                </div>
                <div className="kpi-card" style={{ background: 'var(--card-bg, #1a1f2c)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #2e374a)' }}>
                    <span className="lbl" style={{ fontSize: '0.8rem', color: 'var(--text-muted, #8a99ad)', display: 'block', marginBottom: '0.25rem' }}><FiCheckCircle style={{ color: '#10b981' }} /> Indexed Manuals</span>
                    <span className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{indexedManuals}</span>
                </div>
                <div className="kpi-card" style={{ background: 'var(--card-bg, #1a1f2c)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #2e374a)' }}>
                    <span className="lbl" style={{ fontSize: '0.8rem', color: 'var(--text-muted, #8a99ad)', display: 'block', marginBottom: '0.25rem' }}><FiLoader className="spin" style={{ color: '#f59e0b' }} /> Processing Manuals</span>
                    <span className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{processingManuals}</span>
                </div>
                <div className="kpi-card" style={{ background: 'var(--card-bg, #1a1f2c)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color, #2e374a)' }}>
                    <span className="lbl" style={{ fontSize: '0.8rem', color: 'var(--text-muted, #8a99ad)', display: 'block', marginBottom: '0.25rem' }}><FiLayers /> Total Chunks</span>
                    <span className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main, #fff)' }}>{totalChunks.toLocaleString()}</span>
                </div>
            </div>

            <div className="doc-workspace">
                <div className="doc-left-side">
                    {/* File Ingestion Workspace Block (Read-Only Locked State for Review Build) */}
                    <form className="upload-form-card" onSubmit={(e) => e.preventDefault()}>
                        <div className={`dropzone-box ${dragActive ? 'drag-target' : ''}`} style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                            <FiLock className="drop-icon" />
                            <div className="drop-text-group">
                                <span className="drop-main">Manual Ingestion Temporarily Locked</span>
                                <span className="drop-sub">New document ingestion will be enabled after AI Agent integration pipeline validation.</span>
                            </div>
                            <input type="file" className="native-input-bypass" id="manualFile" disabled />
                            <label htmlFor="manualFile" className="bypass-label" style={{ pointerEvents: 'none' }}>Upload Disabled during Review</label>
                        </div>

                        <div className="form-meta-row">
                            <div className="input-group">
                                <label className="input-lbl">Target Equipment / Asset Alignment</label>
                                <input type="text" className="cc-input" placeholder="Ingestion pipeline offline" disabled />
                            </div>
                            <div className="input-group">
                                <label className="input-lbl">Manual Category Taxonomy</label>
                                <select className="cc-select" disabled>
                                    <option>Select Option</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-lbl">Document Release Version</label>
                                <input type="text" className="cc-input" placeholder="Locked" disabled />
                            </div>
                        </div>

                        <button type="button" className="ingest-submit-btn" style={{ opacity: 0.5, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled>
                            <FiLock /> Upload Disabled During Review Build
                        </button>
                    </form>

                    {/* Ingested Records Display Grid */}
                    <div className="ingested-list-card">
                        <h3 className="card-inner-title">Knowledge Base Storage Ledger</h3>
                        <div className="list-scroll-wrapper">
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Manual ID</th>
                                        <th>Machine ID</th>
                                        <th>File Name</th>
                                        <th>Manual Type</th>
                                        <th>Pages</th>
                                        <th>Chunks</th>
                                        <th>Status</th>
                                        <th>Upload Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manuals.map((doc) => (
                                        <tr key={doc.manual_id} className={selectedManual?.manual_id === doc.manual_id ? 'active-row' : ''} style={{ cursor: 'pointer' }} onClick={() => setSelectedManual(doc)}>
                                            <td className="font-mono">{doc.manual_id}</td>
                                            <td className="strong">{doc.machine_id}</td>
                                            <td>
                                                <div className="file-cell">
                                                    <FiFileText className="file-cell-icon" />
                                                    <div>
                                                        <span className="f-name">{doc.file_name}</span>
                                                        <span className="f-meta font-mono">Rev {doc.version}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="type-lbl">{doc.manual_type}</span></td>
                                            <td className="font-mono">{doc.pages}</td>
                                            <td className="font-mono">{doc.indexed_chunks} / {doc.total_chunks}</td>
                                            <td>
                                                <div className="status-cell">
                                                    {doc.status === 'indexed' ? (
                                                        <span className="p-badge done"><FiCheckCircle /> Vectorized</span>
                                                    ) : (
                                                        <span className="p-badge loading"><FiLoader className="spin" /> Computing</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="f-meta">{doc.upload_date}</td>
                                            <td>
                                                <button type="button" className="bypass-label" style={{ padding: '2px 8px', margin: 0, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FiEye /> Inspect
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {manuals.length === 0 && (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted, #8a99ad)' }}>
                                                No factory documentation resolved inside data/manuals path storage targets.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* pipeline tracing configuration panel */}
                <div className="doc-right-panel">
                    {/* Inspector Block & RAG Verification Section */}
                    {selectedManual && (
                        <div className="pipeline-sticky-box" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color, #2e374a)', paddingBottom: '1.5rem' }}>
                            <h3 className="pipeline-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiBarChart2 /> Manual Inspector</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginTop: '1rem', color: 'var(--text-main, #fff)' }}>
                                <div><strong style={{ color: 'var(--text-muted, #8a99ad)' }}>Manual ID:</strong> <span className="font-mono">{selectedManual.manual_id}</span></div>
                                <div><strong style={{ color: 'var(--text-muted, #8a99ad)' }}>Machine ID:</strong> {selectedManual.machine_id}</div>
                                <div style={{ gridColumn: 'span 2' }}><strong style={{ color: 'var(--text-muted, #8a99ad)' }}>File Name:</strong> <span style={{ wordBreak: 'break-all' }}>{selectedManual.file_name}</span></div>
                                <div><strong style={{ color: 'var(--text-muted, #8a99ad)' }}>Version:</strong> {selectedManual.version}</div>
                                <div><strong style={{ color: 'var(--text-muted, #8a99ad)' }}>Type:</strong> {selectedManual.manual_type}</div>
                                <div><strong style={{ color: 'var(--text-muted, #8a99ad)' }}>Pages:</strong> {selectedManual.pages}</div>
                                <div><strong style={{ color: 'var(--text-muted, #8a99ad)' }}>Upload Date:</strong> {selectedManual.upload_date}</div>
                            </div>

                            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted, #8a99ad)', marginTop: '1.5rem', marginBottom: '0.7rem', letterSpacing: '0.05em' }}>RAG Verification Data</h4>
                            <div style={{ background: '#131722', padding: '0.75rem', borderRadius: '6px', border: '1px solid #252d3d', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <div><span style={{ color: '#8a99ad' }}>Total Chunks:</span> <strong className="font-mono" style={{ float: 'right' }}>{selectedManual.total_chunks}</strong></div>
                                <div><span style={{ color: '#8a99ad' }}>Indexed Chunks:</span> <strong className="font-mono" style={{ float: 'right', color: selectedManual.status === 'indexed' ? '#10b981' : '#f59e0b' }}>{selectedManual.indexed_chunks}</strong></div>
                                <div style={{ gridColumn: 'span 2', borderTop: '1px solid #252d3d', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                                    <span style={{ color: '#8a99ad' }}>Embedding Status:</span>
                                    <strong style={{ float: 'right', color: selectedManual.status === 'indexed' ? '#10b981' : '#f59e0b' }}>
                                        {selectedManual.status === 'indexed' ? '100% Vectorized' : 'Processing Chunks...'}
                                    </strong>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span style={{ color: '#8a99ad' }}>Vector Database Status:</span>
                                    <strong style={{ float: 'right', color: selectedManual.status === 'indexed' ? '#10b981' : '#f59e0b' }}>
                                        {selectedManual.status === 'indexed' ? 'ChromaDB Committed' : 'Syncing Matrix...'}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pipeline-sticky-box">
                        <h3 className="pipeline-title"><FiServer /> AI Knowledge Ingestion Pipeline</h3>
                        <p className="pipeline-desc">Real-time status matrix tracing standard analytical ingestion pathways for parsing natural language data packs into embedded vectors.</p>

                        <div className="pipeline-steps">
                            <div className={`pipe-step ${selectedManual ? 'passed' : 'pending'}`}>
                                <div className="step-indicator">01</div>
                                <div className="step-details">
                                    <h5>PDF Parsing</h5>
                                    <p>OCR engine processes text layout structures and high-resolution blueprint charts.</p>
                                </div>
                            </div>

                            <div className={`pipe-step ${selectedManual ? 'passed' : 'pending'}`}>
                                <div className="step-indicator">02</div>
                                <div className="step-details">
                                    <h5>Chunk Generation</h5>
                                    <p>Paragraph segmenting using 512 token slide blocks with a 10% overlap perimeter to protect context.</p>
                                </div>
                            </div>

                            <div className={`pipe-step ${selectedManual?.status === 'indexed' ? 'passed' : selectedManual?.status === 'indexing' ? 'active-step' : 'pending'}`}>
                                <div className="step-indicator processing">
                                    {selectedManual?.status === 'indexing' ? <FiLoader className="spin" /> : '03'}
                                </div>
                                <div className="step-details">
                                    <h5>Embedding Creation</h5>
                                    <p>Transforming text chunks into high-dimensional geometric coordinates using localized dense model arrays.</p>
                                </div>
                            </div>

                            <div className={`pipe-step ${selectedManual?.status === 'indexed' ? 'passed' : 'pending'}`}>
                                <div className="step-indicator">04</div>
                                <div className="step-details">
                                    <h5>ChromaDB Storage</h5>
                                    <p>Storing payload data with machine indices inside metadata indices for rapid AI execution query retrieval.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pipeline-sys-summary">
                            <div className="summary-row">
                                <span className="lbl"><FiSliders /> Engine Status</span>
                                <span className="val token-status">{selectedManual?.status === 'indexing' ? 'Active Compilation Cluster' : 'Nominal Cluster Load'}</span>
                            </div>
                            <div className="summary-row">
                                <span className="lbl"><FiDatabase /> Selected Node Target</span>
                                <span className="val font-mono" style={{ color: '#38bdf8' }}>{selectedManual ? selectedManual.manual_id : 'None Selected'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}