import React, { useEffect, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from './context/AppContext';
import Icon from './components/Icons';
import LoginScreen from './screens/LoginScreen';
import FeedScreen from './screens/FeedScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import MessagesScreen from './screens/MessagesScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ComposerSheet from './components/ComposerSheet';
import SplashScreen from './components/SplashScreen';
import StoryLandingPage from './components/landing/StoryLandingPage';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  const {
    isLoggedIn,
    currentUser,
    createPost,
    loading,
    error,
    unreadCount,
    unreadMessagesCount,
    pendingRequestsCount,
    hasOnboarded,
    completeOnboarding,
    isDark,
  } = useApp();

  const [activeTab, setActiveTab] = useState('feed');
  const [directMessageTargetUserId, setDirectMessageTargetUserId] = useState(null);
  const [viewMode, setViewMode] = useState('app');
  const [showSplash, setShowSplash] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [composerSessionId, setComposerSessionId] = useState(0);
  const composerSessionRef = useRef(0);
  const [previewOnboarding, setPreviewOnboarding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const dockCreateBtnRef = useRef(null);

  const [autoLayoutLock, setAutoLayoutLock] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('problematic_auto_layout_lock');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [navScale, setNavScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('problematic_nav_scale');
      if (saved) return parseFloat(saved);
      if (window.innerWidth <= 360) return 0.88;
      if (window.innerWidth <= 430) return 1.0;
      return 1.05;
    }
    return 1.0;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('problematic_nav_scale', String(navScale));
      document.documentElement.style.setProperty('--nav-scale', String(navScale));
    }
  }, [navScale]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('problematic_auto_layout_lock', String(autoLayoutLock));
      if (autoLayoutLock) {
        let optimal = 1.0;
        if (window.innerWidth <= 360) optimal = 0.88;
        else if (window.innerWidth <= 430) optimal = 1.0;
        else optimal = 1.05;
        setNavScale(optimal);
        document.documentElement.style.setProperty('--ui-scale', '1.0');
      }
    }
  }, [autoLayoutLock]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#app') {
        setViewMode('app');
      } else if (hash.startsWith('#story')) {
        setViewMode('story');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openApp = () => {
    setShowSplash(true);
    setViewMode('app');
    window.location.hash = '#app';
  };

  const openStory = () => {
    setViewMode('story');
    window.location.hash = '#story';
  };

  const showToast = (msg) => {
    if (!msg) return;
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 2500);
  };

  const openComposer = () => {
    dockCreateBtnRef.current = document.querySelector('.dock-create-btn');
    const nextSession = ++composerSessionRef.current;
    setComposerSessionId(nextSession);
    setShowComposer(true);
  };

  // When the user logs out, always land back on the feed after next login and reset composer.
  useEffect(() => {
    if (!isLoggedIn) {
      setActiveTab('feed');
      setShowComposer(false);
      composerSessionRef.current++;
    }
  }, [isLoggedIn]);

  const showOnboarding = !hasOnboarded || previewOnboarding;

  const handleFinishOnboarding = async () => {
    await completeOnboarding();
    setPreviewOnboarding(false);
    showToast('Welcome to Problematic!');
  };

  if (showSplash) {
    return (
      <div className="mobile-app">
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </div>
    );
  }

  if (viewMode === 'story') {
    return (
      <StoryLandingPage
        onEnterApp={openApp}
        onOpenLogin={openApp}
      />
    );
  }

  if (loading) {
    return (
      <div className="mobile-app">
        <div className="s theme-default app-loading-screen">
          <div style={{ textAlign: 'center', color: 'var(--text-main)' }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 16 }}>
              Problematic
            </div>
            <div className="app-loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mobile-app theme-${isDark ? 'dark' : 'light'}`} data-theme={isDark ? 'dark' : 'light'}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className={`s theme-${isDark ? 'dark' : 'light'}`}>
        {/* ================= ONBOARDING SCREENS ================= */}
        {showOnboarding ? (
          <OnboardingScreen onComplete={handleFinishOnboarding} />
        ) : !isLoggedIn ? (
          /* ================= LOGIN SCREEN ================= */
          <LoginScreen onSuccess={() => setActiveTab('feed')} onOpenStory={openStory} showToast={showToast} />
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
                onOpenComposer={openComposer}
                onDirectMessage={(targetUserId) => {
                  setDirectMessageTargetUserId(targetUserId);
                  setActiveTab('messages');
                  setShowSettings(false);
                }}
                showToast={showToast}
              />
            )}

            {activeTab === 'messages' && (
              <MessagesScreen
                initialRecipientId={directMessageTargetUserId}
                onClearInitialRecipient={() => setDirectMessageTargetUserId(null)}
                showToast={showToast}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsScreen showToast={showToast} />
            )}

            {activeTab === 'profile' && (
              showSettings ? (
                <SettingsScreen
                  onBack={() => setShowSettings(false)}
                  navScale={navScale}
                  setNavScale={setNavScale}
                  autoLayoutLock={autoLayoutLock}
                  setAutoLayoutLock={setAutoLayoutLock}
                  onOpenOnboarding={() => setPreviewOnboarding(true)}
                  showToast={showToast}
                />
              ) : (
                <ProfileScreen
                  onOpenNotifications={() => setActiveTab('notifications')}
                  onOpenOnboarding={() => setPreviewOnboarding(true)}
                  onOpenSettings={() => setShowSettings(true)}
                  showToast={showToast}
                />
              )
            )}

            {/* Dynamic Capsule Navigation Dock (Centered, Sized by User/AutoLayout) */}
            <nav
              className="bnav"
              inert={showComposer ? '' : undefined}
              aria-hidden={showComposer ? 'true' : undefined}
            >
              <div
                className="nav-capsule-main"
                style={{
                  pointerEvents: 'auto',
                  transform: `scale(${navScale})`,
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <button
                  className={`dock-tab ${activeTab === 'feed' ? 'active' : ''}`}
                  aria-label="Home"
                  aria-current={activeTab === 'feed' ? 'page' : undefined}
                  onClick={() => { setActiveTab('feed'); setShowSettings(false); }}
                >
                  <Icon.Home />
                </button>
                <button
                  className={`dock-tab ${activeTab === 'messages' ? 'active' : ''}`}
                  aria-label={
                    unreadMessagesCount + pendingRequestsCount > 0
                      ? `Messages (${unreadMessagesCount + pendingRequestsCount} unread)`
                      : 'Messages'
                  }
                  aria-current={activeTab === 'messages' ? 'page' : undefined}
                  onClick={() => {
                    setActiveTab('messages');
                    setShowSettings(false);
                    setDirectMessageTargetUserId(null);
                  }}
                >
                  <Icon.Message />
                  {(unreadMessagesCount > 0 || pendingRequestsCount > 0) && (
                    <span className="dock-unread-dot" />
                  )}
                </button>
                <button
                  className={`dock-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                  aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
                  aria-current={activeTab === 'notifications' ? 'page' : undefined}
                  onClick={() => { setActiveTab('notifications'); setShowSettings(false); }}
                >
                  <Icon.Bell />
                  {unreadCount > 0 && (
                    <span className="dock-unread-dot" />
                  )}
                </button>
                <button
                  className={`dock-tab ${activeTab === 'profile' && !showSettings ? 'active' : ''}`}
                  aria-label="Profile"
                  aria-current={activeTab === 'profile' && !showSettings ? 'page' : undefined}
                  onClick={() => { setActiveTab('profile'); setShowSettings(false); }}
                >
                  <Icon.User />
                </button>
              </div>
            </nav>

            {/* Independent Post Create Screen (Slow Popup from Down Side, Zero Glitch) */}
            {showComposer && (
              <ComposerSheet
                key={composerSessionId}
                currentUser={currentUser}
                restoreFocusEl={dockCreateBtnRef.current}
                onPublish={async (payload) => {
                  const targetSession = composerSessionId;
                  await createPost(payload);
                  if (composerSessionRef.current === targetSession) {
                    setShowComposer(false);
                    setActiveTab('feed');
                    showToast('Problem broadcasted worldwide!');
                  }
                }}
                onClose={() => {
                  composerSessionRef.current++;
                  setShowComposer(false);
                }}
                onError={(msg) => {
                  if (composerSessionRef.current === composerSessionId) {
                    showToast(msg);
                  }
                }}
              />
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
