import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = 'C:\\Users\\Unified\\AppData\\Local\\Temp\\edge_cdp_profile_' + Date.now();
const OUT_DIR = 'C:\\Users\\Unified\\.gemini\\antigravity\\brain\\743a91ab-5c94-446d-a8f6-15ef6bc273fd';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
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

  const target = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const map = new Map();
  ws.onmessage = e => {
    const d = JSON.parse(e.data);
    if (d.id && map.has(d.id)) {
      const { res, rej } = map.get(d.id);
      map.delete(d.id);
      if (d.error) rej(d.error); else res(d.result);
    }
  };
  await new Promise(r => ws.onopen = r);
  function cmd(m, p = {}) {
    return new Promise((res, rej) => {
      const i = id++;
      map.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method: m, params: p }));
    });
  }
  await cmd('Page.enable');
  await cmd('Runtime.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 424, height: 890, deviceScaleFactor: 2, mobile: true });

  await sleep(3500); // splash finishes
  await cmd('Runtime.evaluate', { expression: 'document.querySelector(".onboarding-skip-btn")?.click()' });
  await sleep(1000);

  // login if needed
  await cmd('Runtime.evaluate', { expression: `
    const inputs = document.querySelectorAll('input');
    if (inputs[0]) { inputs[0].value = 'rohitha'; inputs[0].dispatchEvent(new Event('input', { bubbles: true })); }
    if (inputs[1]) { inputs[1].value = 'password'; inputs[1].dispatchEvent(new Event('input', { bubbles: true })); }
    document.querySelector('.login-submit-btn')?.click();
  ` });
  await sleep(1500);

  const res = await cmd('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT_DIR, 'problematic_title_feed.png'), Buffer.from(res.data, 'base64'));
  console.log('Saved problematic_title_feed.png');

  ws.close();
  edgeProc.kill();
}
main();
