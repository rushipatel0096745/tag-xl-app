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


export function FormatDateTime(dateString: string) {
        if (!dateString) return "";

        const date = new Date(dateString + "Z");

        const datePart = date
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            .replace(/ /g, "-");

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        const period = hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;

        const timePart = `${hours}:${minutes}:${seconds} ${period}`;

        return `${datePart} ${timePart}`;
    }