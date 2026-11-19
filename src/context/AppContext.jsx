import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as storage from '../services/storage';
import * as api from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [comments, setComments] = useState({});
  const [theme, setThemeState] = useState(storage.DEFAULT_THEME);
  const [customBg, setCustomBg] = useState(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ------------------------------ bootstrap ------------------------------ */
  const loadEverything = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storage.initializeStorage();
      setUsers(data.users || []);
      setCurrentUser(data.currentUser || null);
      setPosts(data.posts || []);
      setNotifications(data.notifications || []);
      setComments(data.comments || {});
      setThemeState(data.theme || storage.DEFAULT_THEME);
      setCustomBg(data.customBg || null);
      setHasOnboarded(Boolean(data.onboarded));
      setError(null);

      // Opportunistic sync with backend API server
      try {
        const remote = await api.fetchBootstrap();
        if (remote && remote.posts) {
          setPosts(remote.posts);
          await storage.savePosts(remote.posts);
        }
        if (remote && remote.comments) {
          setComments(remote.comments);
          await storage.saveComments(remote.comments);
        }
        if (remote && remote.users && remote.users.length) {
          setUsers(remote.users);
          await storage.saveUsers(remote.users);
          if (data.currentUser) {
            const updatedMe = remote.users.find((u) => u.id === data.currentUser.id);
            if (updatedMe) setCurrentUser(updatedMe);
          }
        }
        if (remote && remote.notifications) {
          setNotifications(remote.notifications);
          await storage.saveNotifications(remote.notifications);
        }
      } catch (syncErr) {
        // Backend offline or unreachable: continue with local cache smoothly
        console.warn('[app] Server sync skipped (offline mode):', syncErr.message);
      }
    } catch (err) {
      console.error('[app] failed to load data:', err);
      setError(err?.message || 'Could not load your data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEverything();
  }, [loadEverything]);

  /* ------------------------------- helpers ------------------------------- */
  const commentCounts = useMemo(() => {
    const counts = {};
    Object.keys(comments).forEach((postId) => {
      counts[postId] = (comments[postId] || []).length;
    });
    return counts;
  }, [comments]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  /* --------------------------------- auth -------------------------------- */
  const login = useCallback(async (handle, password) => {
    let user;
    try {
      const res = await api.login(handle, password);
      user = res.user;
    } catch (apiErr) {
      user = await storage.verifyUser(handle, password);
    }
    await storage.setSession(user.id);
    setCurrentUser(user);
    setUsers((prev) => {
      const others = prev.filter((u) => u.id !== user.id);
      return [user, ...others];
    });
    return user;
  }, []);

  const signup = useCallback(async ({ name, handle, password }) => {
    let user;
    try {
      const res = await api.signup({ name, handle, password });
      user = res.user;
    } catch (apiErr) {
      user = await storage.createUser({ name, handle, password });
    }
    await storage.setSession(user.id);
    setCurrentUser(user);
    setUsers((prev) => [...prev, user]);
    const welcome = {
      type: 'welcome',
      name: 'Problematic Community',
      avatar: 'P',
      avatarBg: '#1F6F6B',
      text: 'Welcome to Problematic. Broadcast your first problem or help others solve theirs!',
      postId: null,
      unread: true,
    };
    const saved = await storage.addNotification(welcome);
    setNotifications((prev) => [saved, ...prev]);
    return user;
  }, []);

  const logout = useCallback(async () => {
    api.setAuthToken(null);
    await storage.clearSession();
    setCurrentUser(null);
  }, []);

  /* -------------------------------- profile ------------------------------- */
  const saveProfile = useCallback(
    async (updates) => {
      if (!currentUser) return null;
      let updated = null;
      try {
        updated = await api.updateProfile(currentUser.id, updates);
      } catch (e) {}
      if (!updated) {
        updated = await storage.updateProfile(currentUser.id, updates);
      } else {
        await storage.updateProfile(currentUser.id, updates);
      }
      if (updated) {
        setCurrentUser(updated);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setPosts((prev) =>
          prev.map((p) =>
            p.authorId === updated.id
              ? {
                  ...p,
                  author: updated.name,
                  handle: updated.handle,
                  avatar: updated.avatar,
                  avatarBg: updated.avatarBg,
                }
              : p
          )
        );
      }
      return updated;
    },
    [currentUser]
  );

  /* --------------------------------- posts (Problems) --------------------- */
  const createPost = useCallback(
    async ({ title, text, tags, category, image, poll }) => {
      if (!currentUser) throw new Error('Please log in first.');
      const cleanText = (text || '').trim();
      const cleanTitle = (title || '').trim();
      if (!cleanText && !cleanTitle) throw new Error('Please describe your problem.');

      const postPayload = {
        authorId: currentUser.id,
        author: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        avatarBg: currentUser.avatarBg,
        title: cleanTitle || cleanText.slice(0, 60),
        text: cleanText,
        category: category || tags || '#general',
        tags: tags || category || '#problem',
        status: 'open',
        image: image || null,
        poll: poll
          ? {
              options: poll.options.map((o) => ({ text: typeof o === 'string' ? o : o.text, votes: 0 })),
              voterIds: [],
            }
          : null,
        likes: 0,
      };

      let post = null;
      try {
        post = await api.createPost(postPayload);
      } catch (err) {
        console.warn('[app] Server post create failed, saving locally:', err.message);
      }

      if (!post) {
        post = await storage.addPost(postPayload);
      } else {
        await storage.addPost(post);
      }

      setPosts((prev) => [post, ...prev]);
      setCurrentUser((prev) => (prev ? { ...prev, problemsPosted: (prev.problemsPosted || 0) + 1 } : prev));
      return post;
    },
    [currentUser]
  );

  const deletePost = useCallback(async (postId) => {
    try {
      await api.deletePost(postId);
    } catch (e) {}
    await storage.deletePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setComments((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  }, []);

  const toggleLike = useCallback(
    async (postId) => {
      if (!currentUser) return null;
      let updated = null;
      try {
        updated = await api.toggleLikePost(postId, currentUser.id);
      } catch (e) {}
      if (!updated) {
        updated = await storage.toggleLikePost(postId, currentUser.id);
      }
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      }
      return updated;
    },
    [currentUser]
  );

  const votePoll = useCallback(
    async (postId, optionIndex) => {
      if (!currentUser) return null;
      let updated = null;
      try {
        updated = await api.votePoll(postId, optionIndex, currentUser.id);
      } catch (e) {}
      if (!updated) {
        updated = await storage.votePoll(postId, optionIndex, currentUser.id);
      }
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      }
      return updated;
    },
    [currentUser]
  );

  /* ------------------------------- solutions (Comments) ------------------- */
  const addComment = useCallback(
    async (postId, text) => {
      if (!currentUser) throw new Error('Please log in first.');
      const clean = (text || '').trim();
      if (!clean) throw new Error('Write a proposed solution first.');

      let comment = null;
      try {
        comment = await api.addComment(postId, {
          authorId: currentUser.id,
          text: clean,
        });
      } catch (e) {}

      if (!comment) {
        comment = await storage.addComment(postId, {
          authorId: currentUser.id,
          author: currentUser.name,
          handle: currentUser.handle,
          avatar: currentUser.avatar,
          avatarBg: currentUser.avatarBg,
          text: clean,
        });
      }

      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }));
      return comment;
    },
    [currentUser]
  );

  const removeComment = useCallback(async (postId, commentId) => {
    try {
      await api.deleteComment(commentId);
    } catch (e) {}
    await storage.deleteComment(postId, commentId);
    setComments((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));
  }, []);

  /* ----------------- Respectadeo Solution Acceptance & Disqualification --- */
  const acceptSolution = useCallback(
    async (postId, solutionId, solverId) => {
      let result = null;
      try {
        result = await api.acceptSolution(postId, solutionId, solverId);
      } catch (e) {}

      if (!result) {
        result = await storage.acceptSolution(postId, solutionId, solverId);
      }

      if (result.post) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? result.post : p)));
      }
      if (result.comment) {
        setComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).map((c) => (c.id === solutionId ? result.comment : c)),
        }));
      }
      if (result.solver) {
        setUsers((prev) => prev.map((u) => (u.id === solverId ? result.solver : u)));
        if (currentUser && currentUser.id === solverId) {
          setCurrentUser(result.solver);
        }
      }
      // Refresh notifications
      const notifs = await storage.getNotifications();
      setNotifications(notifs);
      return result;
    },
    [currentUser]
  );

  const disqualifySolution = useCallback(
    async (postId, solutionId, solverId, reason) => {
      await storage.disqualifySolution(postId, solutionId, solverId, reason);
      const commentsData = await storage.getComments();
      setComments(commentsData);
      const usersData = await storage.getUsers();
      setUsers(usersData);
      if (currentUser && currentUser.id === solverId) {
        const me = usersData.find((u) => u.id === solverId);
        if (me) setCurrentUser(me);
      }
      const notifs = await storage.getNotifications();
      setNotifications(notifs);
    },
    [currentUser]
  );

  const collectPendingPoints = useCallback(async () => {
    if (!currentUser) return null;
    const result = await storage.collectPendingPoints(currentUser.id);
    if (result.user) {
      setCurrentUser(result.user);
      setUsers((prev) => prev.map((u) => (u.id === result.user.id ? result.user : u)));
    }
    const notifs = await storage.getNotifications();
    setNotifications(notifs);
    return result;
  }, [currentUser]);

  /* ----------------------------- notifications ---------------------------- */
  const notify = useCallback(
    async (payload) => {
      let saved = null;
      try {
        saved = await api.addNotification(payload);
      } catch (e) {}
      if (!saved) {
        saved = await storage.addNotification(payload);
      }
      setNotifications((prev) => [saved, ...prev]);
      return saved;
    },
    []
  );

  const markNotificationRead = useCallback(async (id) => {
    try {
      await api.markNotificationRead(id);
    } catch (e) {}
    await storage.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead(currentUser?.id);
    } catch (e) {}
    await storage.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, [currentUser]);

  const clearNotifications = useCallback(async () => {
    try {
      await api.clearNotifications(currentUser?.id);
    } catch (e) {}
    await storage.clearNotifications();
    setNotifications([]);
  }, [currentUser]);

  /* --------------------------------- theme -------------------------------- */
  const wallpaperSeqRef = useRef(0);

  const isDark = theme !== 'default';

  const changeTheme = useCallback(async (next) => {
    const marker = ++wallpaperSeqRef.current;
    setThemeState(next);
    await storage.saveTheme(next);
    if (marker === wallpaperSeqRef.current) {
      await storage.removeCustomBg();
      setCustomBg(null);
    }
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const next = isDark ? 'default' : 'dark';
    await changeTheme(next);
  }, [isDark, changeTheme]);

  const applyCustomBg = useCallback(async (dataUrl) => {
    const marker = ++wallpaperSeqRef.current;
    await storage.saveCustomBg(dataUrl);
    if (marker === wallpaperSeqRef.current) {
      setCustomBg(dataUrl);
    }
  }, []);

  const clearCustomBg = useCallback(async () => {
    const marker = ++wallpaperSeqRef.current;
    await storage.removeCustomBg();
    if (marker === wallpaperSeqRef.current) {
      setCustomBg(null);
    }
  }, []);

  /* ------------------------------ onboarding ------------------------------ */
  const completeOnboarding = useCallback(async () => {
    setHasOnboarded(true);
    await storage.setOnboardingCompleted(true);
  }, []);

  const resetOnboarding = useCallback(async () => {
    setHasOnboarded(false);
    await storage.setOnboardingCompleted(false);
  }, []);

  /* -------------------------------- value --------------------------------- */
  const value = {
    users,
    currentUser,
    isLoggedIn: !!currentUser,
    posts,
    notifications,
    comments,
    commentCounts,
    theme,
    isDark,
    toggleDarkMode,
    customBg,
    applyCustomBg,
    clearCustomBg,
    loading,
    error,
    unreadCount,
    hasOnboarded,
    completeOnboarding,
    resetOnboarding,

    login,
    signup,
    logout,
    saveProfile,

    createPost,
    deletePost,
    toggleLike,
    votePoll,

    addComment,
    removeComment,
    acceptSolution,
    disqualifySolution,
    collectPendingPoints,

    notify,
    markNotificationRead,
    markAllRead,
    clearNotifications,

    changeTheme,
    reload: loadEverything,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
