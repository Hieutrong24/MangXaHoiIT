// src/services/interceptors.js
import { tokenStorage } from "./tokenStorage";

export function attachInterceptors(http, { onUnauthorized } = {}) {
  http.interceptors.request.use((config) => {
    const token = tokenStorage.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  http.interceptors.response.use(
    (res) => res,
    async (err) => {
      const status = err?.response?.status;

      if (status === 401) {
       
        tokenStorage.clear();
        if (typeof onUnauthorized === "function") onUnauthorized();
      }

      return Promise.reject(err);
    }
  );
}
