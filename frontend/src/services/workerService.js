import apiClient from "./apiClient";

const workerService = {

    getWorkOrder: async () => {

        const response = await apiClient.get(
            "/api/telemetry/agent/work-order"
        );

        return response.data;
    },

    getWorkers: async () => {

        const response = await apiClient.get(
            "/api/telemetry/agent/workers"
        );

        return response.data;
    }

};

export default workerService;