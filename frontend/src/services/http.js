import axios from 'axios';
import { tokenStorage } from './tokenStorage';
import { getCurrentUserId } from '../shared/utils/currentUser';
import { attachInterceptors } from './interceptors';
import { logout } from '../features/auth/hooks/useAuth.jsx';
import { attachArchitectureHttpMonitor } from '../architecture/httpMonitor';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const http = axios.create({
  baseURL,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  const userId = getCurrentUserId();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (userId && !config.headers['x-user-id']) {
    config.headers['x-user-id'] = String(userId);
  }

  return config;
});

attachInterceptors(http, {
  onUnauthorized: () => {
    console.log('[http] Token invalid → Auto logout');
    logout({ reason: 'unauthorized', notify: true });
  }
});

attachArchitectureHttpMonitor(http);
