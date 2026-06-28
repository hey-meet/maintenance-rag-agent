import apiClient from "./apiClient";

export const aiAssistantService = {
    // Agent Health / Status Matrix
    async getStatus() {
        const response = await apiClient.get("/api/telemetry/agent/alerts");
        return response.data;
    },

    // Fetch live alert ingestion queue nodes
    async getAlerts() {
        const response = await apiClient.get("/api/telemetry/agent/alerts");
        return response.data;
    },

    // Send complete telemetry alert into the Agent Processing Core
    async queryAgent(alert) {

        if (!alert) {
            throw new Error("Telemetry alert is required.");
        }

        const payload = {
            alert_id: alert.alert_id,
            machine_id: alert.machine_id,
            error_code: alert.error_code,
            temperature: alert.temperature,
            severity: alert.severity_raw ?? alert.severity,
            status: alert.status,
            timestamp: alert.original_timestamp ?? alert.timestamp
        };

        console.log("========== FRONTEND PAYLOAD ==========");
        console.log(payload);

        const response = await apiClient.post(
            "/api/telemetry/agent/process",
            payload
        );

        return response.data;
    },

    // Fetch real-time step execution logs from the active pipeline
    async getPipelineLogs() {
        const response = await apiClient.get("/api/telemetry/agent/pipeline");
        return response.data;
    },

    // Retrieve prescriptive knowledge matrix variables from memory
    async getMemory() {
        const response = await apiClient.get("/api/telemetry/agent/memory");
        return response.data;
    },

    // Retrieve details for the generated operational work order
    async getWorkOrder() {
        const response = await apiClient.get("/api/telemetry/agent/work-order");
        return response.data;
    },

    // Fallback / Legacy UI Support
    async getDashboardSummary() {
        const response = await apiClient.get("/api/telemetry/agent/status");
        return response.data;
    }
};

export default aiAssistantService;