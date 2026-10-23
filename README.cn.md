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

**通过 Cline 自己的 API（workos bearer）批量创建 Cline API 密钥，并将每个密钥注册到 9Router —— OpenAI 兼容推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-2-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

Cline 通过其自己的普通 HTTPS JSON API 生成 API 密钥 —— 每个密钥一次 `POST`，无需验证码、无需银行卡、无需手机验证、无需一次性邮箱。密钥可批量创建，未观察到失败，大约每 200 个密钥耗时 70 秒。随后每个密钥都会在 9Router 中作为一个 `cline` 提供商节点下的 OpenAI 兼容连接被注册。

## 🎁 免费额度 —— 你能获得多少

**一个 Cline 账户可产出无限量的 `sk-…` 密钥，而使用免费模型的密钥不花任何费用 —— 无需银行卡、无需手机、无需邮箱。**

| 项目 | 值 |
| --- | --- |
| 一个密钥的成本 | **$0** —— 密钥创建免费且不限量（实测：1000 个密钥，0 失败） |
| 是否需要银行卡 | **否** |
| 速率限制 | 创建时的 `429`/`5xx` 会退避并最多重试 4 次；创建之间 `--delay 160` 毫秒 |
| 注册 | 无 —— 该工具通过 WorkOS 刷新令牌复用现有的 Cline 账户 |
| 一个密钥能花费什么 | **父账户的余额**：免费模型返回 `200`，付费模型返回 `402 insufficient_credits` —— 每个密钥共享同一份余额 |
| 可扩展的单位 | **一个账户 = 多个密钥**（不同于每个密钥一个账户的提供商）→ `--count N` 实际上是“来自同一余额的 N 个密钥” |

