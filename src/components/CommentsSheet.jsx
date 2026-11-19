import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icons';
import { timeAgo } from '../services/utils';
import { getRespectadeoTier } from '../services/storage';

function renderWithMentions(content, onMention) {
  if (!content) return null;
  const parts = content.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, idx) => {
    if (/^@[a-zA-Z0-9_]+$/.test(part)) {
      return (
        <button
          key={idx}
          type="button"
          className="comment-mention-tag"
          onClick={(e) => {
            e.stopPropagation();
            onMention?.(part);
          }}
        >
          {part}
        </button>
      );
    }
    return part;
  });
}

export default function CommentsSheet({
  post,
  comments,
  users = [],
  currentUser,
  isModerator = false,
  onAdd,
  onDelete,
  onAccept,
  onRevokeSolution,
  onDisqualify,
  onDirectMessage,
  onClose,
  showToast,
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  const isAuthor = post.authorId === currentUser?.id;
  const acceptedComment = (comments || []).find(
    (c) => c.isAccepted || c.id === post.acceptedSolutionId
  );
  const solverUser = users.find(
    (u) => u.id === acceptedComment?.authorId || u.handle === acceptedComment?.handle
  );
  const solverTier = getRespectadeoTier(solverUser?.respectadeo || 1.0);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [comments?.length]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    try {
      setBusy(true);
      setError(null);
      await onAdd(post.id, text);
      setText('');
      showToast?.('Reply posted!');
    } catch (err) {
      setError(err?.message || 'Could not post reply.');
    } finally {
      setBusy(false);
    }
  };

  const handleAccept = async (comment) => {
    try {
      await onAccept(post.id, comment.id, comment.authorId);
      showToast?.(`Solution accepted! Marked as verified answer.`);
    } catch (err) {
      showToast?.('Could not accept solution.');
    }
  };

  const handleMention = (handleToken) => {
    const cleanHandle = handleToken.trim();
    if (!text.includes(cleanHandle)) {
      setText((prev) => (prev ? `${cleanHandle} ${prev}` : `${cleanHandle} `));
    }
  };

  const handleDirectMessageUser = (userId, handle) => {
    if (!userId) {
      const match = users.find((u) => u.handle.toLowerCase() === handle.toLowerCase());
      if (match) userId = match.id;
    }
    if (userId === currentUser?.id) {
      showToast?.('That is your own account.');
      return;
    }
    onClose?.();
    onDirectMessage?.(userId, handle);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="bottom-sheet" style={{ maxHeight: '88%', padding: 0, gap: 0 }}>
        {/* Header */}
        <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.16)' }}>
          <div className="sheet-handle" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main, #0F1419)' }}>
                Replies ({comments?.length || 0})
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-sub, #536471)', marginTop: 2 }}>
                Replying to <b style={{ color: 'var(--text-sub, #536471)' }}>{post.handle}</b>
              </div>
            </div>
            <button className="sheet-close-btn" onClick={onClose} aria-label="Close">
              <Icon.Close />
            </button>
          </div>
        </div>

        {/* Original Post Context in Replies Sheet */}
        <div style={{ background: 'var(--surface-subtle, #000000)', border: '1px solid var(--border-divider)', borderRadius: 14, padding: '12px 16px', margin: '0 18px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
            <div className="av" style={{ background: post.avatarBg, width: 28, height: 28, fontSize: 12 }}>
              {post.avatar}
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main, #F1F5F9)' }}>{post.author}</span>
            <span style={{ fontSize: 13, color: 'var(--text-sub, #94A3B8)' }}>{post.handle}</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-main, #F1F5F9)', lineHeight: 1.45, paddingLeft: 38 }}>
            {renderWithMentions(post.text, handleMention)}
          </div>
        </div>

        {/* Solution Resolver Mention Card if Solved */}
        {acceptedComment && (
          <div className="solver-mention-card">
            <div className="solver-mention-header">
              <div className="solver-mention-badge">
                <Icon.Check size={14} />
                <span>Solution Resolver</span>
              </div>
              <span className="solver-tier-pill" style={{ color: solverTier.color }}>
                {solverTier.title}
              </span>
            </div>

            <div className="solver-mention-body">
              <div className="av" style={{ background: acceptedComment.avatarBg, width: 34, height: 34, fontSize: 14, flex: 'none' }}>
                {acceptedComment.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-main)' }}>{acceptedComment.author}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text-sub)' }}>{acceptedComment.handle}</span>
                </div>
                <div className="solver-mention-quote">
                  "{acceptedComment.text.slice(0, 110)}{acceptedComment.text.length > 110 ? '…' : ''}"
                </div>
              </div>
            </div>

            <div className="solver-mention-actions">
              {acceptedComment.authorId !== currentUser?.id && (
                <button
                  type="button"
                  className="solver-action-btn"
                  onClick={() => handleDirectMessageUser(acceptedComment.authorId, acceptedComment.handle)}
                >
                  <Icon.Message size={13} />
                  <span>Message Resolver</span>
                </button>
              )}
              <button
                type="button"
                className="solver-action-btn"
                onClick={() => handleMention(acceptedComment.handle)}
              >
                <Icon.AtSign size={13} />
                <span>Mention @{acceptedComment.handle?.replace(/^@/, '')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Replies List */}
        <div
          ref={listRef}
          style={{ flex: 1, overflowY: 'auto', padding: '6px 18px', minHeight: 140 }}
        >
          {(!comments || comments.length === 0) && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-sub, #536471)' }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', opacity: 0.5 }}>
                <Icon.Comment size={26} />
              </div>
              <div style={{ fontWeight: 650, color: 'var(--text-main)', marginBottom: 4 }}>No replies yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>Share an answer or proposed solution.</div>
            </div>
          )}

          {(comments || []).map((c) => {
            const isDisqualified = c.aiStatus === 'disqualified';
            const isAccepted = c.isAccepted;

            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: '1px solid var(--border-divider)',
                  alignItems: 'flex-start',
                }}
              >
                <div className="av" style={{ background: c.avatarBg, width: 38, height: 38, fontSize: 15, flex: 'none' }}>
                  {c.avatar}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main, #0F1419)' }}>{c.author}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-sub, #536471)' }}>{c.handle}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted, #8B98A5)' }}>·</span>
                      <span style={{ fontSize: 12, color: 'var(--text-sub, #536471)' }}>{timeAgo(c.createdAt)}</span>
                      {c.authorId !== currentUser?.id && (
                        <button
                          type="button"
                          className="comment-msg-icon-btn"
                          title={`Message ${c.author}`}
                          aria-label={`Message ${c.author}`}
                          onClick={() => handleDirectMessageUser(c.authorId, c.handle)}
                        >
                          <Icon.Message size={13} />
                        </button>
                      )}
                    </div>

                    {(c.authorId === currentUser?.id || isModerator) && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await onDelete(post.id, c.id);
                            if (isModerator && c.authorId !== currentUser?.id) {
                              showToast?.('Comment removed by Moderator.');
                            }
                          } catch (err) {
                            showToast?.('Could not delete comment.');
                          }
                        }}
                        aria-label="Delete comment"
                        title={isModerator && c.authorId !== currentUser?.id ? 'Moderate: Delete comment' : 'Delete'}
                        style={{
                          padding: '4px 6px',
                          color: isModerator && c.authorId !== currentUser?.id ? '#EF4444' : 'var(--text-sub, #536471)',
                          background: isModerator && c.authorId !== currentUser?.id ? 'rgba(239, 68, 68, 0.12)' : 'none',
                          border: isModerator && c.authorId !== currentUser?.id ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <Icon.Trash size={13} />
                        {isModerator && c.authorId !== currentUser?.id && <span>Mod</span>}
                      </button>
                    )}
                  </div>

                  {/* Badges for status */}
                  {isAccepted && (
                    <div style={{ margin: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge-accepted">
                        <Icon.Check size={12} /> Accepted solution (+0.1 RD)
                      </span>
                      {(isAuthor || isModerator) && onRevokeSolution && (
                        <button
                          type="button"
                          className="revoke-solution-btn"
                          onClick={async () => {
                            try {
                              await onRevokeSolution(post.id, c.id, c.authorId);
                            } catch (err) {
                              // Error handled by onRevokeSolution handler
                            }
                          }}
                          title="Revoke / Delete resolution"
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            color: '#EF4444',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Icon.Close size={12} /> Revoke resolution
                        </button>
                      )}
                    </div>
                  )}

                  {isDisqualified && (
                    <div style={{ margin: '4px 0 6px' }}>
                      <span className="badge-disqualified">
                        Filtered by community moderation (Off-topic)
                      </span>
                    </div>
                  )}

                  {/* Reply Text */}
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.45,
                      color: isDisqualified ? '#64748B' : 'var(--text-main, #0F1419)',
                      textDecoration: isDisqualified ? 'line-through' : 'none',
                      wordBreak: 'break-word',
                      marginTop: 2,
                    }}
                  >
                    {renderWithMentions(c.text, handleMention)}
                  </div>

                  {/* Problem Author or Moderator Action: "Accept as Solution" / Flag */}
                  {(isAuthor || isModerator) && !isAccepted && !isDisqualified && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="accept-solution-btn"
                        onClick={() => handleAccept(c)}
                        title="Mark this comment as the accepted solution"
                      >
                        <Icon.Check size={13} /> Accept as solution
                      </button>
                      {isModerator && onDisqualify && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await onDisqualify(post.id, c.id, c.authorId, 'Off-topic comment');
                              showToast?.('Comment flagged as disqualified.');
                            } catch (err) {
                              showToast?.('Could not flag comment.');
                            }
                          }}
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#F59E0B',
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: '4px 8px',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          Flag Off-Topic
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Mention Resolver Pill */}
        {acceptedComment && (
          <div className="comments-quick-mention-bar">
            <button
              type="button"
              className="quick-mention-btn"
              onClick={() => handleMention(acceptedComment.handle)}
            >
              <Icon.AtSign size={13} />
              <span>Mention Resolver ({acceptedComment.handle})</span>
            </button>
          </div>
        )}

        {/* Post Reply Input Form */}
        <form onSubmit={submit} className="comments-input-form">
          <div className="av" style={{ background: currentUser?.avatarBg || '#1F6F6B', width: 34, height: 34, fontSize: 13, flex: 'none' }}>
            {currentUser?.avatar || '?'}
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Post your reply or solution…"
            className="glass-input comments-input"
          />
          <button
            className="pri"
            type="submit"
            disabled={!text.trim() || busy}
            style={{
              height: 38,
              padding: '0 16px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 999,
              opacity: !text.trim() || busy ? 0.5 : 1,
            }}
          >
            {busy ? 'Posting…' : 'Reply'}
          </button>
        </form>
      </div>
    </>
  );
}
