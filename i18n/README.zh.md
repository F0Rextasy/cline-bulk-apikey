<div align="center">

<img src="../brand/logo.svg" alt="cline-bulk" width="150" />

# cline-bulk-apikey

**通过 Cline 自有 API（`workos` bearer）批量创建 [Cline](https://cline.bot) API 密钥，并将每个密钥注册到运行中的 [9Router](https://9router.com) 实例 —— 端到端。零依赖。**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-连接到-9router)
[![Transport](https://img.shields.io/badge/transport-direct%20fetch-0EA5E9.svg?style=for-the-badge)](#-传输方式)
[![Auth](https://img.shields.io/badge/auth-WorkOS%20refresh%20token-22C55E.svg?style=for-the-badge)](#-传输方式)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ 功能特性

- 🔑 **批量 API 密钥** —— 通过 Cline 自有 API 创建数百个 `sk-…` 密钥，每个密钥一次 `POST`。
- 🔐 **WorkOS bearer** —— 密钥以 `Authorization: Bearer workos:<jwt>` 认证（字面量 `workos:` 前缀是必需的）。
- 🔌 **9Router 连接器** —— 每个密钥都被一次性注册为 `cline` 前缀下的 OpenAI 兼容连接。
- 🪶 **零依赖** —— 纯 Node.js ≥ 18。无需 `npm install`，无需构建步骤。
- ⚡ **快速** —— 每 200 个密钥约 70 秒（实测：**1000/1000 个密钥创建成功**，0 失败）。
- ✅ **无门槛** —— 无验证码、无信用卡、无电话验证、无需一次性邮箱。
- 🧩 **库或 CLI** —— 在代码中调用 `connectBulk()`，或运行内置的 `cline-bulk` 命令。
- 🌍 **5 种语言** —— EN、ID、ZH、JA、ES、DE。

## 🚀 快速开始

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

`create` 每十个密钥就写一次密钥文件，因此崩溃也不会丢失进度；`verify` 会在旁边写入 `.verify.txt` 统计。

## 🛠 用法

```bash
cline-bulk auth                      # check account + balance
cline-bulk list                      # list existing API keys
cline-bulk create --count 200        # bulk-create API keys
cline-bulk verify                    # verify keys work
cline-bulk delete --name clx-001     # delete a key
cline-bulk connect                   # register keys into 9Router
```

| 参数 | 说明 | 默认 |
| --- | --- | --- |
| `--count <n>` | 创建的密钥数量 | `200` |
| `--prefix <p>` | 密钥名前缀（`<p>-NNN`） | `clx` |
| `--start <n>` | 批次起始索引 | `1` |
| `--out <file>` | 输出的密钥文件 | `out/cline-keys.txt` |
| `--model <id>` | 用于验证的模型 | auto-probe |
| `--conc <n>` | verify 的并发数 | `6` |
| `--retries <n>` | 每次验证调用的重试次数 | `3` |
| `--limit <n>` | 只验证前 `n` 个密钥 | 全部 |
| `--delay <ms>` | 创建之间的间隔 | `160` |
| `--keys <file>` | `verify` / `connect` 使用的密钥文件 | `out/cline-keys.txt` |
| `--router <url>` | 9Router 基础 URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router 面板密码 | `123456` |

环境变量：`CLINE_API`（默认 `https://api.cline.bot`）· `CLINE_REFRESH_TOKEN`。

## 🌐 传输方式

Cline 的 API 是一个普通的 HTTPS JSON API，因此该通道使用 Node 内置的 `fetch` 与之通信 —— 不需要浏览器、不需要 CDP 客户端、不需要代理模块，也没有一次性邮箱步骤：Cline 账号本就已存在，创建密钥也不需要验证邮件。

- **直接 fetch（唯一路径）** —— 请求由运行 Node 的机器发往 `CLINE_API`。用 `--base-url` 固定到其他主机。
- **认证通道** —— WorkOS refresh token 来自 `out/.cline-auth.json`、`CLINE_REFRESH_TOKEN` 环境变量，或本地 9Router 数据库（首次运行时引导）。每次刷新都会轮换 token，最新的会被持久化。

## 🔌 连接到 9Router

9Router 是一个自托管、兼容 OpenAI 的路由器：

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

用一条命令注册你所有的密钥（若 `cline` provider-node 不存在则创建，并把每个密钥作为连接挂载上去）：

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

免费模型组合在预热后实测平均延迟 **2.7 s**。

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>
Models   : cline/poolside/laguna-s-2.1:free, cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
```

像调用任何 OpenAI 端点一样使用它：

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🧠 可用模型

| 模型 | 在 9Router 中的调用名 | 状态 |
| --- | --- | --- |
| poolside/laguna-s-2.1:free | `cline/poolside/laguna-s-2.1:free` | ✅ `200`（实测） |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 第二验证回退（首个不可用时探测） |
| 付费模型 | `cline/<model>` | ⚠️ `402 insufficient_credits` —— 所有密钥共享同一账号余额 |

不带 `--model` 的 `verify` 会先探测 `poolside/laguna-s-2.1:free`，再回退到 `nvidia/…`；`--model <id>` 则锁定单个模型。`402` 在统计中计为*已接受* —— 这证明密钥完成了认证。

要刷新你自己账号上的密钥列表：

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 📚 作为库使用

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

## ⚙️ 工作原理

1. **Auth** —— 用 WorkOS refresh token 换取 access token（`POST https://api.workos.com/user_management/authenticate`）；bearer 必须带 `workos:` 前缀。
2. **Create** —— `POST https://api.cline.bot/api/v1/api-keys` 带上 `{name}` 铸造 `sk-…` 密钥；遇到 `429`/`5xx` 会退避并重试，最多 4 次。
3. **Verify** —— 用每个密钥对免费模型调用 `/api/v1/chat/completions`，证明它能通过认证。
4. **Connect** —— 把密钥作为 OpenAI 兼容连接注册到 9Router。

### `workos:` 前缀的坑

Cline 的 API **要求** Authorization 头中带有字面量 `workos:` 前缀：

```
Authorization: Bearer workos:<jwt>   ✅ works
Authorization: Bearer <jwt>          ❌ 401 "re-authenticate your Cline account"
```

错误消息提示会话已过期，但这其实是 bearer 格式的 bug。工具链会自动处理，并在放弃调用前因 `401` 强制刷新一次 token。

### 密钥行为

- **密钥能通过认证**，但共享该账号的余额。
- 付费模型 → `402 insufficient_credits`。
- 免费模型 → `200`（例如 `poolside/laguna-s-2.1:free`）。
- 无效密钥 → `401`（被正确拒绝）。

实测：两次运行共**创建 1000/1000 个密钥**（200 + 800），**0 失败**，每 200 个密钥约 70 秒。

## 📁 目录结构

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

## ⚠️ 说明

- 密钥共享父账号余额。请使用免费模型以避免 `402` 错误。
- WorkOS refresh token 是一次性的 —— 每次刷新都会轮换它。工具链会自动持久化最新 token。
- 首次运行引导：若 `out/.cline-auth.json` 不存在，工具链会从 9Router 数据库读取 refresh token。
- `delete` 在批量删除密钥前会要求 `--yes`。
- 仅供个人/教育用途的自动化。请遵守 Cline 与 9Router 的服务条款。

## 📄 许可证

[MIT](../LICENSE) © 2026 cline-bulk-apikey contributors
