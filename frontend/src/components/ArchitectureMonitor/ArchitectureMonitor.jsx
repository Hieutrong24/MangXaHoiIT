import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ARCH_MONITOR_EVENT,
  ARCH_MONITOR_SOCKET_EVENT,
  isArchitectureMonitorEnabled,
  setArchitectureMonitorEnabled,
} from '../../architecture/monitorBus';
import { attachArchitectureFetchMonitor } from '../../architecture/httpMonitor';
import { ArchitectureMonitorContext } from './ArchitectureMonitorContext';
import './ArchitectureMonitor.css';

const MAX_LOGS = 200;
const POSITION_KEY = 'arch-monitor-position';
const COLLAPSED_KEY = 'arch-monitor-collapsed';
const FILTERS = ['All', 'HTTP', 'WebSocket', 'Database', 'RabbitMQ/Event', 'Error'];

function readJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage restrictions.
  }
}

function formatTime(value) {
  try {
    return new Date(value).toLocaleTimeString('vi-VN', { hour12: false });
  } catch {
    return '';
  }
}

function typeIcon(type) {
  if (type === 'HTTP') return 'HTTP';
  if (type === 'WebSocket') return 'WS';
  if (type === 'Event') return 'EVT';
  if (type === 'Database') return 'DB';
  if (type === 'External Service') return 'EXT';
  if (type === 'Error') return 'ERR';
  return 'LOG';
}

function matchesFilter(log, filter) {
  if (filter === 'All') return true;
  if (filter === 'RabbitMQ/Event') return log.type === 'Event' || !!log.broker;
  if (filter === 'Database') return !!log.database;
  if (filter === 'Error') return log.type === 'Error' || log.level === 'error';
  return log.type === filter;
}

