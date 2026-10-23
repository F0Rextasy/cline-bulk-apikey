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

**Cline 자체 API(workos bearer)를 통해 Cline API 키를 대량 생성하고, 모든 키를 9Router에 등록합니다 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-2-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 이 도구가 존재하는 이유

Cline은 자체적인 평범한 HTTPS JSON API를 통해 API 키를 발급합니다 — 키 하나당 `POST` 한 번, 캡차 없음, 카드 없음, 전화 인증 없음, 일회용 메일함 없음. 두 번의 실행(200 + 800)에서 **생성된 모든 키**가 **0 실패**로, 200개당 약 70초가 걸렸습니다. 그런 다음 모든 키가 9Router의 하나의 `cline` provider-node 아래에 OpenAI 호환 연결로 등록됩니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

**Cline 계정 하나로 무제한 `sk-…` 키를 얻을 수 있으며, 무료 모델에 사용되는 키는 비용이 들지 않습니다 — 카드도, 전화도, 메일함도 필요 없습니다.**

| 항목 | 값 |
| --- | --- |
| 키 비용 | **$0** — 키 생성은 무료이며 무제한입니다 (측정: 키, 0 실패) |
| 카드 필요 | **아니오** |
| 속도 제한 | 생성 시 `429`/`5xx`는 백오프 후 최대 4회 재시도; 생성 간 `--delay 160` ms |
| 가입 | 없음 — 이 도구는 WorkOS 리프레시 토큰을 통해 기존 Cline 계정을 재사용합니다 |
| 키가 사용할 수 있는 것 | **상위 계정의 잔액**: 무료 모델은 `200`을 응답하고, 유료 모델은 `402 insufficient_credits`를 응답합니다 — 모든 키가 그 하나의 잔액을 공유합니다 |
| 확장되는 단위 | **하나의 계정 = 많은 키** (키당 계정을 쓰는 제공자와 다름) → `--count N`은 실제로 "같은 잔액에서 나온 N개의 키"를 의미합니다 |

