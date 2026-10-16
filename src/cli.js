#!/usr/bin/env node
'use strict';

/**
 * cline-bulk — bulk-create Cline API keys and connect them to 9Router.
 *
 * Usage:
 *   cline-bulk auth                      # check account + balance
 *   cline-bulk list                      # list existing keys
 *   cline-bulk create --count 200        # bulk-create keys
 *   cline-bulk verify --model <id>       # verify keys work
 *   cline-bulk connect                   # register keys into 9Router
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE = (process.env.CLINE_API || 'https://api.cline.bot').replace(/\/$/, '');
const OUT_DIR = path.join(__dirname, '..', 'out');
const AUTH_FILE = path.join(OUT_DIR, '.cline-auth.json');
const WORKOS_BASE = 'https://api.workos.com/user_management';
const WORKOS_CLIENT = process.env.CLINE_WORKOS_CLIENT || 'client_01K3A541FN8TA3EPPHTD2325AR';
const UA = 'cline-bulk/1.0';

const arg = (n, d) => {
  const i = process.argv.indexOf(`--${n}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};
const flag = (n) => process.argv.includes(`--${n}`);

const mask = (s) => (s ? String(s).slice(0, 12) + '…' : '(none)');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readStoredAuth() {
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writeStoredAuth(obj) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ ...obj, saved_at: new Date().toISOString() }, null, 1));
}

function refreshTokenFrom9Router() {
  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(path.join(process.env.APPDATA || '', '9router', 'db', 'data.sqlite'), { readOnly: true });
    const row = db.prepare("SELECT data FROM providerConnections WHERE provider LIKE '%cline%' ORDER BY updatedAt DESC LIMIT 1").get();
    db.close();
    if (!row) return null;
    const d = JSON.parse(row.data);
    return d.refreshToken || null;
  } catch (e) {
    console.error('9Router DB read failed:', e.message);
    return null;
  }
}

async function refresh() {
  const stored = readStoredAuth();
  const rt = stored?.refresh_token || process.env.CLINE_REFRESH_TOKEN || refreshTokenFrom9Router();
  if (!rt) throw new Error('no refresh token: neither out/.cline-auth.json nor the 9Router DB has one');
  const res = await fetch(`${WORKOS_BASE}/authenticate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ grant_type: 'refresh_token', client_id: WORKOS_CLIENT, refresh_token: rt }),
  });
  const j = await res.json().catch(() => null);
  if (!res.ok || !j?.access_token) {
    throw new Error(`WorkOS refresh failed: ${res.status} ${JSON.stringify(j).slice(0, 200)}`);
  }
  writeStoredAuth({ access_token: j.access_token, refresh_token: j.refresh_token, user: j.user?.email, obtained_at: Date.now() });
  return j.access_token;
}

function jwtExp(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()).exp;
  } catch {
    return 0;
  }
}

async function token({ force = false } = {}) {
  const stored = readStoredAuth();
  const fresh = stored?.access_token && jwtExp(stored.access_token) * 1000 - Date.now() > 5 * 60 * 1000;
  if (stored?.access_token && fresh && !force) return stored.access_token;
  return refresh();
}

function headers(tok) {
  return {
    authorization: `Bearer workos:${tok}`,
    'content-type': 'application/json',
    'User-Agent': UA,
    'X-CLIENT-TYPE': 'vscode',
    'X-CLIENT-VERSION': '3.39.0',
    'X-CORE-VERSION': '3.39.0',
    'X-PLATFORM': 'win32',
    'X-PLATFORM-VERSION': '10.0.19045',
  };
}

async function api(method, p, body) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const tok = attempt === 0 ? await token() : await token({ force: true });
    const res = await fetch(`${BASE}${p}`, {
      method,
      headers: headers(tok),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}
    if (res.status === 401 && attempt === 0) {
      console.error('  401 → refreshing account token and retrying once');
      continue;
    }
    return { status: res.status, json, text, headers: res.headers };
  }
  throw new Error('unreachable');
}

async function cmdAuth() {
  const tok = await token({ force: flag('force') });
  const me = await api('GET', '/api/v1/users/me');
  const uid = me.json?.data?.id;
  const bal = uid ? await api('GET', `/api/v1/users/${uid}/balance`) : null;
  console.log('token   :', mask(tok), `expires ${new Date(jwtExp(tok) * 1000).toISOString()}`);
  console.log('user    :', me.json?.data?.email, `(${uid})`);
  console.log('balance :', bal?.json?.data?.balance);
}

async function cmdList() {
  const r = await api('GET', '/api/v1/api-keys');
  const keys = r.json?.data?.keys || [];
  console.log(`${keys.length} key(s) on the account`);
  for (const k of keys) {
    console.log(`  ${k.id}  ${String(k.key_prefix).padEnd(12)}  ${String(k.name).padEnd(14)}  created ${k.created_at}  used ${k.last_used_at || '-'}`);
  }
  return keys;
}

async function cmdCreate() {
  const count = Number(arg('count', '200'));
  const prefix = arg('prefix', 'clx');
  const start = Number(arg('start', '1'));
  const delay = Number(arg('delay', '160'));
  const out = arg('out', path.join(OUT_DIR, 'cline-keys.txt'));
  const jl = out.replace(/\.txt$/, '') + '.jsonl';
  const base = (arg('base-url', `${BASE}/api/v1`)).replace(/\/$/, '');
  const created = [];
  const failures = [];
  console.log(`creating ${count} keys "${prefix}-NNN" (${start}..${start + count - 1}) → ${out}`);
  for (let i = start; i < start + count; i++) {
    const name = `${prefix}-${String(i).padStart(3, '0')}`;
    let rec = null;
    for (let retry = 0; retry < 4; retry++) {
      const r = await api('POST', '/api/v1/api-keys', { name });
      if (r.status === 200 && r.json?.data?.secret_key) {
        rec = { name, id: r.json.data.api_key.id, prefix: r.json.data.api_key.key_prefix, key: r.json.data.secret_key, created_at: r.json.data.api_key.created_at };
        break;
      }
      if (r.status === 429 || r.status >= 500) {
        const wait = 1500 * (retry + 1);
        console.error(`  ${name}: ${r.status} → backoff ${wait}ms`);
        await sleep(wait);
        continue;
      }
      failures.push({ name, status: r.status, body: r.text.slice(0, 200) });
      break;
    }
    if (!rec) {
      if (failures.at(-1)?.name !== name) failures.push({ name, status: 'no-record', body: '' });
      console.error(`  ${name}: FAILED`);
    } else {
      created.push(rec);
      console.log(`  [${created.length}/${count}] ${name} → ${rec.id} ${rec.prefix}…`);
    }
    if (created.length && created.length % 10 === 0) {
      fs.appendFileSync(jl, created.slice(-10).map((c) => JSON.stringify(c)).join('\n') + '\n');
      writeKeysFile(out, base, created, failures);
    }
    await sleep(delay);
  }
  writeKeysFile(out, base, created, failures);
  fs.writeFileSync(jl + '.failures.json', JSON.stringify(failures, null, 1));
  console.log(`\ncreated ${created.length}/${count}; failures ${failures.length}`);
  console.log(`keys → ${out}`);
  return created;
}

function writeKeysFile(out, base, created, failures) {
  const head = [
    `# Cline API keys · rotated ${new Date().toISOString()}`,
    `# created ${created.length} · base ${base} · model list ${base}/models`,
    `# tool: cline-bulk (create|list|delete|verify)`,
  ];
  const body = created.map((c) => c.key);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, [...head, ...body, ''].join('\n'));
  if (failures.length) console.error(`${failures.length} failure(s) recorded`);
}

async function cmdDelete() {
  const id = arg('id');
  const name = arg('name');
  let targets = [];
  if (id) targets = [{ id, name: '(by id)' }];
  else {
    const keys = (await cmdList()).filter((k) => (name ? k.name === name : flag('all')));
    targets = keys.map((k) => ({ id: k.id, name: k.name }));
  }
  if (!targets.length) {
    console.log('nothing to delete');
    return;
  }
  if (!flag('yes') && !id) {
    console.log('add --yes to confirm deletion of the keys listed above');
    return;
  }
  for (const t of targets) {
    const r = await api('DELETE', `/api/v1/api-keys/${t.id}`);
    console.log(`delete ${t.id} (${t.name}) → ${r.status}${r.status >= 400 ? ' ' + r.text.slice(0, 160) : ''}`);
  }
}

const VERIFY_FALLBACKS = [
  'poolside/laguna-s-2.1:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
];

async function chat(key, model) {
  const res = await fetch(`${BASE}/api/v1/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json', 'User-Agent': UA, 'HTTP-Referer': 'https://app.cline.bot', 'X-Title': 'cline-bulk-verify' },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Reply with: ok' }], max_tokens: 8, stream: false }),
  });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {}
  const err = body?.error?.message || body?.error || body?.message || (res.ok ? '' : text.slice(0, 160));
  const payload = body?.data ?? body;
  const content = payload?.choices?.[0]?.message?.content;
  return { status: res.status, err: typeof err === 'string' ? err : JSON.stringify(err).slice(0, 160), sample: res.ok ? (content || text.replace(/\s+/g, ' ')).slice(0, 80) : '' };
}

async function cmdVerify() {
  const file = arg('keys', path.join(OUT_DIR, 'cline-keys.txt'));
  const out = arg('out', file.replace(/\.txt$/, '') + '.verify.txt');
  const conc = Number(arg('conc', '6'));
  const retries = Number(arg('retries', '3'));
  const gap = Number(arg('delay', '0'));
  const limit = Number(arg('limit', '0')) || Infinity;
  const keys = fs.readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')).map((l) => l.split(/[\s,]+/)[0]).slice(0, limit);
  let model = arg('model');
  if (!model) {
    for (const m of VERIFY_FALLBACKS) {
      const r = await chat(keys[0], m);
      console.log(`probe ${m} → ${r.status}`);
      if (r.status === 200) { model = m; break; }
    }
    if (!model) model = VERIFY_FALLBACKS[0];
  }
  console.log(`verifying ${keys.length} key(s) · model ${model} · conc ${conc}`);
  const results = [];
  let idx = 0;
  const worker = async () => {
    while (idx < keys.length) {
      const my = idx++;
      const k = keys[my];
      let r = { status: 'net', err: 'not attempted', sample: '' };
      for (let attempt = 0; attempt <= retries; attempt++) {
        try { r = await chat(k, model); } catch (e) { r = { status: 'net', err: e.message, sample: '' }; }
        if (![429, 500, 502, 503, 504].includes(Number(r.status)) || attempt === retries) break;
        await sleep(2000 * (attempt + 1));
      }
      results[my] = { i: my + 1, prefix: k.slice(0, 16), ...r };
      if ((my + 1) % 25 === 0) console.log(`  …${my + 1}/${keys.length}`);
      if (gap) await sleep(gap);
    }
  };
  await Promise.all(Array.from({ length: Math.min(conc, keys.length) }, worker));
  const tally = {};
  for (const r of results) tally[r.status] = (tally[r.status] || 0) + 1;
  const accepted = results.filter((r) => r.status === 200 || r.status === 402).length;
  const lines = [
    `# verification ${new Date().toISOString()} · ${keys.length} keys · model ${model}`,
    `# tally ${JSON.stringify(tally)} · accepted: ${accepted}/${keys.length}`,
    '# idx\tkey_prefix\tstatus\terror/sample',
    ...results.map((r) => `${r.i}\t${r.prefix} …\t${r.status}\t${r.sample || r.err}`),
  ];
  fs.writeFileSync(out, lines.join('\n') + '\n');
  console.log(`tally ${JSON.stringify(tally)} · accepted ${accepted}/${keys.length} → ${out}`);
  return { model, tally, accepted, results };
}

async function cmdConnect() {
  const { connectBulk } = await import('./connect-9router.js');
  const keysFile = arg('keys', path.join(OUT_DIR, 'cline-keys.txt'));
  const router = arg('router', 'http://localhost:20128');
  const password = arg('router-password', '123456');
  const prefix = arg('prefix', 'cline');
  const model = arg('model', 'poolside/laguna-s-2.1:free');
  
  const { clientKey, results } = await connectBulk({
    base: router,
    password,
    keysFile,
    prefix,
    defaultModel: model,
  });
  
  console.log(`\n✅ Connected ${results.filter(r => !r.error).length} keys to 9Router`);
  console.log(`   Endpoint: ${router}/v1`);
  console.log(`   Client key: ${clientKey}`);
}

const cmd = process.argv[2];
(async () => {
  if (cmd === 'auth') return cmdAuth();
  if (cmd === 'list') return cmdList();
  if (cmd === 'create') return cmdCreate();
  if (cmd === 'delete') return cmdDelete();
  if (cmd === 'verify') return cmdVerify();
  if (cmd === 'connect') return cmdConnect();
  if (!cmd) {
    console.log(`cline-bulk — bulk-create Cline API keys (workos bearer) — 9Router connector

Usage:
  cline-bulk auth                      # check account + balance
  cline-bulk list                      # list existing API keys
  cline-bulk create --count 200        # bulk-create API keys
  cline-bulk verify                    # verify keys work
  cline-bulk delete --name clx-001     # delete a key
  cline-bulk connect                   # register keys into 9Router

Options:
  --count <n>          number of keys to create (default: 200)
  --prefix <p>         key name prefix (default: clx)
  --out <file>         output keys file
  --model <id>         model for verification
  --conc <n>           concurrency for verify (default: 6)
  --delay <ms>         delay between creates (default: 160ms)
  --keys <file>        keys file for connect (default: out/cline-keys.txt)
  --router <url>       9Router URL (default: http://localhost:20128)
  --router-password    9Router password (default: 123456)

Environment:
  CLINE_API            Cline API base (default: https://api.cline.bot)
  CLINE_REFRESH_TOKEN  WorkOS refresh token
`);
    process.exit(0);
  }
  console.log('unknown command:', cmd);
  process.exitCode = 1;
})().catch((e) => {
  console.error('FATAL', e.stack || e.message);
  process.exitCode = 1;
});