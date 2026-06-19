import apiClient from "./apiClient";

export const analyticsService = {
    async getAnalyticsData() {
        try {
            const response = await apiClient.get("/api/telemetry/analytics");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch analytics data:", error);

            throw (
                error.response?.data || {
                    status: "error",
                    message: "Unable to load analytics data"
                }
            );
        }
    }
};

export default analyticsService;