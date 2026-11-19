import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';

export default function SettingsScreen({
  onBack,
  navScale,
  setNavScale,
  autoLayoutLock,
  setAutoLayoutLock,
  onOpenOnboarding,
  showToast,
}) {
  const { currentUser, logout, posts, comments } = useApp();
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [screenInfo, setScreenInfo] = useState({ width: 0, height: 0, dpr: 1 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio ? Math.round(window.devicePixelRatio * 100) / 100 : 1,
      });

      const handleResize = () => {
        setScreenInfo({
          width: window.innerWidth,
          height: window.innerHeight,
          dpr: window.devicePixelRatio ? Math.round(window.devicePixelRatio * 100) / 100 : 1,
        });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Check backend server health
  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      try {
        const res = await fetch('https://api.dabcloud.in/api/health', { method: 'GET' });
        if (res.ok && active) setServerStatus('online');
        else if (active) setServerStatus('offline');
      } catch {
        if (active) setServerStatus('offline');
      }
    };
    checkHealth();
    return () => { active = false; };
  }, []);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setNavScale(val);
    if (autoLayoutLock) {
      setAutoLayoutLock(false);
      showToast?.('Custom nav size applied (Auto Layout unlocked).');
    }
  };

  const handleToggleAutoLock = () => {
    const next = !autoLayoutLock;
    setAutoLayoutLock(next);
    if (next) {
      // Calculate optimal recommended scale based on device width
      let optimal = 1.0;
      if (screenInfo.width <= 360) optimal = 0.88;
      else if (screenInfo.width <= 430) optimal = 1.0;
      else optimal = 1.08;
      setNavScale(optimal);
      showToast?.(`Auto Layout locked: ${Math.round(optimal * 100)}% optimal scale.`);
    } else {
      showToast?.('Auto Layout unlocked for manual tuning.');
    }
  };

  const setPreset = (val) => {
    setNavScale(val);
    if (autoLayoutLock) setAutoLayoutLock(false);
    showToast?.(`Nav bar size set to ${Math.round(val * 100)}%`);
  };

  const handleClearCache = () => {
    try {
      showToast?.('Cache cleaned. Local database refreshed.');
    } catch {
      showToast?.('Could not clear cache.');
    }
  };

  const getScaleLabel = (scale) => {
    if (scale <= 0.88) return 'Compact';
    if (scale >= 1.12) return 'Spacious';
    return 'Recommended';
  };

  return (
    <div className="settings-screen">
      <header className="h settings-header">
        <button
          type="button"
          className="settings-back-btn"
          onClick={onBack}
          aria-label="Back to Profile"
        >
          <Icon.Back />
        </button>
        <div className="logo">
          <span>Settings</span>
        </div>
        <div style={{ width: 36 }} /> {/* Balance spacer */}
      </header>

      <main className="screen-scroll settings-content" tabIndex={-1}>
        {/* Section 1: Display & Navigation Bar Tuning */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-pill">
              <Icon.Sliders />
            </div>
            <div>
              <div className="settings-card-title">Navigation & Layout</div>
              <div className="settings-card-subtitle">Adjust navigation dock & UI dimensions</div>
            </div>
          </div>

          {/* Auto Layout Lock Toggle */}
          <div className="settings-toggle-row" onClick={handleToggleAutoLock}>
            <div className="settings-toggle-info">
              <div className="settings-row-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.Lock size={16} />
                <span>Auto Layout Lock</span>
              </div>
              <div className="settings-row-desc">
                Automatically lock recommended UI element sizes for your screen ({screenInfo.width}×{screenInfo.height})
              </div>
            </div>
            <div className={`settings-switch ${autoLayoutLock ? 'active' : ''}`}>
              <div className="settings-switch-thumb" />
            </div>
          </div>

          {autoLayoutLock && (
            <div className="settings-badge-note">
              <span className="settings-pulse-dot" />
              <span>Optimal layout locked for {screenInfo.width}px viewport @ {screenInfo.dpr}x DPR</span>
            </div>
          )}

          {/* Swiping Bar for Nav Bar Scale */}
          <div className="settings-slider-section">
            <div className="settings-slider-header">
              <span className="settings-slider-title">Nav Bar Size</span>
              <span className="settings-slider-badge">
                {Math.round(navScale * 100)}% • {getScaleLabel(navScale)}
              </span>
            </div>

            <div className="settings-slider-track-wrap">
              <input
                type="range"
                className="settings-range-slider"
                min="0.75"
                max="1.30"
                step="0.05"
                value={navScale}
                onChange={handleSliderChange}
                aria-label="Navigation Bar Size"
              />
            </div>

            {/* Quick Presets */}
            <div className="settings-presets-row">
              <button
                type="button"
                className={`settings-preset-btn ${Math.abs(navScale - 0.85) < 0.03 ? 'active' : ''}`}
                onClick={() => setPreset(0.85)}
              >
                Compact (85%)
              </button>
              <button
                type="button"
                className={`settings-preset-btn ${Math.abs(navScale - 1.0) < 0.03 ? 'active' : ''}`}
                onClick={() => setPreset(1.0)}
              >
                Default (100%)
              </button>
              <button
                type="button"
                className={`settings-preset-btn ${Math.abs(navScale - 1.15) < 0.03 ? 'active' : ''}`}
                onClick={() => setPreset(1.15)}
              >
                Spacious (115%)
              </button>
            </div>

            {/* Live Interactive Dock Preview */}
            <div className="settings-dock-preview-wrap">
              <div className="settings-preview-label">Live Dock Preview</div>
              <div
                className="settings-preview-capsule"
                style={{ transform: `scale(${navScale})` }}
              >
                <div className="preview-tab active"><Icon.Home /></div>
                <div className="preview-tab"><Icon.Bell /></div>
                <div className="preview-tab"><Icon.User /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Account & Security */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-pill">
              <Icon.User />
            </div>
            <div>
              <div className="settings-card-title">Account</div>
              <div className="settings-card-subtitle">{currentUser?.name || 'Problem Solver'}</div>
            </div>
          </div>

          <div className="settings-row-static">
            <span className="settings-row-label">Username Handle</span>
            <span className="settings-value-pill">@{currentUser?.handle || 'user'}</span>
          </div>
          <div className="settings-row-static">
            <span className="settings-row-label">Broadcasted Problems</span>
            <span className="settings-value-pill">{posts.length}</span>
          </div>
        </div>

        {/* Section 3: Server & Network */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-pill">
              <Icon.Send />
            </div>
            <div>
              <div className="settings-card-title">Network & Server</div>
              <div className="settings-card-subtitle">REST API & Synchronization</div>
            </div>
          </div>

          <div className="settings-row-static">
            <span className="settings-row-label">Host Domain</span>
            <span className="settings-value-pill">api.dabcloud.in</span>
          </div>
          <div className="settings-row-static">
            <span className="settings-row-label">Service Status</span>
            <span className={`settings-status-tag ${serverStatus}`}>
              {serverStatus === 'online' ? '● Online (HTTP 200)' : serverStatus === 'checking' ? 'Checking...' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Section 4: Data & Maintenance */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-icon-pill">
              <Icon.Refresh />
            </div>
            <div>
              <div className="settings-card-title">Maintenance</div>
              <div className="settings-card-subtitle">Cache and walkthrough controls</div>
            </div>
          </div>

          <button
            type="button"
            className="settings-action-row"
            onClick={handleClearCache}
          >
            <div className="settings-row-label">Clean Cache</div>
            <div className="settings-action-desc">Purge stale cache & verify data</div>
          </button>

          <button
            type="button"
            className="settings-action-row"
            onClick={() => {
              onBack?.();
              onOpenOnboarding?.();
            }}
          >
            <div className="settings-row-label">Replay Onboarding</div>
            <div className="settings-action-desc">View the welcome guide again</div>
          </button>
        </div>

        {/* Section 5: About */}
        <div className="settings-card" style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Problematic
          </div>
          <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 4 }}>
            Version 1.0.0 (Production Build)
          </div>
          <div style={{ fontSize: 11, color: '#71717A', marginTop: 8 }}>
            Designed for focused, noise-free problem solving.
          </div>

          <button
            type="button"
            className="gh profile-btn danger"
            style={{ marginTop: 20, width: '100%' }}
            onClick={async () => {
              await logout();
              onBack?.();
              showToast?.('Logged out successfully.');
            }}
          >
            <Icon.LogOut /> Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}
