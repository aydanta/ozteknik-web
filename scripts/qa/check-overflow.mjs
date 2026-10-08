// kullanım: node overflow.mjs <genişlik> <url>...   → yatay taşan öğeler
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const [W, ...urls] = process.argv.slice(2);
const port = 9800 + Math.floor(Math.random() * 150);
const prof = mkdtempSync(path.join(process.env.TMPDIR || tmpdir(), 'cdp-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
for (let i = 0; i < 50 && !ws; i++) { try { const pg = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((x) => x.type === 'page'); if (pg) ws = new WebSocket(pg.webSocketDebuggerUrl); } catch {} await sleep(200); }
if (ws.readyState !== 1) await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0; const pend = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: 740, deviceScaleFactor: 1, mobile: true });
const check = `(()=>{const W=document.documentElement.clientWidth;const off=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>W+1||r.left<-1)&&!e.closest('.hero-media,.sr-only,[hidden],.mega,.drawer,.mobile-menu,[aria-hidden=true]')});return JSON.stringify({sw:document.documentElement.scrollWidth,W,n:off.length,off:off.slice(0,4).map(e=>e.tagName+'.'+String(e.className).slice(0,28)+' «'+(e.textContent||'').trim().slice(0,30)+'» '+Math.round(e.getBoundingClientRect().right))})})()`;
let bad = 0;
for (const u of urls) {
  await send('Page.navigate', { url: u });
  await sleep(1800);
  const r = JSON.parse((await send('Runtime.evaluate', { expression: check, returnByValue: true })).result.result.value);
  if (r.n || r.sw > r.W) bad++;
  console.log(new URL(u).pathname.padEnd(28), r.n || r.sw > r.W ? `TAŞMA sw=${r.sw} ${r.off.join(' | ')}` : 'ok');
}
console.log(`${urls.length} sayfa, ${bad} taşan`);
ws.close(); chrome.kill();
chrome.on('exit', () => rmSync(prof, { recursive: true, force: true })); // profil ~40 MB, birikmesin
