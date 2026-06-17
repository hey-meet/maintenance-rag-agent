import apiClient from "./apiClient";

const telemetryService = {

    getDashboardData: async () => {
        const response = await apiClient.get(
            "/api/telemetry/dashboard"
        );

        return response.data;
    }

};

export default telemetryService;