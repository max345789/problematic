import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import EditProfileSheet from '../components/EditProfileSheet';

export default function ProfileScreen({ onOpenSettings, onOpenOnboarding, showToast }) {
  const {
    currentUser,
    posts,
    comments,
    saveProfile,
    logout,
    isDark,
    changeTheme,
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
            style={{
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              outline: 'none',
              padding: 0,
            }}
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
              {currentUser?.avatar || 'U'}
            </div>
            <div className="profile-user-details">
              <div className="profile-user-name" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span>{currentUser?.name || 'User'}</span>
              </div>
              <div className="profile-user-handle">
                {currentUser?.handle || '@user'}
              </div>
              <div className="profile-user-bio">
                {currentUser?.bio || 'Sharing real thoughts, pains, and everyday problems.'}
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

        {/* ================= SIMPLE THEME TOGGLE (DARK / LIGHT MODE) ================= */}
        <div className="profile-theme-card">
          <div className="profile-theme-info">
            <div className="profile-theme-icon-wrap" aria-hidden="true">
              {isDark ? <Icon.Moon size={18} /> : <Icon.Sun size={18} />}
            </div>
            <div className="profile-theme-text-col">
              <span className="profile-theme-heading">Appearance</span>
              <span className="profile-theme-subheading">
                {isDark ? 'Dark mode' : 'Light mode'}
              </span>
            </div>
          </div>
          <div className="profile-theme-toggle-group" role="group" aria-label="Theme mode selection">
            <button
              type="button"
              role="button"
              aria-pressed={!isDark}
              className={`profile-theme-toggle-btn ${!isDark ? 'active' : ''}`}
              onClick={() => changeTheme('light')}
            >
              <Icon.Sun size={14} />
              <span>Light</span>
            </button>
            <button
              type="button"
              role="button"
              aria-pressed={isDark}
              className={`profile-theme-toggle-btn ${isDark ? 'active' : ''}`}
              onClick={() => changeTheme('dark')}
            >
              <Icon.Moon size={14} />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* ================= COMMUNITY ACTIVITY METRICS ================= */}
        <div className="pc" style={{ margin: '0 14px 10px', padding: '14px 16px' }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 650,
              color: 'var(--text-sub)',
              marginBottom: 10,
            }}
          >
            Activity & Standing
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
