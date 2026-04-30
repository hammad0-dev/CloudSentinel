import axios from "axios";

// Set in frontend/.env: VITE_API_BASE_URL=http://localhost:3000/api (Windows backend) or http://UBUNTU_IP:3000/api
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api").replace(/\/?$/, "");

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cloudsentinel_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl = String(error.config?.url || "");
      if (!reqUrl.includes("/auth/login") && !reqUrl.includes("/auth/register")) {
        localStorage.removeItem("cloudsentinel_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
