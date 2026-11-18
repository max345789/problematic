import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import PostCard from '../components/PostCard';
import CommentsSheet from '../components/CommentsSheet';
import ComposerSheet from '../components/ComposerSheet';

export default function FeedScreen({ onOpenNotifications, showToast }) {
  const {
    posts,
    currentUser,
    commentCounts,
    comments,
    unreadCount,
    toggleLike,
    votePoll,
    deletePost,
    addComment,
    removeComment,
    acceptSolution,
    createPost,
    notify,
  } = useApp();

  const [composer, setComposer] = useState(null); // 'problem' | null
  const [commentsFor, setCommentsFor] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleShare = async (post) => {
    const shareData = {
      title: 'Problamatic Problem',
      text: `"${post.title || post.text}" — by ${post.author} on Problamatic`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await notify({
          type: 'share',
          name: currentUser?.name || 'You',
          avatar: currentUser?.avatar || 'Y',
          avatarBg: currentUser?.avatarBg || '#1F6F6B',
          text: 'shared your problem',
          postId: post.id,
          unread: false,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        showToast?.('Problem link copied to clipboard!');
      } else {
        showToast?.('Sharing is not supported on this device.');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') showToast?.('Could not share.');
    }
  };

  const handleDelete = async (post) => {
    try {
      await deletePost(post.id);
      showToast?.('Problem deleted.');
    } catch (err) {
      showToast?.('Could not delete problem.');
    }
  };

  return (
    <>
      <header className="h">
        <div className="logo">Problamatic</div>
        <button className="ib" aria-label="Notifications" onClick={onOpenNotifications}>
          <Icon.Bell />
          {unreadCount > 0 && <span className="dot" />}
        </button>
      </header>

      <div className="screen-scroll">
        {/* Worldwide Broadcast Composer Box */}
        <div
          className="composer-box"
          onClick={() => setComposer('problem')}
          role="button"
          tabIndex={0}
        >
          <div className="av" style={{ background: currentUser?.avatarBg || '#1F6F6B' }}>
            {currentUser?.avatar || '?'}
          </div>
          <div style={{ flex: 1, color: '#536471', fontSize: 15, fontWeight: 400 }}>
            What's the problem? Post to find solutions…
          </div>
        </div>

        {/* Global Problems List */}
        <div>
          {posts.length === 0 && (
            <div className="pc" style={{ textAlign: 'center', padding: 28 }}>
              <div className="pnm" style={{ marginBottom: 6 }}>No problems broadcasted yet</div>
              <div className="pm">Tap + to broadcast the first problem to the worldwide community.</div>
            </div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              commentCount={commentCounts[post.id] || 0}
              onLike={toggleLike}
              onComment={(p) => setCommentsFor(p)}
              onShare={handleShare}
              onVote={votePoll}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Floating action button + speed dial (fixed at position) */}
      <div className="fab-container">
        {menuOpen && (
          <>
            <div
              className="fab-item"
              onClick={() => {
                setMenuOpen(false);
                setComposer('problem');
              }}
            >
              <span className="fab-label">Broadcast Problem</span>
              <button className="fab-button" aria-label="Broadcast Problem">
                <Icon.Pencil />
              </button>
            </div>
          </>
        )}
        <button
          className={`fab-main ${menuOpen ? 'open' : ''}`}
          aria-label={menuOpen ? 'Close' : 'Broadcast Problem'}
          onClick={() => {
            setComposer('problem');
          }}
        >
          <Icon.Plus />
        </button>
      </div>

      {composer && (
        <ComposerSheet
          currentUser={currentUser}
          onPublish={async (payload) => {
            await createPost(payload);
            showToast?.('Posted to worldwide feed!');
          }}
          onClose={() => setComposer(null)}
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
    </>
  );
}
