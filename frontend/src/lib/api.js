import axios from "axios";

const BASE_URL = "http://192.168.141.128:3000/api";

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
