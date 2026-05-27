import { createContext, useContext } from 'react';

export const ArchitectureMonitorContext = createContext({
  addLog: () => {},
  clearLogs: () => {},
  enabled: false,
  setEnabled: () => {},
});

export function useArchitectureMonitor() {
  return useContext(ArchitectureMonitorContext);
}
