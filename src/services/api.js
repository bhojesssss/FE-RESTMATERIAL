// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Global API request handler
 * @param {string} endpoint - API endpoint (e.g. '/listings')
 * @param {object} options - Fetch options (method, body, etc)
 * @returns {Promise<any>} JSON response
 */
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("rm_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Set default timeout to 5000ms for quick fallback
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (response.status === 401) {
      localStorage.removeItem("rm_token");
      localStorage.removeItem("rm_session_v1");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      // Try to parse error body from BE for better messages
      let errMsg = `API Error: ${response.statusText}`;
      try {
        const errBody = await response.json();
        errMsg = errBody.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    clearTimeout(id);

    window.dispatchEvent(
      new CustomEvent("api-fallback", {
        detail: {
          message: "Switching to Offline Demo Mode. Backend is unreachable.",
        },
      }),
    );

    console.warn(`[API Fallback] Request to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Upload files via multipart/form-data (untuk photo upload ke BE).
 * Tidak set Content-Type — browser otomatis set boundary yang benar.
 *
 * @param {string} endpoint - e.g. '/listings/abc-123/photos'
 * @param {File[]} files - array of File objects
 * @param {string} fieldName - field name yang di-expect BE (default: 'photos')
 * @returns {Promise<any>} JSON response
 */
export async function uploadFiles(endpoint, files, fieldName = "photos") {
  const token = localStorage.getItem("rm_token");

  const formData = new FormData();
  files.forEach((file) => formData.append(fieldName, file));

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 30000); // 30s timeout untuk upload

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        // Sengaja TIDAK set Content-Type — browser yang urus boundary-nya
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (response.status === 401) {
      localStorage.removeItem("rm_token");
      localStorage.removeItem("rm_session_v1");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      let errMsg = `Upload Error: ${response.statusText}`;
      try {
        const errBody = await response.json();
        errMsg = errBody.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(id);
    console.warn(`[Upload Error] ${endpoint}:`, error);
    throw error;
  }
}
