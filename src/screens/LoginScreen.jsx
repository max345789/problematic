import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';

export default function LoginScreen({ onSuccess, onOpenStory, showToast }) {
  const { login, signup } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('rohitha');
  const [password, setPassword] = useState('password');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    try {
      setBusy(true);
      let user;
      if (mode === 'login') {
        user = await login(handle, password);
        showToast?.(`Welcome back, ${user.name}!`);
      } else {
        user = await signup({ name, handle, password });
        showToast?.(`Welcome, ${user.name}!`);
      }
      onSuccess?.(user);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen-wrap">
      <div className="login-glass-card">
        <div className="login-brand-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Icon.BrandMark size={44} style={{ color: 'var(--text-main)' }} />
          </div>
          <div className="login-logo">Problematic</div>
          <div className="login-subtitle">
            {mode === 'login' ? 'Log in to see what’s new.' : 'Create your account to get started.'}
          </div>
        </div>

        <form onSubmit={submit} className="login-form">
          {mode === 'signup' && (
            <div className="login-field-group">
              <label className="login-label">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="glass-input"
              />
            </div>
          )}

          <div className="login-field-group">
            <label className="login-label">Username</label>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter username"
              autoCapitalize="none"
              autoComplete="username"
              className="glass-input"
            />
          </div>

          <div className="login-field-group">
            <label className="login-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="glass-input"
            />
          </div>

          {error && <div className="login-error-msg">{error}</div>}

          <button className="pri login-submit-btn" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="login-toggle-row">
          {mode === 'login' ? 'New here? ' : 'Already have an account? '}
          <button
            type="button"
            className="login-toggle-btn"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
          >
            {mode === 'login' ? 'Create account' : 'Log in'}
          </button>
        </div>

        {mode === 'login' && (
          <div className="login-demo-pill">
            Demo login: <b>rohitha</b> / <b>password</b>
          </div>
        )}

        {onOpenStory && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              type="button"
              onClick={onOpenStory}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'underline',
              }}
            >
              <span>← Back to Story & Community Overview</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
