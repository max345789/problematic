import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';

const PERMISSION_OPTIONS = [
  {
    id: 'requests',
    title: 'Message requests (Recommended)',
    desc: 'Messages from new profiles require your approval before opening a chat.',
  },
  {
    id: 'everyone',
    title: 'Everyone',
    desc: 'Anyone in the community can send messages directly into your inbox.',
  },
  {
    id: 'nobody',
    title: 'Closed',
    desc: 'Disable incoming direct messages completely.',
  },
];

export default function SettingsScreen({
  onBack,
  navScale,
  setNavScale,
  autoLayoutLock,
  setAutoLayoutLock,
  onOpenOnboarding,
  showToast,
}) {
  const { currentUser, saveProfile, logout, posts, reload } = useApp();
  const radioRefs = useRef([]);
  const [serverStatus, setServerStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [screenInfo, setScreenInfo] = useState({ width: 0, height: 0, dpr: 1 });

  const [selectedPermission, setSelectedPermission] = useState(
    () => currentUser?.messagingPermission || 'requests'
  );

  useEffect(() => {
    if (currentUser?.messagingPermission) {
      setSelectedPermission(currentUser.messagingPermission);
    }
  }, [currentUser?.messagingPermission]);

  const handlePermissionChange = (perm) => {
    setSelectedPermission(perm);
    saveProfile({ messagingPermission: perm })
      .then(() => {
        const label =
          perm === 'everyone' ? 'Everyone' : perm === 'nobody' ? 'Closed' : 'Message requests';
        showToast?.(`Direct message privacy set to: ${label}`);
      })
      .catch(() => {
        showToast?.('Could not update privacy setting.');
      });
  };

  const handleRadioKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = (index + 1) % PERMISSION_OPTIONS.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = (index - 1 + PERMISSION_OPTIONS.length) % PERMISSION_OPTIONS.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePermissionChange(PERMISSION_OPTIONS[index].id);
    }

    if (nextIndex !== null) {
      const nextOption = PERMISSION_OPTIONS[nextIndex];
      handlePermissionChange(nextOption.id);
      radioRefs.current[nextIndex]?.focus();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateScreen = () => {
        setScreenInfo({
          width: window.innerWidth,
          height: window.innerHeight,
          dpr: window.devicePixelRatio ? Math.round(window.devicePixelRatio * 100) / 100 : 1,
        });
      };
      updateScreen();
      window.addEventListener('resize', updateScreen);
      return () => window.removeEventListener('resize', updateScreen);
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
    return () => {
      active = false;
    };
  }, []);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setNavScale(val);
    if (autoLayoutLock) {
      setAutoLayoutLock(false);
      showToast?.('Custom scale applied. Auto layout unlocked.');
    }
  };

  const handleToggleAutoLock = () => {
    const next = !autoLayoutLock;
    setAutoLayoutLock(next);
    if (next) {
      let optimal = 1.0;
      if (screenInfo.width <= 360) optimal = 0.88;
      else if (screenInfo.width <= 430) optimal = 1.0;
      else optimal = 1.08;
      setNavScale(optimal);
      showToast?.(`Auto layout locked: ${Math.round(optimal * 100)}% optimal scale.`);
    } else {
      showToast?.('Auto layout unlocked.');
    }
  };

  const setPreset = (val) => {
    setNavScale(val);
    if (autoLayoutLock) setAutoLayoutLock(false);
    showToast?.(`Scale set to ${Math.round(val * 100)}%`);
  };

  const handleClearCache = async () => {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((k) => window.caches.delete(k)));
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      if (typeof reload === 'function') {
        await reload();
      }
      showToast?.('Local cache purged. State refreshed.');
    } catch {
      showToast?.('Could not clear cache.');
    }
  };

  const getScaleLabel = (scale) => {
    if (scale <= 0.88) return 'Compact';
    if (scale >= 1.12) return 'Spacious';
    return 'Default';
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
        <div style={{ width: 36 }} />
      </header>

      <main className="screen-scroll settings-content" tabIndex={-1}>
        {/* Navigation & Layout Section */}
        <section className="settings-section">
          <div className="settings-section-title">Navigation & dock</div>
          <div className="settings-group">
            {/* Auto Layout Lock Toggle */}
            <div
              className="settings-row settings-row-interactive"
              onClick={handleToggleAutoLock}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleToggleAutoLock();
                }
              }}
              aria-pressed={autoLayoutLock}
            >
              <div className="settings-row-text">
                <div className="settings-label">Auto layout lock</div>
                <div className="settings-description">
                  {autoLayoutLock
                    ? `Locked for ${screenInfo.width}×${screenInfo.height} (${screenInfo.dpr}x DPR)`
                    : `Lock recommended scale for ${screenInfo.width}×${screenInfo.height}`}
                </div>
              </div>
              <div className={`settings-switch ${autoLayoutLock ? 'active' : ''}`} aria-hidden="true">
                <div className="settings-switch-thumb" />
              </div>
            </div>

            <div className="settings-divider" />

            {/* Slider & Presets */}
            <div className="settings-slider-card">
              <div className="settings-slider-header">
                <span className="settings-label">Dock scale</span>
                <span className="settings-tabular-metric">
                  {Math.round(navScale * 100)}% · {getScaleLabel(navScale)}
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
                  aria-label="Navigation dock scale"
                />
              </div>

              <div className="settings-presets-row" role="group" aria-label="Scale presets">
                <button
                  type="button"
                  className={`settings-preset-btn ${Math.abs(navScale - 0.85) < 0.03 ? 'active' : ''}`}
                  onClick={() => setPreset(0.85)}
                >
                  85% Compact
                </button>
                <button
                  type="button"
                  className={`settings-preset-btn ${Math.abs(navScale - 1.0) < 0.03 ? 'active' : ''}`}
                  onClick={() => setPreset(1.0)}
                >
                  100% Default
                </button>
                <button
                  type="button"
                  className={`settings-preset-btn ${Math.abs(navScale - 1.15) < 0.03 ? 'active' : ''}`}
                  onClick={() => setPreset(1.15)}
                >
                  115% Spacious
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Direct Messages Section */}
        <section className="settings-section">
          <div className="settings-section-title">Direct messages</div>
          <div className="settings-group" role="radiogroup" aria-label="Direct messages privacy">
            {PERMISSION_OPTIONS.map((opt, idx) => {
              const isSelected = selectedPermission === opt.id;
              return (
                <React.Fragment key={opt.id}>
                  {idx > 0 && <div className="settings-divider" />}
                  <div
                    ref={(el) => {
                      radioRefs.current[idx] = el;
                    }}
                    className={`settings-radio-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePermissionChange(opt.id)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={isSelected ? 0 : -1}
                    onKeyDown={(e) => handleRadioKeyDown(e, idx)}
                  >
                    <div
                      className={`settings-radio-circle ${isSelected ? 'checked' : ''}`}
                      aria-hidden="true"
                    >
                      {isSelected && <div className="settings-radio-dot" />}
                    </div>
                    <div className="settings-radio-text">
                      <div className="settings-radio-title">{opt.title}</div>
                      <div className="settings-radio-desc">{opt.desc}</div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* Account Section */}
        <section className="settings-section">
          <div className="settings-section-title">Account</div>
          <div className="settings-group">
            <div className="settings-row">
              <span className="settings-label">Username</span>
              <span className="settings-tabular-metric">
                {currentUser?.handle === '@rohitha' ? '@max' : currentUser?.handle?.startsWith('@') ? currentUser.handle : `@${currentUser?.handle || 'max'}`}
              </span>
            </div>
            <div className="settings-divider" />
            <div className="settings-row">
              <span className="settings-label">Broadcasted problems</span>
              <span className="settings-tabular-metric">{posts.length}</span>
            </div>
          </div>
        </section>

        {/* System & Network Section */}
        <section className="settings-section">
          <div className="settings-section-title">System & network</div>
          <div className="settings-group">
            <div className="settings-row">
              <span className="settings-label">API endpoint</span>
              <span className="settings-tabular-metric">api.dabcloud.in</span>
            </div>
            <div className="settings-divider" />
            <div className="settings-row">
              <span className="settings-label">Server status</span>
              <div className={`settings-status-pill ${serverStatus}`}>
                <span className="settings-status-dot" />
                <span>
                  {serverStatus === 'online' ? 'Online' : serverStatus === 'checking' ? 'Checking' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Maintenance Section */}
        <section className="settings-section">
          <div className="settings-section-title">Maintenance</div>
          <div className="settings-group">
            <button
              type="button"
              className="settings-action-btn"
              onClick={handleClearCache}
            >
              <div className="settings-action-text">
                <div className="settings-label">Clean cache</div>
                <div className="settings-description">Purge local cache and sync fresh state</div>
              </div>
              <Icon.ChevronRight size={18} />
            </button>
            <div className="settings-divider" />
            <button
              type="button"
              className="settings-action-btn"
              onClick={() => {
                onBack?.();
                onOpenOnboarding?.();
              }}
            >
              <div className="settings-action-text">
                <div className="settings-label">Replay onboarding</div>
                <div className="settings-description">Review the introductory walkthrough</div>
              </div>
              <Icon.ChevronRight size={18} />
            </button>
          </div>
        </section>

        {/* App Info & Sign out */}
        <section className="settings-section">
          <div className="settings-group">
            <div className="settings-row">
              <span className="settings-label">Problematic</span>
              <span className="settings-tabular-metric">v1.0.0</span>
            </div>
            <div className="settings-divider" />
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="settings-action-btn"
              style={{ textDecoration: 'none' }}
            >
              <div className="settings-action-text">
                <div className="settings-label">Privacy policy</div>
                <div className="settings-description">Data safety, user rights, and retention</div>
              </div>
              <Icon.ChevronRight size={18} />
            </a>
            <div className="settings-divider" />
            <button
              type="button"
              className="settings-logout-btn"
              onClick={async () => {
                await logout();
                onBack?.();
                showToast?.('Logged out successfully.');
              }}
            >
              <Icon.LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
