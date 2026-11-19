import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';

export default function LoginScreen({ onSuccess, onOpenStory, showToast }) {
  const { login, signup } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError(null);
    setConfirmPassword('');
  };

  const handleHandleChange = (e) => {
    setError(null);
    const raw = e.target.value;
    // Auto-normalize: strip leading @, remove whitespace, lowercase
    const normalized = raw.replace(/^@+/, '').replace(/\s+/g, '').toLowerCase();
    setHandle(normalized);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const cleanHandle = handle.trim().replace(/^@+/, '').toLowerCase();
    const finalHandle = `@${cleanHandle}`;

    if (mode === 'login') {
      if (!cleanHandle) {
        setError('Please enter your username.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }
    } else {
      const cleanName = name.trim();
      if (!cleanName) {
        setError('Please enter your full name.');
        return;
      }
      if (!cleanHandle) {
        setError('Please choose a username.');
        return;
      }
      if (!/^@[a-z0-9_]{2,20}$/.test(finalHandle)) {
        setError('Username must be 2–20 characters: letters, numbers, or underscore.');
        return;
      }
      if (!password || password.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setBusy(true);
      let user;
      if (mode === 'login') {
        user = await login(finalHandle, password);
        showToast?.(`Welcome back, ${user.name}!`);
      } else {
        user = await signup({ name: name.trim(), handle: finalHandle, password });
        showToast?.(`Welcome to Problematic, ${user.name}!`);
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
        {/* Brand Header */}
        <div className="login-brand-header">
          <div className="login-brand-icon-wrap" aria-hidden="true">
            <Icon.BrandMark size={36} className="login-brand-icon" />
          </div>
          <h1 className="login-logo">Problematic</h1>
          <p className="login-subtitle">
            {mode === 'login'
              ? 'Welcome back. Sign in to continue.'
              : 'Join the problem-solving network.'}
          </p>
        </div>

        {/* Segmented Tab Selector */}
        <div className="login-segmented-tabs" role="group" aria-label="Authentication type">
          <button
            type="button"
            aria-pressed={mode === 'login'}
            className={`login-segment-tab ${mode === 'login' ? 'is-active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            aria-pressed={mode === 'signup'}
            className={`login-segment-tab ${mode === 'signup' ? 'is-active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="login-form" key={mode}>
          {mode === 'signup' && (
            <div className="login-field-group">
              <label htmlFor="auth-full-name" className="login-label">
                Full Name
              </label>
              <div className="login-input-wrapper">
                <input
                  id="auth-full-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setError(null);
                    setName(e.target.value);
                  }}
                  placeholder="e.g. Max Taylor"
                  autoComplete="name"
                  autoFocus={mode === 'signup'}
                  className="glass-input"
                />
              </div>
            </div>
          )}

          <div className="login-field-group">
            <label htmlFor="auth-handle" className="login-label">
              Username
            </label>
            <div className="login-input-wrapper">
              <span className="login-input-affix" aria-hidden="true">@</span>
              <input
                id="auth-handle"
                type="text"
                value={handle}
                onChange={handleHandleChange}
                placeholder={mode === 'signup' ? 'max_t' : 'username'}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                autoComplete="username"
                autoFocus={mode === 'login'}
                className="glass-input login-input-with-affix"
              />
            </div>
          </div>

          <div className="login-field-group">
            <div className="login-label-row">
              <label htmlFor="auth-password" className="login-label">
                Password
              </label>
              {mode === 'signup' && (
                <span className="login-label-hint">Min 4 chars</span>
              )}
            </div>
            <div className="login-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setError(null);
                  setPassword(e.target.value);
                }}
                placeholder={mode === 'signup' ? 'Create a secure password' : 'Enter your password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="glass-input login-input-with-action"
              />
              <button
                type="button"
                className="login-input-action-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <Icon.EyeOff size={18} /> : <Icon.Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="login-field-group">
              <label htmlFor="auth-confirm-password" className="login-label">
                Confirm Password
              </label>
              <div className="login-input-wrapper">
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setError(null);
                    setConfirmPassword(e.target.value);
                  }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className="glass-input login-input-with-action"
                />
                <button
                  type="button"
                  className="login-input-action-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <Icon.EyeOff size={18} /> : <Icon.Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="login-error-pill" role="alert" aria-live="polite">
              <Icon.AlertCircle size={16} className="login-error-pill-icon" />
              <span className="login-error-pill-text">{error}</span>
            </div>
          )}

          <button className="pri login-submit-btn" type="submit" disabled={busy}>
            {busy ? (
              <span className="login-btn-loading">
                <span className="login-spinner" aria-hidden="true" />
                <span>{mode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
              </span>
            ) : (
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        {/* Mode Toggle Switcher at Bottom */}
        <div className="login-toggle-row">
          <span className="login-toggle-text">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>{' '}
          <button
            type="button"
            className="login-toggle-btn"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
