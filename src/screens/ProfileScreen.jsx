import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import PostCard from '../components/PostCard';
import EditProfileSheet from '../components/EditProfileSheet';
import CommentsSheet from '../components/CommentsSheet';
import CollectPrizeModal from '../components/CollectPrizeModal';
import { getRespectadeoTier } from '../services/storage';
import { timeAgo } from '../services/utils';

export default function ProfileScreen({ theme, onOpenBgSheet, onOpenNotifications, onOpenOnboarding, showToast }) {
  const {
    currentUser,
    posts,
    comments,
    commentCounts,
    saveProfile,
    logout,
    toggleLike,
    votePoll,
    deletePost,
    addComment,
    removeComment,
    acceptSolution,
    collectPendingPoints,
  } = useApp();

  const [editing, setEditing] = useState(false);
  const [commentsFor, setCommentsFor] = useState(null);
  const [profileTab, setProfileTab] = useState('problems'); // 'problems' | 'solutions'
  const [showCollectModal, setShowCollectModal] = useState(false);

  const myPosts = useMemo(
    () => posts.filter((p) => p.authorId === currentUser?.id),
    [posts, currentUser]
  );

  const pendingPoints = currentUser?.pendingPoints || 0;
  const problemsPostedCount = currentUser?.problemsPosted ?? myPosts.length;
  const milestoneProgress = problemsPostedCount % 10;

  // Collect all solutions provided by the current user across all problems
  const mySolutions = useMemo(() => {
    if (!currentUser) return [];
    const results = [];
    Object.keys(comments).forEach((postId) => {
      const parentPost = posts.find((p) => p.id === postId);
      const list = comments[postId] || [];
      list.forEach((sol) => {
        if (sol.authorId === currentUser.id) {
          results.push({
            ...sol,
            parentProblem: parentPost,
          });
        }
      });
    });
    return results;
  }, [comments, posts, currentUser]);

  const tier = getRespectadeoTier(currentUser?.respectadeo);

  const handleShare = async (post) => {
    const text = `"${post.title || post.text}" — by ${post.author} on Problamatic`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Problamatic Problem', text, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        showToast?.('Link copied to clipboard!');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') showToast?.('Could not share.');
    }
  };

  const bgPreview =
    theme === 'default'
      ? 'url(/default_bg.jpg) center/cover'
      : theme === 'ocean'
      ? 'linear-gradient(160deg,#0f2b3d,#2a7f9e)'
      : theme === 'dusk'
      ? 'linear-gradient(160deg,#2b1b3d,#a14a6b)'
      : '#E8ECEF';

  return (
    <>
      <header className="h">
        <div className="logo">Profile</div>
        <button className="ib" aria-label="Notifications" onClick={onOpenNotifications}>
          <Icon.Bell />
        </button>
      </header>

      <div className="screen-scroll">
        {/* User Profile Card */}
        <div className="profile-user-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              className="av"
              style={{
                background: currentUser?.avatarBg || '#1F6F6B',
                width: 68,
                height: 68,
                fontSize: 26,
              }}
            >
              {currentUser?.avatar || '?'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="gh" onClick={() => setEditing(true)}>
                Edit profile
              </button>
              <button
                className="gh"
                onClick={async () => {
                  await logout();
                  showToast?.('Logged out.');
                }}
              >
                Log out
              </button>
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 20, fontWeight: 800 }}>
            {currentUser?.name || 'You'}
          </div>
          <div className="pm">{currentUser?.handle}</div>
          <div style={{ marginTop: 8, color: '#14181F', fontSize: 14 }}>
            {currentUser?.bio || 'Problem solver & community collaborator.'}
          </div>
        </div>

        {/* ================= RESPECTADEO (RD POINTS) CARD (UNSLOPPED) ================= */}
        <div className="rd-hero-card">
          <div className="rd-header-row">
            <span className="rd-card-title">Respectadeo</span>
            <div className="rd-tier-pill">
              <span className="rd-tier-dot" style={{ background: tier.color }} />
              <span>{tier.title}</span>
            </div>
          </div>

          <div className="rd-score-block">
            <div className="rd-score-display">
              <span className="rd-score-number">
                {(currentUser?.respectadeo ?? 0).toFixed(1)}
              </span>
              <span className="rd-score-unit">RD</span>
            </div>
            <div className="rd-score-footnote">
              +0.1 RD per accepted solution · +1.0 RD per 10 problems
            </div>
          </div>

          {/* Pending Milestone Reward Banner OR Progress Track */}
          {pendingPoints > 0 ? (
            <div className="rd-collect-banner">
              <div className="rd-collect-info">
                <span className="rd-collect-tag">Milestone reached</span>
                <span className="rd-collect-desc">+{pendingPoints.toFixed(1)} RD reward ready to collect</span>
              </div>
              <button
                className="rd-collect-btn"
                onClick={() => setShowCollectModal(true)}
              >
                Collect
              </button>
            </div>
          ) : (
            <div className="rd-milestone-box">
              <div className="rd-milestone-header">
                <span>Next active reward (+1.0 RD)</span>
                <span>{milestoneProgress}/10 problems</span>
              </div>
              <div className="rd-progress-track">
                <div
                  className="rd-progress-bar"
                  style={{ width: `${Math.min(100, (milestoneProgress / 10) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Clean 4-Way Metric Row */}
          <div className="rd-metrics-row">
            <div className="rd-metric-item">
              <span className="rd-metric-val">{currentUser?.problemsSolved ?? 0}</span>
              <span className="rd-metric-label">Solved</span>
            </div>
            <div className="rd-metric-item">
              <span className="rd-metric-val">{problemsPostedCount}</span>
              <span className="rd-metric-label">Asked</span>
            </div>
            <div className="rd-metric-item">
              <span className="rd-metric-val">+{((currentUser?.problemsSolved ?? 0) * 0.1).toFixed(1)}</span>
              <span className="rd-metric-label">Earned</span>
            </div>
            <div className="rd-metric-item">
              <span
                className="rd-metric-val"
                style={{ color: (currentUser?.penalties || 0) > 0 ? '#F85149' : '#3FB950' }}
              >
                {(currentUser?.penalties || 0) === 0 ? 'Clean' : currentUser?.penalties}
              </span>
              <span className="rd-metric-label">Penalties</span>
            </div>
          </div>
        </div>

        {/* Quick Settings & Replay */}
        <div style={{ display: 'flex', gap: 10, margin: '0 16px 12px' }}>
          <div
            className="pc settings-quick-card"
            onClick={onOpenBgSheet}
            style={{
              flex: 1,
              margin: 0,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: bgPreview,
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Theme</div>
              <div className="pm" style={{ fontSize: 11 }}>Background</div>
            </div>
          </div>

          <div
            className="pc settings-quick-card"
            onClick={onOpenOnboarding}
            style={{
              flex: 1,
              margin: 0,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#FED053',
                display: 'grid',
                placeItems: 'center',
                fontSize: 16,
                boxShadow: '0 2px 6px rgba(254,208,83,0.3)',
              }}
            >
              ✨
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Tour</div>
              <div className="pm" style={{ fontSize: 11 }}>3 Screens</div>
            </div>
          </div>
        </div>

        {/* ================= TABBED USER ACTIVITY ================= */}
        <div className="profile-tabs">
          <div
            className="profile-tab-indicator"
            style={{
              transform: profileTab === 'problems' ? 'translateX(0%)' : 'translateX(100%)',
            }}
          />
          <button
            className={`profile-tab ${profileTab === 'problems' ? 'active' : ''}`}
            onClick={() => setProfileTab('problems')}
          >
            My Problems ({myPosts.length})
          </button>
          <button
            className={`profile-tab ${profileTab === 'solutions' ? 'active' : ''}`}
            onClick={() => setProfileTab('solutions')}
          >
            My Solutions ({mySolutions.length})
          </button>
        </div>

        {/* Tab 1: Problems posted by current user */}
        {profileTab === 'problems' && (
          <div>
            {myPosts.length === 0 && (
              <div className="pc" style={{ textAlign: 'center', padding: 28 }}>
                <div className="pnm" style={{ marginBottom: 6 }}>No problems posted yet</div>
                <div className="pm">Tap + on the feed to broadcast a problem worldwide.</div>
              </div>
            )}

            {myPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                commentCount={commentCounts[post.id] || 0}
                onLike={toggleLike}
                onComment={(p) => setCommentsFor(p)}
                onShare={handleShare}
                onVote={votePoll}
                onDelete={async (p) => {
                  await deletePost(p.id);
                  showToast?.('Problem deleted.');
                }}
              />
            ))}
          </div>
        )}

        {/* Tab 2: Solutions provided by current user */}
        {profileTab === 'solutions' && (
          <div>
            {mySolutions.length === 0 && (
              <div className="pc" style={{ textAlign: 'center', padding: 28 }}>
                <div className="pnm" style={{ marginBottom: 6 }}>No solutions contributed yet</div>
                <div className="pm">Browse open problems on the feed and answer to earn 0.1 RD points!</div>
              </div>
            )}

            {mySolutions.map((sol) => (
              <div
                key={sol.id}
                className="pc"
                onClick={() => {
                  if (sol.parentProblem) setCommentsFor(sol.parentProblem);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6472' }}>
                    Re: {sol.parentProblem?.title || 'Problem'}
                  </div>
                  {sol.isAccepted ? (
                    <span className="badge-accepted">
                      ✓ Accepted (+0.1 RD)
                    </span>
                  ) : sol.aiStatus === 'disqualified' ? (
                    <span className="badge-disqualified">
                      ⚠️ Disqualified
                    </span>
                  ) : (
                    <span className="badge-status badge-open">
                      In Review
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 14, color: '#14181F', lineHeight: 1.45, marginBottom: 8 }}>
                  "{sol.text}"
                </div>

                <div className="pm" style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{timeAgo(sol.createdAt)}</span>
                  <span style={{ color: '#1F6F6B', fontWeight: 600 }}>Tap to view thread →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {commentsFor && (
        <CommentsSheet
          post={commentsFor}
          comments={comments[commentsFor.id] || []}
          currentUser={currentUser}
          onAdd={addComment}
          onDelete={removeComment}
          onAccept={acceptSolution}
          onClose={() => setCommentsFor(null)}
          showToast={showToast}
        />
      )}

      {showCollectModal && (
        <CollectPrizeModal
          amount={pendingPoints > 0 ? pendingPoints : 1.0}
          taskName="10 Problems Broadcasted Milestone"
          newTotal={(currentUser?.respectadeo || 0) + (pendingPoints > 0 ? pendingPoints : 1.0)}
          onClaim={async () => {
            await collectPendingPoints();
            showToast?.('Milestone reward claimed to Respectadeo balance!');
            setTimeout(() => setShowCollectModal(false), 200);
          }}
          onClose={() => setShowCollectModal(false)}
          showToast={showToast}
        />
      )}
    </>
  );
}
