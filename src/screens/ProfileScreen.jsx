import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import EditProfileSheet from '../components/EditProfileSheet';

export default function ProfileScreen({ showToast }) {
  const {
    currentUser,
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
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon.BrandMark size={22} style={{ color: 'var(--text-main)' }} />
          <span>Profile</span>
        </div>
      </header>

      <main id="main-content" className="screen-scroll" tabIndex={-1}>
        {/* User Profile Card */}
        <div className="profile-user-card">
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
              <div className="profile-user-name">
                {currentUser?.name || 'You'}
              </div>
              <div className="profile-user-handle">{currentUser?.handle}</div>
              <div className="profile-user-bio">
                {currentUser?.bio || 'Problem solver & community collaborator.'}
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