function exportLogs(logs, format) {
  const content = format === 'json'
    ? JSON.stringify(logs, null, 2)
    : logs.map((log) => `[${log.timestamp}] ${log.type} ${log.method || ''} ${log.endpoint || log.eventName || ''} ${log.statusCode || ''} ${log.responseTimeMs ?? '-'}ms ${log.service || ''} ${log.result || ''}`).join('\n');
  const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `architecture-monitor-${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ArchitectureMonitorProvider({ children }) {
  const [enabled, setEnabledState] = useState(() => isArchitectureMonitorEnabled());
  const [logs, setLogs] = useState([]);
  const [socketStatus, setSocketStatus] = useState('idle');

  const addLog = useCallback((entry) => {
    setLogs((prev) => [...prev, { ...entry, id: entry.id || `${Date.now()}-${Math.random()}` }].slice(-MAX_LOGS));
  }, []);

  const setEnabled = useCallback((next) => {
    setEnabledState(!!next);
    setArchitectureMonitorEnabled(!!next);
  }, []);

  useEffect(() => {
    attachArchitectureFetchMonitor();
  }, []);

  useEffect(() => {
    const onLog = (event) => addLog(event.detail);
    const onSocket = (event) => setSocketStatus(event.detail || 'idle');
    const onToggle = (event) => setEnabledState(!!event.detail?.enabled);

    window.addEventListener(ARCH_MONITOR_EVENT, onLog);
    window.addEventListener(ARCH_MONITOR_SOCKET_EVENT, onSocket);
    window.addEventListener('it-social:architecture-monitor:toggle', onToggle);
    return () => {
      window.removeEventListener(ARCH_MONITOR_EVENT, onLog);
      window.removeEventListener(ARCH_MONITOR_SOCKET_EVENT, onSocket);
      window.removeEventListener('it-social:architecture-monitor:toggle', onToggle);
    };
  }, [addLog]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
        event.preventDefault();
        setEnabled(!enabled);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, setEnabled]);

  const value = useMemo(() => ({
    addLog,
    clearLogs: () => setLogs([]),
    enabled,
    setEnabled,
  }), [addLog, enabled, setEnabled]);

  return (
    <ArchitectureMonitorContext.Provider value={value}>
      {children}
      {enabled ? (
        <ArchitectureMonitor
          logs={logs}
          socketStatus={socketStatus}
          onClear={() => setLogs([])}
          onDisable={() => setEnabled(false)}
        />
      ) : null}
    </ArchitectureMonitorContext.Provider>
  );
}

function ArchitectureMonitor({ logs, socketStatus, onClear, onDisable }) {
  const [collapsed, setCollapsed] = useState(() => readJson(COLLAPSED_KEY, false));
  const [position, setPosition] = useState(() => readJson(POSITION_KEY, null));
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const dragRef = useRef(null);
  const listRef = useRef(null);

  const stats = useMemo(() => {
    const httpLogs = logs.filter((log) => log.type === 'HTTP' || log.type === 'External Service' || log.type === 'Error');
    const success = httpLogs.filter((log) => Number(log.statusCode) >= 200 && Number(log.statusCode) < 400).length;
    const errors = logs.filter((log) => log.level === 'error' || log.type === 'Error' || Number(log.statusCode) >= 400).length;
    const timed = logs.filter((log) => Number.isFinite(Number(log.responseTimeMs)));
    const avg = timed.length ? Math.round(timed.reduce((sum, log) => sum + Number(log.responseTimeMs), 0) / timed.length) : 0;
    const realtime = logs.filter((log) => log.type === 'WebSocket' || log.type === 'Event').length;
    return { total: httpLogs.length, success, errors, avg, realtime };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return logs.filter((log) => {
      if (!matchesFilter(log, filter)) return false;
      if (!needle) return true;
      return [log.endpoint, log.service, log.eventName, log.database, log.externalService]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(needle));
    });
  }, [filter, logs, query]);

  useEffect(() => {
    writeJson(COLLAPSED_KEY, collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (position) writeJson(POSITION_KEY, position);
  }, [position]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [filteredLogs.length]);

  const startDrag = (event) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.closest('.architecture-monitor').getBoundingClientRect();
    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    document.body.classList.add('arch-monitor-dragging');
  };

  useEffect(() => {
    const onMove = (event) => {
      if (!dragRef.current) return;
      const width = collapsed ? 380 : 390;
      const height = collapsed ? 56 : 520;
      const x = Math.min(Math.max(8, event.clientX - dragRef.current.offsetX), window.innerWidth - width - 8);
      const y = Math.min(Math.max(8, event.clientY - dragRef.current.offsetY), window.innerHeight - height - 8);
      setPosition({ x, y });
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.classList.remove('arch-monitor-dragging');
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [collapsed]);

  const panelStyle = position ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined;

  return (
    <section className={`architecture-monitor ${collapsed ? 'is-collapsed' : ''}`} style={panelStyle}>
      <header className="arch-monitor-titlebar" onMouseDown={startDrag}>
        <div>
          <div className="arch-monitor-title">Architecture Monitor</div>
          <div className="arch-monitor-subtitle">Prototype telemetry, masked metadata only</div>
        </div>
        <div className="arch-monitor-actions">
          <button type="button" onClick={() => setCollapsed((value) => !value)} title="Thu nhỏ/mở rộng">
            {collapsed ? 'Open' : 'Min'}
          </button>
          <button type="button" onClick={onClear} title="Xóa log">Clear</button>
          <button type="button" onClick={() => navigator.clipboard?.writeText(JSON.stringify(logs, null, 2))} title="Copy log">Copy</button>
          <button type="button" onClick={() => exportLogs(logs, 'json')} title="Export JSON">JSON</button>
          <button type="button" onClick={onDisable} title="Tắt monitor">Off</button>
        </div>
      </header>

      {!collapsed ? (
        <>
          <div className="arch-monitor-stats">
            <div><span>Total</span><strong>{stats.total}</strong></div>
            <div><span>OK</span><strong>{stats.success}</strong></div>
            <div><span>Error</span><strong>{stats.errors}</strong></div>
            <div><span>Avg</span><strong>{stats.avg}ms</strong></div>
            <div><span>Socket</span><strong>{socketStatus}</strong></div>
            <div><span>Realtime</span><strong>{stats.realtime}</strong></div>
          </div>

          <div className="arch-monitor-toolbar">
            <div className="arch-monitor-filters">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={filter === item ? 'active' : ''}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search endpoint/service"
            />
          </div>

          <div className="arch-monitor-list" ref={listRef}>
            {filteredLogs.length === 0 ? (
              <div className="arch-monitor-empty">No architecture logs yet. Trigger login, profile, post, chat, notification, upload or Code Judge APIs.</div>
            ) : filteredLogs.map((log) => (
              <article key={log.id} className={`arch-log arch-log-${log.level || 'success'}`}>
                <button type="button" className="arch-log-main" onClick={() => setExpandedId((id) => id === log.id ? null : log.id)}>
                  <span className="arch-log-icon">{typeIcon(log.type)}</span>
                  <span className="arch-log-content">
                    <span className="arch-log-line">
                      <strong>{log.method || log.type}</strong>
                      <span>{log.endpoint || log.eventName}</span>
                    </span>
                    <span className="arch-log-meta">
                      {formatTime(log.timestamp)} | {log.service} | {log.statusCode || 'OK'} | {log.responseTimeMs ?? 'near'}ms
                    </span>
                  </span>
                </button>
                {expandedId === log.id ? (
                  <dl className="arch-log-details">
                    <div><dt>Action</dt><dd>{log.userAction || '-'}</dd></div>
                    <div><dt>Protocol</dt><dd>{log.protocol || '-'}</dd></div>
                    <div><dt>Database</dt><dd>{log.database || '-'}</dd></div>
                    <div><dt>Event/Broker</dt><dd>{log.eventName || log.broker || '-'}</dd></div>
                    <div><dt>External</dt><dd>{log.externalService || '-'}</dd></div>
                    <div><dt>Correlation</dt><dd>{log.correlationId || '-'}</dd></div>
                    <div><dt>Result</dt><dd>{log.errorMessage || log.result || '-'}</dd></div>
                  </dl>
                ) : null}
              </article>
            ))}
          </div>

          <div className="arch-monitor-footer">
            <button type="button" onClick={() => exportLogs(logs, 'txt')}>Export TXT</button>
            <span>Shortcut: Ctrl + Shift + M</span>
          </div>
        </>
      ) : null}
    </section>
  );
}
