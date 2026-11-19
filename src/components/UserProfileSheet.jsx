import React, { useMemo } from 'react';
import Icon from './Icons';

export default function UserProfileSheet({
  user,
  currentUser,
  posts = [],
  onClose,
  onDirectMessage,
  onOpenMyProfile,
}) {
  if (!user) return null;

  const isMe = currentUser && (currentUser.id === user.id || currentUser.handle === user.handle);

  const userPosts = useMemo(() => {
    return posts.filter((p) => p.authorId === user.id || p.handle === user.handle);
  }, [posts, user]);

  const solvedCount = user.problemsSolved ?? 0;
  const postedCount = user.problemsPosted ?? userPosts.length;
  const respectadeo = (user.respectadeo != null ? Number(user.respectadeo) : 1.0).toFixed(1);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div
        className="bottom-sheet user-profile-sheet"
        style={{
          maxHeight: '85vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div className="sheet-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 750, color: 'var(--text-main, #0F1419)' }}>
            Profile
          </div>
          <button className="sheet-close-btn" onClick={onClose} aria-label="Close">
            <Icon.Close />
          </button>
        </div>

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            padding: '14px 16px',
            borderRadius: 14,
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-light, #E2E8F0)',
          }}
        >
          <div
            className="av"
            style={{
              background: user.avatarBg || '#1F6F6B',
              width: 58,
              height: 58,
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            {user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 750,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}
            >
              {user.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 2 }}>
              {user.handle?.startsWith('@') ? user.handle : `@${user.handle || 'user'}`}
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: 'var(--text-main)',
                marginTop: 8,
                lineHeight: 1.4,
                wordBreak: 'break-word',
              }}
            >
              {user.bio || 'Sharing real thoughts, pains, and everyday problems.'}
            </div>

            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 11.5,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'var(--card-sub-bg, rgba(0,0,0,0.04))',
                  color: 'var(--text-sub)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 500,
                }}
              >
                <Icon.Message size={11} />
                {user.messagingPermission === 'nobody'
                  ? 'DMs: Closed'
                  : user.messagingPermission === 'everyone'
                  ? 'DMs: Open'
                  : 'DMs: Requests Only'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div>
          {isMe ? (
            <button
              type="button"
              className="pri"
              onClick={() => {
                onClose();
                onOpenMyProfile?.();
              }}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 12,
                fontWeight: 650,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Go to my profile
            </button>
          ) : (
            <button
              type="button"
              className="pri"
              onClick={() => {
                onClose();
                onDirectMessage?.(user.id, user.handle);
              }}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 12,
                fontWeight: 650,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <Icon.Message size={16} />
              Message {user.name}
            </button>
          )}
        </div>

        {/* Activity & Standing Stats */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 14,
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-light, #E2E8F0)',
          }}
        >
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 650,
              color: 'var(--text-sub)',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Activity & Standing
          </div>
          <div className="rd-metrics-row" style={{ marginTop: 0 }}>
            <div className="rd-metric-item">
              <span className="rd-metric-val">{solvedCount}</span>
              <span className="rd-metric-label">Solutions</span>
            </div>
            <div className="rd-metric-item">
              <span className="rd-metric-val">{postedCount}</span>
              <span className="rd-metric-label">Broadcasts</span>
            </div>
            <div className="rd-metric-item">
              <span className="rd-metric-val">{respectadeo}</span>
              <span className="rd-metric-label">Standing RD</span>
            </div>
          </div>
        </div>

        {/* Posts by this User */}
        <div style={{ marginTop: 4 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-main)',
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Thoughts & Problems</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-sub)' }}>
              {userPosts.length} total
            </span>
          </div>

          {userPosts.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--text-sub)',
                fontSize: 13,
                background: 'var(--card-bg, #FFFFFF)',
                borderRadius: 12,
                border: '1px solid var(--border-light, #E2E8F0)',
              }}
            >
              No problems broadcast yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {userPosts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'var(--card-bg, #FFFFFF)',
                    border: '1px solid var(--border-light, #E2E8F0)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13.5,
                      color: 'var(--text-main)',
                      fontWeight: 500,
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {p.text}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 11.5,
                      color: 'var(--text-sub)',
                    }}
                  >
                    <span>{p.category || 'General'}</span>
                    <span
                      style={{
                        color: p.status === 'solved' ? '#10B981' : 'var(--text-sub)',
                        fontWeight: p.status === 'solved' ? 600 : 400,
                      }}
                    >
                      {p.status === 'solved' ? '✓ Solved' : 'Open'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
