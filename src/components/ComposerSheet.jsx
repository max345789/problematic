import React, { useState } from 'react';
import Icon from './Icons';
import ImagePicker from './ImagePicker';

const CATEGORIES = [
  '#tech',
  '#mobile',
  '#backend',
  '#frontend',
  '#design',
  '#career',
  '#hardware',
  '#general',
];

export default function ComposerSheet({ currentUser, onPublish, onClose, onError }) {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState('#tech');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showPoll, setShowPoll] = useState(false);

  const addOption = () => {
    if (pollOptions.length < 4) setPollOptions((prev) => [...prev, '']);
  };
  const removeOption = (i) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError(null);

    const cleanText = text.trim();
    if (!cleanText) {
      setError('Please write something before posting.');
      return;
    }

    let poll = null;
    if (showPoll) {
      const opts = pollOptions.map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) {
        setError('Add at least two poll options.');
        return;
      }
      poll = { options: opts };
    }

    try {
      setBusy(true);
      await onPublish({
        text: cleanText,
        tags: selectedTag,
        category: selectedTag,
        image,
        poll,
      });
      onClose();
    } catch (err) {
      const msg = err?.message || 'Could not publish post.';
      setError(msg);
      onError?.(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="bottom-sheet" style={{ maxHeight: '92%', overflowY: 'auto' }}>
        <div className="sheet-handle" />

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onClose} aria-label="Cancel" style={{ fontSize: 15, color: '#536471', fontWeight: 600 }}>
            Cancel
          </button>
          <button
            className="pri"
            onClick={handlePublish}
            disabled={busy || !text.trim()}
            style={{
              height: 36,
              padding: '0 18px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 999,
              opacity: !text.trim() || busy ? 0.5 : 1,
            }}
          >
            {busy ? 'Posting…' : 'Post'}
          </button>
        </div>

        {/* Main Compose Body (Twitter Style) */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div className="av" style={{ background: currentUser?.avatarBg || '#1F6F6B', width: 42, height: 42, fontSize: 16, flex: 'none' }}>
            {currentUser?.avatar || '?'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What problem or question do you have?"
              rows={5}
              autoFocus
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: 16,
                lineHeight: 1.45,
                fontFamily: 'inherit',
                color: '#0F1419',
                resize: 'none',
                background: 'transparent',
                boxSizing: 'border-box',
                padding: 0,
              }}
            />

            {/* Quick Hashtags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedTag(cat)}
                  className={`composer-tag-pill ${selectedTag === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <ImagePicker image={image} onSelect={setImage} onClear={() => setImage(null)} />

            {/* Optional Poll */}
            {showPoll && (
              <div className="composer-poll-box">
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F1419' }}>Poll Options</div>
                {pollOptions.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6 }}>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPollOptions((prev) => prev.map((o, idx) => (idx === i ? val : o)));
                      }}
                      placeholder={`Choice ${i + 1}`}
                      className="glass-input composer-poll-input"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="gh"
                        style={{ height: 36, width: 36, padding: 0 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button type="button" className="gh" onClick={addOption} style={{ height: 32, fontSize: 12 }}>
                    + Add option
                  </button>
                )}
              </div>
            )}

            {/* Bottom Actions toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, borderTop: '1px solid #EFF3F4', paddingTop: 8 }}>
              <button
                type="button"
                onClick={() => setShowPoll((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'none',
                  color: showPoll ? '#1D9BF0' : '#536471',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <Icon.Poll /> {showPoll ? 'Poll added' : 'Add poll'}
              </button>
            </div>

            {error && <div style={{ color: '#F4212E', fontSize: 13, marginTop: 8, fontWeight: 600 }}>{error}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
