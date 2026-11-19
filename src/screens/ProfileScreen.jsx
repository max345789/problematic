import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import EditProfileSheet from '../components/EditProfileSheet';

export default function ProfileScreen({ onOpenSettings, onOpenOnboarding, showToast }) {
  const {
    currentUser,
    isModerator,
    posts,
    comments,
    saveProfile,
    logout,
  } = useApp();

  const [editing, setEditing] = useState(false);

  const problemsPostedCount = currentUser?.problemsPosted ?? posts.filter((p) => p.authorId === currentUser?.id).length;

  const myRepliesCount = useMemo(() => {
    if (!currentUser) return 0;
    let count = 0;
    Object.keys(comments).forEach((postId) => {
      const list = comments[postId] || [];
      list.forEach((sol) => {
        if (sol.authorId === currentUser.id) count++;
      });
    });
    return count;
  }, [comments, currentUser]);

  return (
    <>
      <header className="h">
        <div className="logo">
          <span>Profile</span>
        </div>
      </header>

      <main id="main-content" className="screen-scroll" tabIndex={-1}>
        {/* User Profile Card */}
        <div className="profile-user-card" style={{ position: 'relative' }}>
          <button
            type="button"
            className="profile-settings-btn"
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
          >
            <Icon.Gear />
          </button>
          <div className="profile-header-top">
            <div
              className="av profile-avatar"
              style={{
                background: currentUser?.avatarBg || '#1F6F6B',
              }}
            >
              {currentUser?.avatar || '?'}
            </div>
            <div className="profile-user-details">
              <div className="profile-user-name" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span>{currentUser?.name || 'You'}</span>
                {isModerator && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      padding: '2px 7px',
                      borderRadius: 9999,
                      background: 'rgba(29, 155, 240, 0.15)',
                      color: '#1D9BF0',
                      border: '1px solid rgba(29, 155, 240, 0.35)',
                    }}
                    title="Community Moderator"
                  >
                    🛡️ MOD
                  </span>
                )}
              </div>
              <div className="profile-user-handle">{currentUser?.handle}</div>
              <div className="profile-user-bio">
                {currentUser?.bio || 'Problem solver & community collaborator.'}
              </div>
              <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#71767B',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Icon.Message size={11} />
                  <span>DMs: {currentUser?.messagingPermission === 'everyone' ? 'Everyone' : currentUser?.messagingPermission === 'nobody' ? 'Closed' : 'Requests Only'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions-row">
            <button className="gh profile-btn" onClick={() => setEditing(true)}>
              Edit profile
            </button>
            <button
              className="gh profile-btn danger"
              onClick={async () => {
                await logout();
                showToast?.('Logged out.');
              }}
            >
              Log out
            </button>
          </div>
        </div>

        {/* ================= MODERATOR ACCOUNT PRIVILEGES CARD ================= */}
        {isModerator && (
          <div
            style={{
              margin: '0 16px 12px',
              padding: '12px 16px',
              borderRadius: 14,
              background: '#16181C',
              border: '1px solid #2F3336',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(29, 155, 240, 0.12)',
                border: '1px solid rgba(29, 155, 240, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              🛡️
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E7E9EA' }}>
                Moderator Account
              </div>
              <div style={{ fontSize: 12, color: '#71767B', marginTop: 1, lineHeight: 1.35 }}>
                Full moderation access: delete unwanted problems, remove comments & revoke solutions.
              </div>
            </div>
          </div>
        )}

        {/* ================= COMMUNITY ACTIVITY METRICS ================= */}
        <div className="pc" style={{ margin: '0 16px 12px', padding: '16px' }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-sub)',
              marginBottom: 12,
            }}
          >
            Community Activity
          </div>
          <div className="rd-metrics-row" style={{ marginTop: 0 }}>
            <div className="rd-metric-item">
              <span className="rd-metric-val">{currentUser?.problemsSolved ?? 0}</span>
              <span className="rd-metric-label">Solutions</span>
            </div>
            <div className="rd-metric-item">
              <span className="rd-metric-val">{problemsPostedCount}</span>
              <span className="rd-metric-label">Broadcasts</span>
            </div>
            <div className="rd-metric-item">
              <span className="rd-metric-val">{myRepliesCount}</span>
              <span className="rd-metric-label">Replies</span>
            </div>
            <div className="rd-metric-item">
              <span
                className="rd-metric-val"
                style={{ color: (currentUser?.penalties || 0) > 0 ? '#F85149' : '#10B981' }}
              >
                {(currentUser?.penalties || 0) === 0 ? 'Good' : currentUser?.penalties}
              </span>
              <span className="rd-metric-label">Standing</span>
            </div>
          </div>
        </div>
      </main>

      {editing && (
        <EditProfileSheet
          currentUser={currentUser}
          onSave={async (updates) => {
            await saveProfile(updates);
            showToast?.('Profile updated.');
          }}
          onClose={() => setEditing(false)}
          onError={(msg) => showToast?.(msg)}
        />
      )}
    </>
  );
}
