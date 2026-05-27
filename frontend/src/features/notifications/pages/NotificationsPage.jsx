import { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, CheckCheck } from 'lucide-react';
import GlassCard from '../../../shared/components/GlassCard';
import NotificationItem from '../components/NotificationItem';
import { notificationsApi } from '../api/notifications.api';
import { getNotificationSocket } from '../services/socket';
import { formatNotificationDisplay } from '../utils.notificationDisplay';
import { getCurrentUserId } from '../../../shared/utils/currentUser';

function isJobNotification(item) {
  return String(item?.type || item?.typeKey || '').toLowerCase().replace(/[.\-\s]+/g, '_').startsWith('job_');
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const userId = useMemo(() => getCurrentUserId(), []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, unreadRes] = await Promise.all([
        notificationsApi.list({ page: 1, limit: 20 }),
        notificationsApi.unreadCount(),
      ]);

      const nextItems = Array.isArray(listRes?.items)
        ? listRes.items.map((item) => formatNotificationDisplay(item)).filter((item) => !isJobNotification(item))
        : [];

      setItems(nextItems);
      setUnreadCount(Number(unreadRes?.count || 0));
    } catch (error) {
      console.error('Load notifications error:', error);
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleMarkRead = useCallback(async (notification) => {
    if (!notification?._id || notification.isRead) return;

    try {
      await notificationsApi.markRead(notification._id);
      setItems((prev) => prev.map((item) => item._id === notification._id ? formatNotificationDisplay({ ...item, isRead: true, readAt: new Date().toISOString() }) : item));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark notification as read error:', error);
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (!items.length || unreadCount <= 0) return;

    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      const now = new Date().toISOString();
      setItems((prev) => prev.map((item) => item.isRead ? item : formatNotificationDisplay({ ...item, isRead: true, readAt: now })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
    } finally {
      setMarkingAll(false);
    }
  }, [items.length, unreadCount]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    loadNotifications();

    const socket = getNotificationSocket();
    if (!socket) return;

    const onNewNotification = (notification) => {
      if (!notification?._id) return;
      const normalized = formatNotificationDisplay(notification);
      if (isJobNotification(normalized)) return;
      setItems((prev) => {
        const existed = prev.some((item) => item._id === normalized._id);
        return existed ? prev : [normalized, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notification:new', onNewNotification);
    return () => socket.off('notification:new', onNewNotification);
  }, [loadNotifications, userId]);

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-white">Thông báo</div>
            <div className="text-sm text-slate-400">{unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã được đọc'}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={markingAll || unreadCount <= 0}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCheck className="h-4 w-4" />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {!userId ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">Bạn cần đăng nhập để xem thông báo.</div>
      ) : loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">Chưa có thông báo nào.</div>
      ) : (
        <div className="mt-6 grid gap-3">
          {items.map((n) => (
            <NotificationItem key={n._id} n={n} onClick={handleMarkRead} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}
