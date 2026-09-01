import { useState, useEffect, useCallback } from "react";
import { adminService, type SystemNotification } from "../services/adminService";

/**
 * Single source of truth for admin notification state.
 * Used by AdminHeader (badge + drawer) and NotificationsScreen.
 * All components share the same fetch and update operations.
 */
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await adminService.getNotifications();
      setNotifications(data);
    } catch {
      // Silently handle network/auth issues
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    await adminService.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markOneRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    // Persist to backend (mark all read — we only have a bulk endpoint currently)
    try {
      await adminService.markNotificationsRead();
    } catch {
      // Revert optimistic update on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n)),
      );
    }
  }, []);

  return { notifications, loading, unreadCount, fetchNotifications, markAllRead, markOneRead };
}
