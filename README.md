<div align="center">

<img src="brand/logo.svg" alt="cline-bulk" width="150" />

# cline-bulk-apikey

**Bulk-create [Cline](https://cline.bot) API keys (workos bearer) — 9Router connector. Zero dependencies.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-9router)

</div>

---

## ✨ Features

- 🔑 **Bulk API keys** — create hundreds of `sk-…` keys through Cline's own API.
- 🔐 **WorkOS bearer** — keys use `Authorization: Bearer workos:<jwt>` (not raw JWT).
- 🔌 **9Router connector** — every key is registered as an OpenAI-compatible connection in 9Router.
- 🪶 **Zero dependencies** — pure Node.js ≥ 18. No `npm install`, no build step.
- ⚡ **Fast** — ~70 seconds per 200 keys.
- ✅ **No friction** — no captcha, no card, no phone verification.

## 🚀 Quick start

```bash
git clone https://github.com/F0Rextasy/cline-bulk-apikey
cd cline-bulk-apikey

# Check account auth
node src/cli.js auth

# Bulk-create 200 keys
node src/cli.js create --count 200 --prefix clx

# Verify keys work
node src/cli.js verify
```

## 🛠 Usage

```bash
cline-bulk auth                      # check account + balance
cline-bulk list                      # list existing API keys
cline-bulk create --count 200        # bulk-create API keys
cline-bulk verify                    # verify keys work
cline-bulk delete --name clx-001     # delete a key
```

| Flag | Description | Default |
| --- | --- | --- |
| `--count <n>` | number of keys to create | `200` |
| `--prefix <p>` | key name prefix | `clx` |
| `--out <file>` | output keys file | `out/cline-keys.txt` |
| `--model <id>` | model for verification | auto-probe |
| `--conc <n>` | concurrency for verify | `6` |
| `--delay <ms>` | delay between creates | `160` |

## 📐 How it works

1. **Auth** — Exchange a WorkOS refresh token for an access token (bearer must include `workos:` prefix).
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` with `{name}` to mint keys.
3. **Verify** — Test each key against free models to confirm they authenticate.
4. **Connect** — Register keys into 9Router as OpenAI-compatible connections.

### The `workos:` prefix gotcha

Cline's API **requires** the literal `workos:` prefix in the Authorization header:

```
Authorization: Bearer workos:<jwt>   ✅ works
Authorization: Bearer <jwt>          ❌ 401 "re-authenticate your Cline account"
```

The error message suggests a expired session, but it's actually a bearer-shape bug. The toolkit handles this automatically.

### Key behavior

- **Keys authenticate** but share the account's balance.
- Paid models → `402 insufficient_credits`
- Free models → `200` (e.g., `poolside/laguna-s-2.1:free`)
- A garbage key → `401` (correctly rejected)

Measured: **1000/1000 keys created** in two runs (200 + 800), **0 failures**, ~70s per 200 keys.

## 🔌 Connect to 9Router

9Router is a self-hosted, OpenAI-compatible router:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Register all your keys in one command:

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

This creates a `cline` provider-node (if it doesn't exist) and attaches each key as a connection. The free-model combo measured **2.7s average** latency after warm-up.

### Usage through 9Router

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>
Models   : cline/poolside/laguna-s-2.1:free, cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
```

Call it like any OpenAI endpoint:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

## 📚 As a library

```js
import { connectBulk } from './src/connect-9router.js';

const { clientKey, results } = await connectBulk({
  base: 'http://localhost:20128',
  password: '123456',
  keysFile: './out/cline-keys.txt',
  prefix: 'cline',
  defaultModel: 'poolside/laguna-s-2.1:free',
});

console.log('9Router key:', clientKey);
```

## ⚠️ Notes

- Keys share the parent account's balance. Use free models to avoid 402 errors.
- The WorkOS refresh token is single-use — each refresh rotates it. The toolkit auto-persists the newest token.
- First-run bootstrap: if `out/.cline-auth.json` is missing, the toolkit reads the refresh token from the 9Router DB.

## 📄 License

[MIT](LICENSE) © 2026 cline-bulk-apikey contributors