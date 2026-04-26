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
      // Unauthorized, token expired or invalid
      localStorage.removeItem("rm_token");
      localStorage.removeItem("rm_session_v1"); // Clean up old session
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Sometimes DELETE or 204 No Content doesn't have JSON body
    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    clearTimeout(id);

    // Dispatch a custom event to show Toast Notification for Fallback Mode
    window.dispatchEvent(
      new CustomEvent("api-fallback", {
        detail: {
          message: "Switching to Offline Demo Mode. Backend is unreachable.",
        },
      }),
    );

    console.warn(`[API Fallback] Request to ${endpoint} failed:`, error);
    throw error; // Re-throw to be handled by the specific component fallback logic
  }
}
