import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import PostCard from '../components/PostCard';
import CommentsSheet from '../components/CommentsSheet';
import ShareModal from '../components/ShareModal';

export default function FeedScreen({ onOpenNotifications, onOpenComposer, showToast }) {
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
    notify,
    isDark,
    toggleDarkMode,
  } = useApp();

  const [commentsFor, setCommentsFor] = useState(null);
  const [sharingPost, setSharingPost] = useState(null);

  const handleShare = (post) => {
    setSharingPost(post);
  };

  const handleShareSuccess = async (msg) => {
    showToast?.(msg);
    if (sharingPost) {
      await notify({
        type: 'share',
        name: currentUser?.name || 'You',
        avatar: currentUser?.avatar || 'Y',
        avatarBg: currentUser?.avatarBg || '#1F6F6B',
        text: 'shared your problem',
        postId: sharingPost.id,
        unread: false,
      });
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
      <header className="h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo">
          <span>Problematic</span>
        </div>
        <button
          type="button"
          className="feed-header-create-btn"
          onClick={onOpenComposer}
          aria-label="Create Problem"
          title="Create Problem"
        >
          <Icon.Plus size={24} />
        </button>
      </header>

      <main id="main-content" tabIndex={-1} className="screen-scroll">
        {/* Global Problems List */}
        <div>
          {posts.length === 0 && (
            <div className="pc empty-card" style={{ textAlign: 'center', padding: 28 }}>
              <div className="pnm" style={{ marginBottom: 6 }}>No problems broadcasted yet</div>
              <div className="pm instruction-text">Tap + in the bottom navigation bar to broadcast the first problem to the worldwide community.</div>
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
      </main>

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

      {sharingPost && (
        <ShareModal
          post={sharingPost}
          onClose={() => setSharingPost(null)}
          onShareSuccess={handleShareSuccess}
        />
      )}
    </>
  );
}
