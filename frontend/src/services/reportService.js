// src/services/reportService.js
import apiClient from "./apiClient";

/**
 * Fetches the active reporting suite metrics and historical document library.
 * @returns {Promise<Object>} Dashboard orchestration data setup payload
 */
export const getReports = async () => {
    const response = await apiClient.get("/api/telemetry/reports");
    return response.data;
};

/**
 * Fetches targeted summary structures for an isolated ledger index tracking entry.
 * @param {string} reportId - Selected report identity parameter 
 * @returns {Promise<Object>} Specific report entity
 */
export const getReportById = async (reportId) => {
    const response = await apiClient.get(`/api/telemetry/reports/${reportId}`);
    return response.data;
};

/**
 * Initiates the PDF report generation pipeline and returns the file stream as a Blob.
 * @param {Object} payload - Parameters for report generation
 * @param {string} payload.report_id - The targeted report/work order identity key
 * @returns {Promise<Blob>} The generated PDF file blob stream layer
 */
export const generateReport = async (payload) => {
    const response = await apiClient.post(
        "/api/telemetry/reports/generate",
        payload,
        {
            responseType: "blob"
        }
    );
    return response.data;
};