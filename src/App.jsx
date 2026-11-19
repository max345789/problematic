import React, { useEffect, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from './context/AppContext';
import Icon from './components/Icons';
import LoginScreen from './screens/LoginScreen';
import FeedScreen from './screens/FeedScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ComposerSheet from './components/ComposerSheet';
import SplashScreen from './components/SplashScreen';
import StoryLandingPage from './components/landing/StoryLandingPage';

const TAB_OFFSETS = { feed: 6, notifications: 64, profile: 122 };

export default function App() {
  const {
    isLoggedIn,
    currentUser,
    createPost,
    loading,
    error,
    unreadCount,
    hasOnboarded,
    completeOnboarding,
  } = useApp();

  const [activeTab, setActiveTab] = useState('feed');
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      if (Capacitor.isNativePlatform()) return 'app';
      const hash = window.location.hash;
      if (hash === '#app') return 'app';
      if (hash.startsWith('#story')) return 'story';
    }
    return 'story';
  });
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window !== 'undefined') {
      if (Capacitor.isNativePlatform() || window.location.hash === '#app') return true;
    }
    return false;
  });
  const [showComposer, setShowComposer] = useState(false);
  const [composerSessionId, setComposerSessionId] = useState(0);
  const composerSessionRef = useRef(0);
  const [previewOnboarding, setPreviewOnboarding] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const dockCreateBtnRef = useRef(null);

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

  if (viewMode === 'story') {
    return (
      <StoryLandingPage
        onEnterApp={openApp}
        onOpenLogin={openApp}
      />
    );
  }

  if (showSplash) {
    return (
      <div className="mobile-app">
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </div>
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
    <div className="mobile-app">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="s">
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
                onOpenStory={openStory}
                showToast={showToast}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsScreen showToast={showToast} />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                onOpenNotifications={() => setActiveTab('notifications')}
                onOpenOnboarding={() => setPreviewOnboarding(true)}
                showToast={showToast}
              />
            )}

            {/* Dual-Cluster Dynamic Capsule Navigation */}
            <nav
              className="bnav"
              inert={showComposer ? '' : undefined}
              aria-hidden={showComposer ? 'true' : undefined}
            >
              <div className="nav-dual-cluster">
                {/* Cluster 1: Browsing Capsule */}
                <div className="nav-capsule-main">
                  <button
                    className={`dock-tab ${activeTab === 'feed' ? 'active' : ''}`}
                    aria-label="Home"
                    aria-current={activeTab === 'feed' ? 'page' : undefined}
                    onClick={() => setActiveTab('feed')}
                  >
                    <Icon.Home />
                  </button>
                  <button
                    className={`dock-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                    aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
                    aria-current={activeTab === 'notifications' ? 'page' : undefined}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Icon.Bell />
                    {unreadCount > 0 && (
                      <span className="dock-unread-dot" />
                    )}
                  </button>
                  <button
                    className={`dock-tab ${activeTab === 'profile' ? 'active' : ''}`}
                    aria-label="Profile"
                    aria-current={activeTab === 'profile' ? 'page' : undefined}
                    onClick={() => setActiveTab('profile')}
                  >
                    <Icon.User />
                  </button>
                </div>

                {/* Cluster 2: Standalone Hero Action Orb */}
                <button
                  className="nav-action-orb dock-create-btn"
                  aria-label="Create Problem Post"
                  title="Create Problem Post"
                  onClick={openComposer}
                >
                  <Icon.Plus />
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
