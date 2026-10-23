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

**Cline 自身の API (workos bearer) を通じて Cline API キーを一括作成し、すべてのキーを 9Router に登録します — OpenAI 互換推論 + 9Router コネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-2-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

Cline は独自のプレーンな HTTPS JSON API を通じて API キーを発行します — キーごとに 1 回の `POST`、キャプチャなし、カードなし、電話認証なし、使い捨て受信トレイも不要です。キーはバッチで作成され、失敗は観測されておらず、200 キーあたり約 70 秒です。その後、すべてのキーは 9Router の 1 つの `cline` プロバイダーノードの下に OpenAI 互換接続として登録されます。

## 🎁 無料枠 — どれだけ得られるか

**1 つの Cline アカウントで無制限の `sk-…` キーが得られ、無料モデルに当たったキーはコストがかかりません — カードも電話も受信トレイも不要です。**

| 項目 | 値 |
| --- | --- |
| キーのコスト | **$0** — キー作成は無料で無制限 (実測: 1000 キー、失敗 0) |
| カード必須 | **いいえ** |
| レート制限 | 作成時の `429`/`5xx` はバックオフして最大 4 回リトライ; 作成間の `--delay 160` ms |
| サインアップ | なし — ツールは WorkOS リフレッシュトークン経由で既存の Cline アカウントを再利用します |
| キーが使えるもの | **親アカウントの残高**: 無料モデルは `200` を返し、有料モデルは `402 insufficient_credits` を返します — すべてのキーがその 1 つの残高を共有します |
| スケールする単位 | **1 アカウント = 多数のキー** (キーごとにアカウントが必要なプロバイダーとは異なります) → `--count N` は実質「同じ残高から N 個のキー」です |

