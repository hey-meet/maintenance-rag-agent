import apiClient from "./apiClient";

const alertService = {

    getAlerts: async () => {

        const response = await apiClient.get(
            "/api/telemetry/alerts"
        );

        return response.data;
    }

};

export default alertService;