import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as storage from '../services/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [comments, setComments] = useState({});
  const [theme, setThemeState] = useState(storage.DEFAULT_THEME);
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
      setHasOnboarded(Boolean(data.onboarded));
      setError(null);
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
    const user = await storage.verifyUser(handle, password);
    await storage.setSession(user.id);
    setCurrentUser(user);
    setUsers((prev) => {
      const others = prev.filter((u) => u.id !== user.id);
      return [user, ...others];
    });
    return user;
  }, []);

  const signup = useCallback(async ({ name, handle, password }) => {
    const user = await storage.createUser({ name, handle, password });
    await storage.setSession(user.id);
    setCurrentUser(user);
    setUsers((prev) => [...prev, user]);
    const welcome = {
      type: 'welcome',
      name: 'Problamatic Community',
      avatar: 'P',
      avatarBg: '#1F6F6B',
      text: 'Welcome to Problamatic. Broadcast your first problem or solve one to earn Respectadeo (RD) points!',
      postId: null,
      unread: true,
    };
    const saved = await storage.addNotification(welcome);
    setNotifications((prev) => [saved, ...prev]);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await storage.clearSession();
    setCurrentUser(null);
  }, []);

  /* -------------------------------- profile ------------------------------- */
  const saveProfile = useCallback(
    async (updates) => {
      if (!currentUser) return null;
      const updated = await storage.updateProfile(currentUser.id, updates);
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

      const post = await storage.addPost({
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
              options: poll.options.map((o) => ({ text: o, votes: 0 })),
              voterIds: [],
            }
          : null,
        likes: 0,
      });

      setPosts((prev) => [post, ...prev]);
      setCurrentUser((prev) => (prev ? { ...prev, problemsPosted: (prev.problemsPosted || 0) + 1 } : prev));
      return post;
    },
    [currentUser]
  );

  const deletePost = useCallback(async (postId) => {
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
      const updated = await storage.toggleLikePost(postId, currentUser.id);
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
      const updated = await storage.votePoll(postId, optionIndex, currentUser.id);
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
      const comment = await storage.addComment(postId, {
        authorId: currentUser.id,
        author: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        avatarBg: currentUser.avatarBg,
        text: clean,
      });
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }));
      return comment;
    },
    [currentUser]
  );

  const removeComment = useCallback(async (postId, commentId) => {
    await storage.deleteComment(postId, commentId);
    setComments((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));
  }, []);

  /* ----------------- Respectadeo Solution Acceptance & Disqualification --- */
  const acceptSolution = useCallback(
    async (postId, solutionId, solverId) => {
      const result = await storage.acceptSolution(postId, solutionId, solverId);
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
      const saved = await storage.addNotification(payload);
      setNotifications((prev) => [saved, ...prev]);
      return saved;
    },
    []
  );

  const markNotificationRead = useCallback(async (id) => {
    await storage.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }, []);

  const markAllRead = useCallback(async () => {
    await storage.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const clearNotifications = useCallback(async () => {
    await storage.clearNotifications();
    setNotifications([]);
  }, []);

  /* --------------------------------- theme -------------------------------- */
  const changeTheme = useCallback(async (next) => {
    setThemeState(next);
    await storage.saveTheme(next);
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
