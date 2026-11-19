import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icons';
import { fileToCompressedDataUrl } from '../services/utils';

const CATEGORIES = [
  '#tech',
  '#mental',
  '#physical',
  '#dailylife',
  '#career',
  '#mobile',
  '#backend',
  '#frontend',
  '#general',
];

export default function ComposerSheet({ currentUser, restoreFocusEl, onPublish, onClose, onError }) {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState('#tech');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showPoll, setShowPoll] = useState(false);

  const fileInputRef = useRef(null);
  const sheetRef = useRef(null);
  const postBtnRef = useRef(null);
  const photoReqCounterRef = useRef(0);
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
      // Invalidate any in-flight photo compression from this dismissed draft
      photoReqCounterRef.current++;
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

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || photoProcessing || busy) return;

    const currentReqId = ++photoReqCounterRef.current;
    try {
      setPhotoProcessing(true);
      setError(null);
      const dataUrl = await fileToCompressedDataUrl(file);
      if (currentReqId === photoReqCounterRef.current) {
        setImage(dataUrl);
      }
    } catch (err) {
      if (currentReqId === photoReqCounterRef.current) {
        const msg = err?.message || 'Could not process that image.';
        setError(msg);
        onError?.(msg);
      }
    } finally {
      if (currentReqId === photoReqCounterRef.current) {
        setPhotoProcessing(false);
      }
    }
  };

  const handleRemoveImage = () => {
    if (busy) return;
    photoReqCounterRef.current++;
    setPhotoProcessing(false);
    setImage(null);
    setTimeout(() => {
      if (!sheetRef.current?.contains(document.activeElement)) {
        sheetRef.current?.querySelector('textarea:not([disabled]), input:not([disabled]), button:not([disabled])')?.focus();
      }
    }, 0);
  };

  const safeSliceUnicode = (str, limit = 60) => {
    const codePoints = Array.from(str);
    return codePoints.length <= limit ? str : codePoints.slice(0, limit).join('');
  };

  const handlePublish = async (event) => {
    event?.preventDefault?.();
    if (busy || photoProcessing) return;
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
      let domain = 'general';
      if (selectedTag.includes('mental')) domain = 'mental';
      else if (selectedTag.includes('physical')) domain = 'physical';
      else if (selectedTag.includes('dailylife') || selectedTag.includes('diy') || selectedTag.includes('home')) domain = 'dailylife';
      else if (selectedTag.includes('tech') || selectedTag.includes('mobile') || selectedTag.includes('backend') || selectedTag.includes('frontend')) domain = 'tech';

      await onPublish({
        title: safeSliceUnicode(cleanText, 60),
        text: cleanText,
        tags: selectedTag,
        category: selectedTag,
        domain,
        image,
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

  const canPost = !busy && !photoProcessing && text.trim().length > 0;

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
            New Problem
          </div>
          <button
            ref={postBtnRef}
            type="button"
            className="composer-post-btn"
            onClick={handlePublish}
            disabled={!canPost}
          >
            {busy ? 'Posting…' : photoProcessing ? 'Processing…' : 'Post'}
          </button>
        </div>

        {/* Status Notification live region for progress announcements */}
        <div
          className="composer-status-banner"
          role="status"
          aria-live="polite"
        >
          {busy ? 'Publishing problem, please wait…' : photoProcessing ? 'Optimizing photo, please wait…' : ''}
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
          <div className="composer-tag-badge">
            {selectedTag}
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

        {/* Image Attachment Preview */}
        {image && (
          <div className="composer-image-preview">
            <img src={image} alt="Attachment" className="composer-preview-img" />
            <button
              type="button"
              className="composer-remove-img-btn"
              onClick={handleRemoveImage}
              disabled={busy}
              aria-label="Remove image"
            >
              <Icon.Close />
            </button>
          </div>
        )}

        {/* Optional Community Poll */}
        {showPoll && (
          <div className="composer-poll-card">
            <div className="composer-poll-header">
              <div className="composer-poll-title">
                <Icon.Poll /> Community Poll
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

        {/* Topic / Category Selector */}
        <div className="composer-category-section">
          <span className="composer-category-label">Select Topic</span>
          <div className="composer-category-scroll">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => {
                  if (!busy) setSelectedTag(cat);
                }}
                disabled={busy}
                aria-pressed={selectedTag === cat}
                className={`composer-tag-chip ${selectedTag === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Toolbar: Photo + Poll Actions & Char Count */}
        <div className="composer-bottom-bar">
          <div className="composer-tools">
            <button
              type="button"
              className={`composer-tool-btn ${image ? 'active' : ''}`}
              onClick={() => {
                if (!photoProcessing && !busy) fileInputRef.current?.click();
              }}
              disabled={busy}
              aria-disabled={photoProcessing || busy}
              aria-busy={photoProcessing}
              title="Add photo from gallery"
            >
              <Icon.Photo />
              <span>{photoProcessing ? 'Processing…' : image ? 'Change photo' : 'Add photo'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFile}
              disabled={busy}
              style={{ display: 'none' }}
            />

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
