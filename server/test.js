const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('--- Starting Backend Server Integration Tests ---');
  let failures = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failures++;
    }
  }

  let authToken = null;
  let testUser = null;
  let createdPostId = null;
  let createdCommentId = null;

  // 1. Health check
  await check('Health Check', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'ok') {
      throw new Error(`Health check returned ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 2. Existing user login
  await check('User Login (@rohitha)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle: '@rohitha', password: 'password' }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.token) {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
    authToken = data.token;
    testUser = data.user;
  });

  // 3. New User Registration
  await check('New User Signup', async () => {
    const rand = Math.floor(Math.random() * 10000);
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Tester ${rand}`,
        handle: `@tester_${rand}`,
        password: 'securePassword123',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.user || !data.token) {
      throw new Error(`Signup failed: ${JSON.stringify(data)}`);
    }
  });

  // 4. Fetch Posts
  await check('Fetch Posts Feed', async () => {
    const res = await fetch(`${BASE_URL}/posts`);
    const posts = await res.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error(`Expected posts array, got: ${JSON.stringify(posts)}`);
    }
  });

  // 5. Create a new Problem post
  await check('Create Problem Broadcast', async () => {
    const res = await fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: 'Android Gradle release bundle fails with proguard shrinker',
        text: 'When generating release AAB bundle, R8 obfuscates capacitor bridge classes. Need the proper keep rules.',
        category: '#android #gradle',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.id) {
      throw new Error(`Create post failed: ${JSON.stringify(data)}`);
    }
    createdPostId = data.id;
  });

  // 6. Like post
  await check('Toggle Like on Post', async () => {
    const res = await fetch(`${BASE_URL}/posts/${createdPostId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId: testUser.id }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.likes !== 1) {
      throw new Error(`Toggle like failed: ${JSON.stringify(data)}`);
    }
  });

  // 7. Add Comment / Proposed Solution
  await check('Add Proposed Solution', async () => {
    const res = await fetch(`${BASE_URL}/posts/${createdPostId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        text: 'Add -keep class com.getcapacitor.** { *; } and keep attributes *Annotation* in proguard-rules.pro',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.id) {
      throw new Error(`Add comment failed: ${JSON.stringify(data)}`);
    }
    createdCommentId = data.id;
  });

  // 8. Accept Solution
  await check('Accept Solution as Resolution', async () => {
    const res = await fetch(`${BASE_URL}/comments/${createdCommentId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        postId: createdPostId,
        solverId: testUser.id,
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success || data.post.status !== 'solved') {
      throw new Error(`Accept solution failed: ${JSON.stringify(data)}`);
    }
  });

  // 9. Fetch Notifications
  await check('Fetch & Mark Notification Read', async () => {
    const res = await fetch(`${BASE_URL}/notifications?userId=${testUser.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const notifs = await res.json();
    if (!Array.isArray(notifs) || notifs.length === 0) {
      throw new Error(`Expected notifications array, got: ${JSON.stringify(notifs)}`);
    }
    const firstId = notifs[0].id;
    const patchRes = await fetch(`${BASE_URL}/notifications/${firstId}/read`, {
      method: 'PATCH',
    });
    if (patchRes.status !== 200) {
      throw new Error(`Mark read failed`);
    }
  });

  // 10. Sync Bootstrap endpoint
  await check('Full Sync Bootstrap Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/sync-bootstrap`);
    const data = await res.json();
    if (!data.posts || !data.users || !data.comments || !data.notifications) {
      throw new Error(`Invalid sync bootstrap response: ${Object.keys(data)}`);
    }
  });

  console.log(`\nTests Completed: ${10 - failures}/10 passed. Failures: ${failures}`);
  if (failures > 0) process.exit(1);
}

runTests();
