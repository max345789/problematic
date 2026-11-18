import React, { useRef, useState } from 'react';
import { fileToCompressedDataUrl } from '../services/utils';

/**
 * Real image picker. Uses the native browser/WebView file picker,
 * which opens the device gallery or camera on Android.
 */
export default function ImagePicker({
  value,
  image,
  onChange,
  onSelect,
  onClear,
  onError,
  label = 'Choose a photo',
}) {
  const currentImage = value || image;
  const handleUpdate = onChange || onSelect;
  const handleClear = onClear || (() => handleUpdate?.(null));
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setBusy(true);
      const dataUrl = await fileToCompressedDataUrl(file);
      handleUpdate?.(dataUrl);
    } catch (err) {
      onError?.(err?.message || 'Could not process that image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ margin: '8px 0' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {currentImage ? (
        <div
          style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.75)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          <img
            src={currentImage}
            alt="Selected"
            style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
          />
          <button
            onClick={handleClear}
            aria-label="Remove photo"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="gh"
          style={{
            width: '100%',
            height: '46px',
            gap: 8,
            borderRadius: '16px',
            border: '1px dashed rgba(31, 111, 107, 0.4)',
            background: 'rgba(255, 255, 255, 0.55)',
          }}
          onClick={handlePick}
          disabled={busy}
        >
          {busy ? 'Processing…' : label}
        </button>
      )}

      {currentImage && (
        <button
          type="button"
          className="gh"
          style={{ width: '100%', height: '40px', marginTop: 8, gap: 8, borderRadius: '14px' }}
          onClick={handlePick}
          disabled={busy}
        >
          {busy ? 'Processing…' : 'Replace photo'}
        </button>
      )}
    </div>
  );
}
