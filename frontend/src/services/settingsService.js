// src/services/settingsService.js
import apiClient from "./apiClient";

const settingsService = {

    // Load complete settings, health matrix endpoints and ecosystem integrations map
    getSettings: async () => {
        const response = await apiClient.get(
            "/api/telemetry/settings"
        );
        return response.data;
    },

    // Save updated configurations straight back down to system profiles
    deployConfiguration: async (configurationData) => {
        const response = await apiClient.put(
            "/api/telemetry/settings",
            configurationData
        );
        return response.data;
    },

    // Restore default settings schema
    resetConfiguration: async () => {
        const response = await apiClient.post(
            "/api/telemetry/settings/reset"
        );
        return response.data;
    }

};

export default settingsService;