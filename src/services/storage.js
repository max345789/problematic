import { Preferences } from '@capacitor/preferences';

/* -------------------------------------------------------------------------- */
/*  Problamatic — Worldwide Problem-Solving Network & Respectadeo Economy       */
/*  Community moderation and Respectadeo (RD Points) reward economy.           */
/* -------------------------------------------------------------------------- */

export const STORAGE_KEYS = {
  USERS: 'problamatic_users_v5',
  SESSION: 'problamatic_session_v5',
  POSTS: 'problamatic_posts_v5',
  NOTIFICATIONS: 'problamatic_notifications_v5',
  COMMENTS: 'problamatic_comments_v5',
  THEME: 'problamatic_theme_v5',
  SEEDED: 'problamatic_seeded_v5',
  ONBOARDING: 'problamatic_onboarding_v5',
  CUSTOM_BG: 'problamatic_custom_bg_v5',
};

export const DEFAULT_THEME = 'dark';

/* ----------------------------- tiny hash ---------------------------------- */
export function hashPassword(password) {
  let h = 5381;
  const salt = 'problamatic::v5';
  const input = `${salt}:${password}`;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return `h${h.toString(36)}`;
}

/* --------------------------- generic helpers ------------------------------ */
export async function getStoredData(key, defaultValue) {
  try {
    const { value } = await Preferences.get({ key });
    return value != null ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`[storage] read failed for ${key}:`, error);
    return defaultValue;
  }
}

export async function setStoredData(key, value) {
  try {
    await Preferences.set({ key, value: JSON.stringify(value) });
    return true;
  } catch (error) {
    console.error(`[storage] write failed for ${key}:`, error);
    return false;
  }
}

async function removeStoredData(key) {
  try {
    await Preferences.remove({ key });
    return true;
  } catch (error) {
    console.error(`[storage] remove failed for ${key}:`, error);
    throw error;
  }
}

export function makeId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getRespectadeoTier(points = 0) {
  const p = typeof points === 'number' ? points : 0;
  if (p >= 5.0) return { title: 'Grand thinker', color: '#D29922' };
  if (p >= 3.0) return { title: 'Master resolver', color: '#58A6FF' };
  if (p >= 1.0) return { title: 'Verified solver', color: '#3FB950' };
  return { title: 'Novice solver', color: '#8B949E' };
}

/* ------------------------------- users ------------------------------------ */
const AVATAR_COLORS = ['#1F6F6B', '#C2562F', '#3B5BDB', '#8A5CF6', '#B7791F', '#2C7A7B'];

