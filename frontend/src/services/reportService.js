// src/services/reportService.js

import apiClient from "./apiClient";

// Complete Reports Dashboard Data
export const getReports = async () => {
    const response = await apiClient.get("/api/telemetry/reports");
    return response.data;
};

// Single Report Details
export const getReportById = async (reportId) => {
    const response = await apiClient.get(`/api/telemetry/reports/${reportId}`);
    return response.data;
};

// Generate New Report
export const generateReport = async (payload) => {
    const response = await apiClient.post("/reports/generate", payload);
    return response.data;
};