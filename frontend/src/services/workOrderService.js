import apiClient from "./apiClient";

const workOrderService = {

    getWorkOrders: async () => {

        const response = await apiClient.get(
            "/api/telemetry/work-orders"
        );

        return response.data;
    },

    completeWorkOrder: async (workOrderId) => {

        const response = await apiClient.post(
            `/api/telemetry/work-orders/${workOrderId}/complete`
        );

        return response.data;
    }

};

export default workOrderService;
