// UploadManuals.jsx
import React, { useState } from 'react';
import {
    FiUploadCloud,
    FiFileText,
    FiCheckCircle,
    FiLoader,
    FiServer,
    FiCpu,
    FiSliders,
    FiLayers
} from 'react-icons/fi';
import '../styles/uploadManuals.css';

const INITIAL_INGESTIONS = [
    {
        id: 'DOC-081',
        fileName: 'OM-HYD-SEC4.2_v2.pdf',
        machine: 'Hydraulic Press P-04',
        type: 'Operator Manual',
        version: '4.2',
        pages: 148,
        status: 'indexed',
        date: '2026-06-15'
    },
    {
        id: 'DOC-082',
        fileName: 'CNC-M-TH-09_factory.pdf',
        machine: 'CNC Milling Unit C-12',
        type: 'Technical Manual',
        version: '9.1',
        pages: 312,
        status: 'indexed',
        date: '2026-06-16'
    },
    {
        id: 'DOC-083',
        fileName: 'ROB-SYS-VOL2_revised.pdf',
        machine: 'Robotic Arm Assembly R-02',
        type: 'Wiring Diagrams',
        version: '2.0',
        pages: 64,
        status: 'indexing',
        date: '2026-06-17'
    }
];

export default function UploadManuals() {
    const [ingestions, setIngestions] = useState(INITIAL_INGESTIONS);
    const [machineName, setMachineName] = useState('');
    const [manualType, setManualType] = useState('Technical Manual');
    const [version, setVersion] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleUploadTrigger = (e) => {
        e.preventDefault();
        if (!machineName) {
            alert('Assign target manufacturing asset prior to ingestion initialization.');
            return;
        }

        const newDoc = {
            id: `DOC-0${Math.floor(Math.random() * 900) + 100}`,
            fileName: 'INGEST_STREAM_MUTABLE.pdf',
            machine: machineName,
            type: manualType,
            version: version || '1.0',
            pages: Math.floor(Math.random() * 200) + 20,
            status: 'indexing',
            date: '2026-06-17'
        };

        setIngestions([newDoc, ...ingestions]);
        setMachineName('');
        setVersion('');
    };

    return (
        <div className="doc-container">
            <header className="doc-header">
                <div>
                    <h1 className="doc-title">Upload Manuals</h1>
                    <p className="doc-subtitle">Ingest factory documentation, specification schematics, and service logs into the RAG vector core</p>
                </div>
            </header>

            <div className="doc-workspace">
                <div className="doc-left-side">
                    {/* File Assembly Formulation Block */}
                    <form className="upload-form-card" onSubmit={handleUploadTrigger}>
                        <div
                            className={`dropzone-box ${dragActive ? 'drag-target' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
                        >
                            <FiUploadCloud className="drop-icon" />
                            <div className="drop-text-group">
                                <span className="drop-main">Drag architectural specifications here</span>
                                <span className="drop-sub">Supported formats: PDF, DOCX, TXT up to 45MB</span>
                            </div>
                            <input type="file" className="native-input-bypass" id="manualFile" disabled />
                            <label htmlFor="manualFile" className="bypass-label">Select File Path</label>
                        </div>

                        <div className="form-meta-row">
                            <div className="input-group">
                                <label className="input-lbl">Target Equipment / Asset Alignment</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Rotary Compressor K-08"
                                    value={machineName}
                                    onChange={(e) => setMachineName(e.target.value)}
                                    className="cc-input"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-lbl">Manual Category Taxonomy</label>
                                <select
                                    value={manualType}
                                    onChange={(e) => setManualType(e.target.value)}
                                    className="cc-select"
                                >
                                    <option value="Technical Manual">Technical Manual</option>
                                    <option value="Operator Guide">Operator Guide</option>
                                    <option value="Wiring Diagrams">Wiring Diagrams</option>
                                    <option value="Regulatory Blueprint">Regulatory Blueprint</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-lbl">Document Release Version</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 4.1.2"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    className="cc-input"
                                />
                            </div>
                        </div>

                        <button type="submit" className="ingest-submit-btn">
                            Execute RAG Knowledge Base Ingestion Sequence
                        </button>
                    </form>

                    {/* Ingested Records Display Grid */}
                    <div className="ingested-list-card">
                        <h3 className="card-inner-title">Knowledge Base Storage Ledger</h3>
                        <div className="list-scroll-wrapper">
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Documentation Signature</th>
                                        <th>Asset Assignment</th>
                                        <th>Structural Type</th>
                                        <th>Indexed Quantities</th>
                                        <th>System Processing State</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ingestions.map((doc) => (
                                        <tr key={doc.id}>
                                            <td>
                                                <div className="file-cell">
                                                    <FiFileText className="file-cell-icon" />
                                                    <div>
                                                        <span className="f-name">{doc.fileName}</span>
                                                        <span className="f-meta font-mono">{doc.id} • Revision {doc.version}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="strong">{doc.machine}</td>
                                            <td><span className="type-lbl">{doc.type}</span></td>
                                            <td className="font-mono">{doc.pages} leaves</td>
                                            <td>
                                                <div className="status-cell">
                                                    {doc.status === 'indexed' ? (
                                                        <span className="p-badge done"><FiCheckCircle /> Vectorized</span>
                                                    ) : (
                                                        <span className="p-badge loading"><FiLoader className="spin" /> Computing</span>
                                                    )}
                                                    <span className="f-meta">{doc.date}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* pipeline tracing configuration panel */}
                <div className="doc-right-panel">
                    <div className="pipeline-sticky-box">
                        <h3 className="pipeline-title"><FiServer /> AI Knowledge Ingestion Pipeline</h3>
                        <p className="pipeline-desc">Real-time status matrix tracing standard analytical ingestion pathways for parsing natural language data packs into embedded vectors.</p>

                        <div className="pipeline-steps">
                            <div className="pipe-step passed">
                                <div className="step-indicator">01</div>
                                <div className="step-details">
                                    <h5>Structural PDF Parsing</h5>
                                    <p>OCR engine processes text layout structures and high-resolution blueprint charts.</p>
                                </div>
                            </div>

                            <div className="pipe-step passed">
                                <div className="step-indicator">02</div>
                                <div className="step-details">
                                    <h5>Context-Aware Chunking</h5>
                                    <p>Paragraph segmenting using 512 token slide blocks with a 10% overlap perimeter to protect context.</p>
                                </div>
                            </div>

                            <div className="pipe-step active-step">
                                <div className="step-indicator processing"><FiLoader className="spin" /></div>
                                <div className="step-details">
                                    <h5>Embedding Model Vectorization</h5>
                                    <p>Transforming text chunks into high-dimensional geometric coordinates using localized dense model arrays.</p>
                                </div>
                            </div>

                            <div className="pipe-step pending">
                                <div className="step-indicator">04</div>
                                <div className="step-details">
                                    <h5>Vector Database Commit</h5>
                                    <p>Storing payload data with machine indices inside metadata indices for rapid AI execution query retrieval.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pipeline-sys-summary">
                            <div className="summary-row">
                                <span className="lbl"><FiSliders /> Engine Status</span>
                                <span className="val token-status">Nominal Cluster Load</span>
                            </div>
                            <div className="summary-row">
                                <span className="lbl"><FiLayers /> Total Chunks Indexed</span>
                                <span className="val font-mono">14,208 Blocks</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}