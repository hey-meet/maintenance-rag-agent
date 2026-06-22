import apiClient from "./apiClient";

const radarService = {

    getCriticalAlerts: async () => {

        const response = await apiClient.get(
            "/api/telemetry/critical-alerts"
        );

        return response.data;
    }

};

export default radarService;