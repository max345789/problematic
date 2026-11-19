import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import PostCard from '../components/PostCard';
import CommentsSheet from '../components/CommentsSheet';
import ShareModal from '../components/ShareModal';

export default function FeedScreen({
  onOpenNotifications,
  onOpenComposer,
  onDirectMessage,
  showToast,
}) {
  const {
    posts,
    users,
    currentUser,
    isModerator,
    commentCounts,
    comments,
    unreadCount,
    toggleLike,
    votePoll,
    deletePost,
    addComment,
    removeComment,
    acceptSolution,
    revokeSolution,
    disqualifySolution,
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
      showToast?.(isModerator && post.authorId !== currentUser?.id ? 'Problem removed by Moderator.' : 'Problem deleted.');
    } catch (err) {
      showToast?.('Could not delete problem.');
    }
  };

  const handleRevokeSolution = async (postId, solutionId, solverId) => {
    try {
      await revokeSolution(postId, solutionId, solverId);
      showToast?.('Resolution revoked by Moderator.');
    } catch (err) {
      showToast?.('Could not revoke resolution.');
      throw err;
    }
  };

  return (
    <>
      <header className="h feed-header">
        <div className="feed-brand-wrap">
          <span className="feed-brand-title">Problematic</span>
        </div>
        <button
          type="button"
          className="feed-header-create-btn"
          onClick={onOpenComposer}
          aria-label="Create problem"
          title="Create problem"
        >
          <Icon.Plus size={24} />
        </button>
      </header>

      <main id="main-content" tabIndex={-1} className="screen-scroll">
        {/* Global Problems List */}
        <div>
          {posts.length === 0 && (
            <div className="empty-state-card">
              <Icon.Layers size={26} className="empty-state-icon" />
              <div className="empty-state-title">No problems yet</div>
              <div className="empty-state-desc">
                Broadcast the first problem to start solving.
              </div>
            </div>
          )}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUser?.id}
              isModerator={isModerator}
              commentCount={commentCounts[post.id] || 0}
              comments={comments[post.id] || []}
              onLike={toggleLike}
              onComment={(p) => setCommentsFor(p)}
              onShare={handleShare}
              onVote={votePoll}
              onDelete={handleDelete}
              onRevokeSolution={handleRevokeSolution}
              onDirectMessage={onDirectMessage}
            />
          ))}
        </div>
      </main>

      {commentsFor && (
        <CommentsSheet
          post={posts.find((p) => p.id === commentsFor.id) || commentsFor}
          comments={comments[commentsFor.id] || []}
          users={users}
          currentUser={currentUser}
          isModerator={isModerator}
          onAdd={addComment}
          onDelete={removeComment}
          onAccept={acceptSolution}
          onRevokeSolution={handleRevokeSolution}
          onDisqualify={disqualifySolution}
          onDirectMessage={onDirectMessage}
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
