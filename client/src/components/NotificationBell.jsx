import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNotificationStore } from "../store/notifications";
import "./NotificationBell.css";

export default function NotificationBell() {
  const { unreadCount, refreshUnread } = useNotificationStore();
  const location = useLocation();

  // 进入页面时拉一次；从通知页返回后也会触发
  useEffect(() => {
    refreshUnread();
    // 页面可见性变化时也刷新一次（切回标签页）
    const onVis = () =>
      document.visibilityState === "visible" && refreshUnread();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refreshUnread, location.pathname]);

  return (
    <Link to="/notifications" className="notif-bell" aria-label="Notifications">
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </Link>
  );
}