function pickColor(seed = '') {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function normalizeHandle(raw = '') {
  const stripped = raw.trim().replace(/^@+/, '').toLowerCase();
  return `@${stripped}`;
}

export async function getUsers() {
  const users = await getStoredData(STORAGE_KEYS.USERS, []);
  // Ensure demo account rohitha always has moderator status
  return users.map((u) => {
    if (u.id === 'user_rohitha' || u.handle === '@rohitha') {
      return { ...u, role: 'moderator', isModerator: true };
    }
    return u;
  });
}

export async function saveUsers(users) {
  return setStoredData(STORAGE_KEYS.USERS, users);
}

export async function findUserByHandle(handle) {
  const users = await getUsers();
  const normalized = normalizeHandle(handle);
  return users.find((u) => u.handle.toLowerCase() === normalized.toLowerCase()) || null;
}

export async function getUserById(userId) {
  const users = await getUsers();
  return users.find((u) => u.id === userId) || null;
}

export async function createUser({ name, handle, password }) {
  const users = await getUsers();
  const normalizedHandle = normalizeHandle(handle);
  const cleanName = name.trim();

  if (!cleanName) throw new Error('Please enter your name.');
  if (!normalizedHandle || normalizedHandle === '@') throw new Error('Please choose a username.');
  if (!/^@[a-z0-9_]{2,20}$/.test(normalizedHandle)) {
    throw new Error('Username must be 2–20 characters: letters, numbers or underscore.');
  }
  if (!password || password.length < 4) throw new Error('Password must be at least 4 characters.');

  const exists = users.some((u) => u.handle.toLowerCase() === normalizedHandle.toLowerCase());
  if (exists) throw new Error('That username is already taken.');

  const user = {
    id: makeId('user'),
    name: cleanName,
    handle: normalizedHandle,
    passwordHash: hashPassword(password),
    avatar: cleanName.charAt(0).toUpperCase(),
    avatarBg: pickColor(normalizedHandle),
    bio: 'Problem solver & community collaborator.',
    respectadeo: 0.1, // starting seed bonus
    problemsSolved: 0,
    problemsPosted: 0,
    penalties: 0,
    createdAt: Date.now(),
  };

  await saveUsers([...users, user]);
  return user;
}

export async function verifyUser(handle, password) {
  const user = await findUserByHandle(handle);
  if (!user) throw new Error('No account found with that username.');
  if (user.passwordHash !== hashPassword(password)) throw new Error('Incorrect password.');
  return user;
}

export async function updateProfile(userId, updates) {
  const users = await getUsers();
  let updatedUser = null;
  const next = users.map((u) => {
    if (u.id !== userId) return u;
    const patch = { ...updates };
    if (patch.name) patch.avatar = String(patch.name).charAt(0).toUpperCase();
    if (patch.handle) patch.handle = normalizeHandle(patch.handle);
    updatedUser = { ...u, ...patch };
    return updatedUser;
  });
  await saveUsers(next);
  return updatedUser;
}

/* ------------------------------- session ---------------------------------- */
export async function getSession() {
  return getStoredData(STORAGE_KEYS.SESSION, null);
}

export async function setSession(userId) {
  return setStoredData(STORAGE_KEYS.SESSION, { userId, loggedInAt: Date.now() });
}

export async function clearSession() {
  await removeStoredData(STORAGE_KEYS.SESSION);
}

/* -------------------------------- posts (Problems) ------------------------- */
export async function getPosts() {
  return getStoredData(STORAGE_KEYS.POSTS, []);
}

export async function savePosts(posts) {
  return setStoredData(STORAGE_KEYS.POSTS, posts);
}

export async function addPost(post) {
  const posts = await getPosts();
  const newPost = {
    likedByIds: [],
    image: null,
    poll: null,
    tags: '#problem',
    status: 'open',
    acceptedSolutionId: null,
    aiTriage: {
      verified: true,
      score: 98,
      agentReview: 'Verified authentic problem.',
    },
    ...post,
    id: makeId('prob'),
    createdAt: Date.now(),
  };

  // Increment user's problemsPosted counter & check for 10-problem milestone (+1.0 RD)
  if (post.authorId) {
    const users = await getUsers();
    const updatedUsers = users.map((u) => {
      if (u.id !== post.authorId) return u;
      const nextPosted = (u.problemsPosted || 0) + 1;
      const newMilestones = Math.floor(nextPosted / 10);
      const prevMilestones = u.collectedPostMilestones || 0;
      let newPending = u.pendingPoints || 0;
      if (newMilestones > prevMilestones) {
        newPending = Number((newPending + (newMilestones - prevMilestones) * 1.0).toFixed(1));
      }
      return {
        ...u,
        problemsPosted: nextPosted,
        pendingPoints: newPending,
      };
    });
    await saveUsers(updatedUsers);
  }

  await savePosts([newPost, ...posts]);
  return newPost;
}

export async function updatePost(postId, updates) {
  const posts = await getPosts();
  const updated = posts.map((p) => (p.id === postId ? { ...p, ...updates } : p));
  await savePosts(updated);
  return updated.find((p) => p.id === postId) || null;
}

export async function deletePost(postId) {
  const posts = await getPosts();
  await savePosts(posts.filter((p) => p.id !== postId));
  const comments = await getComments();
  delete comments[postId];
  await setStoredData(STORAGE_KEYS.COMMENTS, comments);
}

export async function toggleLikePost(postId, userId) {
  const posts = await getPosts();
  let result = null;
  const updated = posts.map((p) => {
    if (p.id !== postId) return p;
    const likedByIds = Array.isArray(p.likedByIds) ? p.likedByIds : [];
    const already = likedByIds.includes(userId);
    const nextLiked = already ? likedByIds.filter((id) => id !== userId) : [...likedByIds, userId];
    result = {
      ...p,
      likedByIds: nextLiked,
      likes: Math.max(0, (p.likes || 0) + (already ? -1 : 1)),
    };
    return result;
  });
  await savePosts(updated);
  return result;
}

export async function votePoll(postId, optionIndex, userId) {
  const posts = await getPosts();
  let result = null;
  const updated = posts.map((p) => {
    if (p.id !== postId || !p.poll) return p;
    const voterIds = Array.isArray(p.poll.voterIds) ? p.poll.voterIds : [];
    if (voterIds.includes(userId)) {
      result = p;
      return p;
    }
    const options = p.poll.options.map((opt, i) =>
      i === optionIndex ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
    );
    result = { ...p, poll: { ...p.poll, options, voterIds: [...voterIds, userId] } };
    return result;
  });
  await savePosts(updated);
  return result;
}

/* ------------------------------ solutions (Comments) ---------------------- */
export async function getComments() {
  return getStoredData(STORAGE_KEYS.COMMENTS, {});
}

export async function saveComments(comments) {
  return setStoredData(STORAGE_KEYS.COMMENTS, comments);
}

export async function getCommentsForPost(postId) {
  const all = await getComments();
  return all[postId] || [];
}

export async function addComment(postId, comment) {
  const all = await getComments();
  const list = all[postId] || [];
  const newComment = {
    isAccepted: false,
    aiStatus: 'verified',
    disqualificationReason: null,
    pointsAwarded: 0,
    ...comment,
    id: makeId('sol'),
    createdAt: Date.now(),
  };
  all[postId] = [...list, newComment];
  await setStoredData(STORAGE_KEYS.COMMENTS, all);
  return newComment;
}

export async function deleteComment(postId, commentId) {
  const all = await getComments();
  const list = all[postId] || [];
  all[postId] = list.filter((c) => c.id !== commentId);
  await setStoredData(STORAGE_KEYS.COMMENTS, all);

  // If this comment was the accepted solution on the post, reopen the post
  const posts = await getPosts();
  const targetPost = posts.find((p) => p.id === postId);
  if (targetPost && targetPost.acceptedSolutionId === commentId) {
    const nextPosts = posts.map((p) =>
      p.id === postId ? { ...p, status: 'open', acceptedSolutionId: null } : p
    );
    await savePosts(nextPosts);
  }
}

export async function revokeSolution(postId, solutionId, solverId) {
  // Read posts with null default to catch read failures and prevent saving fallbacks
  const rawPosts = await getStoredData(STORAGE_KEYS.POSTS, null);
  if (!Array.isArray(rawPosts)) {
    throw new Error('Cannot revoke resolution: failed to read stored posts.');
  }

  const targetPost = rawPosts.find((p) => p.id === postId);
  
  // Read comments with null default to catch read failures
  const rawComments = await getStoredData(STORAGE_KEYS.COMMENTS, null);
  if (!rawComments || typeof rawComments !== 'object') {
    throw new Error('Cannot revoke resolution: failed to read stored comments.');
  }

  const list = rawComments[postId] || [];
  const activeSolutionId = targetPost?.acceptedSolutionId || solutionId;
  const acceptedComment = list.find((c) => c.id === activeSolutionId || c.isAccepted);

  // If neither the post is solved nor any comment remains accepted, revocation is already complete
  if ((!targetPost || targetPost.status !== 'solved') && (!acceptedComment || !acceptedComment.isAccepted)) {
    return { post: targetPost || null, comment: null };
  }

  // If a specific solutionId was requested and post is solved with another, reject mismatch
  if (solutionId && targetPost?.acceptedSolutionId && targetPost.acceptedSolutionId !== solutionId) {
    return { post: targetPost, comment: null };
  }

  const revokedMarkerKey = `revoked_${postId}_${activeSolutionId}`;
  const targetSolverId = solverId || acceptedComment?.authorId;

  // 1. Reconcile solver points with retry-safe durable receipt on the solver record
  if (targetSolverId && acceptedComment?.isAccepted) {
    const rawUsers = await getStoredData(STORAGE_KEYS.USERS, null);
    if (!Array.isArray(rawUsers)) {
      throw new Error('Cannot reconcile solver: failed to read stored users.');
    }
    const targetSolver = rawUsers.find((u) => u.id === targetSolverId);
    const alreadyReconciled = Boolean(targetSolver?.reconciledRevocations?.includes(revokedMarkerKey));

    if (!alreadyReconciled) {
      const nextUsers = rawUsers.map((u) => {
        if (u.id !== targetSolverId) return u;
        const currentRd = typeof u.respectadeo === 'number' ? u.respectadeo : 0;
        const nextRd = Math.max(0, Number((currentRd - 0.1).toFixed(1)));
        const solved = Math.max(0, (u.problemsSolved || 0) - 1);
        const existingReceipts = u.reconciledRevocations || [];
        const nextReceipts = existingReceipts.includes(revokedMarkerKey)
          ? existingReceipts
          : [...existingReceipts, revokedMarkerKey];
        return {
          ...u,
          respectadeo: nextRd,
          problemsSolved: solved,
          reconciledRevocations: nextReceipts,
        };
      });
      const usersSaved = await setStoredData(STORAGE_KEYS.USERS, nextUsers);
      if (!usersSaved) {
        throw new Error('Failed to persist solver reconciliation during resolution revocation.');
      }
    }
  }

  // 2. Prepare and persist comments update
  let updatedComment = null;
  const freshComments = await getStoredData(STORAGE_KEYS.COMMENTS, null);
  if (!freshComments || typeof freshComments !== 'object') {
    throw new Error('Cannot update comments: failed to re-read stored comments.');
  }
  const currentList = freshComments[postId] || [];
  freshComments[postId] = currentList.map((c) => {
    if (c.id === activeSolutionId || c.isAccepted) {
      updatedComment = { ...c, isAccepted: false, pointsAwarded: 0 };
      return updatedComment;
    }
    return c;
  });
  const commentsSaved = await setStoredData(STORAGE_KEYS.COMMENTS, freshComments);
  if (!commentsSaved) {
    throw new Error('Failed to persist comment updates during resolution revocation.');
  }

  // 3. Prepare and persist post status back to open (tracking reconciliation marker to prevent duplicate deductions on retry)
  let updatedPost = null;
  const currentPosts = await getStoredData(STORAGE_KEYS.POSTS, null);
  if (!Array.isArray(currentPosts)) {
    throw new Error('Cannot update post: failed to re-read stored posts.');
  }
  const nextPosts = currentPosts.map((p) => {
    if (p.id !== postId) return p;
    const existingMarkers = p.reconciledRevocations || [];
    const nextMarkers = existingMarkers.includes(revokedMarkerKey) ? existingMarkers : [...existingMarkers, revokedMarkerKey];
    updatedPost = {
      ...p,
      status: 'open',
      acceptedSolutionId: null,
      reconciledRevocations: nextMarkers,
    };
    return updatedPost;
  });
  const postsSaved = await setStoredData(STORAGE_KEYS.POSTS, nextPosts);
  if (!postsSaved) {
    throw new Error('Failed to persist post updates during resolution revocation.');
  }

  return { post: updatedPost, comment: updatedComment };
}

export async function getCommentCounts() {
  const all = await getComments();
  const counts = {};
  Object.keys(all).forEach((postId) => {
    counts[postId] = (all[postId] || []).length;
  });
  return counts;
}

/* ----------------- Respectadeo Solution Acceptance & Disqualification ------ */
export async function acceptSolution(postId, solutionId, solverId) {
  const posts = await getPosts();
  let updatedPost = null;
  const targetPost = posts.find((p) => p.id === postId);

  const nextPosts = posts.map((p) => {
    if (p.id !== postId) return p;
    updatedPost = { ...p, status: 'solved', acceptedSolutionId: solutionId };
    return updatedPost;
  });
  await savePosts(nextPosts);

  // Update solution status in comments
  const comments = await getComments();
  const list = comments[postId] || [];
  let acceptedComment = null;
  const nextList = list.map((c) => {
    if (c.id !== solutionId) return c;
    acceptedComment = { ...c, isAccepted: true, pointsAwarded: 0.1 };
    return acceptedComment;
  });
  comments[postId] = nextList;
  await setStoredData(STORAGE_KEYS.COMMENTS, comments);

  // Award +0.1 Respectadeo (RD) to solver
  const users = await getUsers();
  let updatedSolver = null;
  const nextUsers = users.map((u) => {
    if (u.id !== solverId) return u;
    const currentRd = typeof u.respectadeo === 'number' ? u.respectadeo : 0;
    const nextRd = Number((currentRd + 0.1).toFixed(1));
    const solved = (u.problemsSolved || 0) + 1;
    updatedSolver = { ...u, respectadeo: nextRd, problemsSolved: solved };
    return updatedSolver;
  });
  await saveUsers(nextUsers);

  // Send solution accepted notification
  await addNotification({
    type: 'solution_accepted',
    name: 'Solution Accepted',
    avatar: '✓',
    avatarBg: '#10B981',
    text: `Your solution was marked as accepted for "${targetPost?.title || 'Problem'}".`,
    postId,
    unread: true,
  });

  return { post: updatedPost, comment: acceptedComment, solver: updatedSolver };
}

export async function disqualifySolution(postId, solutionId, solverId, reason = 'Unrelated to the problem') {
  const comments = await getComments();
  const list = comments[postId] || [];
  const nextList = list.map((c) => {
    if (c.id !== solutionId) return c;
    return {
      ...c,
      aiStatus: 'disqualified',
      disqualificationReason: `Disqualified by community moderation: ${reason}`,
    };
  });
  comments[postId] = nextList;
  await setStoredData(STORAGE_KEYS.COMMENTS, comments);

  // Apply penalty to solver
  const users = await getUsers();
  const nextUsers = users.map((u) => {
    if (u.id !== solverId) return u;
    const currentRd = typeof u.respectadeo === 'number' ? u.respectadeo : 0;
    const nextRd = Math.max(0, Number((currentRd - 0.2).toFixed(1)));
    const penalties = (u.penalties || 0) + 1;
    return { ...u, respectadeo: nextRd, penalties };
  });
  await saveUsers(nextUsers);

  await addNotification({
    type: 'penalty',
    name: 'Community Moderation',
    avatar: '⚠️',
    avatarBg: '#F8BAC9',
    text: `Your response was disqualified by community moderation: ${reason}. (-0.2 RD penalty).`,
    postId,
    unread: true,
  });
}

export async function collectPendingPoints(userId) {
  const users = await getUsers();
  let updatedUser = null;
  let collectedAmount = 0;
  const nextUsers = users.map((u) => {
    if (u.id !== userId) return u;
    collectedAmount = u.pendingPoints || 0;
    const currentRd = typeof u.respectadeo === 'number' ? u.respectadeo : 0;
    const nextRd = Number((currentRd + collectedAmount).toFixed(1));
    const currentPosted = u.problemsPosted || 0;
    const newMilestone = Math.floor(currentPosted / 10);
    updatedUser = {
      ...u,
      respectadeo: nextRd,
      pendingPoints: 0,
      collectedPostMilestones: newMilestone,
    };
    return updatedUser;
  });
  await saveUsers(nextUsers);

  if (collectedAmount > 0) {
    await addNotification({
      type: 'rd_award',
      name: 'Milestone Reward',
      avatar: '★',
      avatarBg: '#FED053',
      text: `You collected +${collectedAmount.toFixed(1)} RD points for staying active and posting 10 problems!`,
      postId: null,
      unread: true,
    });
  }

  return { user: updatedUser, collectedAmount };
}

/* ---------------------------- notifications ------------------------------- */
export async function getNotifications() {
  return getStoredData(STORAGE_KEYS.NOTIFICATIONS, []);
}

export async function saveNotifications(notifications) {
  return setStoredData(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export async function addNotification(notification) {
  const list = await getNotifications();
  const newNotification = {
    unread: true,
    ...notification,
    id: makeId('notif'),
    createdAt: Date.now(),
  };
  await saveNotifications([newNotification, ...list]);
  return newNotification;
}

export async function markNotificationRead(notificationId) {
  const list = await getNotifications();
  await saveNotifications(
    list.map((n) => (n.id === notificationId ? { ...n, unread: false } : n))
  );
}

export async function markAllNotificationsRead() {
  const list = await getNotifications();
  await saveNotifications(list.map((n) => ({ ...n, unread: false })));
}

export async function clearNotifications() {
  await saveNotifications([]);
}

/* -------------------------------- theme ----------------------------------- */
export async function getTheme() {
  return getStoredData(STORAGE_KEYS.THEME, DEFAULT_THEME);
}

export async function saveTheme(theme) {
  return setStoredData(STORAGE_KEYS.THEME, theme);
}

/* --------------------------- custom background ---------------------------- */
export async function getCustomBg() {
  return getStoredData(STORAGE_KEYS.CUSTOM_BG, null);
}

export async function saveCustomBg(bgDataUrl) {
  return setStoredData(STORAGE_KEYS.CUSTOM_BG, bgDataUrl);
}

export async function removeCustomBg() {
  return removeStoredData(STORAGE_KEYS.CUSTOM_BG);
}

/* ------------------------------ seed data --------------------------------- */
function minutesAgo(m) {
  return Date.now() - m * 60 * 1000;
}
function hoursAgo(h) {
  return Date.now() - h * 60 * 60 * 1000;
}
function daysAgo(d) {
  return Date.now() - d * 24 * 60 * 60 * 1000;
}

function seedCommunity() {
  const rohitha = {
    id: 'user_rohitha',
    name: 'Rohitha',
    handle: '@rohitha',
    passwordHash: hashPassword('password'),
    role: 'moderator',
    isModerator: true,
    avatar: 'R',
    avatarBg: '#1F6F6B',
    bio: 'Community Moderator & Front-end engineer. Keeping Problematic authentic.',
    respectadeo: 1.4,
    problemsSolved: 14,
    problemsPosted: 10,
    pendingPoints: 1.0,
    collectedPostMilestones: 0,
    penalties: 0,
    createdAt: daysAgo(14),
  };

  const community = [
    {
      id: 'user_arjun',
      name: 'Arjun',
      handle: '@arjun',
      passwordHash: hashPassword('password'),
      avatar: 'A',
      avatarBg: '#C2562F',
      bio: 'Senior UX architect. Helping people clarify design & layout problems.',
      respectadeo: 5.8,
      problemsSolved: 58,
      problemsPosted: 6,
      penalties: 0,
      createdAt: daysAgo(120),
    },
    {
      id: 'user_meera',
      name: 'Meera',
      handle: '@meera',
      passwordHash: hashPassword('password'),
      avatar: 'M',
      avatarBg: '#1F6F6B',
      bio: 'Backend & database specialist. SQL optimizations and schema migrations.',
      respectadeo: 3.2,
      problemsSolved: 32,
      problemsPosted: 4,
      penalties: 0,
      createdAt: daysAgo(60),
    },
    {
      id: 'user_nila',
      name: 'Nila',
      handle: '@nila',
      passwordHash: hashPassword('password'),
      avatar: 'N',
      avatarBg: '#3B5BDB',
      bio: 'Mobile & Capacitor dev. Debugging native builds and touch gestures.',
      respectadeo: 2.1,
      problemsSolved: 21,
      problemsPosted: 2,
      penalties: 0,
      createdAt: daysAgo(90),
    },
    {
      id: 'user_sanjay',
      name: 'Sanjay',
      handle: '@sanjay',
      passwordHash: hashPassword('password'),
      avatar: 'S',
      avatarBg: '#8A5CF6',
      bio: 'Exploring distributed systems & systems design.',
      respectadeo: 0.8,
      problemsSolved: 8,
      problemsPosted: 5,
      penalties: 0,
      createdAt: daysAgo(30),
    },
  ];

  return [rohitha, ...community];
}

function seedPosts() {
  return [
    {
      id: 'prob_1',
      authorId: 'user_arjun',
      author: 'Arjun',
      handle: '@arjun',
      avatar: 'A',
      avatarBg: '#C2562F',
      title: 'Capacitor Android build fails: AAPT attribute android:attr/lStar not found',
      text: 'Every time I run gradle assembleDebug on Android 14, AAPT throws this attribute missing error. Already updated Android SDK 34 and core-ktx. What is the clean fix?',
      category: '#mobile #android #build',
      status: 'solved',
      acceptedSolutionId: 'sol_1_rohitha',
      aiTriage: {
        verified: true,
        score: 99,
        agentReview: 'Verified authentic problem.',
      },
      image: null,
      poll: null,
      likes: 18,
      likedByIds: ['user_rohitha', 'user_meera'],
      createdAt: minutesAgo(25),
    },
    {
      id: 'prob_2',
      authorId: 'user_meera',
      author: 'Meera',
      handle: '@meera',
      avatar: 'M',
      avatarBg: '#1F6F6B',
      title: 'PostgreSQL connection pool exhaustion on serverless webhook surges',
      text: 'Our microservice spawns 200+ ephemeral lambdas during webhook surges, immediately killing Postgres max_connections. Need a zero-downtime pooling solution without changing cloud providers.',
      category: '#backend #database #scaling',
      status: 'open',
      acceptedSolutionId: null,
      aiTriage: {
        verified: true,
        score: 97,
        agentReview: 'Verified authentic problem.',
      },
      image: null,
      poll: null,
      likes: 24,
      likedByIds: ['user_arjun', 'user_nila', 'user_sanjay'],
      createdAt: hoursAgo(2),
    },
    {
      id: 'prob_3',
      authorId: 'user_sanjay',
      author: 'Sanjay',
      handle: '@sanjay',
      avatar: 'S',
      avatarBg: '#8A5CF6',
      title: 'CSS sticky nav jumps when iOS virtual keyboard opens',
      text: 'When a user taps an input inside our bottom sheet on iOS Safari, the bottom dock pops abruptly above the viewport boundary instead of respecting safe-area-inset-bottom. Best practices?',
      category: '#frontend #css #ios',
      status: 'open',
      acceptedSolutionId: null,
      aiTriage: {
        verified: true,
        score: 95,
        agentReview: 'Verified authentic problem.',
      },
      image: null,
      poll: {
        options: [
          { text: 'Use visualViewport resize API', votes: 12 },
          { text: 'Switch to fixed position + 100dvh', votes: 8 },
          { text: 'Scroll sheet into view on focus', votes: 5 },
        ],
        voterIds: [],
      },
      likes: 11,
      likedByIds: ['user_rohitha'],
      createdAt: hoursAgo(5),
    },
  ];
}

function seedComments() {
  return {
    prob_1: [
      {
        id: 'sol_1_rohitha',
        authorId: 'user_rohitha',
        author: 'Rohitha',
        handle: '@rohitha',
        avatar: 'R',
        avatarBg: '#1F6F6B',
        text: 'This happens because older transitive dependencies force an older compileSdkVersion. In your android/variables.gradle, set compileSdkVersion = 34 and force androidx.core:core:1.12.0 in your build.gradle app dependencies block.',
        isAccepted: true,
        aiStatus: 'verified',
        disqualificationReason: null,
        pointsAwarded: 0.1,
        createdAt: minutesAgo(18),
      },
      {
        id: 'sol_1_nila',
        authorId: 'user_nila',
        author: 'Nila',
        handle: '@nila',
        avatar: 'N',
        avatarBg: '#3B5BDB',
        text: 'Can confirm Rohitha’s fix! Also run npx cap sync android after changing the gradle file.',
        isAccepted: false,
        aiStatus: 'verified',
        disqualificationReason: null,
        pointsAwarded: 0,
        createdAt: minutesAgo(12),
      },
    ],
    prob_2: [
      {
        id: 'sol_2_arjun',
        authorId: 'user_arjun',
        author: 'Arjun',
        handle: '@arjun',
        avatar: 'A',
        avatarBg: '#C2562F',
        text: 'Deploy PgBouncer or AWS RDS Proxy in front of Postgres. In serverless, each lambda invocation creates a direct connection; RDS Proxy maintains a persistent warm pool to the database and multiplexes queries over single-digit connection sockets.',
        isAccepted: false,
        aiStatus: 'verified',
        disqualificationReason: null,
        pointsAwarded: 0,
        createdAt: hoursAgo(1),
      },
      {
        id: 'sol_2_spam',
        authorId: 'user_sanjay',
        author: 'Spam Bot',
        handle: '@bot_promo',
        avatar: 'B',
        avatarBg: '#8A5CF6',
        text: 'Invest in cheap crypto signals at telegram.me/fakecrypto discount today!',
        isAccepted: false,
        aiStatus: 'disqualified',
        disqualificationReason: 'Disqualified: Off-topic spam (-0.2 RD penalty applied)',
        pointsAwarded: 0,
        createdAt: minutesAgo(40),
      },
    ],
  };
}

function seedNotifications(userId) {
  return [
    {
      id: 'notif_rd_1',
      type: 'solution_accepted',
      name: 'Solution Accepted',
      avatar: '✓',
      avatarBg: '#10B981',
      text: 'Arjun marked your solution as accepted for "Capacitor Android build fails".',
      postId: 'prob_1',
      unread: true,
      createdAt: minutesAgo(15),
    },
    {
      id: 'notif_prob_1',
      type: 'comment',
      name: 'Arjun',
      avatar: 'A',
      avatarBg: '#C2562F',
      text: 'proposed a solution to your problem.',
      postId: 'prob_2',
      unread: true,
      createdAt: hoursAgo(1),
    },
    {
      id: 'notif_welcome_app',
      type: 'welcome',
      name: 'Problematic Community',
      avatar: 'P',
      avatarBg: '#1F6F6B',
      text: 'Welcome to Problematic. Broadcast your first problem or help others solve theirs!',
      postId: null,
      unread: false,
      createdAt: daysAgo(1),
    },
  ];
}

export async function seedInitialData() {
  const seeded = await getStoredData(STORAGE_KEYS.SEEDED, false);
  if (seeded) return;

  await saveUsers(seedCommunity());
  await savePosts(seedPosts());
  await setStoredData(STORAGE_KEYS.COMMENTS, seedComments());
  await saveNotifications(seedNotifications('user_rohitha'));
  await setSession('user_rohitha');

  const theme = await getTheme();
  if (!theme) await saveTheme(DEFAULT_THEME);

  await setStoredData(STORAGE_KEYS.SEEDED, true);
}

export async function hasCompletedOnboarding() {
  const completed = await getStoredData(STORAGE_KEYS.ONBOARDING, false);
  return Boolean(completed);
}

export async function setOnboardingCompleted(completed = true) {
  await setStoredData(STORAGE_KEYS.ONBOARDING, completed);
}

export async function initializeStorage() {
  await seedInitialData();
  const [users, session, posts, notifications, comments, theme, onboarded, customBg] = await Promise.all([
    getUsers(),
    getSession(),
    getPosts(),
    getNotifications(),
    getComments(),
    getTheme(),
    hasCompletedOnboarding(),
    getCustomBg(),
  ]);

  const currentUser = session?.userId
    ? users.find((u) => u.id === session.userId) || users[0] || null
    : users[0] || null;

  if (currentUser && (currentUser.id === 'user_rohitha' || currentUser.handle === '@rohitha')) {
    currentUser.role = 'moderator';
    currentUser.isModerator = true;
  }

  return { users, session, currentUser, posts, notifications, comments, theme, onboarded, customBg };
}

export async function clearAllData() {
  await Promise.all(Object.values(STORAGE_KEYS).map((key) => Preferences.remove({ key })));
}