> 💡 免费额度由 Cline 设定，可能会变化。请在 [cline.bot](https://cline.bot) 查看实时数字 —— 并让工具自身的关卡来判定：

```bash
node src/cli.js verify            # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 —— 全部 2 个

Cline 的目录更大，并受父账户余额的限制；一个新密钥实际能使用的两个 id —— 也是 `verify` 所探测的 —— 是：

| 模型 ID | 在 9Router 中的调用方式 | 状态 |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200`（实测） |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 第二验证回退 |
| 付费模型 | `cline/<model>` | ⚠️ `402 insufficient_credits` —— 每个密钥共享账户余额 |

`--model <id>` 固定使用单个模型。在验证统计中，`402` 计为*已接受* —— 它证明该密钥能够通过认证。要列出你自己账户上的目录：

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 如何使用 API

上游基础 URL 是 **`https://api.cline.bot/api/v1`**；密钥作为整个 bearer 值传入（在 Cline 的 API 上为 `Authorization: Bearer sk-…`，账户令牌为 `Bearer workos:<jwt>`）。一旦密钥进入 9Router，就改为调用路由器 —— `http://localhost:20128/v1`：

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

直接针对 Cline（即 `verify` 对每个密钥所做的）：

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

免费模型组合在预热后于 9Router 中实测平均延迟为 **2.7 秒**。

## 🛠 快速开始

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

`create` 每创建十个密钥后写入一次密钥文件，因此崩溃绝不会丢失进度；`verify` 会在其旁边写入一个 `.verify.txt` 统计文件。

### 🖱️ 启动器

`node src/launcher.js` 会打开一个小菜单 —— 生成密钥、验证它们，或将它们注册到本地 9Router / OmniRoute（`--connect-9router`、`--connect-omniroute`）—— 并将答案记录在 `launcher.config.json` 中。它所做的每件事也都是普通的 `src/cli.js` 命令（`auth`、`list`、`create`、`verify`、`delete`、`connect`），因此菜单是可选的。

## ✅ 已验证可用 —— 每个密钥都经过测试

| 检查 | 结果 |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys`（`{name}`） | 密钥一次性批量创建，无失败，每 200 个约 70 秒 |
| 对 `poolside/laguna-s-2.1:free` 的 `POST /api/v1/chat/completions` | **200** —— 密钥通过认证 |
| 付费模型 | **402 insufficient_credits** —— 认证没问题，共享余额是关卡 |
| 一个无效密钥 | **401** —— 被正确拒绝 |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **质量关卡。** 这里的每个密钥在被写入 `keys.txt` 之前都通过了实时的 `chat-200`
> （绝不发布失效密钥）。路由器组合在模型层面遵循同样的规则：一个条目
> **仅当模型返回 `chat-200` 且能调用工具时**才会被添加 —— 不支持工具的模型、
> 失效密钥或失效提供商会被丢弃而不是添加。可随时重新运行验证步骤；
> 失败会被报告，绝不隐藏。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **认证** —— 用 WorkOS 刷新令牌换取访问令牌（`POST https://api.workos.com/user_management/authenticate`）；bearer 必须带有 `workos:` 前缀。
2. **创建** —— 用 `{name}` 调用 `POST https://api.cline.bot/api/v1/api-keys` 生成 `sk-…` 密钥；`429`/`5xx` 会退避并最多重试 4 次。
3. **验证** —— 用每个密钥对免费模型调用 `/api/v1/chat/completions`，以证明其能够通过认证。
4. **连接** —— 将密钥作为 OpenAI 兼容连接注册到 9Router。

**`workos:` 前缀的坑：** Cline 的 API 要求这个字面前缀 —— `Authorization: Bearer workos:<jwt>` 可用，`Bearer <jwt>` 会返回 `401 "re-authenticate your Cline account"`。该错误消息暗示会话过期，但实际上是 bearer 形态的 bug；该工具包会自动处理，并在 `401` 时强制刷新一次令牌，之后才放弃。

WorkOS 刷新令牌是一次性的，每次刷新都会轮换；最新的一个会被持久化到 `out/.cline-auth.json`（或从 `CLINE_REFRESH_TOKEN` 读取，或从本地 9Router 数据库引导）。

## ⚙️ CLI 选项

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| 标志 | 描述 | 默认值 |
| --- | --- | --- |
| `--count <n>` | 要创建的密钥数量 | `200` |
| `--prefix <p>` | 密钥名称前缀（`<p>-NNN`） | `clx` |
| `--start <n>` | 批次的起始索引 | `1` |
| `--out <file>` | 输出密钥文件 | `out/cline-keys.txt` |
| `--model <id>` | 用于验证的模型 | 自动探测 |
| `--conc <n>` | 验证的并发数 | `6` |
| `--retries <n>` | 每次验证调用的重试次数 | `3` |
| `--limit <n>` | 仅验证前 `n` 个密钥 | 全部 |
| `--delay <ms>` | 创建之间的延迟 | `160` |
| `--keys <file>` | 用于 `verify` / `connect` 的密钥文件 | `out/cline-keys.txt` |
| `--router <url>` | 9Router 基础 URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router 仪表盘密码 | `123456` |

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | API 主机 |
| `CLINE_REFRESH_TOKEN` | — | WorkOS 刷新令牌（否则用 `out/.cline-auth.json`，再用 9Router 数据库） |

## 🛰️ 代理之后

**设计上不使用代理。** 此通道使用 Node 内置的 `fetch`，从运行 Node 的机器上访问 Cline 的 API —— 没有浏览器、没有 CDP 客户端，也没有代理模块。请求从你自己的地址发出，这在这里没问题，因为密钥创建不需要为每个密钥注册：一个现有账户即可生成全部密钥。只有当你自己为 API 做前置代理时，才用 `--base-url` 指定另一个主机。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `out/cline-keys.txt` | 生成的 `sk-…` 密钥，每行一个 —— 已被 git 忽略 |
| `out/cline-keys.txt.verify.txt` | 验证统计 |
| `out/.cline-auth.json` | 持久化的 WorkOS 刷新令牌 —— 已被 git 忽略，切勿提交 |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` · `src/connect-omniroute.js` | 将密钥注册为 9Router / OmniRoute 提供商 |
| `examples/bulk-create.js` | 从脚本创建一批密钥 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、OpenAI 兼容的路由器（`npm install -g 9router && 9router`，仪表盘位于 `http://localhost:20128`）。用一条命令注册每个密钥 —— 如果 `cline` 提供商节点不存在则创建它，并将每个密钥附加为一个连接：

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、OpenAI 兼容的路由器（`npm install -g omniroute && omniroute`，仪表盘位于 `http://localhost:20128`）。连接器在那里做同样的工作 —— 如果 `cline` 提供商节点不存在则创建它，并将 `keys.txt` 中的每个密钥附加为一个连接：

```bash
node src/connect-omniroute.js                    # every key in keys.txt
node src/connect-omniroute.js --api-key clx-…    # or one key at a time
```

交互式启动器可到达同样的流程：`node src/launcher.js --connect-omniroute`。

默认值：基础 `http://localhost:20128`，密码 `123456`，前缀 `cline`，上游 `https://api.cline.bot/api/v1`，默认模型 `poolside/laguna-s-2.1:free`，客户端密钥名为 `cline`。随后模型以 `cline/<model id>` 的形式提供服务，并在每个密钥之间进行负载均衡。

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **Cline** —— [cline.bot](https://cline.bot) · 应用位于 [app.cline.bot](https://app.cline.bot) |
| 🎁 提供商提供什么 | 每个密钥上的免费模型 —— 来自一个 WorkOS 账户的批量 sk-… 密钥，无需验证码 |
| 🔑 一个密钥能给你什么 | 一个能对 Cline 的 API 通过认证的 `sk-…` 密钥；其花费跟随**父账户的余额**（免费模型 `200`，付费模型 `402`） |
| 🌐 API 形态 | OpenAI 兼容：`POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 你的数据 | 仅会联系 `api.cline.bot`、`api.workos.com` 和你的本地 9Router；密钥和 WorkOS 令牌留在你的机器上 |

## 🐞 问题

如果 Cline 更改其 API 形态，或 Cline/WorkOS 轮换客户端 id，该工具会在该步骤停止并说明原因。**[提交 issue](../../issues)**，附上你运行的命令和确切的输出；欢迎 PR。

## 📄 许可证

MIT © 2026 —— 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>