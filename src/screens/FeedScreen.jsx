import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import PostCard from '../components/PostCard';
import CommentsSheet from '../components/CommentsSheet';
import ShareModal from '../components/ShareModal';
import UserProfileSheet from '../components/UserProfileSheet';

export default function FeedScreen({
  onOpenNotifications,
  onOpenComposer,
  onOpenProfile,
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
  const [viewedUser, setViewedUser] = useState(null);

  const handleViewProfile = (authorId, handle, entityObj) => {
    const found = users.find((u) => u.id === authorId || (handle && u.handle?.toLowerCase() === handle.toLowerCase()));
    if (found) {
      setViewedUser(found);
    } else if (entityObj) {
      setViewedUser({
        id: authorId || entityObj.authorId || `user_${handle}`,
        name: entityObj.author || (handle ? handle.replace(/^@/, '') : 'User'),
        handle: handle || entityObj.handle || '@user',
        avatar: entityObj.avatar || (entityObj.author ? entityObj.author.charAt(0).toUpperCase() : 'U'),
        avatarBg: entityObj.avatarBg || '#1F6F6B',
        bio: 'Sharing real thoughts, pains, and everyday problems.',
        respectadeo: 1.0,
        problemsSolved: 0,
        problemsPosted: 1,
        messagingPermission: 'requests',
      });
    }
  };

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
      showToast?.(isModerator ? 'Resolution revoked by Moderator.' : 'Resolution revoked.');
    } catch (err) {
      showToast?.('Could not revoke resolution.');
      throw err;
    }
  };

  return (
    <>
      <header className="h feed-header">
        {/* col 1 — spacer so title stays perfectly centred */}
        <div aria-hidden="true" />
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
              onViewProfile={handleViewProfile}
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
          onViewProfile={handleViewProfile}
          onClose={() => setCommentsFor(null)}
          showToast={showToast}
        />
      )}

      {viewedUser && (
        <UserProfileSheet
          user={viewedUser}
          currentUser={currentUser}
          posts={posts}
          onClose={() => setViewedUser(null)}
          onDirectMessage={onDirectMessage}
          onOpenMyProfile={onOpenProfile}
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
