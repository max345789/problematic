import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icons';
import { timeAgo } from '../services/utils';

export default function CommentsSheet({
  post,
  comments,
  currentUser,
  onAdd,
  onDelete,
  onAccept,
  onClose,
  showToast,
}) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  const isAuthor = post.authorId === currentUser?.id;

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
            {post.text}
          </div>
        </div>

        {/* Replies List */}
        <div
          ref={listRef}
          style={{ flex: 1, overflowY: 'auto', padding: '6px 18px', minHeight: 140 }}
        >
          {(!comments || comments.length === 0) && (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-sub, #536471)' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>💬</div>
              <div style={{ fontWeight: 700, color: 'var(--text-main, #0F1419)', marginBottom: 4 }}>No replies yet</div>
              <div style={{ fontSize: 13 }}>Be the first to share an answer or solution.</div>
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
                    </div>

                    {c.authorId === currentUser?.id && (
                      <button
                        onClick={() => onDelete(post.id, c.id)}
                        aria-label="Delete"
                        style={{ padding: 4, color: 'var(--text-sub, #536471)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        <Icon.Trash />
                      </button>
                    )}
                  </div>

                  {/* Badges for status */}
                  {isAccepted && (
                    <div style={{ margin: '4px 0 6px' }}>
                      <span className="badge-accepted">
                        ✓ Author Accepted (+0.1 RD)
                      </span>
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
                    {c.text}
                  </div>

                  {/* Problem Author Action: "Accept as Solution" */}
                  {isAuthor && !isAccepted && !isDisqualified && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        className="accept-solution-btn"
                        onClick={() => handleAccept(c)}
                        title="Mark this comment as the accepted solution"
                      >
                        ✓ Accept as Solution
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
