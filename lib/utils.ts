const API_BASE_URL = "https://tagxl.com/api";

export async function clientFetch(endpoint: string, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return response.json();
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const validateFileSize = (fileSize: number | undefined): { valid: boolean; message: string } => {
    if (!fileSize) return { valid: true, message: "" };

    if (fileSize > MAX_FILE_SIZE_BYTES) {
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        return {
            valid: false,
            message: `File size (${fileSizeMB}MB) exceeds the maximum allowed size of ${MAX_FILE_SIZE_MB}MB`,
        };
    }

    return { valid: true, message: "" };
};
