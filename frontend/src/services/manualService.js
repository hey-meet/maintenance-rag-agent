// manualService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/telemetry'; // Or whatever your system prefix is

export const getManuals = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/manuals`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch manuals:", error);
        throw error;
    }
};