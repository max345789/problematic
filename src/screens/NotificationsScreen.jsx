import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import { timeAgo, groupByDay } from '../services/utils';

const GROUPS = ['Today', 'Yesterday', 'Earlier'];

export default function NotificationsScreen({ showToast }) {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    clearNotifications,
    isDark,
    toggleDarkMode,
  } = useApp();

  const grouped = useMemo(() => {
    const map = { Today: [], Yesterday: [], Earlier: [] };
    notifications.forEach((n) => {
      const g = groupByDay(n.createdAt);
      (map[g] || map.Earlier).push(n);
    });
    return map;
  }, [notifications]);

  return (
    <>
      <header className="h">
        <div className="logo">
          <span>Notifications</span>
        </div>
      </header>

      {unreadCount > 0 && (
        <div className="notifications-unread-bar">
          <span className="notifications-unread-text">
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            className="gh"
            style={{ minHeight: 32, fontSize: 12, fontWeight: 600, padding: '0 12px', borderRadius: 999 }}
            onClick={async () => {
              await markAllRead();
              showToast?.('All notifications marked as read.');
            }}
          >
            Mark all read
          </button>
        </div>
      )}

      <main id="main-content" className="screen-scroll">
        {notifications.length === 0 && (
          <div className="gc" style={{ padding: 28, textAlign: 'center' }}>
            <div className="pnm" style={{ marginBottom: 6 }}>No notifications</div>
            <div className="pm">Activity on your posts will show up here.</div>
          </div>
        )}

        {GROUPS.map((group) =>
          grouped[group]?.length ? (
            <div className="gc" key={group}>
              <div className="sec">{group}</div>
              {grouped[group].map((n) => (
                <div
                  key={n.id}
                  className={`n ${n.unread ? 'un' : ''}`}
                  onClick={() => {
                    if (n.unread) markNotificationRead(n.id);
                  }}
                >
                  <div className="av" style={{ background: n.avatarBg }}>
                    {n.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className="nm">{n.name} </span>
                    <span style={{ color: 'var(--text-main, #0F1419)' }}>{n.text}</span>
                    <div className="pm" style={{ marginTop: 2 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {n.unread && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--link-blue, #1D9BF0)',
                        boxShadow: '0 0 8px rgba(29, 155, 240, 0.6)',
                        flex: 'none',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : null
        )}

        {notifications.length > 0 && (
          <div style={{ textAlign: 'center', padding: '12px 0 24px' }}>
            <button
              className="gh danger"
              style={{ minHeight: 38, fontSize: 13, fontWeight: 600, padding: '0 18px', borderRadius: 999 }}
              onClick={async () => {
                await clearNotifications();
                showToast?.('Notifications cleared.');
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </main>
    </>
  );
}
