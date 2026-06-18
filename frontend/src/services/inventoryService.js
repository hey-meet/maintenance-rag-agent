import apiClient from "./apiClient";

const inventoryService = {

    async getInventory() {

        try {

            const response = await apiClient.get(
                "/api/telemetry/inventory"
            );

            return response.data;

        } catch (error) {

            console.error(
                "Inventory API Error:",
                error
            );

            throw error;
        }
    }
};

export default inventoryService;