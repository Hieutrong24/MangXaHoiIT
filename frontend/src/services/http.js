import axios from "axios";
import { tokenStorage } from "./tokenStorage";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const http = axios.create({
  baseURL,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
   
    if (err?.response?.status === 401) { 
    }
    return Promise.reject(err);
  }
);
