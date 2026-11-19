import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\Unified\\AppData\\Local\\Temp\\edge_store_' + Date.now();
const RELEASE_DIR = 'C:\\Users\\Unified\\.gemini\\antigravity\\scratch\\problematic\\release';
const ARTIFACT_DIRS = [
  'C:\\Users\\Unified\\.gemini\\antigravity\\brain\\743a91ab-5c94-446d-a8f6-15ef6bc273fd',
  'C:\\Users\\Unified\\.gemini\\antigravity\\brain\\b08eafe0-3d3f-4541-a5af-10e5ff30a375'
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching Edge headless...');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9334',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=1024,500',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/generate_feature_graphic.html'
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9334/json/list');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch {
      await sleep(250);
    }
  }

  if (!targets || targets.length === 0) {
    edgeProc.kill();
    throw new Error('Could not find Edge page target');
  }

  const target = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let idCounter = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');

  // Set exact viewport for Feature Graphic: 1024x500
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 500,
    deviceScaleFactor: 1,
    mobile: false
  });

  await sleep(1500);

  // Capture Feature Graphic
  const fgRes = await sendCommand('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const fgBuf = Buffer.from(fgRes.data, 'base64');
  
  const fgReleasePath = path.join(RELEASE_DIR, 'playstore-feature-graphic-1024x500.png');
  fs.writeFileSync(fgReleasePath, fgBuf);
  for (const ad of ARTIFACT_DIRS) {
    if (fs.existsSync(ad)) {
      fs.writeFileSync(path.join(ad, 'playstore-feature-graphic-1024x500.png'), fgBuf);
    }
  }
  console.log(`Saved Feature Graphic (1024x500): ${fgReleasePath} (${fgBuf.length} bytes)`);

  // Navigate to App Feed and capture Mobile Phone Store Screenshots
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
    mobile: true
  });

  await sendCommand('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(2000);

  async function captureStoreScreen(name) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const buf = Buffer.from(res.data, 'base64');
    const rPath = path.join(RELEASE_DIR, name);
    fs.writeFileSync(rPath, buf);
    for (const ad of ARTIFACT_DIRS) {
      if (fs.existsSync(ad)) {
        fs.writeFileSync(path.join(ad, name), buf);
      }
    }
    console.log(`Saved Store Screenshot: ${rPath} (${buf.length} bytes)`);
  }

  // 1. Feed Screenshot
  await captureStoreScreen('store_screenshot_1_feed.png');

  // 2. Profile Screenshot (Click Profile Dock tab)
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[aria-label="Profile"]');
      if (btn) { btn.click(); return 'clicked profile'; }
      return 'profile tab not found';
    })()`
  });
  await sleep(1200);
  await captureStoreScreen('store_screenshot_2_profile.png');

  // 3. Settings Screenshot (Click gear icon in Profile)
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const gear = document.querySelector('.profile-settings-btn');
      if (gear) { gear.click(); return 'clicked settings gear'; }
      return 'gear not found';
    })()`
  });
  await sleep(1200);
  await captureStoreScreen('store_screenshot_3_settings.png');

  // 4. Messages Screenshot
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[aria-label^="Messages"]');
      if (btn) { btn.click(); return 'clicked messages'; }
      return 'messages tab not found';
    })()`
  });
  await sleep(1200);
  await captureStoreScreen('store_screenshot_4_messages.png');

  // 5. Clean Login Screenshot (Sign out from Settings to view clean login dialog)
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const profBtn = document.querySelector('button[aria-label="Profile"]');
      if (profBtn) profBtn.click();
    })()`
  });
  await sleep(800);
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const gear = document.querySelector('.profile-settings-btn');
      if (gear) gear.click();
    })()`
  });
  await sleep(800);
  await sendCommand('Runtime.evaluate', {
    expression: `(() => {
      const logoutBtn = document.querySelector('.settings-logout-btn');
      if (logoutBtn) { logoutBtn.click(); return 'logout clicked'; }
      return 'logout btn not found';
    })()`
  });
  await sleep(1200);
  await captureStoreScreen('store_screenshot_5_login.png');

  ws.close();
  edgeProc.kill();
  console.log('All Play Store graphics and screenshots captured successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
