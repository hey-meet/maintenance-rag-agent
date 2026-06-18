import apiClient from "./apiClient";

const workOrderService = {
    getWorkOrders: async () => {

        const response = await apiClient.get(
            "/api/telemetry/work-orders"
        );

        return response.data;
    },
};

export default workOrderService;