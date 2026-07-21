// Base URL for all backend API calls. Set VITE_API_URL in the environment
// when deploying (e.g. https://your-backend.up.railway.app/api) — falls
// back to the local dev backend when unset.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
