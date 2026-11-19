import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\Unified\\AppData\\Local\\Temp\\edge_cdp_profile_' + Date.now();
const OUT_DIR = 'C:\\Users\\Unified\\.gemini\\antigravity\\brain\\743a91ab-5c94-446d-a8f6-15ef6bc273fd';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Launching Edge headless with remote debugging on port 9222...');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=430,932',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/',
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/list');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch {
      await sleep(200);
    }
  }

  if (!targets || targets.length === 0) {
    throw new Error('Could not find Edge page target');
  }

  const target = targets.find((t) => t.type === 'page') || targets[0];
  const wsUrl = target.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
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

  await new Promise((resolve) => ws.onopen = resolve);

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('DOM.enable');

  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 424,
    height: 890,
    deviceScaleFactor: 2,
    mobile: true,
  });

  async function takeScreenshot(name) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(OUT_DIR, name);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
    return filePath;
  }

  // Capture splash screen at ~900ms when text animation is expanding
  await sleep(900);
  await takeScreenshot('new_splash_screen_animating.png');

  // Capture splash screen at 1350ms when animation reaches full expansion
  await sleep(450);
  await takeScreenshot('new_splash_screen_complete.png');

  console.log('Splash captures complete.');
  ws.close();
  edgeProc.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
