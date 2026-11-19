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
    await sleep(500);
    const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(OUT_DIR, name);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
    return filePath;
  }

  console.log('Waiting for initial load and splash completion...');
  await sleep(4000);

  // 1. Screenshot Onboarding Slide 1
  await takeScreenshot('v3_onboarding_slide1.png');

  // Next to Slide 2
  console.log('Navigating to Onboarding Slide 2...');
  await evaluate(`document.querySelectorAll('.onboarding-dot')[1]?.click()`);
  await sleep(700);
  await takeScreenshot('v3_onboarding_slide2.png');

  // Next to Slide 3
  console.log('Navigating to Onboarding Slide 3...');
  await evaluate(`document.querySelectorAll('.onboarding-dot')[2]?.click()`);
  await sleep(700);
  await takeScreenshot('v3_onboarding_slide3.png');

  // Skip onboarding to go to Login or Feed
  console.log('Completing onboarding...');
  await evaluate(`
    const skipBtn = document.querySelector('.onboarding-skip-btn');
    if (skipBtn) skipBtn.click();
  `);
  await sleep(1000);

  // Check if we are on Login screen
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

  // Feed with Increased Size Nav Panel
  console.log('Capturing Feed with enlarged Nav Panel...');
  await takeScreenshot('v2_feed_large_nav.png');

  // Navigate to Profile
  console.log('Navigating to Profile...');
  await evaluate(`
    const tabs = document.querySelectorAll('.dock-tab');
    if (tabs[2]) tabs[2].click();
  `);
  await sleep(1000);
  await takeScreenshot('v2_profile_cleaned.png');

  // Open Composer Sheet via (+) Action Orb
  console.log('Opening Composer Sheet via Nav Orb...');
  await evaluate(`
    const orb = document.querySelector('.nav-action-orb');
    if (orb) orb.click();
  `);
  await sleep(800);
  await takeScreenshot('v2_composer_sheet.png');

  // Clean up
  console.log('All screenshots captured successfully.');
  ws.close();
  edgeProc.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error('Error running capture:', err);
  process.exit(1);
});
