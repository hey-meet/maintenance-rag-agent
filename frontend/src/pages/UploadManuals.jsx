// UploadManuals.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    FiFileText,
    FiCheckCircle,
    FiLoader,
    FiServer,
    FiSliders,
    FiLayers,
    FiUnlock,
    FiDatabase,
    FiBarChart2,
    FiEye,
    FiAlertTriangle,
    FiUploadCloud,
    FiRefreshCw,
    FiCpu,
    FiPlay,
    FiExternalLink,
    FiDownload,
    FiX
} from 'react-icons/fi';
import manualService from '../services/manualService';
import '../styles/uploadManuals.css';

// TASK 2: Temporary Maintenance Lock Configuration
const MANUAL_PAGE_LOCKED = false;

export default function UploadManuals() {
    // Pipeline Core States
    const [manuals, setManuals] = useState([]);
    const [selectedManual, setSelectedManual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Ingestion Form State
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        machine_id: '',
        manual_type: 'Operations',
        version: '1.0'
    });

    // Dedicated Production Progress / Pipeline Text States
    const [pipelineStatusText, setPipelineStatusText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Toast Notification System State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fileInputRef = useRef(null);

    // Toast Notification Dispatcher
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 5000);
    };

    // Core Data Fetch Ledger Line
    const fetchManuals = async (autoSelect = false) => {
        try {
            setError(null);
            const data = await manualService.getManuals();

            // Handling variations of wrapping responses safely
            const resolvedManuals = Array.isArray(data) ? data : (data?.manuals || []);

            setManuals(resolvedManuals);

            if (resolvedManuals.length > 0) {
                if (autoSelect || !selectedManual) {
                    setSelectedManual(resolvedManuals[0]);
                } else {
                    const updatedSelected = resolvedManuals.find(m => m.manual_id === selectedManual.manual_id);
                    if (updatedSelected) {
                        setSelectedManual(updatedSelected);
                    } else {
                        setSelectedManual(resolvedManuals[0]);
                    }
                }
            } else {
                setSelectedManual(null);
            }
        } catch (err) {
            setError(err.message || 'Failed to establish connection with RAG cluster registry.');
            showToast('System synchronization failure across operational ledger.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManuals(true);
    }, []);

    // Drag and Drop Route Interceptors
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (MANUAL_PAGE_LOCKED) return;
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (MANUAL_PAGE_LOCKED) return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await processInboundFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = async (e) => {
        if (MANUAL_PAGE_LOCKED) return;
        if (e.target.files && e.target.files[0]) {
            await processInboundFile(e.target.files[0]);
        }
    };

    // Ingestion & File Execution Pipeline
    const processInboundFile = async (file) => {
        if (MANUAL_PAGE_LOCKED) return;
        if (file.type !== "application/pdf") {
            showToast("Framework restriction: Only high-resolution technical PDFs are authorized.", "error");
            return;
        }
        if (!formData.machine_id.trim()) {
            showToast("Ingestion rejected: Machine ID alignment configuration missing.", "error");
            return;
        }

        try {
            setIsProcessing(true);
            setPipelineStatusText('Uploading...');

            const dataPayload = new FormData();
            dataPayload.append('file', file);
            dataPayload.append('machine_id', formData.machine_id);
            dataPayload.append('manual_type', formData.manual_type);
            dataPayload.append('version', formData.version);

            await manualService.uploadManual(dataPayload);

            showToast(`Asset '${file.name}' committed cleanly to backend/data/manuals/`);

            // Cleanup input forms safely
            setFormData({ machine_id: '', manual_type: 'Operations', version: '1.0' });
            if (fileInputRef.current) fileInputRef.current.value = '';

            await fetchManuals(false);
        } catch (err) {
            showToast(`Upload Protocol Aborted: ${err.message || 'Transmission exception.'}`, 'error');
        } finally {
            setIsProcessing(false);
            setPipelineStatusText('');
        }
    };

    // Pipeline Action Handlers
    const runChunkGeneration = async (fileName) => {
        if (!fileName || MANUAL_PAGE_LOCKED) return;
        setIsProcessing(true);
        setPipelineStatusText('Generating Chunks...');
        try {
            await manualService.generateChunks(fileName);
            showToast(`Tokenization mapping complete for asset reference: ${fileName}`);
            await fetchManuals(false);
        } catch (err) {
            showToast(`Chunk Generation Error: ${err.message}`, 'error');
        } finally {
            setIsProcessing(false);
            setPipelineStatusText('');
        }
    };

    const runEmbeddingGeneration = async (fileName) => {
        if (!fileName || MANUAL_PAGE_LOCKED) return;
        setIsProcessing(true);
        setPipelineStatusText('Generating Embeddings...');
        try {
            await manualService.generateEmbeddings(fileName);
            showToast(`Vector embeddings committed successfully into shared collection index.`);
            await fetchManuals(false);
        } catch (err) {
            showToast(`Vector Mapping Exception: ${err.message}`, 'error');
        } finally {
            setIsProcessing(false);
            setPipelineStatusText('');
        }
    };

    const runOpenManual = async (fileName) => {
        if (!fileName) return;
        try {
            await manualService.openManual(fileName);
        } catch (err) {
            showToast(`Unable to open documentation pipeline stream: ${err.message}`, 'error');
        }
    };

    const runDownloadManual = async (fileName) => {
        if (!fileName) return;
        try {
            await manualService.downloadManual(fileName);
            showToast(`Download pipeline initialization triggered for ${fileName}`);
        } catch (err) {
            showToast(`Download Target Registry Error: ${err.message}`, 'error');
        }
    };

    // Calculate real KPIs from current ledger array
    const totalManuals = manuals.length;
    const indexedManuals = manuals.filter(m => m.status === 'indexed').length;
    const processingManuals = manuals.filter(m => ['indexing', 'chunking', 'embedding'].includes(m.status)).length;
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
                        onClick={() => fetchManuals(true)}
                    >
                        Retry Protocol Pipeline Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="doc-container">
            {/* Real-Time Contextual Notification Toast Display */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    top: '1.5rem',
                    right: '1.5rem',
                    zIndex: 9999,
                    background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${toast.type === 'error' ? '#f87171' : '#4ade80'}`,
                    padding: '1rem 1.25rem',
                    borderRadius: '6px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    minWidth: '300px',
                    maxWidth: '450px'
                }}>
                    {toast.type === 'error' ? <FiAlertTriangle style={{ color: '#ef4444', flexShrink: 0 }} /> : <FiCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} />}
                    <span style={{ fontSize: '0.85rem', color: '#1f2937', fontWeight: 500, flexGrow: 1 }}>{toast.message}</span>
                    <FiX style={{ cursor: 'pointer', color: '#9ca3af' }} onClick={() => setToast(prev => ({ ...prev, show: false }))} />
                </div>
            )}

            <header className="doc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="doc-title">Knowledge Base Management</h1>
                    <p className="doc-subtitle">Manage machine manuals, technical documentation, indexed knowledge assets, and RAG ingestion status.</p>
                </div>
                <button className="bypass-label" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => fetchManuals(false)} disabled={isProcessing}>
                    <FiRefreshCw className={isProcessing ? 'spin' : ''} /> Refresh System Status
                </button>
            </header>

            {/* Ingestion Matrix KPIs Summary Dashboard */}
            <div className="kpi-dashboard-grid">
                <div className="kpi-card">
                    <span className="lbl" style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}><FiFileText /> Total Manuals</span>
                    <span className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2E3133' }}>{totalManuals}</span>
                </div>
                <div className="kpi-card">
                    <span className="lbl" style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}><FiCheckCircle style={{ color: '#7D9A72' }} /> Indexed Manuals</span>
                    <span className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7D9A72' }}>{indexedManuals}</span>
                </div>
                <div className="kpi-card">
                    <span className="lbl" style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}><FiCpu style={{ color: '#D96C4A' }} /> Active Nodes</span>
                    <span className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D96C4A' }}>{processingManuals}</span>
                </div>
                <div className="kpi-card">
                    <span className="lbl" style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block', marginBottom: '0.25rem' }}><FiLayers /> Total Chunks</span>
                    <span className="val" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2E3133' }}>{totalChunks.toLocaleString()}</span>
                </div>
            </div>

            <div className="doc-workspace">
                <div className="doc-left-side">
                    {/* Live Upload Ingestion Work Area */}
                    <form className="upload-form-card" onSubmit={(e) => e.preventDefault()}>
                        <div
                            className={`dropzone-box ${dragActive ? 'drag-target' : ''}`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => !isProcessing && !MANUAL_PAGE_LOCKED && fileInputRef.current.click()}
                            style={{
                                cursor: (isProcessing || MANUAL_PAGE_LOCKED) ? 'not-allowed' : 'pointer',
                                opacity: MANUAL_PAGE_LOCKED ? 0.65 : 1
                            }}
                        >
                            {isProcessing && pipelineStatusText === 'Uploading...' ? (
                                <>
                                    <FiLoader className="drop-icon spin" style={{ color: '#D96C4A' }} />
                                    <div className="drop-text-group">
                                        <span className="drop-main">Uploading Technical Documentation...</span>
                                        <span className="drop-sub">Streaming binary packets to target asset architecture</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FiUploadCloud className="drop-icon" style={{ color: MANUAL_PAGE_LOCKED ? '#9CA3AF' : undefined }} />
                                    <div className="drop-text-group">
                                        <span className="drop-main">{MANUAL_PAGE_LOCKED ? "Upload Protocol Offline" : "Drag & Drop Factory Manual PDF"}</span>
                                        <span className="drop-sub">{MANUAL_PAGE_LOCKED ? "Administrative structural ingestion lock is active" : "or click to browse filesystem targets"}</span>
                                    </div>
                                </>
                            )}
                            <input
                                type="file"
                                className="native-input-bypass"
                                id="manualFile"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".pdf"
                                disabled={isProcessing || MANUAL_PAGE_LOCKED}
                            />
                        </div>

                        <div className="form-meta-row">
                            <div className="input-group">
                                <label className="input-lbl">Target Equipment / Asset Alignment</label>
                                <input
                                    type="text"
                                    className="cc-input"
                                    placeholder="e.g., COMPRESSOR_A16"
                                    value={formData.machine_id}
                                    onChange={(e) => setFormData({ ...formData, machine_id: e.target.value.toUpperCase() })}
                                    disabled={isProcessing || MANUAL_PAGE_LOCKED}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-lbl">Manual Category Taxonomy</label>
                                <select
                                    className="cc-select"
                                    value={formData.manual_type}
                                    onChange={(e) => setFormData({ ...formData, manual_type: e.target.value })}
                                    disabled={isProcessing || MANUAL_PAGE_LOCKED}
                                >
                                    <option value="Operations">Operations Manual</option>
                                    <option value="Maintenance">Prescriptive Repair Guide</option>
                                    <option value="Electrical">Electrical Schematic</option>
                                    <option value="Safety">Safety Protocol Blueprint</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-lbl">Document Release Version</label>
                                <input
                                    type="text"
                                    className="cc-input"
                                    placeholder="1.0"
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    disabled={isProcessing || MANUAL_PAGE_LOCKED}
                                />
                            </div>
                        </div>
                    </form>

                    {/* Industrial Storage Ledger Table */}
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
                                        <th>Chunks Mapping</th>
                                        <th>Pipeline Status</th>
                                        <th>Upload Date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manuals.map((doc) => (
                                        <tr
                                            key={doc.manual_id || doc.file_name}
                                            className={selectedManual?.manual_id === doc.manual_id ? 'active-row' : ''}
                                            onClick={() => setSelectedManual(doc)}
                                        >
                                            <td className="font-mono">{doc.manual_id || 'N/A'}</td>
                                            <td className="strong">{doc.machine_id}</td>
                                            <td>
                                                <div className="file-cell">
                                                    <FiFileText className="file-cell-icon" />
                                                    <div>
                                                        <span className="f-name" title={doc.file_name}>{doc.file_name}</span>
                                                        <span className="f-meta font-mono">Rev {doc.version || '1.0'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="type-lbl">{doc.manual_type}</span></td>
                                            <td className="font-mono">{doc.pages || '--'}</td>
                                            <td className="font-mono">{doc.total_chunks || 0} units</td>
                                            <td>
                                                <div className="status-cell">
                                                    {doc.status === 'indexed' && <span className="p-badge done"><FiCheckCircle /> Indexed</span>}
                                                    {doc.status === 'embedded' && <span className="p-badge" style={{ color: '#3b82f6', borderColor: '#bfdbfe' }}><FiDatabase /> Embedded</span>}
                                                    {doc.status === 'uploaded' && <span className="p-badge" style={{ color: '#6b7280', borderColor: '#e5e7eb' }}><FiUnlock /> Uploaded</span>}
                                                    {!['indexed', 'embedded', 'uploaded'].includes(doc.status) && (
                                                        <span className="p-badge loading"><FiLoader className="spin" /> Custom State</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="f-meta">{doc.upload_date || '--'}</td>
                                            <td>
                                                <button type="button" className="bypass-label" style={{ padding: '2px 8px', margin: 0, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FiEye /> Inspect
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {manuals.length === 0 && (
                                        <tr>
                                            <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#6B7280' }}>
                                                No factory documentation resolved inside active data target registers.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Sticky Ingestion Panel and Pipeline Diagnostics */}
                <div className="doc-right-panel">
                    {/* Active Manual Diagnostics Inspector */}
                    {selectedManual && (
                        <div className="pipeline-sticky-box" style={{ borderBottom: '1px solid #F7F5F2', paddingBottom: '1.5rem' }}>
                            <h3 className="pipeline-title"><FiBarChart2 /> Manual Inspector</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                <div><strong style={{ color: '#6B7280' }}>Manual ID:</strong> <span className="font-mono">{selectedManual.manual_id || 'UNASSIGNED'}</span></div>
                                <div><strong style={{ color: '#6B7280' }}>Machine ID:</strong> {selectedManual.machine_id}</div>
                                <div style={{ gridColumn: 'span 2' }}><strong style={{ color: '#6B7280' }}>Source File:</strong> <span style={{ wordBreak: 'break-all' }} className="font-mono">{selectedManual.file_name}</span></div>
                                <div><strong style={{ color: '#6B7280' }}>Version:</strong> {selectedManual.version || '1.0'}</div>
                                <div><strong style={{ color: '#6B7280' }}>Taxonomy:</strong> {selectedManual.manual_type}</div>
                                <div><strong style={{ color: '#6B7280' }}>Total Chunks:</strong> {selectedManual.total_chunks || 0}</div>
                                <div><strong style={{ color: '#6B7280' }}>Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{selectedManual.status}</span></div>
                            </div>

                            {/* Control Suite Trigger Array */}
                            <div className="control-actions-suite" style={{ marginTop: '0.5rem' }}>
                                <button className="bypass-label" onClick={() => runOpenManual(selectedManual.file_name)} disabled={isProcessing}>
                                    <FiExternalLink /> Open Manual
                                </button>
                                <button className="bypass-label" onClick={() => runDownloadManual(selectedManual.file_name)} disabled={isProcessing}>
                                    <FiDownload /> Download
                                </button>
                                <button className="bypass-label" onClick={() => runChunkGeneration(selectedManual.file_name)} disabled={isProcessing || MANUAL_PAGE_LOCKED} style={{ opacity: MANUAL_PAGE_LOCKED ? 0.5 : 1, cursor: MANUAL_PAGE_LOCKED ? 'not-allowed' : 'pointer' }}>
                                    <FiLayers /> Gen Chunks
                                </button>
                                <button className="ingest-submit-btn" onClick={() => runEmbeddingGeneration(selectedManual.file_name)} disabled={isProcessing || MANUAL_PAGE_LOCKED} style={{ opacity: MANUAL_PAGE_LOCKED ? 0.5 : 1, cursor: MANUAL_PAGE_LOCKED ? 'not-allowed' : 'pointer' }}>
                                    <FiDatabase /> Embed Text
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Operational Progress Status Diagnostics Box */}
                    <div className="pipeline-sticky-box">
                        <h3 className="pipeline-title">
                            {isProcessing ? <FiLoader className="spin" style={{ color: '#D96C4A' }} /> : <FiServer />}
                            {isProcessing ? `Pipeline: ${pipelineStatusText}` : 'AI Ingestion Pipeline'}
                        </h3>
                        <p className="pipeline-desc">Real-time visualization monitoring localized data compilation parameters across continuous embedding models.</p>

                        {/* TASK 2 Notice Box Insertion */}
                        {MANUAL_PAGE_LOCKED && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: '#FFF7ED',
                                border: '1px solid #FFEDD5',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                marginBottom: '1rem',
                                color: '#C2410C',
                                fontSize: '0.8rem',
                                fontWeight: 500
                            }}>
                                <FiAlertTriangle style={{ flexShrink: 0 }} />
                                <span>Manual processing is temporarily locked by the system administrator.</span>
                            </div>
                        )}

                        <div className="pipeline-steps">
                            <div className={`pipe-step ${selectedManual ? 'passed' : 'pending'}`}>
                                <div className="step-indicator">01</div>
                                <div className="step-details">
                                    <h5>PDF Ingestion & Storage</h5>
                                    <p>File verified and placed into `backend/data/manuals/` storage routes.</p>
                                </div>
                            </div>

                            <div className={`pipe-step ${['embedded', 'indexed'].includes(selectedManual?.status) ? 'passed' : isProcessing && pipelineStatusText === 'Generating Chunks...' ? 'active-step' : 'pending'}`}>
                                <div className="step-indicator">
                                    {isProcessing && pipelineStatusText === 'Generating Chunks...' ? <FiLoader className="spin" /> : '02'}
                                </div>
                                <div className="step-details">
                                    <h5>Chunk File Extraction</h5>
                                    <p>Generates target structural mapping configurations (e.g., `{selectedManual ? selectedManual.machine_id.toLowerCase() : 'asset'}_chunks.json`).</p>
                                </div>
                            </div>

                            <div className={`pipe-step ${selectedManual?.status === 'indexed' ? 'passed' : isProcessing && pipelineStatusText === 'Generating Embeddings...' ? 'active-step' : 'pending'}`}>
                                <div className="step-indicator">
                                    {isProcessing && pipelineStatusText === 'Generating Embeddings...' ? <FiLoader className="spin" /> : '03'}
                                </div>
                                <div className="step-details">
                                    <h5>ChromaDB Indexing</h5>
                                    <p>Transforms text nodes into high-dimensional geometric coordinate clusters using parent context tags.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pipeline-sys-summary">
                            <div className="summary-row">
                                <span className="lbl"><FiSliders /> Subsystem Status</span>
                                <span className="val token-status" style={{ color: isProcessing ? '#D96C4A' : '#7D9A72' }}>
                                    {isProcessing ? pipelineStatusText : 'Nominal Core Grid Load'}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span className="lbl"><FiDatabase /> Selected Entry Node</span>
                                <span className="val font-mono" style={{ color: '#3A3D3F' }}>{selectedManual ? selectedManual.file_name : 'No Target Identified'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}