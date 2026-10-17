<div align="center">

<img src="brand/logo.svg" alt="cline-bulk" width="150" />

# cline-bulk-apikey

**Bulk-create [Cline](https://cline.bot) API keys through Cline's own API (`workos` bearer) and register every key into a running [9Router](https://9router.com) instance — end to end. Zero dependencies.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-connect-to-9router)
[![Transport](https://img.shields.io/badge/transport-direct%20fetch-0EA5E9.svg?style=for-the-badge)](#-transports)
[![Auth](https://img.shields.io/badge/auth-WorkOS%20refresh%20token-22C55E.svg?style=for-the-badge)](#-transports)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](README.md) · [Bahasa Indonesia](i18n/README.id.md) · [简体中文](i18n/README.zh.md) · [日本語](i18n/README.ja.md) · [Español](i18n/README.es.md) · [Deutsch](i18n/README.de.md)

</div>

---

## ✨ Features

- 🔑 **Bulk API keys** — create hundreds of `sk-…` keys through Cline's own API, one `POST` per key.
- 🔐 **WorkOS bearer** — keys authenticate as `Authorization: Bearer workos:<jwt>` (the literal `workos:` prefix is mandatory).
- 🔌 **9Router connector** — every key is registered as an OpenAI-compatible connection under the `cline` prefix in a single pass.
- 🪶 **Zero dependencies** — pure Node.js ≥ 18. No `npm install`, no build step.
- ⚡ **Fast** — ~70 seconds per 200 keys (measured: **1000/1000 keys created**, 0 failures).
- ✅ **No friction** — no captcha, no card, no phone verification, no disposable inbox needed.
- 🧩 **Library or CLI** — call `connectBulk()` in code, or run the bundled `cline-bulk` command.
- 🌍 **5 languages** — EN, ID, ZH, JA, ES, DE.

## 🚀 Quick start

```bash
git clone https://github.com/F0Rextasy/cline-bulk-apikey
cd cline-bulk-apikey

# Check the account: token, user, balance
node src/cli.js auth

# Bulk-create 200 keys → out/cline-keys.txt
node src/cli.js create --count 200 --prefix clx

# Prove the keys with a live chat call
node src/cli.js verify

# Register them in 9Router
node src/cli.js connect --keys out/cline-keys.txt
```

`create` writes the keys file after every ten keys, so a crash never loses progress; `verify` writes a `.verify.txt` tally next to it.

## 🛠 Usage

```bash
cline-bulk auth                      # check account + balance
cline-bulk list                      # list existing API keys
cline-bulk create --count 200        # bulk-create API keys
cline-bulk verify                    # verify keys work
cline-bulk delete --name clx-001     # delete a key
cline-bulk connect                   # register keys into 9Router
```

| Flag | Description | Default |
| --- | --- | --- |
| `--count <n>` | number of keys to create | `200` |
| `--prefix <p>` | key name prefix (`<p>-NNN`) | `clx` |
| `--start <n>` | first index of the batch | `1` |
| `--out <file>` | output keys file | `out/cline-keys.txt` |
| `--model <id>` | model for verification | auto-probe |
| `--conc <n>` | concurrency for verify | `6` |
| `--retries <n>` | retries per verification call | `3` |
| `--limit <n>` | verify only the first `n` keys | all |
| `--delay <ms>` | delay between creates | `160` |
| `--keys <file>` | keys file for `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | 9Router base URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router dashboard password | `123456` |

Environment: `CLINE_API` (default `https://api.cline.bot`) · `CLINE_REFRESH_TOKEN`.

## 🌐 Transports

Cline's API is a plain HTTPS JSON API, so this lane speaks it with Node's built-in `fetch` — there is no browser, no CDP client and no proxy module, and no disposable-inbox step: a Cline account already exists, and key creation needs no verification mail.

- **Direct fetch (only path)** — requests go to `CLINE_API` from the machine that runs Node. Pin another host with `--base-url`.
- **Auth rail** — the WorkOS refresh token comes from `out/.cline-auth.json`, the `CLINE_REFRESH_TOKEN` environment variable, or the local 9Router database (first-run bootstrap). Each refresh rotates the token and the newest one is persisted.

## 🔌 Connect to 9Router

9Router is a self-hosted, OpenAI-compatible router:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Register all your keys in one command (creates the `cline` provider-node if it does not exist and attaches every key as a connection):

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

The free-model combo measured **2.7 s average** latency after warm-up.

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

## 🧠 Available models

| Model | Call as in 9Router | Status |
| --- | --- | --- |
| poolside/laguna-s-2.1:free | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (measured) |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 second verify fallback (probed when the first is unavailable) |
| paid models | `cline/<model>` | ⚠️ `402 insufficient_credits` — every key shares the account balance |

`verify` without `--model` probes `poolside/laguna-s-2.1:free` first and falls back to the `nvidia/…` one; `--model <id>` pins a single model. `402` counts as *accepted* in the tally — it proves the key authenticates.

To refresh the key list on your own account:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
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

## ⚙️ How it works

1. **Auth** — exchange a WorkOS refresh token for an access token (`POST https://api.workos.com/user_management/authenticate`); the bearer must carry the `workos:` prefix.
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` with `{name}` to mint `sk-…` keys; `429`/`5xx` back off and retry up to 4 times.
3. **Verify** — call `/api/v1/chat/completions` with each key against a free model to prove it authenticates.
4. **Connect** — register the keys into 9Router as OpenAI-compatible connections.

### The `workos:` prefix gotcha

Cline's API **requires** the literal `workos:` prefix in the Authorization header:

```
Authorization: Bearer workos:<jwt>   ✅ works
Authorization: Bearer <jwt>          ❌ 401 "re-authenticate your Cline account"
```

The error message suggests an expired session, but it is a bearer-shape bug. The toolkit handles this automatically, and a `401` triggers one forced token refresh before the call is given up on.

### Key behavior

- **Keys authenticate** but share the account's balance.
- Paid models → `402 insufficient_credits`.
- Free models → `200` (e.g. `poolside/laguna-s-2.1:free`).
- A garbage key → `401` (correctly rejected).

Measured: **1000/1000 keys created** in two runs (200 + 800), **0 failures**, ~70 s per 200 keys.

## 📁 Layout

```
cline-bulk-apikey/
├── src/
│   ├── cli.js                  # auth · list · create · delete · verify · connect
│   ├── connect-9router.js      # register the keys as a 9Router provider
│   └── launcher.js             # CLINE ASCII banner
├── examples/
│   └── bulk-create.js          # create a batch of keys from a script
├── brand/
│   ├── logo.svg                # README banner
│   └── icon.svg                # app-style icon
├── i18n/                       # translations of the README
│   ├── README.id.md            # Bahasa Indonesia
│   ├── README.zh.md            # 简体中文
│   ├── README.ja.md            # 日本語
│   ├── README.es.md            # Español
│   └── README.de.md            # Deutsch
├── README.md                   # English (default)
├── LICENSE                     # MIT
└── package.json
```

## ⚠️ Notes

- Keys share the parent account's balance. Use the free models to avoid `402` errors.
- The WorkOS refresh token is single-use — each refresh rotates it. The toolkit auto-persists the newest token.
- First-run bootstrap: if `out/.cline-auth.json` is missing, the toolkit reads the refresh token from the 9Router DB.
- `delete` asks for `--yes` before removing keys in bulk.
- For personal/educational automation. Respect Cline's and 9Router's terms of service.

## 📄 License

[MIT](LICENSE) © 2026 cline-bulk-apikey contributors
