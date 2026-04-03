const API_BASE_URL = "https://tagxl.com/api";

export async function clientFetch(endpoint: string, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return response.json();
}
