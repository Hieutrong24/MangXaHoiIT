import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import IncomingCallModal from '../../features/chat/call/IncomingCallModal';
import CallModal from '../../features/chat/call/CallModal';
import { getNotificationSocket, disconnectNotificationSocket } from '../../features/notifications/services/socket';
import {
  initCallManager,
  getCallManager,
  subscribeCallState,
} from '../../features/chat/call/callManager';
import { tokenStorage } from '../../services/tokenStorage';
import { settingsApi } from '../../features/settings/api/settings.api';
import { getCurrentUserId } from '../utils/currentUser';
import { ensureBrowserNotificationPermission, showBrowserNotification } from './browserNotification';
import {
  bindNotificationSoundUnlock,
  playNotificationSound,
  startIncomingCallRingtone,
  stopIncomingCallRingtone,
  syncNotificationSoundPreference,
} from './notificationSounds';

function getActorLabel(payload = {}) {
  return (
    payload?.actorName ||
    payload?.senderName ||
    payload?.fromUserName ||
    payload?.callerName ||
    payload?.fromUserId ||
    payload?.senderId ||
    payload?.userId ||
    'Ai đó'
  );
}

function normalizeNotificationPayload(payload = {}) {
  return {
    id: payload?._id || payload?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: payload?.title || 'Thông báo mới',
    body: payload?.body || payload?.message || '',
    createdAt: payload?.createdAt || new Date().toISOString(),
    type: payload?.type || payload?.typeKey || 'system',
  };
}

function isMessageNotification(item = {}) {
  const type = String(item?.type || item?.typeKey || '').toLowerCase();
  return type.includes('message') || type.includes('chat');
}

function ToastItem({ item, onClose }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{item.title}</div>
          <div className="mt-1 text-sm text-slate-300">{item.body}</div>
        </div>
        <button
          type="button"
          onClick={() => onClose(item.id)}
          className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

export default function SocialRealtimeBridge() {
  const location = useLocation();
  const [callState, setCallState] = useState(null);
  const [toasts, setToasts] = useState([]);

  const userId = useMemo(() => getCurrentUserId(), [location.key]);
  const token = useMemo(() => tokenStorage.get(), [location.key]);

  useEffect(() => bindNotificationSoundUnlock(), []);

  useEffect(() => {
    if (!userId) return undefined;

    let alive = true;
    settingsApi.get()
      .then((settings) => {
        if (!alive) return;
        const notifyPrefs = typeof settings?.notifyPrefsJson === 'string'
          ? JSON.parse(settings.notifyPrefsJson || '{}')
          : (settings?.notifyPrefsJson || {});
        syncNotificationSoundPreference(notifyPrefs);
      })
      .catch(() => {
        // Notification sounds still use the local default if settings cannot load.
      });

    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !token) {
      disconnectNotificationSocket();
      stopIncomingCallRingtone();
      return undefined;
    }

    initCallManager({ token, userId });
    const unsubscribe = subscribeCallState(setCallState);

    const notificationSocket = getNotificationSocket();
    if (!notificationSocket) {
      return unsubscribe;
    }

    const onNotification = async (payload) => {
      const item = normalizeNotificationPayload(payload);
      setToasts((prev) => [item, ...prev].slice(0, 4));
      window.dispatchEvent(new CustomEvent('social:notification:new', { detail: item }));
      playNotificationSound(isMessageNotification(item) ? 'message' : 'notification');

      if (document.hidden) {
        const permission = await ensureBrowserNotificationPermission();
        if (permission === 'granted') {
          showBrowserNotification(item.title, { body: item.body });
        }
      }
    };

    notificationSocket.on('notification:new', onNotification);

    return () => {
      unsubscribe?.();
      notificationSocket.off('notification:new', onNotification);
      stopIncomingCallRingtone();
    };
  }, [token, userId]);

  useEffect(() => {
    if (!callState || callState.status !== 'ringing') {
      stopIncomingCallRingtone();
      return undefined;
    }

    startIncomingCallRingtone();

    if (location.pathname === '/chat') {
      return () => stopIncomingCallRingtone();
    }

    const title = callState.type === 'video' ? 'Cuộc gọi video đến' : 'Cuộc gọi thoại đến';
    const actorName = getActorLabel(callState);
    ensureBrowserNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        showBrowserNotification(title, { body: `${actorName} đang gọi cho bạn.` });
      }
    });

    return () => stopIncomingCallRingtone();
  }, [callState, location.pathname]);

  useEffect(() => {
    if (!toasts.length) return undefined;

    const timers = toasts.map((item) =>
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((entry) => entry.id !== item.id));
      }, 5000)
    );

    return () => timers.forEach((timerId) => window.clearTimeout(timerId));
  }, [toasts]);

  const caller = useMemo(() => {
    if (!callState) return null;
    const id = callState.direction === 'incoming' ? callState.fromUserId : callState.toUserId;
    return {
      userId: id,
      fullName: getActorLabel(callState),
      username: id,
    };
  }, [callState]);

  const showIncoming = callState?.direction === 'incoming' && callState?.status === 'ringing';
  const showCallModal = !!callState && callState?.status !== 'ringing';
  const callManager = getCallManager();

  return (
    <>
      <div className="pointer-events-none fixed right-4 top-20 z-[70] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItem
              item={item}
              onClose={(id) => setToasts((prev) => prev.filter((entry) => entry.id !== id))}
            />
          </div>
        ))}
      </div>

      <IncomingCallModal
        open={showIncoming}
        call={callState}
        caller={caller}
        onAccept={() => callManager?.acceptIncoming?.()}
        onReject={() => callManager?.rejectIncoming?.()}
      />

      <CallModal
        open={showCallModal}
        call={callState}
        peer={caller}
        onHangup={() => callManager?.hangup?.()}
      />
    </>
  );
}
