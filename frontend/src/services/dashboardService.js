import apiClient from "./apiClient";

const dashboardService = {

    async getDashboardData() {

        try {

            const response =
                await apiClient.get("/api/telemetry/dashboard");

            return response.data;

        } catch (error) {

            console.error(
                "Dashboard API Error:",
                error
            );

            throw error;
        }
    }
};

export default dashboardService;