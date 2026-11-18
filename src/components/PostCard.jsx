import React, { useState } from 'react';
import Icon from './Icons';
import { timeAgo } from '../services/utils';

function Poll({ post, currentUserId, onVote }) {
  const [preview, setPreview] = useState(null);
  const voterIds = post.poll?.voterIds || [];
  const userHasVoted = voterIds.includes(currentUserId);
  const showResults = userHasVoted || preview != null;
  const totalVotes = post.poll.options.reduce((sum, o) => sum + (o.votes || 0), 0);

  return (
    <div className="poll-container">
      {post.poll.options.map((opt, i) => {
        const pct = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
        return (
          <button
            key={i}
            className={`poll-glass-btn ${showResults ? 'voted' : ''}`}
            onClick={() => {
              if (showResults) return;
              setPreview(i);
              onVote?.(i);
            }}
            disabled={showResults}
          >
            {showResults && (
              <span
                className="poll-glass-fill"
                style={{ width: `${pct}%` }}
              />
            )}
            <span className="poll-opt-label">
              {opt.text}
            </span>
            {showResults && (
              <span className="poll-opt-pct">
                {pct}%
              </span>
            )}
          </button>
        );
      })}
      <div style={{ fontSize: 12, color: '#536471', marginTop: 3, fontWeight: 500 }}>
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        {showResults ? ' • Final results' : ''}
      </div>
    </div>
  );
}

export default function PostCard({
  post,
  currentUserId,
  commentCount = 0,
  onLike,
  onComment,
  onShare,
  onVote,
  onDelete,
}) {
  const liked = (post.likedByIds || []).includes(currentUserId);
  const isOwn = post.authorId === currentUserId;
  const [menuOpen, setMenuOpen] = useState(false);

  // Extract tags from text or post.tags
  const tagsList = post.tags
    ? post.tags.split(' ').filter((t) => t.startsWith('#'))
    : [];

  return (
    <div className="tweet-card">
      {/* Left Column: Author Avatar */}
      <div className="tweet-avatar-col">
        <div
          className="av"
          style={{
            background: post.avatarBg,
            width: 42,
            height: 42,
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {post.avatar}
        </div>
      </div>

      {/* Right Column: Tweet Body, Media & Actions */}
      <div className="tweet-main-col">
        {/* Tweet Header: Name @handle · time */}
        <div className="tweet-header">
          <div className="tweet-user-info">
            <span className="tweet-name">{post.author}</span>
            <span className="tweet-handle">{post.handle}</span>
            <span className="tweet-dot">·</span>
            <span className="tweet-time">{timeAgo(post.createdAt)}</span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className="tweet-more-btn"
              aria-label="More"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Icon.More />
            </button>

            {menuOpen && (
              <>
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                />
                <div className="glass-dropdown-menu">
                  {isOwn ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete?.(post);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 10,
                        color: '#F4212E',
                        fontSize: 13,
                        fontWeight: 600,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon.Trash /> Delete post
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onShare?.(post);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#0F1419',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon.Share /> Share post
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Post Title (if different from text) */}
        {post.title && post.title !== post.text && (
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0F1419', marginBottom: 4 }}>
            {post.title}
          </div>
        )}

        {/* Tweet Text */}
        <div className="tweet-text">{post.text}</div>

        {/* Tags styled as clickable twitter hashtags */}
        {tagsList.length > 0 && (
          <div className="tweet-tags">
            {tagsList.map((tag, idx) => (
              <span key={idx} className="tweet-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Media attachment */}
        {post.image ? (
          <div className="tweet-image-wrapper">
            <img
              src={post.image}
              alt="Attachment"
              className="tweet-image-content"
            />
          </div>
        ) : null}

        {/* Optional Poll */}
        {post.poll ? (
          <Poll post={post} currentUserId={currentUserId} onVote={(i) => onVote?.(post.id, i)} />
        ) : null}

        {/* Twitter-style Action Bar */}
        <div className="tweet-actions-bar">
          {/* Replies */}
          <button
            className="tweet-action-btn tweet-reply-btn"
            aria-label="Replies"
            onClick={() => onComment?.(post)}
          >
            <Icon.Comment />
            <span>{commentCount > 0 ? commentCount : ''}</span>
          </button>

          {/* Retweet / Repost */}
          <button
            className="tweet-action-btn tweet-repost-btn"
            aria-label="Repost"
            onClick={() => onShare?.(post)}
          >
            <Icon.Retweet />
          </button>

          {/* Like (Heart) */}
          <button
            className={`tweet-action-btn tweet-like-btn ${liked ? 'liked' : ''}`}
            aria-label="Like"
            onClick={() => onLike?.(post.id)}
          >
            <Icon.Heart />
            <span>{post.likes > 0 ? post.likes : ''}</span>
          </button>

          {/* Bookmark / Share */}
          <button
            className="tweet-action-btn tweet-share-btn"
            aria-label="Share"
            onClick={() => onShare?.(post)}
          >
            <Icon.Bookmark />
          </button>
        </div>
      </div>
    </div>
  );
}
