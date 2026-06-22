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

    // Send target Alert ID into the Agent Processing Core
    async queryAgent(alertId) {
        const response = await apiClient.post("/api/telemetry/agent/process", {
            alert_id: alertId
        });
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

    // Fallback/Legacy UI Support: Redirects to health status matrix metadata
    async getDashboardSummary() {
        const response = await apiClient.get("/api/telemetry/agent/status");
        return response.data;
    }
};

export default aiAssistantService;