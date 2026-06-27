import apiClient from "./apiClient";

const manualService = {


    getManuals: async () => {

        const response = await apiClient.get(
            "/api/telemetry/manuals"
        );

        return response.data;
    },

    uploadManual: async (formData) => {

        const response = await apiClient.post(
            "/api/telemetry/manuals/upload",
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data"
                }
            }
        );

        return response.data;
    },

    generateChunks: async (manualId) => {

        const response = await apiClient.post(
            `/api/telemetry/manuals/chunk/${manualId}`
        );

        return response.data;
    },

    generateEmbeddings: async (manualId) => {

        const response = await apiClient.post(
            `/api/telemetry/manuals/embed/${manualId}`
        );

        return response.data;
    },

    openManual: (filename) => {

        window.open(
            `${import.meta.env.VITE_API_URL}/api/telemetry/manuals/view/${filename}`,
            "_blank"
        );
    },

    downloadManual: (filename) => {

        window.open(
            `${import.meta.env.VITE_API_URL}/api/telemetry/manuals/download/${filename}`,
            "_blank"
        );
    }


};

export default manualService;
