import React from 'react';

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icon = {
  Home: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z" />
    </svg>
  ),
  Bell: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </svg>
  ),
  User: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  ThumbsUp: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  ),
  Comment: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  Share: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  ),
  More: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <circle cx="12" cy="5" r="0.9" fill="currentColor" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
      <circle cx="12" cy="19" r="0.9" fill="currentColor" />
    </svg>
  ),
  Plus: (p) => (
    <svg width="26" height="26" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Close: (p) => (
    <svg width="24" height="24" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  Pencil: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  Poll: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  ),
  Photo: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16l-5-5-9 9" />
    </svg>
  ),
  Check: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Trash: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14" />
    </svg>
  ),
  Back: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  Send: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
    </svg>
  ),
  LogOut: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Heart: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  Retweet: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  Bookmark: (p) => (
    <svg width="18" height="18" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  ),
  Sparkle: (p) => (
    <svg width="20" height="20" viewBox="0 0 24 24" {...base} {...p}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </svg>
  ),
};

export default Icon;
