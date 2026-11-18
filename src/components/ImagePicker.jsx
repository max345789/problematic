import React, { useRef, useState } from 'react';
import { fileToCompressedDataUrl } from '../services/utils';

/**
 * Real image picker. Uses the native browser/WebView file picker,
 * which opens the device gallery or camera on Android.
 */
export default function ImagePicker({ value, onChange, onError, label = 'Choose a photo' }) {
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
      onChange?.(dataUrl);
    } catch (err) {
      onError?.(err?.message || 'Could not process that image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      {value ? (
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
          <img
            src={value}
            alt="Selected"
            style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
          />
          <button
            onClick={() => onChange?.(null)}
            aria-label="Remove photo"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(20,24,31,0.75)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="gh"
          style={{ width: '100%', height: '48px', gap: 8 }}
          onClick={handlePick}
          disabled={busy}
        >
          {busy ? 'Processing…' : label}
        </button>
      )}

      {value && (
        <button
          type="button"
          className="gh"
          style={{ width: '100%', height: '40px', marginTop: 8, gap: 8 }}
          onClick={handlePick}
          disabled={busy}
        >
          {busy ? 'Processing…' : 'Replace photo'}
        </button>
      )}
    </div>
  );
}
