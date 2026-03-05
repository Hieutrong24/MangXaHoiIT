// src/services/interceptors.js
import { tokenStorage } from "./tokenStorage";

/**
 * Gắn interceptors cho axios instance.
 * - request: attach token
 * - response: handle 401 (logout) / refresh (tuỳ backend)
 */
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
        // TODO: nếu bạn có refresh token endpoint, xử lý ở đây.
        // Tạm thời: clear token + callback
        tokenStorage.clear();
        if (typeof onUnauthorized === "function") onUnauthorized();
      }

      return Promise.reject(err);
    }
  );
}
