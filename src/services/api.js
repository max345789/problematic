/* -------------------------------------------------------------------------- */
/*  Problematic REST API Client                                               */
/*  Seamless synchronization with the backend server with offline fallback.  */
/* -------------------------------------------------------------------------- */

// Increased to 25s to accommodate Render Free tier cold start wake-up
const API_TIMEOUT_MS = 25000;

// Determine default host: on Android Emulator use 10.0.2.2, on web/device use localhost or env
function getDefaultBaseUrl() {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return 'https://api.dabcloud.in/api';
}

export const BASE_URL = getDefaultBaseUrl();

let authToken = localStorage.getItem('problematic_auth_token') || null;

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('problematic_auth_token', token);
  } else {
    localStorage.removeItem('problematic_auth_token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function request(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const err = new Error(data?.error || `API error ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/* -------------------------------- API Methods ----------------------------- */

export async function checkHealth() {
  try {
    return await request('/health');
  } catch (err) {
    return null;
  }
}

export async function login(handle, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ handle, password }),
  });
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function signup({ name, handle, password }) {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, handle, password }),
  });
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function getMe() {
  return request('/auth/me');
}

export async function fetchBootstrap() {
  return request('/sync-bootstrap');
}

export async function fetchPosts() {
  return request('/posts');
}

export async function createPost(postData) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

export async function deletePost(postId) {
  return request(`/posts/${postId}`, {
    method: 'DELETE',
  });
}

export async function toggleLikePost(postId, userId) {
  return request(`/posts/${postId}/like`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function votePoll(postId, optionIndex, userId) {
  return request(`/posts/${postId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ optionIndex, userId }),
  });
}

export async function fetchComments(postId) {
  return request(`/posts/${postId}/comments`);
}

export async function addComment(postId, commentData) {
  return request(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  });
}

export async function deleteComment(commentId) {
  return request(`/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export async function acceptSolution(postId, solutionId, solverId) {
  return request(`/comments/${solutionId}/accept`, {
    method: 'POST',
    body: JSON.stringify({ postId, solverId }),
  });
}

export async function fetchNotifications(userId) {
  return request(`/notifications?userId=${encodeURIComponent(userId || '')}`);
}

export async function addNotification(payload) {
  return request('/notifications', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function markNotificationRead(notifId) {
  return request(`/notifications/${notifId}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead(userId) {
  return request('/notifications/read-all', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function clearNotifications(userId) {
  return request('/notifications', {
    method: 'DELETE',
    body: JSON.stringify({ userId }),
  });
}

export async function updateProfile(userId, updates) {
  return request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify({ id: userId, ...updates }),
  });
}
