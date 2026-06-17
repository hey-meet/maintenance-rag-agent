// AIAssistant.jsx
import React, { useState } from 'react';
import {
    FiCpu,
    FiSend,
    FiBookmark,
    FiFileText,
    FiExternalLink,
    FiZap,
    FiLayers
} from 'react-icons/fi';
import '../styles/aiAssistant.css';

const SUGGESTED_PROMPTS = [
    'Isolate diagnostic steps for hydraulic pump error code E-HYD-402',
    'Retrieve specification tolerances for CNC milling spindle calibration',
    'Compile thermal risk analysis summary for Induction Furnace F-01'
];

const INITIAL_CONVERSATION = [
    {
        role: 'assistant',
        text: 'Operational Retrieval-Augmented Core active. I have full structural indexing context on active maintenance manuals, error logs, and component history files. State telemetry query.',
        sources: []
    },
    {
        role: 'user',
        text: 'Hydraulic Press P-04 is running high temps and triggered an alert. Give me the primary manual diagnostic sequence for pressure line faults.',
        sources: []
    },
    {
        role: 'assistant',
        text: 'Cross-referencing technical manual "OM-HYD-SEC4.2". Under Section 4.2.1 (Hydraulic Fluid Temperature Threshold Violations), execute the following containment protocol:\n\n1. Check transducer feedback values against physical analog dials.\n2. Isolate fluid line bypass valve V-12 to check for internal micro-frictional leak paths.\n3. Verify if secondary auxiliary fan lines are drawing nominal current values.',
        sources: [
            { docId: 'OM-HYD-SEC4.2', page: 'Page 42', section: 'Sec 4.2.1' },
            { docId: 'OM-HYD-SEC4.2', page: 'Page 45', section: 'Manifold Flow Diagrams' }
        ]
    }
];

export default function AIAssistant() {
    const [messages, setMessages] = useState(INITIAL_CONVERSATION);
    const [inputVal, setInputVal] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputVal.trim()) return;

        const userMsg = { role: 'user', text: inputVal, sources: [] };
        const simulatedResponse = {
            role: 'assistant',
            text: `Analytical scan executed for phrase: "${inputVal}". Vector database retrieved matching textbook data layers within nominal system latency thresholds. Standard engineering practice confirms operational parameters match manual blueprint baseline metrics.`,
            sources: [{ docId: 'GEN-MAINT-GEN2', page: 'Page 12', section: 'General Asset Diagnostics' }]
        };

        setMessages([...messages, userMsg, simulatedResponse]);
        setInputVal('');
    };

    return (
        <div className="ai-container">
            <header className="ai-header">
                <div>
                    <h1 className="ai-title">AI Assistant</h1>
                    <p className="ai-subtitle">Retrieval-augmented engineering support intelligence pipeline</p>
                </div>
            </header>

            <div className="ai-workspace">
                {/* Central Chat Stream */}
                <div className="ai-chat-module">
                    <div className="chat-scroller">
                        {messages.map((msg, index) => (
                            <div key={index} className={`msg-row ${msg.role === 'user' ? 'u-row' : 'a-row'}`}>
                                <div className="avatar-box">
                                    {msg.role === 'user' ? 'OP' : <FiCpu className="bot-ico" />}
                                </div>
                                <div className="msg-payload">
                                    <div className="msg-bubble">
                                        <p className="msg-text-paragraph">{msg.text}</p>
                                    </div>

                                    {msg.sources.length > 0 && (
                                        <div className="source-chip-tray">
                                            <span className="tray-lbl"><FiBookmark /> Extracted Context:</span>
                                            {msg.sources.map((src, idx) => (
                                                <div key={idx} className="source-chip">
                                                    <FiFileText />
                                                    <span>{src.docId} • <strong>{src.page}</strong> ({src.section})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form className="chat-input-dock" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Query structural manuals, ask for repair steps, or look up fault logic code paths..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="dock-input-field"
                        />
                        <button type="submit" className="dock-send-btn">
                            <FiSend /> Send
                        </button>
                    </form>
                </div>

                {/* Right contextual insight deck */}
                <div className="ai-context-panel">
                    <div className="context-sticky-wrapper">
                        <div className="context-box-section">
                            <h4 className="box-title"><FiZap /> Guided System Inquiries</h4>
                            <div className="prompt-stack">
                                {SUGGESTED_PROMPTS.map((p, i) => (
                                    <button key={i} className="prompt-pill" onClick={() => setInputVal(p)}>
                                        {p} <FiExternalLink className="p-icon" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="context-box-section summary-card-inner">
                            <h4 className="box-title"><FiLayers /> Active Core Context Matrix</h4>
                            <div className="meta-info-block">
                                <div className="meta-line">
                                    <span className="lbl">Model Variant</span>
                                    <span className="val">Industrial Llama-3-70B-Instruct</span>
                                </div>
                                <div className="meta-line">
                                    <span className="lbl">Retrieval Depth</span>
                                    <span className="val">Top-K 5 Chunks</span>
                                </div>
                                <div className="meta-line">
                                    <span className="lbl">Vector Match Score</span>
                                    <span className="val text-success">&gt; 0.88 Cosine Similarity</span>
                                </div>
                            </div>
                        </div>

                        <div className="context-box-section">
                            <h4 className="box-title"><FiFileText /> Active Vector Index Files</h4>
                            <ul className="active-files-list">
                                <li>
                                    <span className="file-title">OM-HYD-SEC4.2_v2.pdf</span>
                                    <span className="file-desc-lbl">Hydraulics Context Frame</span>
                                </li>
                                <li>
                                    <span className="file-title">CNC-M-TH-09_factory.pdf</span>
                                    <span className="file-desc-lbl">Mechanical Engineering Standard</span>
                                </li>
                                <li>
                                    <span className="file-title">ROB-SYS-VOL2_revised.pdf</span>
                                    <span className="file-desc-lbl">Robotics Schematics Layer</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}