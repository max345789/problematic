import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'problematic.db');
const db = new sqlite3.Database(DB_PATH);

// Promise helpers for clean async/await
export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

export function makeId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// Initialize tables and run migrations
export async function initDatabase() {
  await run(`PRAGMA foreign_keys = ON;`);

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      handle TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      avatar TEXT,
      avatar_bg TEXT,
      bio TEXT,
      respectadeo REAL DEFAULT 0.0,
      problems_solved INTEGER DEFAULT 0,
      problems_posted INTEGER DEFAULT 0,
      pending_points REAL DEFAULT 0.0,
      penalties INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      author TEXT NOT NULL,
      handle TEXT NOT NULL,
      avatar TEXT,
      avatar_bg TEXT,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      category TEXT,
      tags TEXT,
      status TEXT DEFAULT 'open',
      accepted_solution_id TEXT,
      ai_triage TEXT,
      image TEXT,
      poll TEXT,
      likes INTEGER DEFAULT 0,
      liked_by_ids TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author TEXT NOT NULL,
      handle TEXT NOT NULL,
      avatar TEXT,
      avatar_bg TEXT,
      text TEXT NOT NULL,
      ai_status TEXT,
      disqualification_reason TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar TEXT,
      avatar_bg TEXT,
      text TEXT NOT NULL,
      post_id TEXT,
      unread INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL
    );
  `);

  // Seed default community data if empty
  const userCount = await get(`SELECT COUNT(*) as count FROM users`);
  if (userCount.count === 0) {
    console.log('[db] Seeding initial database tables for Problematic...');
    await seedDatabase();
  }
}

async function seedDatabase() {
  const now = Date.now();
  const minutesAgo = (m) => now - m * 60 * 1000;
  const hoursAgo = (h) => now - h * 60 * 60 * 1000;
  const daysAgo = (d) => now - d * 24 * 60 * 60 * 1000;

  // Simple bcrypt hash for 'password'
  const defaultPwHash = '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lR0.WfD6x7Y6UjC9pY2g4wD2O/8iC';

  const users = [
    {
      id: 'user_rohitha',
      name: 'Max',
      handle: '@max',
      password_hash: defaultPwHash,
      avatar: 'M',
      avatar_bg: '#1F6F6B',
      bio: 'Front-end engineer & systems thinker. Love fixing async race conditions.',
      respectadeo: 1.4,
      problems_solved: 14,
      problems_posted: 10,
      pending_points: 1.0,
      penalties: 0,
      created_at: daysAgo(14),
    },
    {
      id: 'user_arjun',
      name: 'Arjun',
      handle: '@arjun',
      password_hash: defaultPwHash,
      avatar: 'A',
      avatar_bg: '#C2562F',
      bio: 'Senior UX architect. Helping people clarify design & layout problems.',
      respectadeo: 5.8,
      problems_solved: 58,
      problems_posted: 6,
      pending_points: 0.0,
      penalties: 0,
      created_at: daysAgo(120),
    },
    {
      id: 'user_meera',
      name: 'Meera',
      handle: '@meera',
      password_hash: defaultPwHash,
      avatar: 'M',
      avatar_bg: '#1F6F6B',
      bio: 'Backend & database specialist. SQL optimizations and schema migrations.',
      respectadeo: 3.2,
      problems_solved: 32,
      problems_posted: 4,
      pending_points: 0.0,
      penalties: 0,
      created_at: daysAgo(60),
    },
    {
      id: 'user_nila',
      name: 'Nila',
      handle: '@nila',
      password_hash: defaultPwHash,
      avatar: 'N',
      avatar_bg: '#3B5BDB',
      bio: 'Mobile & Capacitor dev. Debugging native builds and touch gestures.',
      respectadeo: 2.1,
      problems_solved: 21,
      problems_posted: 2,
      pending_points: 0.0,
      penalties: 0,
      created_at: daysAgo(90),
    },
    {
      id: 'user_sanjay',
      name: 'Sanjay',
      handle: '@sanjay',
      password_hash: defaultPwHash,
      avatar: 'S',
      avatar_bg: '#8A5CF6',
      bio: 'Exploring distributed systems & systems design.',
      respectadeo: 0.8,
      problems_solved: 8,
      problems_posted: 5,
      pending_points: 0.0,
      penalties: 0,
      created_at: daysAgo(30),
    },
    {
      id: 'user_moderator',
      name: 'Moderator',
      handle: '@moderator',
      password_hash: defaultPwHash,
      avatar: 'M',
      avatar_bg: '#0F172A',
      bio: 'Problematic Platform Moderator. Maintaining real-life empathy and authentic discussions.',
      respectadeo: 10.0,
      problems_solved: 100,
      problems_posted: 0,
      pending_points: 0.0,
      penalties: 0,
      created_at: daysAgo(365),
    },
  ];

  for (const u of users) {
    await run(
      `INSERT INTO users (id, name, handle, password_hash, avatar, avatar_bg, bio, respectadeo, problems_solved, problems_posted, pending_points, penalties, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.handle, u.password_hash, u.avatar, u.avatar_bg, u.bio, u.respectadeo, u.problems_solved, u.problems_posted, u.pending_points, u.penalties, u.created_at]
    );
  }

  const posts = [
    {
      id: 'prob_1',
      author_id: 'user_arjun',
      author: 'Arjun',
      handle: '@arjun',
      avatar: 'A',
      avatar_bg: '#C2562F',
      title: 'Capacitor Android build fails: AAPT attribute android:attr/lStar not found',
      text: 'Every time I run gradle assembleDebug on Android 14, AAPT throws this attribute missing error. Already updated Android SDK 34 and core-ktx. What is the clean fix?',
      category: '#mobile #android #build',
      tags: '#mobile',
      status: 'solved',
      accepted_solution_id: 'sol_1_rohitha',
      ai_triage: JSON.stringify({ verified: true, score: 99, agentReview: 'Verified authentic problem.' }),
      image: null,
      poll: null,
      likes: 18,
      liked_by_ids: JSON.stringify(['user_rohitha', 'user_meera']),
      created_at: minutesAgo(25),
    },
    {
      id: 'prob_2',
      author_id: 'user_meera',
      author: 'Meera',
      handle: '@meera',
      avatar: 'M',
      avatar_bg: '#1F6F6B',
      title: 'PostgreSQL connection pool exhaustion on serverless webhook surges',
      text: 'Our microservice spawns 200+ ephemeral lambdas during webhook surges, immediately killing Postgres max_connections. Need a zero-downtime pooling solution without changing cloud providers.',
      category: '#backend #database #scaling',
      tags: '#backend',
      status: 'open',
      accepted_solution_id: null,
      ai_triage: JSON.stringify({ verified: true, score: 97, agentReview: 'Verified authentic problem.' }),
      image: null,
      poll: null,
      likes: 24,
      liked_by_ids: JSON.stringify(['user_arjun', 'user_nila', 'user_sanjay']),
      created_at: hoursAgo(2),
    },
    {
      id: 'prob_3',
      author_id: 'user_nila',
      author: 'Nila',
      handle: '@nila',
      avatar: 'N',
      avatar_bg: '#3B5BDB',
      title: 'Which local embedded database performs best for high-throughput mobile apps?',
      text: 'Debating between SQLite with WAL mode vs pure document store for storing 50k local offline sync rows on low-end Android hardware.',
      category: '#mobile #sqlite #performance',
      tags: '#mobile',
      status: 'open',
      accepted_solution_id: null,
      ai_triage: JSON.stringify({ verified: true, score: 95, agentReview: 'Verified authentic problem.' }),
      image: null,
      poll: JSON.stringify({
        options: [
          { text: 'SQLite (WAL Mode)', votes: 14 },
          { text: 'IndexedDB / Document Store', votes: 3 },
          { text: 'MMKV Key-Value Engine', votes: 8 },
        ],
        voterIds: ['user_arjun', 'user_meera', 'user_sanjay'],
      }),
      likes: 31,
      liked_by_ids: JSON.stringify(['user_arjun', 'user_rohitha']),
      created_at: hoursAgo(5),
    },
  ];

  for (const p of posts) {
    await run(
      `INSERT INTO posts (id, author_id, author, handle, avatar, avatar_bg, title, text, category, tags, status, accepted_solution_id, ai_triage, image, poll, likes, liked_by_ids, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.author_id, p.author, p.handle, p.avatar, p.avatar_bg, p.title, p.text, p.category, p.tags, p.status, p.accepted_solution_id, p.ai_triage, p.image, p.poll, p.likes, p.liked_by_ids, p.created_at]
    );
  }

  const comments = [
    {
      id: 'sol_1_rohitha',
      post_id: 'prob_1',
      author_id: 'user_rohitha',
      author: 'Max',
      handle: '@max',
      avatar: 'M',
      avatar_bg: '#1F6F6B',
      text: 'Add androidx.core:core-ktx:1.12.0 explicitly in android/app/build.gradle dependencies block. AAPT lStar was introduced in SDK 31+ resources and fails if an older transitive core-ktx is pulled in.',
      ai_status: 'accepted',
      disqualification_reason: null,
      created_at: minutesAgo(12),
    },
    {
      id: 'sol_2_meera',
      post_id: 'prob_2',
      author_id: 'user_sanjay',
      author: 'Sanjay',
      handle: '@sanjay',
      avatar: 'S',
      avatar_bg: '#8A5CF6',
      text: 'Deploy PgBouncer in transaction pooling mode right next to the database or use Supabase / AWS RDS Proxy with keepalive disabled on lambdas.',
      ai_status: null,
      disqualification_reason: null,
      created_at: hoursAgo(1),
    },
  ];

  for (const c of comments) {
    await run(
      `INSERT INTO comments (id, post_id, author_id, author, handle, avatar, avatar_bg, text, ai_status, disqualification_reason, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.post_id, c.author_id, c.author, c.handle, c.avatar, c.avatar_bg, c.text, c.ai_status, c.disqualification_reason, c.created_at]
    );
  }

  const notifications = [
    {
      id: 'notif_welcome',
      user_id: 'user_rohitha',
      type: 'welcome',
      name: 'Problematic Community',
      avatar: 'P',
      avatar_bg: '#1F6F6B',
      text: 'Welcome to Problematic. Broadcast your first problem or help others solve theirs!',
      post_id: null,
      unread: 0,
      created_at: daysAgo(14),
    },
    {
      id: 'notif_accepted',
      user_id: 'user_rohitha',
      type: 'solution_accepted',
      name: 'Arjun accepted your solution',
      avatar: '✓',
      avatar_bg: '#238636',
      text: 'Your solution to "Capacitor Android build fails" was officially accepted as verified resolution!',
      post_id: 'prob_1',
      unread: 1,
      created_at: minutesAgo(10),
    },
  ];

  for (const n of notifications) {
    await run(
      `INSERT INTO notifications (id, user_id, type, name, avatar, avatar_bg, text, post_id, unread, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [n.id, n.user_id, n.type, n.name, n.avatar, n.avatar_bg, n.text, n.post_id, n.unread, n.created_at]
    );
  }

  console.log('[db] Initial database seeding completed successfully.');
}

export default db;