> 💡 無料枠は Cline によって設定され、変更される可能性があります。最新の数値は [cline.bot](https://cline.bot) で確認してください — そしてツール自身のゲートに判断させてください:

```bash
node src/cli.js verify            # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — その 2 つすべて

Cline のカタログはより大きく、親アカウントの残高によって制限されます; 新しいキーが実際に使用できる 2 つの id — そして `verify` がプローブするもの — は次のとおりです:

| モデル ID | 9Router での呼び出し | ステータス |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (実測) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 2 番目の verify フォールバック |
| 有料モデル | `cline/<model>` | ⚠️ `402 insufficient_credits` — すべてのキーがアカウント残高を共有します |

`--model <id>` は単一のモデルを固定します。`402` は verify の集計で *受け入れられた* ものとしてカウントされます — それはキーが認証されることを証明します。自分のアカウントでカタログを一覧表示するには:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 API の使い方

上流のベース URL は **`https://api.cline.bot/api/v1`** です; キーはベアラー値全体として渡されます (Cline の API では `Authorization: Bearer sk-…`、アカウントトークンでは `Bearer workos:<jwt>`)。キーが 9Router に入ったら、代わりにルーターを呼び出します — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Cline に直接 (キーごとに `verify` が行うこと):

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

無料モデルの組み合わせは、ウォームアップ後の 9Router で **平均 2.7 秒** のレイテンシを実測しました。

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

`create` は 10 キーごとにキーファイルを書き込むため、クラッシュしても進捗が失われることはありません; `verify` はその隣に `.verify.txt` の集計を書き込みます。

### 🖱️ ランチャー

`node src/launcher.js` は小さなメニューを開きます — キーの発行、検証、またはローカルの 9Router / OmniRoute への登録 (`--connect-9router`、`--connect-omniroute`) — そして回答を `launcher.config.json` に記憶します。それが行うすべてはプレーンな `src/cli.js` コマンド (`auth`、`list`、`create`、`verify`、`delete`、`connect`) でもあるため、メニューは任意です。

## ✅ 検証済みで動作 — すべてのキーがテストされます

| チェック | 結果 |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | キーは 1 バッチで作成され、失敗なし、200 あたり約 70 秒 |
| `poolside/laguna-s-2.1:free` に対する `POST /api/v1/chat/completions` | **200** — キーが認証されます |
| 有料モデル | **402 insufficient_credits** — 認証は問題なく、共有残高がゲートです |
| 無効なキー | **401** — 正しく拒否されます |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前にライブの `chat-200` を通過しました
> (死んだキーは決して出荷されません)。ルーターの組み合わせもモデルレベルで同じルールに従います: エントリは
> **モデルが `chat-200` を返し、ツールを呼び出せる場合にのみ** 追加されます — ツールサポートのないモデル、
> 死んだキー、死んだプロバイダーは追加されずに削除されます。verify ステップはいつでも再実行できます;
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

1. **認証** — WorkOS リフレッシュトークンをアクセストークンと交換します (`POST https://api.workos.com/user_management/authenticate`); ベアラーは `workos:` プレフィックスを伴う必要があります。
2. **作成** — `{name}` を付けて `POST https://api.cline.bot/api/v1/api-keys` を呼び出し、`sk-…` キーを発行します; `429`/`5xx` はバックオフして最大 4 回リトライします。
3. **検証** — 各キーで `/api/v1/chat/completions` を無料モデルに対して呼び出し、認証されることを証明します。
4. **接続** — キーを OpenAI 互換接続として 9Router に登録します。

**`workos:` プレフィックスの落とし穴:** Cline の API はリテラルのプレフィックスを要求します — `Authorization: Bearer workos:<jwt>` は機能し、`Bearer <jwt>` は `401 "re-authenticate your Cline account"` を返します。エラーメッセージはセッションの期限切れを示唆しますが、それはベアラー形状のバグです; ツールキットはそれを自動的に処理し、諦める前に `401` で 1 回のトークンリフレッシュを強制します。

WorkOS リフレッシュトークンは単回使用で、リフレッシュごとにローテーションします; 最新のものは `out/.cline-auth.json` に永続化されます (または `CLINE_REFRESH_TOKEN` から読み取られるか、ローカルの 9Router DB からブートストラップされます)。

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
| `--prefix <p>` | キー名のプレフィックス (`<p>-NNN`) | `clx` |
| `--start <n>` | バッチの最初のインデックス | `1` |
| `--out <file>` | 出力キーファイル | `out/cline-keys.txt` |
| `--model <id>` | 検証用のモデル | 自動プローブ |
| `--conc <n>` | verify の並行度 | `6` |
| `--retries <n>` | 検証呼び出しごとのリトライ回数 | `3` |
| `--limit <n>` | 最初の `n` 個のキーのみを検証 | すべて |
| `--delay <ms>` | 作成間の遅延 | `160` |
| `--keys <file>` | `verify` / `connect` 用のキーファイル | `out/cline-keys.txt` |
| `--router <url>` | 9Router ベース URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router ダッシュボードのパスワード | `123456` |

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | API ホスト |
| `CLINE_REFRESH_TOKEN` | — | WorkOS リフレッシュトークン (それ以外は `out/.cline-auth.json`、次に 9Router DB) |

## 🛰️ プロキシの背後で

**設計上プロキシされません。** このレーンは、Node を実行するマシンから Node 組み込みの `fetch` で Cline の API と通信します — ブラウザも CDP クライアントもプロキシモジュールもありません。リクエストはあなた自身のアドレスから発信されますが、ここではキー作成にキーごとのサインアップが不要なため問題ありません: 1 つの既存アカウントがそれらすべてを発行します。API を自分でフロントする場合にのみ、`--base-url` で別のホストを指定してください。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `out/cline-keys.txt` | 発行された `sk-…` キー、1 行に 1 つ — git で無視されます |
| `out/cline-keys.txt.verify.txt` | verify の集計 |
| `out/.cline-auth.json` | 永続化された WorkOS リフレッシュトークン — git で無視され、決してコミットしないでください |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` · `src/connect-omniroute.js` | キーを 9Router / OmniRoute プロバイダーとして登録します |
| `examples/bulk-create.js` | スクリプトからキーのバッチを作成します |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホストの OpenAI 互換ルーターです (`npm install -g 9router && 9router`、ダッシュボードは `http://localhost:20128`)。1 つのコマンドですべてのキーを登録します — `cline` プロバイダーノードは存在しない場合に作成され、各キーが接続としてアタッチされます:

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

## 🔌 OmniRoute に接続

[OmniRoute](https://omniroute.online) はセルフホストの OpenAI 互換ルーターです (`npm install -g omniroute && omniroute`、ダッシュボードは `http://localhost:20128`)。コネクタはそこで同じ仕事をします — `cline` プロバイダーノードは存在しない場合に作成され、`keys.txt` のすべてのキーが接続としてアタッチされます:

```bash
node src/connect-omniroute.js                    # every key in keys.txt
node src/connect-omniroute.js --api-key clx-…    # or one key at a time
```

対話型ランチャーも同じフローに到達します: `node src/launcher.js --connect-omniroute`。

デフォルト: ベース `http://localhost:20128`、パスワード `123456`、プレフィックス `cline`、上流 `https://api.cline.bot/api/v1`、デフォルトモデル `poolside/laguna-s-2.1:free`、クライアントキー名 `cline`。モデルはその後 `cline/<model id>` として提供され、すべてのキーにわたって負荷分散されます。

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **Cline** — [cline.bot](https://cline.bot) · アプリは [app.cline.bot](https://app.cline.bot) |
| 🎁 プロバイダーが提供するもの | すべてのキーで無料モデル — 1 つの WorkOS アカウントから一括の sk-… キー、キャプチャなし |
| 🔑 1 つのキーで得られるもの | Cline の API に対して認証する `sk-…` キー; その消費は **親アカウントの残高** に従います (無料モデル `200`、有料モデル `402`) |
| 🌐 API 形状 | OpenAI 互換: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 あなたのデータ | 接触するのは `api.cline.bot`、`api.workos.com`、およびローカルの 9Router のみです; キーと WorkOS トークンはあなたのマシンに留まります |

## 🐞 問題

Cline が API の形状を変更した場合、または Cline/WorkOS がクライアント id をローテーションした場合、ツールはそのステップで停止し、その旨を伝えます。実行したコマンドと正確な出力を添えて **[issue を開いてください](../../issues)**; PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照してください。

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>