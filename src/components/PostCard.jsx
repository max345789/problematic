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
      <div style={{ fontSize: 12, color: 'var(--text-sub, #536471)', marginTop: 3, fontWeight: 500 }}>
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        {showResults ? ' • Final results' : ''}
      </div>
    </div>
  );
}

export default function PostCard({
  post,
  currentUserId,
  isModerator = false,
  commentCount = 0,
  comments = [],
  onLike,
  onComment,
  onShare,
  onVote,
  onDelete,
  onRevokeSolution,
  onDirectMessage,
}) {
  const liked = (post.likedByIds || []).includes(currentUserId);
  const isOwn = post.authorId === currentUserId;
  const canDelete = isOwn || isModerator;
  const [menuOpen, setMenuOpen] = useState(false);

  const solverComment = post.status === 'solved'
    ? comments.find((c) => c.id === post.acceptedSolutionId || c.isAccepted)
    : null;

  // Extract tags from text or post.tags
  const tagsList = post.tags
    ? post.tags.split(' ').filter((t) => t.startsWith('#'))
    : [];

  const getDomainPill = (domain) => {
    switch (domain) {
      case 'mental': return { icon: Icon.Brain, label: 'Mental' };
      case 'physical': return { icon: Icon.Activity, label: 'Physical' };
      case 'dailylife': return { icon: Icon.Compass, label: 'Daily life' };
      case 'tech': return { icon: Icon.Terminal, label: 'Tech' };
      default: return null;
    }
  };

  const domainPill = getDomainPill(post.domain);

  return (
    <div className="tweet-card">
      {/* Top Header: Avatar + User Info (Name stacked with handle & time) */}
      <div className="tweet-header-row">
        <div className="tweet-avatar-wrap">
          <div
            className="av"
            style={{
              background: post.avatarBg || '#1F6F6B',
              width: 44,
              height: 44,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {post.avatar}
          </div>
        </div>

        <div className="tweet-user-info-stacked">
          <div className="tweet-author-line">
            <span className="tweet-name">{post.author}</span>
            {post.status === 'solved' && (
              <span className="badge-status badge-solved" style={{ flexShrink: 0 }}>Solved</span>
            )}
          </div>
          <div className="tweet-meta-sub">
            <span className="tweet-handle">{post.handle}</span>
            <span className="tweet-dot">·</span>
            <span className="tweet-time">{timeAgo(post.createdAt)}</span>
            {!isOwn && (
              <button
                type="button"
                className="tweet-header-msg-btn"
                title={`Message ${post.author}`}
                aria-label={`Message ${post.author}`}
                onClick={() => onDirectMessage?.(post.authorId, post.handle)}
              >
                <Icon.Message size={13} />
              </button>
            )}
          </div>
        </div>

        <div style={{ position: 'relative', marginLeft: 'auto', flexShrink: 0 }}>
          <button
            className="tweet-more-btn"
            aria-label="More"
            aria-expanded={menuOpen}
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
                {canDelete && (
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
                      borderRadius: 8,
                      color: '#EF4444',
                      fontSize: 13,
                      fontWeight: 600,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon.Trash /> {isOwn ? 'Delete problem' : 'Delete problem (Moderator)'}
                  </button>
                )}

                {isModerator && post.status === 'solved' && onRevokeSolution && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRevokeSolution?.(post.id, post.acceptedSolutionId);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      color: '#F59E0B',
                      fontSize: 13,
                      fontWeight: 600,
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon.Close /> Revoke resolution (Moderator)
                  </button>
                )}

                {!isOwn && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDirectMessage?.(post.authorId, post.handle);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1D9BF0',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon.Message size={15} /> Message {post.author}
                  </button>
                )}

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
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon.Share /> Share post
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Verified Resolution Strip */}
      {post.status === 'solved' && solverComment && (
        <div className="post-solver-strip">
          <div className="post-solver-left">
            <span className="post-solver-badge-icon">✓</span>
            <span className="post-solver-text">
              Resolved by <strong className="post-solver-handle">{solverComment.handle}</strong>
            </span>
          </div>
          {solverComment.authorId !== currentUserId && (
            <button
              type="button"
              className="post-solver-msg-btn"
              title={`Message ${solverComment.author}`}
              onClick={(e) => {
                e.stopPropagation();
                onDirectMessage?.(solverComment.authorId, solverComment.handle);
              }}
            >
              <Icon.Message size={12} />
              <span>Message</span>
            </button>
          )}
        </div>
      )}

      {/* Post Title (if different from text) */}
      {post.title && post.title !== post.text && (
        <div className="tweet-post-title">{post.title}</div>
      )}

      {/* Post Text */}
      <div className="tweet-text">{post.text}</div>

      {/* Tags & Domain Pill */}
      {(domainPill || tagsList.length > 0) && (
        <div className="tweet-tags">
          {domainPill && (
            <span className="tweet-domain-pill">
              {domainPill.icon && <domainPill.icon size={12} className="domain-tag-icon" />}
              <span>{domainPill.label}</span>
            </span>
          )}
          {tagsList.map((tag, idx) => (
            <span key={idx} className="tweet-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Media attachment with rounded preview */}
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

      {/* Modern Compact Flat Action Bar (Like, Reply, Share) - No text */}
      <div className="tweet-actions-bar">
        {/* Downside Triangle Like Button (Fills with white when pressed) */}
        <button
          type="button"
          className={`tweet-action-btn tweet-like-btn ${liked ? 'liked' : ''}`}
          aria-label={post.likes > 0 ? (liked ? `Liked (${post.likes})` : `Like (${post.likes})`) : (liked ? 'Liked' : 'Like')}
          title={post.likes > 0 ? (liked ? `Liked (${post.likes})` : `Like (${post.likes})`) : (liked ? 'Liked' : 'Like')}
          aria-pressed={liked}
          onClick={() => onLike?.(post.id)}
        >
          <Icon.TriangleDown filled={liked} />
        </button>

        {/* Reply / Comment */}
        <button
          type="button"
          className="tweet-action-btn tweet-reply-btn"
          aria-label={commentCount > 0 ? `Comments (${commentCount})` : 'Comments'}
          title={commentCount > 0 ? `Comments (${commentCount})` : 'Comments'}
          onClick={() => onComment?.(post)}
        >
          <Icon.Comment />
        </button>

        {/* Share */}
        <button
          type="button"
          className="tweet-action-btn tweet-share-btn"
          aria-label="Share post"
          title="Share post"
          onClick={() => onShare?.(post)}
        >
          <Icon.Share />
        </button>
      </div>
    </div>
  );
}
