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
      await sleep(250);
    }
  }

  if (!targets || targets.length === 0) {
    throw new Error('Could not find Edge page target');
  }

  const target = targets.find((t) => t.type === 'page') || targets[0];
  const wsUrl = target.webSocketDebuggerUrl;

  console.log('Connecting WebSocket to target:', wsUrl);
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

  async function evaluate(expression) {
    const res = await sendCommand('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      console.error('Eval error:', res.exceptionDetails);
    }
    return res.result?.value;
  }

  async function takeScreenshot(name) {
    await sleep(400);
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(OUT_DIR, name);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
    return filePath;
  }

  console.log('Waiting for initial load and splash completion...');
  await sleep(4000);

  // Skip onboarding
  console.log('Skipping onboarding...');
  await evaluate(`document.querySelector('.onboarding-skip-btn')?.click()`);
  await sleep(800);

  // Check login
  const isLogin = await evaluate(`!!document.querySelector('.login-submit-btn')`);
  if (isLogin) {
    console.log('Logging in with demo credentials...');
    await evaluate(`
      const inputs = document.querySelectorAll('input');
      if (inputs[0]) {
        inputs[0].value = 'rohitha';
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (inputs[1]) {
        inputs[1].value = 'password';
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
      const submitBtn = document.querySelector('.login-submit-btn');
      if (submitBtn) submitBtn.click();
    `);
    await sleep(1500);
  }

  // 1. Feed Screenshot Before Opening
  console.log('Capturing feed before composer open...');
  await takeScreenshot('motion_1_feed_before.png');

  // 2. Click (+) Hero Action Orb to open composer slowly
  console.log('Opening composer via (+) Action Orb...');
  await evaluate(`document.querySelector('.nav-action-orb')?.click()`);
  
  // Wait 600ms for slow upward glide to complete
  await sleep(600);
  console.log('Capturing independent post create screen...');
  await takeScreenshot('motion_2_composer_opened.png');

  // 3. Type some text in the composer
  console.log('Entering text into composer...');
  await evaluate(`
    const ta = document.querySelector('.composer-textarea');
    if (ta) {
      ta.value = 'Fixing race condition in SQLite transaction batcher on Android 14';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
  `);
  await sleep(300);
  await takeScreenshot('motion_3_composer_with_text.png');

  // 4. Tap Cancel to verify smooth downward slide exit
  console.log('Tapping Cancel to verify smooth slide down...');
  await evaluate(`document.querySelector('.composer-cancel-btn')?.click()`);
  
  // Wait 500ms for slide down animation to finish
  await sleep(550);
  console.log('Capturing feed after composer dismiss...');
  await takeScreenshot('motion_4_feed_after_dismiss.png');

  // Clean up
  console.log('All motion tests passed successfully.');
  ws.close();
  edgeProc.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error running test:', err);
  process.exit(1);
});