> 💡 무료 티어는 Cline이 정하며 변경될 수 있습니다. 실시간 수치는 [cline.bot](https://cline.bot)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하도록 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 딱 2개

Cline의 카탈로그는 더 크고 상위 계정의 잔액에 따라 제한됩니다; 새 키가 실제로 사용할 수 있는 두 개의 id — 그리고 `verify`가 검사하는 대상 — 은 다음과 같습니다:

| 모델 ID | 9Router에서 호출 | 상태 |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (측정됨) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 두 번째 verify 폴백 |
| 유료 모델 | `cline/<model>` | ⚠️ `402 insufficient_credits` — 모든 키가 계정 잔액을 공유합니다 |

`--model <id>`는 단일 모델을 고정합니다. `402`는 verify 집계에서 *허용됨*으로 간주됩니다 — 키가 인증된다는 것을 증명하기 때문입니다. 자신의 계정에서 카탈로그를 나열하려면:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 API 사용 방법

업스트림 기본 URL은 **`https://api.cline.bot/api/v1`**입니다; 키는 전체 bearer 값으로 들어갑니다 (Cline의 API에서는 `Authorization: Bearer sk-…`, 계정 토큰으로는 `Bearer workos:<jwt>`). 키가 9Router에 들어가면 대신 라우터를 호출하세요 — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Cline에 직접 (각 키에 대해 `verify`가 하는 일):

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

무료 모델 조합은 워밍업 후 9Router에서 **평균 2.7초**의 지연 시간을 측정했습니다.

## 🛠 빠른 시작

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

`create`는 키 열 개마다 키 파일을 기록하므로, 충돌이 나도 진행 상황을 잃지 않습니다; `verify`는 그 옆에 `.verify.txt` 집계를 기록합니다.

### 🖱️ 런처

여기에는 대화형 메뉴가 없습니다 — `src/cli.js`가 전체 인터페이스이며 (`auth`, `list`, `create`, `verify`, `delete`, `connect`), 모든 플래그는 명령줄에서 설정할 수 있습니다. `src/launcher.js`는 CLINE ASCII 배너만 렌더링합니다.

## ✅ 검증됨 — 모든 키가 테스트됩니다

| 검사 | 결과 |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | **모든 키 생성됨**, 0 실패, 200개당 약 70초 |
| `poolside/laguna-s-2.1:free`에 대한 `POST /api/v1/chat/completions` | **200** — 키가 인증됨 |
| 유료 모델 | **402 insufficient_credits** — 인증은 정상, 공유 잔액이 관문 |
| 잘못된 키 | **401** — 올바르게 거부됨 |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **품질 게이트.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실제 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 조합은 모델 수준에서도 같은 규칙을 따릅니다: 항목은
> **모델이 `chat-200`을 응답하고 도구를 호출할 수 있을 때만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키 또는 죽은 제공자는 추가되지 않고 제거됩니다. 언제든지 verify 단계를 다시 실행하세요;
> 실패는 보고되며, 절대 숨겨지지 않습니다.

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **인증** — WorkOS 리프레시 토큰을 액세스 토큰으로 교환합니다 (`POST https://api.workos.com/user_management/authenticate`); bearer에는 `workos:` 접두사가 있어야 합니다.
2. **생성** — `{name}`과 함께 `POST https://api.cline.bot/api/v1/api-keys`로 `sk-…` 키를 발급합니다; `429`/`5xx`는 백오프 후 최대 4회 재시도합니다.
3. **검증** — 각 키로 무료 모델에 대해 `/api/v1/chat/completions`를 호출하여 인증되는지 증명합니다.
4. **연결** — 키를 9Router에 OpenAI 호환 연결로 등록합니다.

**`workos:` 접두사 함정:** Cline의 API는 리터럴 접두사를 요구합니다 — `Authorization: Bearer workos:<jwt>`는 작동하고, `Bearer <jwt>`는 `401 "re-authenticate your Cline account"`를 응답합니다. 오류 메시지는 만료된 세션을 시사하지만, 이는 bearer 형태의 버그입니다; 툴킷은 이를 자동으로 처리하고 포기하기 전에 `401`에서 한 번 토큰 새로고침을 강제합니다.

WorkOS 리프레시 토큰은 일회용이며 새로고침할 때마다 회전합니다; 가장 최신 것은 `out/.cline-auth.json`에 저장됩니다 (또는 `CLINE_REFRESH_TOKEN`에서 읽거나, 로컬 9Router DB에서 부트스트랩).

## ⚙️ CLI 옵션

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| 플래그 | 설명 | 기본값 |
| --- | --- | --- |
| `--count <n>` | 생성할 키 수 | `200` |
| `--prefix <p>` | 키 이름 접두사 (`<p>-NNN`) | `clx` |
| `--start <n>` | 배치의 첫 번째 인덱스 | `1` |
| `--out <file>` | 출력 키 파일 | `out/cline-keys.txt` |
| `--model <id>` | 검증용 모델 | 자동 검사 |
| `--conc <n>` | verify 동시성 | `6` |
| `--retries <n>` | 검증 호출당 재시도 | `3` |
| `--limit <n>` | 처음 `n`개의 키만 검증 | 전체 |
| `--delay <ms>` | 생성 간 지연 | `160` |
| `--keys <file>` | `verify` / `connect`용 키 파일 | `out/cline-keys.txt` |
| `--router <url>` | 9Router 기본 URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router 대시보드 비밀번호 | `123456` |

| 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | API 호스트 |
| `CLINE_REFRESH_TOKEN` | — | WorkOS 리프레시 토큰 (그렇지 않으면 `out/.cline-auth.json`, 그다음 9Router DB) |

## 🛰️ 프록시 뒤에서

**설계상 프록시를 사용하지 않습니다.** 이 레인은 Node를 실행하는 머신에서 Node의 내장 `fetch`로 Cline의 API와 통신합니다 — 브라우저도, CDP 클라이언트도, 프록시 모듈도 없습니다. 요청은 자신의 주소에서 나가는데, 여기서는 키 생성에 키당 가입이 필요 없기 때문에 문제없습니다: 기존 계정 하나가 모든 키를 발급합니다. API를 직접 앞단에 두는 경우에만 `--base-url`로 다른 호스트를 고정하세요.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `out/cline-keys.txt` | 발급된 `sk-…` 키, 한 줄에 하나 — git-ignored |
| `out/cline-keys.txt.verify.txt` | verify 집계 |
| `out/.cline-auth.json` | 저장된 WorkOS 리프레시 토큰 — git-ignored, 절대 커밋하지 마세요 |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` | 키를 9Router 제공자로 등록 |
| `examples/bulk-create.js` | 스크립트에서 키 배치 생성 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다 (`npm install -g 9router && 9router`, 대시보드는 `http://localhost:20128`). 한 명령으로 모든 키를 등록하세요 — `cline` provider-node가 없으면 생성되고 각 키가 연결로 첨부됩니다:

```bash
node src/cli.js connect --keys out/cline-keys.txt

# or as a library:
#   import { connectBulk } from './src/connect-9router.js';
```

기본값: base `http://localhost:20128`, password `123456`, prefix `cline`, upstream `https://api.cline.bot/api/v1`, default model `poolside/laguna-s-2.1:free`, client key named `cline`. 그러면 모델은 `cline/<model id>`로 제공되며 모든 키에 걸쳐 로드 밸런싱됩니다.

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다 (`npm install -g omniroute && omniroute`, 대시보드는 `http://localhost:20128`). 한 명령으로 모든 키를 등록하세요 — `cline` provider-node가 없으면 생성되고 각 키가 연결로 첨부됩니다:

```bash
node src/cli.js connect --keys out/cline-keys.txt
# or as a library:
#   import { connectBulk } from './src/connect-omniroute.js';
```

기본값: base `http://localhost:20128`, password `123456`, prefix `cline`, upstream `https://api.cline.bot/api/v1`, default model `poolside/laguna-s-2.1:free`, client key named `cline`. 그러면 모델은 `cline/<model id>`로 제공되며 모든 키에 걸쳐 로드 밸런싱됩니다.

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **Cline** — [cline.bot](https://cline.bot) · 앱은 [app.cline.bot](https://app.cline.bot) |
| 🎁 제공자가 주는 것 | 모든 키에 무료 모델 — 하나의 WorkOS 계정에서 대량 sk-… 키, 캡차 없음 |
| 🔑 키 하나로 얻는 것 | Cline의 API에 인증되는 `sk-…` 키; 그 사용액은 **상위 계정의 잔액**을 따릅니다 (무료 모델 `200`, 유료 모델 `402`) |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 데이터 | `api.cline.bot`, `api.workos.com` 및 로컬 9Router만 접속됩니다; 키와 WorkOS 토큰은 사용자의 머신에 남습니다 |

## 🐞 이슈

Cline이 API 형태를 변경하거나 Cline/WorkOS가 클라이언트 id를 회전하면, 도구는 해당 단계에서 멈추고 그 사실을 알립니다. 실행한 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**; PR을 환영합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE)를 참조하세요.

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>