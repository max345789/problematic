import React, { useEffect, useState } from 'react';
import { useApp } from './context/AppContext';
import Icon from './components/Icons';
import LoginScreen from './screens/LoginScreen';
import FeedScreen from './screens/FeedScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const TAB_OFFSETS = { feed: 6, notifications: 64, profile: 122 };

const THEMES = [
  { id: 'default', label: 'Default', preview: 'url(/default_bg.jpg) center/cover' },
  { id: 'ocean', label: 'Ocean', preview: 'linear-gradient(160deg,#0f2b3d,#2a7f9e 60%,#bfe3ee)' },
  { id: 'dusk', label: 'Dusk', preview: 'linear-gradient(160deg,#2b1b3d,#a14a6b 60%,#f2b27a)' },
  { id: 'plain', label: 'Plain', preview: '#E8ECEF' },
];

export default function App() {
  const {
    isLoggedIn,
    theme,
    loading,
    error,
    changeTheme,
    unreadCount,
    hasOnboarded,
    completeOnboarding,
  } = useApp();

  const [activeTab, setActiveTab] = useState('feed');
  const [showBgSheet, setShowBgSheet] = useState(false);
  const [previewOnboarding, setPreviewOnboarding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    if (!msg) return;
    setToastMessage(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToastMessage(null), 2500);
  };

  // When the user logs out, always land back on the feed after next login.
  useEffect(() => {
    if (!isLoggedIn) setActiveTab('feed');
  }, [isLoggedIn]);

  const showOnboarding = !hasOnboarded || previewOnboarding;

  const handleFinishOnboarding = async () => {
    await completeOnboarding();
    setPreviewOnboarding(false);
    showToast('Welcome to Problamatic!');
  };

  if (loading) {
    return (
      <div className="mobile-app">
        <div className="s theme-default" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 16 }}>
              Problamatic
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                border: '3px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-app">
      <div className={`s theme-${theme}`}>
        {/* Ambient Organic Liquid Blobs for Glass Refraction */}
        <div className="liquid-ambient-backdrop" aria-hidden="true">
          <div className="liquid-blob blob-1" />
          <div className="liquid-blob blob-2" />
          <div className="liquid-blob blob-3" />
          <div className="liquid-blob blob-4" />
        </div>

        {/* ================= ONBOARDING SCREENS ================= */}
        {showOnboarding ? (
          <OnboardingScreen onComplete={handleFinishOnboarding} />
        ) : !isLoggedIn ? (
          /* ================= LOGIN SCREEN ================= */
          <LoginScreen onSuccess={() => setActiveTab('feed')} showToast={showToast} />
        ) : (
          /* ================= MAIN APP TABS ================= */
          <>
            {error && (
              <div
                style={{
                  background: '#FDECEA',
                  color: '#C0392B',
                  fontSize: 13,
                  padding: '8px 16px',
                }}
              >
                {error}
              </div>
            )}

            {activeTab === 'feed' && (
              <FeedScreen
                onOpenNotifications={() => setActiveTab('notifications')}
                showToast={showToast}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsScreen showToast={showToast} />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                theme={theme}
                onOpenBgSheet={() => setShowBgSheet(true)}
                onOpenNotifications={() => setActiveTab('notifications')}
                onOpenOnboarding={() => setPreviewOnboarding(true)}
                showToast={showToast}
              />
            )}

            {/* Floating bottom dock - FIXED AT POSITION */}
            <nav className="tb bnav">
              <div className="tp">
                <div
                  className="tab-indicator"
                  style={{ left: `${TAB_OFFSETS[activeTab] ?? 6}px` }}
                />
                <button
                  className={`dock-tab ${activeTab === 'feed' ? 'active' : ''}`}
                  aria-label="Home"
                  onClick={() => setActiveTab('feed')}
                >
                  <Icon.Home />
                </button>
                <button
                  className={`dock-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                  aria-label="Notifications"
                  onClick={() => setActiveTab('notifications')}
                  style={{ position: 'relative' }}
                >
                  <Icon.Bell />
                  {unreadCount > 0 && (
                    <span className="dock-unread-dot" />
                  )}
                </button>
                <button
                  className={`dock-tab ${activeTab === 'profile' ? 'active' : ''}`}
                  aria-label="Profile"
                  onClick={() => setActiveTab('profile')}
                >
                  <Icon.User />
                </button>
              </div>
            </nav>

            {/* Change Background Bottom Sheet */}
            {showBgSheet && (
              <>
                <div className="modal-backdrop" onClick={() => setShowBgSheet(false)} />
                <div className="bottom-sheet">
                  <div className="sheet-handle" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#0F1419' }}>Change background</div>
                    <button
                      className="sheet-close-btn"
                      onClick={() => setShowBgSheet(false)}
                      aria-label="Close"
                    >
                      <Icon.Close />
                    </button>
                  </div>

                  <div className="theme-options-grid">
                    {THEMES.map((t) => {
                      const isActive = theme === t.id;
                      return (
                        <div
                          key={t.id}
                          className={`theme-card-option ${isActive ? 'active' : ''}`}
                          onClick={async () => {
                            await changeTheme(t.id);
                            showToast?.(`${t.label} theme applied.`);
                          }}
                        >
                          <div
                            className="theme-card-preview"
                            style={{ background: t.preview }}
                          >
                            <div className="theme-glass-overlay" />
                            {isActive && (
                              <div className="theme-check-badge">
                                <Icon.Check />
                              </div>
                            )}
                          </div>
                          <div className={`theme-card-label ${isActive ? 'active' : ''}`}>
                            {t.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="pri theme-action-btn"
                    onClick={() => showToast?.('Gallery picker simulated.')}
                  >
                    <Icon.Photo /> Choose from gallery
                  </button>

                  <button
                    className="gh theme-action-btn"
                    onClick={async () => {
                      await changeTheme('default');
                      setShowBgSheet(false);
                      showToast?.('Reset to default forest theme.');
                    }}
                  >
                    Reset to default
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="glass-toast">
            {toastMessage}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
