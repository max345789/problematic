import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\Unified\\AppData\\Local\\Temp\\edge_landing_cdp_' + Date.now();
const OUT_DIR = 'C:\\Users\\Unified\\.gemini\\antigravity\\brain\\35b0391c-62d0-4805-bce0-3e6720cd8ff2';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Starting Vite preview server on port 4173...');
  const previewProc = spawn('npx.cmd', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'ignore'
  });

  // Wait for preview server to be responsive
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:4173/');
      if (res.ok) {
        serverReady = true;
        break;
      }
    } catch {}
    await sleep(300);
  }

  if (!serverReady) {
    previewProc.kill();
    throw new Error('Vite preview server failed to start');
  }
  console.log('Preview server ready at http://127.0.0.1:4173');

  console.log('Launching Edge headless...');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless=new',
    '--remote-debugging-port=9227',
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=1440,900',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://127.0.0.1:4173/'
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9227/json/list');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch {
      await sleep(250);
    }
  }

  if (!targets || targets.length === 0) {
    edgeProc.kill();
    previewProc.kill();
    throw new Error('Could not find Edge page target');
  }

  const target = targets.find(t => t.type === 'page') || targets[0];
  const wsUrl = target.webSocketDebuggerUrl;
  console.log('Connecting to WebSocket target:', wsUrl);

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

  await new Promise(resolve => ws.onopen = resolve);

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('DOM.enable');
  await sendCommand('CSS.enable');

  // Let initial page load settle
  await sleep(1500);

  async function takeScreenshot(filename) {
    const res = await sendCommand('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${outPath} (${buffer.length} bytes)`);
  }

  async function scrollToSection(id) {
    const res = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const el = document.getElementById('${id}');
        if (el) {
          window.scrollTo({ top: el.offsetTop - 70, left: 0, behavior: 'instant' });
        }
        return window.scrollY;
      })()`
    });
    console.log(`Scrolled to ${id}: current scrollY = ${res.result?.value}`);
    await sleep(800);
  }

  // 1. Hero Act
  await takeScreenshot('landing_hero.png');

  // 2. Pillars Act
  await scrollToSection('story-pillars');
  await takeScreenshot('landing_pillars.png');

  // 3. Moderation Act
  await scrollToSection('story-moderation');
  await takeScreenshot('landing_moderation.png');

  // 4. Resonance Act
  await scrollToSection('story-resonance');
  await takeScreenshot('landing_resonance.png');

  // 5. CTA Act
  await scrollToSection('story-cta');
  await takeScreenshot('landing_cta.png');

  // 6. Mobile Viewport (412x915)
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 412,
    height: 915,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sendCommand('Runtime.evaluate', {
    expression: "window.scrollTo(0, 0);"
  });
  await sleep(800);
  await takeScreenshot('landing_mobile.png');

  // Cleanup
  ws.close();
  edgeProc.kill();
  previewProc.kill();

  console.log('🎉 All screenshots successfully captured!');
}

capture().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
