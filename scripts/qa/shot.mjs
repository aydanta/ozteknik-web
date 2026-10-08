// kullanım: node shot.mjs <url> <çıktı.png> [genişlik=1440] [yükseklik=900] [tam=1] [ölçek=1]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const [url, out, W = '1440', H = '900', full = '1', scale = '1'] = process.argv.slice(2);
const port = 9300 + Math.floor(Math.random() * 500);
const prof = mkdtempSync(path.join(process.env.TMPDIR || tmpdir(), 'cdp-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 50; i++) {
  try { const j = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const pg = j.find((x) => x.type === 'page'); if (pg) { ws = new WebSocket(pg.webSocketDebuggerUrl); break; } } catch {}
  await sleep(200);
}
if (ws.readyState !== 1) await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pend = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: +scale, mobile: +W < 768 });
await send('Page.navigate', { url });
await sleep(4500);
// tembel görseller ve reveal animasyonları için sayfayı baştan sona kaydır
await send('Runtime.evaluate', { expression: `(async()=>{for(let y=0;y<document.body.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}scrollTo(0,0);await new Promise(r=>setTimeout(r,800));document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-in'));return 1})()`, awaitPromise: true });
await sleep(1200);
if (process.env.EVAL) { await send('Runtime.evaluate', { expression: process.env.EVAL, awaitPromise: true }); await sleep(1500); }
const m = await send('Page.getLayoutMetrics');
const h = full === '1' ? Math.ceil(m.result.cssContentSize.height) : +H;
const s = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full === '1', clip: { x: 0, y: full === '1' ? 0 : m.result.cssVisualViewport.pageY, width: +W, height: h, scale: 1 } });
writeFileSync(out, Buffer.from(s.result.data, 'base64'));
console.log(out, W + 'x' + h);
ws.close(); chrome.kill();
chrome.on('exit', () => rmSync(prof, { recursive: true, force: true })); // profil ~40 MB, birikmesin
