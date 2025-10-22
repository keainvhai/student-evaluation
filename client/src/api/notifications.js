// 复用你已有的 axios 实例：client/src/api.js
import api from "../api";

/** 获取通知列表（可选只取未读） */
export async function fetchNotifications(unread = false) {
  const res = await api.get("/notifications", {
    params: unread ? { unread: "true" } : {},
  });
  return res.data; // [{ id, userId, type, title, body, link, read, createdAt, updatedAt }, ...]
}

/** 获取未读数量 */
export async function fetchUnreadCount() {
  const res = await api.get("/notifications/unread-count");
  return res.data.count; // number
}

/** 标记已读 */
export async function markNotificationRead(id) {
  await api.patch(`/notifications/${id}/read`);
}

/** 删除通知 */
export async function removeNotification(id) {
  await api.delete(`/notifications/${id}`);
}
