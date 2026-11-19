import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icons';

export default function ComposerSheet({ currentUser, restoreFocusEl, onPublish, onClose, onError }) {
  const [text, setText] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showPoll, setShowPoll] = useState(false);

  const sheetRef = useRef(null);
  const postBtnRef = useRef(null);
  const restoreTargetRef = useRef(restoreFocusEl);
  restoreTargetRef.current = restoreFocusEl;
  const isComposingRef = useRef(false);

  // Track active IME composition so Escape does not discard drafts
  useEffect(() => {
    let compResetTimer = null;
    const handleCompStart = () => {
      if (compResetTimer) clearTimeout(compResetTimer);
      isComposingRef.current = true;
    };
    const handleCompEnd = () => {
      if (compResetTimer) clearTimeout(compResetTimer);
      compResetTimer = setTimeout(() => { isComposingRef.current = false; }, 50);
    };
    window.addEventListener('compositionstart', handleCompStart);
    window.addEventListener('compositionend', handleCompEnd);
    return () => {
      if (compResetTimer) clearTimeout(compResetTimer);
      window.removeEventListener('compositionstart', handleCompStart);
      window.removeEventListener('compositionend', handleCompEnd);
    };
  }, []);

  // Restore keyboard focus only on actual composer unmount
  useEffect(() => {
    return () => {
      setTimeout(() => {
        if (restoreTargetRef.current && typeof restoreTargetRef.current.focus === 'function') {
          restoreTargetRef.current.focus();
        }
      }, 0);
    };
  }, []);

  const [closing, setClosing] = useState(false);
  const closingTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current);
    };
  }, []);

  // Safe dismiss guard: do not close while publish is actively running
  const handleDismiss = () => {
    if (busy || closing) return;
    setClosing(true);
    closingTimerRef.current = setTimeout(() => {
      onClose?.();
    }, 420);
  };

  // Move focus to sheet container on open and while busy without opening virtual keyboard or scrolling
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.focus({ preventScroll: true });
    }
  }, [busy]);

  // Trap keyboard focus inside modal and close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (e.isComposing || e.nativeEvent?.isComposing || isComposingRef.current || e.keyCode === 229) return;
        e.preventDefault();
        if (!busy && !closing) handleDismiss();
      }
      if (e.key === 'Tab') {
        if (busy) {
          e.preventDefault();
          sheetRef.current?.focus();
          return;
        }
        if (sheetRef.current) {
          const focusables = Array.from(
            sheetRef.current.querySelectorAll(
              'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          );
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (!sheetRef.current.contains(document.activeElement) || document.activeElement === sheetRef.current) {
              e.preventDefault();
              if (e.shiftKey) {
                last.focus();
              } else {
                first.focus();
              }
            } else if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, busy]);

  const addOption = () => {
    if (busy) return;
    if (pollOptions.length < 4) {
      const nextIdx = pollOptions.length;
      setPollOptions((prev) => [...prev, '']);
      setTimeout(() => {
        const inputs = sheetRef.current?.querySelectorAll('.composer-poll-input');
        if (inputs && inputs[nextIdx]) {
          inputs[nextIdx].focus();
        }
      }, 0);
    }
  };

  const removeOption = (i) => {
    if (busy) return;
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((_, idx) => idx !== i));
    setTimeout(() => {
      if (!sheetRef.current?.contains(document.activeElement)) {
        sheetRef.current?.querySelector('input:not([disabled]), textarea:not([disabled]), button:not([disabled])')?.focus();
      }
    }, 0);
  };

  const handleRemovePoll = () => {
    if (busy) return;
    setShowPoll(false);
    setTimeout(() => {
      if (!sheetRef.current?.contains(document.activeElement)) {
        sheetRef.current?.querySelector('input:not([disabled]), textarea:not([disabled]), button:not([disabled])')?.focus();
      }
    }, 0);
  };

  const safeSliceUnicode = (str, limit = 60) => {
    const codePoints = Array.from(str);
    return codePoints.length <= limit ? str : codePoints.slice(0, limit).join('');
  };

  const handlePublish = async (event) => {
    event?.preventDefault?.();
    if (busy) return;
    setError(null);

    const cleanText = text.trim();

    if (!cleanText) {
      setError('Please write your problem before posting.');
      return;
    }

    let poll = null;
    if (showPoll) {
      const opts = pollOptions.map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) {
        setError('Please add at least two poll choices.');
        return;
      }
      poll = { options: opts };
    }

    try {
      setBusy(true);
      await onPublish({
        title: safeSliceUnicode(cleanText, 60),
        text: cleanText,
        tags: '',
        category: 'general',
        domain: 'general',
        image: null,
        poll,
      });
      // Parent App manages dismissal on success
    } catch (err) {
      const msg = err?.message || 'Could not publish post.';
      setError(msg);
      onError?.(msg);
      setTimeout(() => {
        postBtnRef.current?.focus();
      }, 0);
    } finally {
      setBusy(false);
    }
  };

  const canPost = !busy && text.trim().length > 0;

  return (
    <div
      ref={sheetRef}
      tabIndex={-1}
      className={`composer-screen-independent ${closing ? 'closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="composer-heading"
      style={{ outline: 'none' }}
    >
      {/* Top Navigation Bar: Cancel | Title | Post */}
      <div className="composer-header-bar">
        <button
          type="button"
          onClick={handleDismiss}
          disabled={busy || closing}
          aria-label="Cancel"
            className="composer-cancel-btn"
          >
            Cancel
          </button>
          <div id="composer-heading" className="composer-header-title">
            New problem
          </div>
          <button
            ref={postBtnRef}
            type="button"
            className="composer-post-btn"
            onClick={handlePublish}
            disabled={!canPost}
          >
            {busy ? 'Posting…' : 'Post'}
          </button>
        </div>

        {/* Status Notification live region for progress announcements */}
        <div
          className="composer-status-banner"
          role="status"
          aria-live="polite"
        >
          {busy ? 'Publishing problem, please wait…' : ''}
        </div>

        {/* Error Notification live region kept mounted so screen readers announce changes */}
        <div
          className="composer-error-banner"
          role="alert"
          aria-live="polite"
        >
          {error || ''}
        </div>

        {/* Author Row */}
        <div className="composer-author-row">
          <div
            className="composer-avatar"
            style={{ background: currentUser?.avatarBg || '#1F6F6B' }}
          >
            {currentUser?.avatar || '?'}
          </div>
          <div className="composer-author-info">
            <span className="composer-author-name">{currentUser?.name || 'Anonymous'}</span>
            <span className="composer-author-handle">{currentUser?.handle || '@user'}</span>
          </div>
        </div>

        {/* Single Main Text Box (No Heading, No Auto-Focus) */}
        <div className="composer-inputs-wrap">
          <div className="composer-field-group">
            <textarea
              id="composer-desc-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's the problem or challenge you're facing?"
              rows={5}
              className="composer-textarea"
              maxLength={1000}
              disabled={busy}
              aria-label="Describe your problem"
            />
          </div>
        </div>

        {/* Optional Community Poll */}
        {showPoll && (
          <div className="composer-poll-card">
            <div className="composer-poll-header">
              <div className="composer-poll-title">
                <Icon.Poll /> Community poll
              </div>
              <button
                type="button"
                className="composer-poll-close-btn"
                onClick={handleRemovePoll}
                disabled={busy}
              >
                Remove
              </button>
            </div>
            <div className="composer-poll-options">
              {pollOptions.map((opt, i) => (
                <div key={i} className="composer-poll-row">
                  <span className="composer-poll-num">{i + 1}</span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPollOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
                    }}
                    placeholder={`Option ${i + 1}`}
                    className="composer-poll-input"
                    maxLength={50}
                    disabled={busy}
                  />
                  {pollOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      disabled={busy}
                      className="composer-poll-remove-opt-btn"
                      aria-label={`Remove option ${i + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {pollOptions.length < 4 && (
              <button
                type="button"
                className="composer-poll-add-opt-btn"
                onClick={addOption}
                disabled={busy}
              >
                + Add option
              </button>
            )}
          </div>
        )}

        {/* Bottom Toolbar: Poll Action & Char Count */}
        <div className="composer-bottom-bar">
          <div className="composer-tools">
            <button
              type="button"
              className={`composer-tool-btn ${showPoll ? 'active' : ''}`}
              onClick={() => {
                if (!busy) setShowPoll((v) => !v);
              }}
              disabled={busy}
              aria-pressed={showPoll}
              title={showPoll ? 'Remove poll' : 'Add a community poll'}
            >
              <Icon.Poll />
              <span>{showPoll ? 'Remove poll' : 'Add poll'}</span>
            </button>
          </div>

          <div className={`composer-char-count ${text.length > 900 ? 'near-limit' : ''}`}>
            {text.length} / 1000
          </div>
        </div>
      </div>
  );
}
