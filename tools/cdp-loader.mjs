// Fallback loader for Claude Desktop builds that no longer load the React DevTools slot (REACT_PROFILE=1).
// Start Claude with --remote-debugging-port=9222, then run:  node tools/cdp-loader.mjs
// It attaches over the Chrome DevTools Protocol, runs the same painter the extension runs (theme.js), and feeds it
// theme.json / event.json from the extension folder the /themes strip already writes. Nothing in the app is changed.
// Env: THEMES_PORT (default 9222), THEMES_DIR (default: the extension folder under Claude's userData).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const PORT = Number(process.env.THEMES_PORT) || 9222
const SLOT = 'fmkadmapgofadopljbjfkapdkoienihi'
const userData = process.platform === 'win32' ? path.join(process.env.APPDATA ?? '', 'Claude') : path.join(os.homedir(), 'Library/Application Support/Claude')
const DIR = process.env.THEMES_DIR || path.join(userData, 'extensions', SLOT)
const read = n => { try { return fs.readFileSync(path.join(DIR, n), 'utf8') } catch { return null } }
const painter = () => read('theme.js') ?? ''

const SHIM = `(() => { if (window.__themeShim) return; window.__themeShim = true; window.__themeFiles = window.__themeFiles || {};
  window.chrome = window.chrome || {}; chrome.runtime = chrome.runtime || {}; chrome.runtime.getURL = n => 'https://theme.invalid/' + n;
  const of = window.fetch.bind(window);
  window.fetch = (u, o) => { const s = String((u && u.url) || u);
    if (s.startsWith('https://theme.invalid/')) { const t = window.__themeFiles[s.slice(22).split('?')[0]];
      return Promise.resolve(new Response(t == null ? '' : t, { status: t == null ? 404 : 200 })) }
    return of(u, o) } })();\n`

const sessions = new Map()
const log = (...a) => console.log(new Date().toISOString(), ...a)

function attach(t) {
  const ws = new WebSocket(t.webSocketDebuggerUrl)
  const s = { ws, n: 0 }
  sessions.set(t.id, s)
  const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++s.n, method, params }))
  s.send = send
  ws.onopen = () => {
    const src = SHIM + painter()
    send('Page.enable'); send('Page.setBypassCSP', { enabled: true })
    send('Page.addScriptToEvaluateOnNewDocument', { source: src })
    send('Runtime.evaluate', { expression: src })
    log('attached', t.id, t.url.slice(0, 60))
  }
  ws.onclose = () => sessions.delete(t.id)
  ws.onerror = () => sessions.delete(t.id)
}

async function scan() {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()
    for (const t of list) if (t.type === 'page' && /^(https?|file):/.test(t.url) && !sessions.has(t.id)) attach(t)
  } catch { /* app not up with the debug port yet */ }
}

function feed() {
  const files = { 'theme.json': read('theme.json'), 'event.json': read('event.json') }
  const expr = `window.__themeFiles = ${JSON.stringify(files)}`
  for (const s of sessions.values()) if (s.ws.readyState === 1) s.send('Runtime.evaluate', { expression: expr })
}

setInterval(scan, 3000)
setInterval(feed, 400)
scan()
log('themes injector running, waiting for Claude on port', PORT)
