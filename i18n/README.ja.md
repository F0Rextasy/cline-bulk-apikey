<div align="center">

```
 ██████╗ ██╗      ██╗ ███╗   ██╗ ███████╗
██╔════╝ ██║      ██║ ████╗  ██║ ██╔════╝
██║      ██║      ██║ ██╔██╗ ██║ █████╗
██║      ██║      ██║ ██║╚██╗██║ ██╔══╝
╚██████╗ ███████╗ ██║ ██║ ╚████║ ███████╗
 ╚═════╝ ╚══════╝ ╚═╝ ╚═╝  ╚═══╝ ╚══════╝
```

<img src="../brand/logo.svg" alt="cline-bulk" width="150" />

# cline-bulk-apikey

**Cline 自身の API（`workos` bearer）経由で [Cline](https://cline.bot) の API キーを大量に作成し、すべてのキーを稼働中の [9Router](https://9router.com) インスタンスに登録する — エンドツーエンド。依存関係ゼロ。**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-9router-に接続)
[![Transport](https://img.shields.io/badge/transport-direct%20fetch-0EA5E9.svg?style=for-the-badge)](#-トランスポート)
[![Auth](https://img.shields.io/badge/auth-WorkOS%20refresh%20token-22C55E.svg?style=for-the-badge)](#-トランスポート)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ 機能

- 🔑 **API キーの一括作成** — Cline 自身の API で数百個の `sk-…` キーを作成。1 キーにつき 1 回の `POST`。
- 🔐 **WorkOS bearer** — キーは `Authorization: Bearer workos:<jwt>` で認証されます（リテラルの `workos:` プレフィックスは必須）。
- 🔌 **9Router コネクター** — すべてのキーが `cline` プレフィックス配下の OpenAI 互換接続として一度に登録されます。
- 🪶 **依存関係ゼロ** — 純 Node.js ≥ 18。`npm install` もビルドも不要。
- ⚡ **高速** — 200 キーあたり約 70 秒（実測：**1000/1000 キー作成成功**、失敗 0）。
- ✅ **導入の敷居なし** — キャプチャもカードも電話認証も使い捨て受信箱も不要。
- 🧩 **ライブラリまたは CLI** — コード内で `connectBulk()` を呼ぶか、同梱の `cline-bulk` コマンドを実行。
- 🌍 **5 言語** — EN、ID、ZH、JA、ES、DE。

## 🚀 クイックスタート

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

`create` は 10 キーごとにキーファイルを書き出すため、途中でクラッシュしても進捗は失われません。`verify` はその隣に `.verify.txt` の集計を書き出します。

## 🛠 使い方

```bash
cline-bulk auth                      # check account + balance
cline-bulk list                      # list existing API keys
cline-bulk create --count 200        # bulk-create API keys
cline-bulk verify                    # verify keys work
cline-bulk delete --name clx-001     # delete a key
cline-bulk connect                   # register keys into 9Router
```

| フラグ | 説明 | 既定値 |
| --- | --- | --- |
| `--count <n>` | 作成するキー数 | `200` |
| `--prefix <p>` | キー名のプレフィックス（`<p>-NNN`） | `clx` |
| `--start <n>` | バッチの開始インデックス | `1` |
| `--out <file>` | 出力するキーファイル | `out/cline-keys.txt` |
| `--model <id>` | 検証に使うモデル | auto-probe |
| `--conc <n>` | verify の同時実行数 | `6` |
| `--retries <n>` | 検証呼び出しあたりの再試行回数 | `3` |
| `--limit <n>` | 先頭 `n` 件のキーだけ検証 | すべて |
| `--delay <ms>` | 作成間の待機時間 | `160` |
| `--keys <file>` | `verify` / `connect` で使うキーファイル | `out/cline-keys.txt` |
| `--router <url>` | 9Router のベース URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router ダッシュボードのパスワード | `123456` |

環境変数: `CLINE_API`（既定 `https://api.cline.bot`）· `CLINE_REFRESH_TOKEN`。

## 🌐 トランスポート

Cline の API は普通の HTTPS JSON API なので、このレーンは Node 内蔵の `fetch` でそれを話します — ブラウザも CDP クライアントもプロキシモジュールも使いません。使い捨て受信箱のステップも不要です。Cline アカウントはすでに存在し、キー作成に確認メールも要りません。

- **直接 fetch（唯一のパス）** — リクエストは Node を実行しているマシンから `CLINE_API` へ送信されます。別のホストに固定するには `--base-url` を使います。
- **認証レール** — WorkOS リフレッシュトークンは `out/.cline-auth.json`、`CLINE_REFRESH_TOKEN` 環境変数、またはローカルの 9Router データベース（初回起動時のブートストラップ）から取得します。リフレッシュごとにトークンはローテーションし、最新版が永続化されます。

## 🔌 9Router に接続

9Router はセルフホスト型の OpenAI 互換ルーターです:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

すべてのキーを 1 コマンドで登録します（`cline` プロバイダーノードがなければ作成し、各キーを接続として付与します）:

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

無料モデルのコンボはウォームアップ後の実測で平均 **2.7 s** のレイテンシでした。

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>
Models   : cline/poolside/laguna-s-2.1:free, cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
```

通常の OpenAI エンドポイントと同じように呼び出します:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🧠 利用可能なモデル

| モデル | 9Router での呼び出し名 | ステータス |
| --- | --- | --- |
| poolside/laguna-s-2.1:free | `cline/poolside/laguna-s-2.1:free` | ✅ `200`（実測） |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 2 つ目の検証フォールバック（最初が利用不可のときにプローブ） |
| 有料モデル | `cline/<model>` | ⚠️ `402 insufficient_credits` — すべてのキーがアカウントの残高を共有します |

`--model` なしの `verify` はまず `poolside/laguna-s-2.1:free` をプローブし、利用できなければ `nvidia/…` のほうにフォールバックします。`--model <id>` は 1 つのモデルに固定します。集計上 `402` は*受理*として数えられます — そのキーが認証に通った証明になるためです。

自分のアカウントのキーリストを更新するには:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 📚 ライブラリとしての使用

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

## ⚙️ 動作の仕組み

1. **Auth** — WorkOS リフレッシュトークンをアクセストークンと交換（`POST https://api.workos.com/user_management/authenticate`）。bearer には `workos:` プレフィックスが必要です。
2. **Create** — `{name}` を付けて `POST https://api.cline.bot/api/v1/api-keys` を実行し `sk-…` キーを発行。`429`/`5xx` はバックオフして最大 4 回まで再試行します。
3. **Verify** — 各キーで無料モデルに対して `/api/v1/chat/completions` を呼び出し、認証を通ることを証明します。
4. **Connect** — キーを OpenAI 互換接続として 9Router に登録します。

### `workos:` プレフィックスの注意点

Cline の API は Authorization ヘッダーにリテラルの `workos:` プレフィックスを**必須**とします:

```
Authorization: Bearer workos:<jwt>   ✅ works
Authorization: Bearer <jwt>          ❌ 401 "re-authenticate your Cline account"
```

エラーメッセージはセッションの期限切れを示しますが、実際には bearer の形式のバグです。ツールキットはこれを自動処理し、`401` が返ると、その呼び出しを諦める前にトークンの強制リフレッシュを 1 回行います。

### キーの挙動

- **キーは認証を通りますが**、アカウントの残高を共有します。
- 有料モデル → `402 insufficient_credits`。
- 無料モデル → `200`（例: `poolside/laguna-s-2.1:free`）。
- 不正なキー → `401`（正しく拒否されます）。

実測: 2 回の実行（200 + 800）で **1000/1000 キー作成成功**、**失敗 0**、200 キーあたり約 70 秒。

## 📁 ファイル構成

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

## ⚠️ 注意事項

- キーは親アカウントの残高を共有します。`402` エラーを避けるには無料モデルを使ってください。
- WorkOS リフレッシュトークンは単回使用です — リフレッシュごとにローテーションします。ツールキットは最新トークンを自動保存します。
- 初回起動時のブートストラップ: `out/.cline-auth.json` がない場合、ツールキットは 9Router の DB からリフレッシュトークンを読み取ります。
- `delete` はキーを一括削除する前に `--yes` を確認します。
- 個人/教育目的の自動化向けです。Cline と 9Router の利用規約を尊重してください。

## 📄 ライセンス

[MIT](../LICENSE) © 2026 cline-bulk-apikey contributors
