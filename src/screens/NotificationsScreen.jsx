import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { timeAgo, groupByDay } from '../services/utils';

const GROUPS = ['Today', 'Yesterday', 'Earlier'];

export default function NotificationsScreen({ showToast }) {
  const { notifications, unreadCount, markNotificationRead, markAllRead, clearNotifications } = useApp();

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
        <div className="logo">Notifications</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              className="gh"
              style={{ height: 32, fontSize: 12, padding: '0 12px' }}
              onClick={async () => {
                await markAllRead();
                showToast?.('All notifications marked as read.');
              }}
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="screen-scroll">
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
                    <span style={{ color: '#14181F' }}>{n.text}</span>
                    <div className="pm" style={{ marginTop: 2 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {n.unread && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#1F6F6B',
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
          <div style={{ textAlign: 'center', padding: '4px 0 20px' }}>
            <button
              className="gh"
              style={{ height: 36, fontSize: 13 }}
              onClick={async () => {
                await clearNotifications();
                showToast?.('Notifications cleared.');
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}
