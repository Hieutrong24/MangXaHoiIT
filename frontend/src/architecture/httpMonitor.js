import { createCorrelationId, emitArchitectureLog } from './monitorBus';
import { getHttpArchitecture, getLogKindFromArchitecture } from './architectureMap';

function getFullUrl(config = {}) {
  const base = config.baseURL || '';
  const url = config.url || '';
  try {
    return new URL(url, base || window.location.origin).toString();
  } catch {
    return `${base}${url}`;
  }
}

function getHeader(headers, key) {
  if (!headers) return undefined;
  if (typeof headers.get === 'function') return headers.get(key);
  const found = Object.keys(headers).find((item) => item.toLowerCase() === key.toLowerCase());
  return found ? headers[found] : undefined;
}

function statusLevel(status) {
  if (!status || status >= 500) return 'error';
  if (status >= 400) return 'warning';
  return 'success';
}

export function attachArchitectureHttpMonitor(http) {
  if (!http || http.__architectureMonitorAttached) return;
  http.__architectureMonitorAttached = true;

  http.interceptors.request.use((config) => {
    const correlationId = createCorrelationId('req');
    config.metadata = {
      ...(config.metadata || {}),
      architectureMonitor: {
        startedAt: performance.now(),
        correlationId,
      },
    };
    config.headers = config.headers || {};
    config.headers['X-Correlation-Id'] = config.headers['X-Correlation-Id'] || correlationId;
    return config;
  });

  http.interceptors.response.use(
    (response) => {
      const config = response.config || {};
      const monitor = config.metadata?.architectureMonitor || {};
      const elapsed = Math.round(performance.now() - (monitor.startedAt || performance.now()));
      const url = getFullUrl(config);
      const architecture = getHttpArchitecture(url);
      const serviceName = getHeader(response.headers, 'x-service-name') || architecture.service;
      const correlationId = getHeader(response.headers, 'x-correlation-id') || monitor.correlationId;
      const responseTimeHeader = Number(getHeader(response.headers, 'x-response-time-ms'));

      emitArchitectureLog({
        type: getLogKindFromArchitecture(architecture),
        level: statusLevel(response.status),
        method: String(config.method || 'GET').toUpperCase(),
        endpoint: architecture.endpoint,
        service: serviceName,
        protocol: architecture.protocol,
        database: architecture.database,
        broker: architecture.broker,
        eventName: architecture.eventName,
        externalService: architecture.externalService,
        statusCode: response.status,
        responseTimeMs: Number.isFinite(responseTimeHeader) ? responseTimeHeader : elapsed,
        correlationId,
        userAction: architecture.userAction,
        result: architecture.result,
      });

      return response;
    },
    (error) => {
      const config = error.config || {};
      const monitor = config.metadata?.architectureMonitor || {};
      const elapsed = Math.round(performance.now() - (monitor.startedAt || performance.now()));
      const url = getFullUrl(config);
      const architecture = getHttpArchitecture(url);
      const status = error.response?.status;

      emitArchitectureLog({
        type: 'Error',
        level: 'error',
        method: String(config.method || 'GET').toUpperCase(),
        endpoint: architecture.endpoint,
        service: getHeader(error.response?.headers, 'x-service-name') || architecture.service,
        protocol: architecture.protocol,
        database: architecture.database,
        broker: architecture.broker,
        eventName: architecture.eventName,
        externalService: architecture.externalService,
        statusCode: status || 'NETWORK',
        responseTimeMs: elapsed,
        correlationId: getHeader(error.response?.headers, 'x-correlation-id') || monitor.correlationId,
        userAction: architecture.userAction,
        result: 'failed',
        errorMessage: error.response?.data?.message || error.message || 'Request failed',
      });

      return Promise.reject(error);
    }
  );
}

export function attachArchitectureFetchMonitor() {
  if (typeof window === 'undefined' || window.__architectureFetchMonitorAttached || !window.fetch) return;
  window.__architectureFetchMonitorAttached = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    const startedAt = performance.now();
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = String(init?.method || input?.method || 'GET').toUpperCase();
    const correlationId = createCorrelationId('fetch');
    const headers = new Headers(init?.headers || input?.headers || {});
    headers.set('X-Correlation-Id', headers.get('X-Correlation-Id') || correlationId);
    const nextInit = { ...init, headers };
    const architecture = getHttpArchitecture(url);

    try {
      const response = await originalFetch(input, nextInit);
      emitArchitectureLog({
        type: getLogKindFromArchitecture(architecture),
        level: statusLevel(response.status),
        method,
        endpoint: architecture.endpoint,
        service: response.headers.get('x-service-name') || architecture.service,
        protocol: architecture.protocol,
        database: architecture.database,
        broker: architecture.broker,
        eventName: architecture.eventName,
        externalService: architecture.externalService,
        statusCode: response.status,
        responseTimeMs: Math.round(performance.now() - startedAt),
        correlationId: response.headers.get('x-correlation-id') || correlationId,
        userAction: architecture.userAction,
        result: architecture.result,
      });
      return response;
    } catch (error) {
      emitArchitectureLog({
        type: 'Error',
        level: 'error',
        method,
        endpoint: architecture.endpoint,
        service: architecture.service,
        protocol: architecture.protocol,
        database: architecture.database,
        externalService: architecture.externalService,
        statusCode: 'NETWORK',
        responseTimeMs: Math.round(performance.now() - startedAt),
        correlationId,
        userAction: architecture.userAction,
        result: 'failed',
        errorMessage: error?.message || 'Fetch failed',
      });
      throw error;
    }
  };
}
