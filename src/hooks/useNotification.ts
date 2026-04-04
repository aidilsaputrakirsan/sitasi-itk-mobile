import { useEffect, useRef, useState, useCallback } from 'react';
import { notifikasiApi } from '../api/endpoints/notifikasi';
import { useAuthStore } from '../stores/authStore';
import config from '../config/env';

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const response = await notifikasiApi.unreadCount();
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    fetchCount();
    intervalRef.current = setInterval(fetchCount, config.NOTIFICATION_POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, fetchCount]);

  return { unreadCount, refetch: fetchCount };
}
