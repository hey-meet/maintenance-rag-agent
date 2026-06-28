import React, { useState, useEffect } from 'react';
import workerService from '../services/workerService';
import emailService from "../services/emailService";
import '../styles/WorkerAssignment.css';

const WorkerAssignment = () => {
    const [workOrder, setWorkOrder] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [selectedWorkerIds, setSelectedWorkerIds] = useState([]); // Tracks selected worker IDs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form Configuration State
    const [schedule, setSchedule] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchOperationalParameters = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetching both APIs simultaneously using the workerService abstraction layer
                const [workOrderData, workersResponse] = await Promise.all([
                    workerService.getWorkOrder(),
                    workerService.getWorkers()
                ]);

                setWorkOrder(workOrderData);

                // Safely resolving workers array from response object
                const workersList = Array.isArray(workersResponse?.workers)
                    ? workersResponse.workers
                    : [];

                setWorkers(workersList);

                // Default Behavior: Automatically select all workers by default
                setSelectedWorkerIds(workersList.map(w => w.employee_id || w.id));
            } catch (err) {
                console.error('Error synchronizing data from workerService:', err);
                setError('Failed to fetch operational parameters from the recommendation engine.');
            } finally {
                setLoading(false);
            }
        };

        fetchOperationalParameters();
    }, []);

    // --- Worker Selection Toggles ---
    const handleCheckboxChange = (workerId) => {
        setSelectedWorkerIds(prev =>
            prev.includes(workerId)
                ? prev.filter(id => id !== workerId)
                : [...prev, workerId]
        );
    };

    const handleSelectAll = () => {
        setSelectedWorkerIds(workers.map(w => w.employee_id || w.id));
    };

    const handleClearAll = () => {
        setSelectedWorkerIds([]);
    };

    const handleNotificationDispatch = async (e) => {
        e.preventDefault();

        // 1. Validation Constraints
        if (!schedule) {
            alert("Please select a maintenance schedule.");
            return;
        }

        if (!Array.isArray(workers) || workers.length === 0) {
            alert("No workers available for notification.");
            return;
        }

        // Filter to get only manually selected worker records
        const selectedWorkers = workers.filter(w => selectedWorkerIds.includes(w.employee_id || w.id));

        if (selectedWorkers.length === 0) {
            alert("Please select at least one worker.");
            return;
        }

        setSubmitting(true);

        try {
            // 2. Transmit EmailJS notifications only to the selected workers
            const emailPromises = selectedWorkers.map(worker =>
                emailService.sendNotification(
                    worker,
                    workOrder,
                    schedule,
                    notes
                )
            );

            await Promise.all(emailPromises);

            // 3. Success Feedback Handling
            alert(`Notification successfully sent to ${selectedWorkers.length} worker(s).`);

            // Reset form states cleanly upon complete dispatch success
            setSchedule('');
            setNotes('');
        } catch (err) {
            // 4. Exception Grace Handling
            console.error('Critical failure tracking email integration transmission stack:', err);
            alert('Failed to transmit automated email notifications to all designated workers.');
        } finally {
            setSubmitting(false);
        }
    };

    // 1. Loading State
    if (loading) {
        return (
            <div className="assignment-loading">
                <div className="spinner"></div>
                <p>Synchronizing operational telemetry profiles...</p>
            </div>
        );
    }

    // 2. Error State
    if (error) {
        return (
            <div className="assignment-error">
                <h3>System Communication Fault</h3>
                <p>{error}</p>
            </div>
        );
    }

    // 3. Clean Empty State (If no active work order exists)
    if (!workOrder) {
        return (
            <div className="assignment-empty">
                <h3>No Open Recommendations Ready for Dispatch</h3>
                <p>The AI analytical processor has not compiled an unassigned workflow routing profile.</p>
            </div>
        );
    }

    return (
        <div className="assignment-container">
            <header className="assignment-header">
                <h1>Worker Assignment</h1>
                <p>Review recommendations and dispatch designated personnel notifications</p>
            </header>

            {/* Top Section: Work Order Summary Card */}
            <section className="assignment-card">
                <div className="section-title">Work Order Summary</div>
                <div className="summary-grid">
                    <div className="summary-item">
                        <label>Work Order ID</label>
                        <span>{workOrder.work_order_id || workOrder.id || 'N/A'}</span>
                    </div>
                    <div className="summary-item">
                        <label>Machine</label>
                        <span>{workOrder.machine || 'Unknown Asset'}</span>
                    </div>
                    <div className="summary-item">
                        <label>Priority</label>
                        <span className={`badge priority-${workOrder.priority?.toLowerCase() || 'medium'}`}>
                            {workOrder.priority || 'Medium'}
                        </span>
                    </div>
                    <div className="summary-item">
                        <label>Status</label>
                        <span className={`badge status-${workOrder.status?.toLowerCase() || 'pending'}`}>
                            {workOrder.status || 'Pending'}
                        </span>
                    </div>
                    <div className="summary-item">
                        <label>Assigned Team</label>
                        <span>{workOrder.assigned_team || workOrder.assigned_department || 'Unassigned'}</span>
                    </div>
                    <div className="summary-item">
                        <label>Estimated Time</label>
                        <span>{workOrder.estimated_time || 'N/A'}</span>
                    </div>
                </div>
            </section>

            {/* Middle Section: Assigned Workers Grid with Selection Infrastructure */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <div className="section-title" style={{ margin: 0 }}>
                        Assigned Workers ({selectedWorkerIds.length} of {workers.length} selected)
                    </div>

                    {/* Bulk Action Controls */}
                    {workers.length > 0 && (
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                style={{ background: 'none', border: 'none', color: '#3A3D3F', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={handleClearAll}
                                style={{ background: 'none', border: 'none', color: '#D96C4A', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', cursor: 'pointer', padding: 0 }}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {!Array.isArray(workers) || workers.length === 0 ? (
                    <div style={{ padding: '1.5rem', color: '#D96C4A', backgroundColor: '#FDFCFB', border: '1px solid #CFC0BD', borderRadius: '4px', marginBottom: '2rem' }}>
                        No workers available for the assigned department.
                    </div>
                ) : (
                    <div className="workers-grid">
                        {Array.isArray(workers) &&
                            workers.map((worker, index) => {
                                const id = worker.employee_id || worker.id || index;
                                const isChecked = selectedWorkerIds.includes(id);

                                return (
                                    <div key={id} className="worker-card" style={{ border: isChecked ? '1px solid #3A3D3F' : '1px solid #CFC0BD' }}>
                                        <div className="worker-info">
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <input
                                                    type="checkbox"
                                                    id={`worker-${id}`}
                                                    checked={isChecked}
                                                    onChange={() => handleCheckboxChange(id)}
                                                    style={{ marginTop: '0.25rem', cursor: 'pointer', accentColor: '#3A3D3F' }}
                                                />
                                                <label htmlFor={`worker-${id}`} style={{ fontWeight: '600', fontSize: '1.1rem', cursor: 'pointer', color: '#3A3D3F' }}>
                                                    {worker.name}
                                                </label>
                                            </div>
                                            <div className="worker-designation" style={{ paddingLeft: '1.75rem' }}>{worker.designation}</div>
                                            <div className="worker-meta" style={{ paddingLeft: '1.75rem' }}>
                                                <div><strong>Department:</strong> {worker.department}</div>
                                                <div><strong>Email:</strong> {worker.email}</div>
                                            </div>
                                        </div>
                                        <div className={`status-indicator status-${(worker.availability_status || worker.availability || 'Available').toLowerCase().replace(' ', '-')}`} style={{ marginLeft: '1.75rem' }}>
                                            {worker.availability_status || worker.availability || 'Available'}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </section>

            {/* Bottom Section: Dispatch Details Form */}
            <form onSubmit={handleNotificationDispatch}>
                <section className="assignment-card">
                    <div className="section-title">Dispatch Details</div>
                    <div className="dispatch-form">
                        <div className="form-group">
                            <label htmlFor="schedule">Maintenance Schedule</label>
                            <input
                                type="datetime-local"
                                id="schedule"
                                className="form-input"
                                required
                                value={schedule}
                                onChange={(e) => setSchedule(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Additional Notes</label>
                            <textarea
                                id="notes"
                                className="form-textarea"
                                placeholder="Specify precise calibration instructions, structural constraints, or tool checklist parameters..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                {/* Form Action Dispatch */}
                <div className="action-container">
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Sending Notifications...' : 'Send Notification'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WorkerAssignment;