// Mock dataset mimicking valid payloads processed by your backend validation schema
const mockTelemetryAlerts = [
    { alert_id: "ALT-101", machine_id: "CNC-MILL-01", severity: "CRITICAL", error_code: "ERR_MOTOR_OVERHEAT", timestamp: new Date().toLocaleTimeString() },
    { alert_id: "ALT-102", machine_id: "PUMP-04", severity: "WARNING", error_code: "ERR_PRESSURE_HIGH", timestamp: new Date().toLocaleTimeString() },
    { alert_id: "ALT-103", machine_id: "ROBOT-ARM-09", severity: "INFO", error_code: "LOG_CYCLE_COMPLETE", timestamp: new Date().toLocaleTimeString() }
];

function renderDashboard(alerts) {
    const container = document.getElementById('alerts-container');
    let htmlContent = '';
    
    let criticals = 0;
    let warnings = 0;

    alerts.forEach(alert => {
        if(alert.severity === 'CRITICAL') criticals++;
        if(alert.severity === 'WARNING') warnings++;

        htmlContent += `
            <div style="padding: 12px; margin-bottom: 10px; border: 1px solid #eee; border-radius: 4px; background: #fafafa;">
                <strong>[${alert.severity}]</strong> ${alert.machine_id} triggered ${alert.error_code} at ${alert.timestamp} (ID: ${alert.alert_id})
            </div>
        `;
    });

    container.innerHTML = htmlContent;
    document.getElementById('critical-count').innerText = criticals;
    document.getElementById('warning-count').innerText = warnings;
    document.getElementById('total-count').innerText = alerts.length;
}

// Initial rendering run
document.addEventListener("DOMContentLoaded", () => {
    renderDashboard(mockTelemetryAlerts);
});