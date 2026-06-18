import apiClient from "./alertService";

export const aiAssistantService = {
    // Main Agent Query
    async queryAgent(query) {
        const response = await apiClient.post("/agent/query", {
            query,
        });

        return response.data;
    },

    // Agent Health / Status
    async getStatus() {
        const response = await apiClient.get("/agent/status");
        return response.data;
    },

    // Current Agent Memory
    async getMemory() {
        const response = await apiClient.get("/agent/memory");
        return response.data;
    },

    // Suggested Prompts
    async getSuggestedPrompts() {
        const response = await apiClient.get("/agent/prompts");
        return response.data;
    },

    // Dashboard Summary
    async getDashboardSummary() {
        const response = await apiClient.get("/agent/dashboard");
        return response.data;
    }
};

export default aiAssistantService;