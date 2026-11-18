import React, { useState } from 'react';
import Icon from './Icons';

const COLORS = ['#1F6F6B', '#C2562F', '#3B5BDB', '#8A5CF6', '#B7791F', '#2C7A7B', '#B83280'];

export default function EditProfileSheet({ currentUser, onSave, onClose, onError }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [handle, setHandle] = useState(currentUser?.handle || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarBg, setAvatarBg] = useState(currentUser?.avatarBg || '#1F6F6B');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (!/^@?[a-zA-Z0-9_]{2,20}$/.test(handle.trim())) {
      setError('Username must be 2–20 letters, numbers or underscore.');
      return;
    }
    try {
      setBusy(true);
      await onSave({ name: name.trim(), handle: handle.trim(), bio: bio.trim(), avatarBg });
      onClose();
    } catch (err) {
      const msg = err?.message || 'Could not save your profile.';
      setError(msg);
      onError?.(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="bottom-sheet" style={{ maxHeight: '90%', overflowY: 'auto' }}>
        <div className="sheet-handle" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F1419' }}>Edit profile</div>
          <button className="sheet-close-btn" onClick={onClose} aria-label="Close">
            <Icon.Close />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="av" style={{ background: avatarBg, width: 64, height: 64, fontSize: 24 }}>
            {(name || '?').charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAvatarBg(c)}
                aria-label={`Avatar color ${c}`}
                className="color-dot-btn"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: c,
                  border: avatarBg === c ? '3px solid #14181F' : '2px solid rgba(255,255,255,0.8)',
                  boxShadow: avatarBg === c ? '0 0 0 2px rgba(255,255,255,0.6), 0 2px 8px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.15)',
                  transform: avatarBg === c ? 'scale(1.12)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            ))}
          </div>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600 }}>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          className="glass-input"
          style={{ height: 42, padding: '0 12px' }}
        />

        <label style={{ fontSize: 13, fontWeight: 600 }}>Username</label>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          maxLength={21}
          className="glass-input"
          style={{ height: 42, padding: '0 12px' }}
        />

        <label style={{ fontSize: 13, fontWeight: 600 }}>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={140}
          placeholder="Tell people a little about you"
          className="glass-input"
          style={{
            padding: 12,
            resize: 'none',
          }}
        />

        {error && <div style={{ color: '#C0392B', fontSize: 13 }}>{error}</div>}

        <button className="pri" style={{ height: 48 }} onClick={submit} disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </>
  );
}
