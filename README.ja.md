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

**Cline 自身の API（workos bearer）を通じて Cline API キーを一括作成し、すべてのキーを 9Router に登録します — OpenAI 互換推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-2-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題報告](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

Cline は独自のプレーンな HTTPS JSON API を通じて API キーを発行します — キー 1 つにつき `POST` が 1 回、キャプチャなし、カードなし、電話認証なし、使い捨て受信トレイも不要。**作成されたすべてのキー**は 2 回の実行（200 + 800）で **0 件の失敗**、200 キーあたり約 70 秒。その後、すべてのキーは 9Router の 1 つの `cline` プロバイダーノードの下に OpenAI 互換接続として登録されます。

## 🎁 無料枠 — どれだけ得られるか

**1 つの Cline アカウントで無制限の `sk-…` キーが得られ、無料モデルに当たったキーはコストがかかりません — カードも電話も受信トレイも不要。**

| 項目 | 値 |
| --- | --- |
| キーのコスト | **$0** — キー作成は無料かつ無制限（実測: キー、失敗 0 件） |
| カード必須 | **いいえ** |
| レート制限 | 作成時の `429`/`5xx` はバックオフして最大 4 回再試行。作成間隔は `--delay 160` ms |
| サインアップ | 不要 — ツールは既存の Cline アカウントを WorkOS リフレッシュトークン経由で再利用します |
| キーが使えるもの | **親アカウントの残高**: 無料モデルは `200` を返し、有料モデルは `402 insufficient_credits` を返します — すべてのキーがその 1 つの残高を共有します |
| スケールする単位 | **1 アカウント = 多数のキー**（キーごとにアカウントが必要なプロバイダーとは異なります）→ `--count N` は実質「同じ残高から N 個のキー」 |

> 💡 無料枠は Cline が設定するもので、変更される可能性があります。最新の数値は [cline.bot](https://cline.bot) で確認してください — そしてツール自身のゲートに判断させてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — その 2 つすべて

Cline のカタログはより大きく、親アカウントの残高によって制限されます。新しいキーが実際に使用できる 2 つの ID — そして `verify` がプローブするもの — は次のとおりです:

| モデル ID | 9Router での呼び出し方 | ステータス |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200`（実測） |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 2 番目の verify フォールバック |
| 有料モデル | `cline/<model>` | ⚠️ `402 insufficient_credits` — すべてのキーがアカウント残高を共有します |

`--model <id>` は単一のモデルを固定します。`402` は verify の集計で *受け入れ済み* としてカウントされます — キーが認証されることを証明するからです。自分のアカウントでカタログを一覧表示するには:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 API の使い方

上流のベース URL は **`https://api.cline.bot/api/v1`** です。キーはベアラー値全体として渡します（Cline の API では `Authorization: Bearer sk-…`、アカウントトークンでは `Bearer workos:<jwt>`）。キーが 9Router に入ったら、代わりにルーターを呼び出します — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Cline に直接（`verify` がキーごとに行うこと）:

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

無料モデルの組み合わせは、ウォームアップ後の 9Router で **平均 2.7 秒** のレイテンシを計測しました。

## 🛠 クイックスタート

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

`create` は 10 キーごとにキーファイルを書き込むため、クラッシュしても進捗が失われることはありません。`verify` はその隣に `.verify.txt` の集計を書き込みます。

### 🖱️ ランチャー

ここには対話型メニューはありません — `src/cli.js` がインターフェース全体です（`auth`、`list`、`create`、`verify`、`delete`、`connect`）。すべてのフラグはコマンドラインで設定できます。`src/launcher.js` は CLINE の ASCII バナーをレンダリングするだけです。

## ✅ 検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys`（`{name}`） | **すべてのキーを作成**、失敗 0 件、200 キーあたり約 70 秒 |
| `poolside/laguna-s-2.1:free` に対する `POST /api/v1/chat/completions` | **200** — キーが認証される |
| 有料モデル | **402 insufficient_credits** — 認証は問題なく、共有残高がゲート |
| 無効なキー | **401** — 正しく拒否される |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前に実際の `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターの組み合わせもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` を返し、ツールを呼び出せる場合にのみ**追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダーは追加されずに除外されます。verify ステップはいつでも再実行できます。
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **認証** — WorkOS リフレッシュトークンをアクセストークンと交換します（`POST https://api.workos.com/user_management/authenticate`）。ベアラーには `workos:` プレフィックスが必要です。
2. **作成** — `{name}` を付けて `POST https://api.cline.bot/api/v1/api-keys` を呼び出し、`sk-…` キーを発行します。`429`/`5xx` はバックオフして最大 4 回再試行します。
3. **検証** — 各キーで `/api/v1/chat/completions` を無料モデルに対して呼び出し、認証されることを証明します。
4. **接続** — キーを OpenAI 互換接続として 9Router に登録します。

**`workos:` プレフィックスの落とし穴:** Cline の API はリテラルのプレフィックスを要求します — `Authorization: Bearer workos:<jwt>` は機能し、`Bearer <jwt>` は `401 "re-authenticate your Cline account"` を返します。エラーメッセージはセッションの期限切れを示唆しますが、これはベアラーの形式のバグです。ツールキットはこれを自動的に処理し、諦める前に `401` で 1 回トークンを強制リフレッシュします。

WorkOS リフレッシュトークンは 1 回限りで、リフレッシュごとにローテーションします。最新のものは `out/.cline-auth.json` に永続化されます（または `CLINE_REFRESH_TOKEN` から読み取るか、ローカルの 9Router DB からブートストラップされます）。

## ⚙️ CLI オプション

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| フラグ | 説明 | デフォルト |
| --- | --- | --- |
| `--count <n>` | 作成するキーの数 | `200` |
| `--prefix <p>` | キー名のプレフィックス（`<p>-NNN`） | `clx` |
| `--start <n>` | バッチの最初のインデックス | `1` |
| `--out <file>` | 出力キーファイル | `out/cline-keys.txt` |
| `--model <id>` | 検証に使用するモデル | 自動プローブ |
| `--conc <n>` | verify の並行数 | `6` |
| `--retries <n>` | 検証呼び出しごとの再試行回数 | `3` |
| `--limit <n>` | 最初の `n` 個のキーのみを検証 | すべて |
| `--delay <ms>` | 作成間の遅延 | `160` |
| `--keys <file>` | `verify` / `connect` 用のキーファイル | `out/cline-keys.txt` |
| `--router <url>` | 9Router のベース URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router ダッシュボードのパスワード | `123456` |

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | API ホスト |
| `CLINE_REFRESH_TOKEN` | — | WorkOS リフレッシュトークン（それ以外は `out/.cline-auth.json`、次に 9Router DB） |

## 🛰️ プロキシの背後で

**設計上、プロキシは使用しません。** このレーンは Node を実行するマシンから Node 組み込みの `fetch` で Cline の API と通信します — ブラウザも CDP クライアントもプロキシモジュールもありません。リクエストはあなた自身のアドレスから送信されますが、キー作成にはキーごとのサインアップが不要なため、ここでは問題ありません: 既存の 1 つのアカウントがすべてを発行します。自分で API をフロントする場合にのみ、`--base-url` で別のホストを指定してください。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `out/cline-keys.txt` | 発行された `sk-…` キー、1 行に 1 つ — git 管理外 |
| `out/cline-keys.txt.verify.txt` | verify の集計 |
| `out/.cline-auth.json` | 永続化された WorkOS リフレッシュトークン — git 管理外、決してコミットしないでください |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` | キーを 9Router プロバイダーとして登録します |
| `examples/bulk-create.js` | スクリプトからキーのバッチを作成します |

## 🔌 9Router に接続する

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです（`npm install -g 9router && 9router`、ダッシュボードは `http://localhost:20128`）。1 つのコマンドですべてのキーを登録します — `cline` プロバイダーノードが存在しない場合は作成され、各キーが接続としてアタッチされます:

```bash
node src/cli.js connect --keys out/cline-keys.txt

# or as a library:
#   import { connectBulk } from './src/connect-9router.js';
```

デフォルト: ベース `http://localhost:20128`、パスワード `123456`、プレフィックス `cline`、上流 `https://api.cline.bot/api/v1`、デフォルトモデル `poolside/laguna-s-2.1:free`、クライアントキー名 `cline`。モデルはその後 `cline/<model id>` として提供され、すべてのキーにわたってロードバランスされます。

## 🔌 OmniRoute に接続する

[OmniRoute](https://omniroute.online) はセルフホスト型の OpenAI 互換ルーターです（`npm install -g omniroute && omniroute`、ダッシュボードは `http://localhost:20128`）。1 つのコマンドですべてのキーを登録します — `cline` プロバイダーノードが存在しない場合は作成され、各キーが接続としてアタッチされます:

```bash
node src/cli.js connect --keys out/cline-keys.txt
# or as a library:
#   import { connectBulk } from './src/connect-omniroute.js';
```

デフォルト: ベース `http://localhost:20128`、パスワード `123456`、プレフィックス `cline`、上流 `https://api.cline.bot/api/v1`、デフォルトモデル `poolside/laguna-s-2.1:free`、クライアントキー名 `cline`。モデルはその後 `cline/<model id>` として提供され、すべてのキーにわたってロードバランスされます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Cline** — [cline.bot](https://cline.bot) · アプリは [app.cline.bot](https://app.cline.bot) |
| 🎁 プロバイダーが提供するもの | すべてのキーで無料モデル — 1 つの WorkOS アカウントから大量の sk-… キー、キャプチャなし |
| 🔑 1 つのキーで得られるもの | Cline の API に対して認証される `sk-…` キー。その消費は **親アカウントの残高** に従います（無料モデルは `200`、有料モデルは `402`） |
| 🌐 API の形式 | OpenAI 互換: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 あなたのデータ | 接続されるのは `api.cline.bot`、`api.workos.com`、およびローカルの 9Router のみです。キーと WorkOS トークンはあなたのマシン上に留まります |

## 🐞 問題報告

Cline が API の形式を変更したり、Cline/WorkOS がクライアント ID をローテーションした場合、ツールはそのステップで停止し、その旨を報告します。実行したコマンドと正確な出力を添えて **[issue を作成してください](../../issues)**。PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照してください。

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>