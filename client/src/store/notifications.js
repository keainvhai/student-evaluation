import { create } from "zustand";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  removeNotification,
} from "../api/notifications";

export const useNotificationStore = create((set, get) => ({
  items: [],
  unreadCount: 0,
  loading: false,
  filterUnreadOnly: false,

  setFilterUnreadOnly: (v) => set({ filterUnreadOnly: v }),

  /** 刷新未读数量（Navbar 的 bell 用） */
  refreshUnread: async () => {
    try {
      const count = await fetchUnreadCount();
      set({ unreadCount: count });
    } catch (e) {
      // 静默失败，避免打断用户
      console.error("refreshUnread failed:", e);
    }
  },

  /** 拉取列表（通知页用） */
  loadList: async () => {
    const unreadOnly = get().filterUnreadOnly;
    set({ loading: true });
    try {
      const data = await fetchNotifications(unreadOnly);
      set({ items: data });
      // 页面切到“仅未读”时，未读数与 items 长度保持一致（不强制，以后以服务端为准）
    } finally {
      set({ loading: false });
    }
  },

  /** 标记某一条为已读（同时更新未读角标 & 列表） */
  markRead: async (id) => {
    const { items, unreadCount } = get();
    const target = items.find((x) => x.id === id);
    if (!target || target.read) return;

    // 先本地更新，提升交互手感
    set({
      items: items.map((x) => (x.id === id ? { ...x, read: true } : x)),
      unreadCount: Math.max(0, unreadCount - 1),
    });

    try {
      await markNotificationRead(id);
    } catch (e) {
      // 回滚（极少见）
      console.error("markRead failed:", e);
      set({
        items: items, // 回滚
        unreadCount,
      });
    }
  },

  /** 删除（常用于清理旧通知） */
  deleteOne: async (id) => {
    const { items } = get();
    const target = items.find((x) => x.id === id);
    const wasUnread = target && !target.read;

    // 本地预更新
    set({
      items: items.filter((x) => x.id !== id),
      unreadCount: wasUnread
        ? Math.max(0, get().unreadCount - 1)
        : get().unreadCount,
    });

    try {
      await removeNotification(id);
    } catch (e) {
      console.error("deleteOne failed:", e);
      // 最简单回滚：重新加载
      get().loadList();
      get().refreshUnread();
    }
  },
}));
