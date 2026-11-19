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
  const [domainFilter, setDomainFilter] = useState('all'); // 'all' | 'mental' | 'physical' | 'dailylife' | 'tech'

  const DOMAIN_FILTERS = [
    { id: 'all', label: 'All', icon: Icon.Globe },
    { id: 'mental', label: 'Mental', icon: Icon.Brain },
    { id: 'physical', label: 'Physical', icon: Icon.Activity },
    { id: 'dailylife', label: 'Daily life', icon: Icon.Compass },
    { id: 'tech', label: 'Tech', icon: Icon.Terminal },
  ];

  const filteredPosts = posts.filter((p) => {
    if (domainFilter === 'all') return true;
    if (p.domain === domainFilter) return true;
    if (domainFilter === 'mental' && (p.category?.includes('mental') || p.tags?.includes('mental') || p.category?.includes('burnout'))) return true;
    if (domainFilter === 'physical' && (p.category?.includes('physical') || p.tags?.includes('physical') || p.category?.includes('posture'))) return true;
    if (domainFilter === 'dailylife' && (p.category?.includes('dailylife') || p.tags?.includes('home') || p.tags?.includes('diy'))) return true;
    if (domainFilter === 'tech' && (p.category?.includes('tech') || p.tags?.includes('mobile') || p.tags?.includes('backend') || p.tags?.includes('css'))) return true;
    return false;
  });

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
          <Icon.Plus size={19} />
        </button>
      </header>

      {/* Universal Problem Domains Pill Bar */}
      <div className="feed-domains-bar" role="group" aria-label="Filter problems by domain">
        {DOMAIN_FILTERS.map((f) => {
          const FilterIcon = f.icon;
          const isActive = domainFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={isActive}
              className={`domain-filter-pill ${isActive ? 'active' : ''}`}
              onClick={() => setDomainFilter(f.id)}
            >
              {FilterIcon && <FilterIcon size={14} className="domain-pill-icon" />}
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      <main id="main-content" tabIndex={-1} className="screen-scroll">
        {/* Global Problems List */}
        <div>
          {filteredPosts.length === 0 && (
            <div className="empty-state-card">
              <Icon.Layers size={26} className="empty-state-icon" />
              <div className="empty-state-title">No problems in this category</div>
              <div className="empty-state-desc">
                Broadcast a problem or switch filter back to all domains.
              </div>
            </div>
          )}
          {filteredPosts.map((post) => (
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
