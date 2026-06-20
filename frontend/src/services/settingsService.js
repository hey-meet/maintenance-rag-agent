// src/services/settingsService.js

import apiClient from "./apiClient";

const settingsService = {

    // Main Settings Configuration
    getSettings: async () => {
        const response = await apiClient.get(
            "/api/telemetry/settings"
        );

        return response.data;
    },

    // Agent Health Dashboard
    getAgentHealth: async () => {
        const response = await apiClient.get(
            "/api/telemetry/settings/agent-health"
        );

        return response.data;
    },

    // Platform Integrations
    getIntegrations: async () => {
        const response = await apiClient.get(
            "/api/telemetry/settings/integrations"
        );

        return response.data;
    },

    // Retrieval Metrics
    getRetrievalMetrics: async () => {
        const response = await apiClient.get(
            "/api/telemetry/settings/retrieval-metrics"
        );

        return response.data;
    },

    // Memory Metrics
    getMemoryMetrics: async () => {
        const response = await apiClient.get(
            "/api/telemetry/settings/memory-metrics"
        );

        return response.data;
    },

    // Deploy Configuration
    deployConfiguration: async (configurationData) => {
        const response = await apiClient.post(
            "/api/telemetry/settings/deploy",
            configurationData
        );

        return response.data;
    },

    // Reset Configuration
    resetConfiguration: async () => {
        const response = await apiClient.post(
            "/api/telemetry/settings/reset"
        );

        return response.data;
    }

};

export default settingsService;