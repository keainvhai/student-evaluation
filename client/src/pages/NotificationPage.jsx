import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/notifications";
import "../styles/NotificationsPage.css";

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export default function NotificationsPage() {
  const {
    items,
    loading,
    unreadCount,
    filterUnreadOnly,
    setFilterUnreadOnly,
    loadList,
    markRead,
    deleteOne,
    refreshUnread,
  } = useNotificationStore();

  const nav = useNavigate();

  // 初次进入页面：默认显示全部。你也可以改为默认只看未读。
  useEffect(() => {
    loadList();
    refreshUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUnreadOnly]);

  const onToggleUnreadOnly = () => setFilterUnreadOnly(!filterUnreadOnly);

  const openItem = async (n) => {
    if (!n.read) await markRead(n.id);
    if (n.link) {
      // 站内路由或外链
      if (n.link.startsWith("http")) {
        window.open(n.link, "_blank", "noopener,noreferrer");
      } else {
        nav(n.link);
      }
    }
  };

  return (
    <div className="notif-page">
      <div className="notif-page-header">
        <h2>Notifications</h2>
        <div className="notif-actions">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={filterUnreadOnly}
              onChange={onToggleUnreadOnly}
            />
            <span>Only Unread</span>
          </label>
          <span className="unread-hint">Unread: {unreadCount}</span>
        </div>
      </div>

      {loading && <div className="notif-empty">Loading...</div>}

      {!loading && items.length === 0 && (
        <div className="notif-empty">
          {filterUnreadOnly
            ? "No unread notifications"
            : "No notifications yet"}
        </div>
      )}

      <ul className="notif-list">
        {items.map((n) => (
          <li key={n.id} className={`notif-item ${n.read ? "read" : "unread"}`}>
            <div className="notif-main" onClick={() => openItem(n)}>
              <div className="notif-title">
                {!n.read && <span className="dot" />}
                {n.title || "(No title)"}
              </div>
              {n.body && <div className="notif-body">{n.body}</div>}
              <div className="notif-meta">
                <span className="type">{n.type}</span>
                <span className="time">{formatTime(n.createdAt)}</span>
                {n.link && <span className="link-hint"></span>}
              </div>
            </div>

            <div className="notif-ops">
              {!n.read && (
                <button
                  className="btn btn-light"
                  onClick={() => markRead(n.id)}
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => deleteOne(n.id)}
                title="Delete"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
