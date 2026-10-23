<div align="center">

```
 ██████╗██╗     ██╗███╗   ██╗███████╗
██╔════╝██║     ██║████╗  ██║██╔════╝
██║     ██║     ██║██╔██╗ ██║█████╗
██║     ██║     ██║██║╚██╗██║██╔══╝
╚██████╗███████╗██║██║ ╚████║███████╗
 ╚═════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
```

# cline-bulk-apikey

**Bulk-create Cline API keys through Cline's own API (workos bearer) and register every key into 9Router — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-2-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

Cline mints API keys through its own plain HTTPS JSON API — one `POST` per key, no captcha, no card, no phone verification, no disposable inbox. Keys are created in batches with no failures observed, at roughly 70 s per 200 keys. Every key is then registered as an OpenAI-compatible connection under one `cline` provider-node in 9Router.

## 🎁 Free tier — how much you get

**One Cline account yields unlimited `sk-…` keys, and keys that hit the free models cost nothing — no card, no phone, no inbox.**

| What | Value |
| --- | --- |
| Cost of a key | **$0** — key creation is free and unmetered (measured: 1000 keys, 0 failures) |
| Card required | **No** |
| Rate limit | `429`/`5xx` on create back off and retry up to 4 times; `--delay 160` ms between creates |
| Sign-up | none — the tool reuses an existing Cline account via its WorkOS refresh token |
| What a key can spend | the **parent account's balance**: free models answer `200`, paid models answer `402 insufficient_credits` — every key shares that one balance |
| The unit that scales | **one account = many keys** (unlike account-per-key providers) → `--count N` is really "N keys from the same balance" |

> 💡 The free tier is set by Cline and can change. Check the live numbers at [cline.bot](https://cline.bot) — and let the tool's own gate decide:

```bash
node src/cli.js verify            # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 2 of them

Cline's catalogue is larger and gated by the parent account's balance; the two ids a fresh key can actually use — and what `verify` probes — are:

| Model ID | Call as in 9Router | Status |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (measured) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 second verify fallback |
| paid models | `cline/<model>` | ⚠️ `402 insufficient_credits` — every key shares the account balance |

`--model <id>` pins a single model. `402` counts as *accepted* in the verify tally — it proves the key authenticates. To list the catalogue on your own account:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 How to use the API

The upstream base URL is **`https://api.cline.bot/api/v1`**; the key goes in as the whole bearer value (`Authorization: Bearer sk-…` on Cline's API, `Bearer workos:<jwt>` for the account token). Once the keys are in 9Router, call the router instead — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Directly against Cline (what `verify` does per key):

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

The free-model combo measured **2.7 s average** latency in 9Router after warm-up.

## 🛠 Quick start

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

### 🖱️ The launcher

`node src/launcher.js` opens a small menu — mint keys, verify them, or register them with a local 9Router / OmniRoute (`--connect-9router`, `--connect-omniroute`) — and remembers the answers in `launcher.config.json`. Everything it does is also a plain `src/cli.js` command (`auth`, `list`, `create`, `verify`, `delete`, `connect`), so the menu is optional.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | keys created in one batch, no failures, ~70 s per 200 |
| `POST /api/v1/chat/completions` on `poolside/laguna-s-2.1:free` | **200** — the key authenticates |
| paid model | **402 insufficient_credits** — auth is fine, the shared balance is the gate |
| a garbage key | **401** — correctly rejected |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **Auth** — exchange a WorkOS refresh token for an access token (`POST https://api.workos.com/user_management/authenticate`); the bearer must carry the `workos:` prefix.
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` with `{name}` to mint `sk-…` keys; `429`/`5xx` back off and retry up to 4 times.
3. **Verify** — call `/api/v1/chat/completions` with each key against a free model to prove it authenticates.
4. **Connect** — register the keys into 9Router as OpenAI-compatible connections.

**The `workos:` prefix gotcha:** Cline's API requires the literal prefix — `Authorization: Bearer workos:<jwt>` works, `Bearer <jwt>` answers `401 "re-authenticate your Cline account"`. The error message suggests an expired session, but it is a bearer-shape bug; the toolkit handles it automatically and forces one token refresh on `401` before giving up.

The WorkOS refresh token is single-use and rotates on every refresh; the newest one is persisted to `out/.cline-auth.json` (or read from `CLINE_REFRESH_TOKEN`, or bootstrapped from the local 9Router DB).

## ⚙️ CLI options

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
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

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | the API host |
| `CLINE_REFRESH_TOKEN` | — | WorkOS refresh token (otherwise `out/.cline-auth.json`, then the 9Router DB) |

## 🛰️ Behind a proxy

**Not proxied by design.** This lane speaks Cline's API with Node's built-in `fetch` from the machine that runs Node — there is no browser, no CDP client and no proxy module. Requests leave from your own address, which is fine here because key creation needs no sign-up per key: one existing account mints all of them. Pin another host with `--base-url` only if you front the API yourself.

## 📄 Files

| Path | Contents |
| --- | --- |
| `out/cline-keys.txt` | the minted `sk-…` keys, one per line — git-ignored |
| `out/cline-keys.txt.verify.txt` | the verify tally |
| `out/.cline-auth.json` | the persisted WorkOS refresh token — git-ignored, never commit |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` · `src/connect-omniroute.js` | register the keys as a 9Router / OmniRoute provider |
| `examples/bulk-create.js` | create a batch of keys from a script |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router (`npm install -g 9router && 9router`, dashboard on `http://localhost:20128`). Register every key in one command — the `cline` provider-node is created if missing and each key is attached as a connection:

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router (`npm install -g omniroute && omniroute`, dashboard on `http://localhost:20128`). The connector does the same job there — the `cline` provider-node is created if missing and every key in `keys.txt` is attached as a connection:

```bash
node src/connect-omniroute.js                    # every key in keys.txt
node src/connect-omniroute.js --api-key clx-…    # or one key at a time
```

The interactive launcher reaches the same flow: `node src/launcher.js --connect-omniroute`.

Defaults: base `http://localhost:20128`, password `123456`, prefix `cline`, upstream `https://api.cline.bot/api/v1`, default model `poolside/laguna-s-2.1:free`, client key named `cline`. Models are then served as `cline/<model id>` and load-balanced across every key.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **Cline** — [cline.bot](https://cline.bot) · app at [app.cline.bot](https://app.cline.bot) |
| 🎁 What the provider gives | free models on every key — bulk sk-… keys from one WorkOS account, no captcha |
| 🔑 What one key gets you | a `sk-…` key that authenticates against Cline's API; its spend follows the **parent account's balance** (free models `200`, paid models `402`) |
| 🌐 API shape | OpenAI-compatible: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 Your data | only `api.cline.bot`, `api.workos.com` and your local 9Router are contacted; keys and the WorkOS token stay on your machine |

## 🐞 Issues

If Cline changes its API shape or Cline/WorkOS rotates the client id, the tool stops at that step and says so. **[Open an issue](../../issues)** with the command you ran and the exact output; PRs are welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>
