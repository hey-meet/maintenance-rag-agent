import apiClient from "./apiClient";

const retrievalService = {
    processAlert: async (alertPayload) => {
        const response = await apiClient.post(
            "/api/telemetry/alert",
            alertPayload
        );

        return response.data;
    },
};

export default retrievalService;