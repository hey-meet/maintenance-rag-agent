import apiClient from "./apiClient";
 
const machineHealthService = {
 
    getMachineHealth: async () => {
 
        const response = await apiClient.get(
            "/api/telemetry/machine-health"
        );
 
        return response.data;
    }
 
};
 
export default machineHealthService;
 
