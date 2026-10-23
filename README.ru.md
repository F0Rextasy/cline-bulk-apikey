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

**Массовое создание API-ключей Cline через собственный API Cline (workos bearer) и регистрация каждого ключа в 9Router — OpenAI-совместимый инференс + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-2-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

Cline выпускает API-ключи через собственный обычный HTTPS JSON API — один `POST` на ключ, без капчи, без карты, без подтверждения по телефону, без одноразовой почты. Ключи создаются пакетами без наблюдавшихся сбоев, примерно за 70 с на 200 ключей. Затем каждый ключ регистрируется как OpenAI-совместимое подключение под одним провайдер-узлом `cline` в 9Router.

## 🎁 Бесплатный тариф — сколько вы получаете

**Один аккаунт Cline даёт неограниченное количество ключей `sk-…`, а ключи, использующие бесплатные модели, ничего не стоят — без карты, без телефона, без почты.**

| Что | Значение |
| --- | --- |
| Стоимость ключа | **$0** — создание ключей бесплатно и без ограничений (измерено: 1000 ключей, 0 сбоев) |
| Требуется карта | **Нет** |
| Ограничение скорости | `429`/`5xx` при создании отступают и повторяются до 4 раз; `--delay 160` мс между созданиями |
| Регистрация | не требуется — инструмент переиспользует существующий аккаунт Cline через его WorkOS refresh-токен |
| Что может тратить ключ | **баланс родительского аккаунта**: бесплатные модели отвечают `200`, платные модели отвечают `402 insufficient_credits` — каждый ключ делит этот единый баланс |
| Единица масштабирования | **один аккаунт = много ключей** (в отличие от провайдеров с аккаунтом на ключ) → `--count N` на самом деле означает «N ключей из одного баланса» |

> 💡 Бесплатный тариф устанавливается Cline и может измениться. Проверяйте актуальные цифры на [cline.bot](https://cline.bot) — и пусть решение принимает собственный гейт инструмента:

```bash
node src/cli.js verify            # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 2 из них

Каталог Cline больше и ограничен балансом родительского аккаунта; два id, которые свежий ключ действительно может использовать — и которые проверяет `verify` — это:

| ID модели | Вызов как в 9Router | Статус |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (измерено) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 второй запасной вариант при проверке |
| платные модели | `cline/<model>` | ⚠️ `402 insufficient_credits` — каждый ключ делит баланс аккаунта |

`--model <id>` фиксирует одну модель. `402` считается *принятым* в подсчёте проверки — это доказывает, что ключ аутентифицируется. Чтобы вывести каталог для своего аккаунта:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 Как использовать API

Базовый URL вышестоящего сервиса — **`https://api.cline.bot/api/v1`**; ключ передаётся как всё значение bearer (`Authorization: Bearer sk-…` в API Cline, `Bearer workos:<jwt>` для токена аккаунта). Как только ключи окажутся в 9Router, обращайтесь к роутеру — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Напрямую к Cline (то, что `verify` делает для каждого ключа):

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Комбинация бесплатных моделей показала **в среднем 2,7 с** задержки в 9Router после прогрева.

## 🛠 Быстрый старт

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

`create` записывает файл ключей после каждых десяти ключей, поэтому сбой никогда не теряет прогресс; `verify` записывает подсчёт `.verify.txt` рядом с ним.

### 🖱️ Лаунчер

`node src/launcher.js` открывает небольшое меню — создать ключи, проверить их или зарегистрировать их в локальном 9Router / OmniRoute (`--connect-9router`, `--connect-omniroute`) — и запоминает ответы в `launcher.config.json`. Всё, что он делает, также является обычной командой `src/cli.js` (`auth`, `list`, `create`, `verify`, `delete`, `connect`), поэтому меню необязательно.

## ✅ Проверено в работе — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | ключи созданы одним пакетом, без сбоев, ~70 с на 200 |
| `POST /api/v1/chat/completions` на `poolside/laguna-s-2.1:free` | **200** — ключ аутентифицируется |
| платная модель | **402 insufficient_credits** — аутентификация в порядке, гейтом является общий баланс |
| мусорный ключ | **401** — корректно отклонён |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200` прежде чем был записан в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Повторяйте шаг проверки в любое время;
> сбои сообщаются, никогда не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **Аутентификация** — обмен WorkOS refresh-токена на access-токен (`POST https://api.workos.com/user_management/authenticate`); bearer должен нести префикс `workos:`.
2. **Создание** — `POST https://api.cline.bot/api/v1/api-keys` с `{name}` для выпуска ключей `sk-…`; `429`/`5xx` отступают и повторяются до 4 раз.
3. **Проверка** — вызов `/api/v1/chat/completions` с каждым ключом против бесплатной модели, чтобы доказать, что он аутентифицируется.
4. **Подключение** — регистрация ключей в 9Router как OpenAI-совместимых подключений.

**Подвох с префиксом `workos:`** — API Cline требует буквальный префикс: `Authorization: Bearer workos:<jwt>` работает, `Bearer <jwt>` отвечает `401 "re-authenticate your Cline account"`. Сообщение об ошибке намекает на истёкшую сессию, но это баг формы bearer; инструментарий обрабатывает это автоматически и принудительно обновляет токен один раз при `401`, прежде чем сдаться.

WorkOS refresh-токен одноразовый и ротируется при каждом обновлении; самый новый сохраняется в `out/.cline-auth.json` (или читается из `CLINE_REFRESH_TOKEN`, или загружается из локальной БД 9Router).

## ⚙️ Опции CLI

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| Флаг | Описание | По умолчанию |
| --- | --- | --- |
| `--count <n>` | количество создаваемых ключей | `200` |
| `--prefix <p>` | префикс имени ключа (`<p>-NNN`) | `clx` |
| `--start <n>` | первый индекс пакета | `1` |
| `--out <file>` | выходной файл ключей | `out/cline-keys.txt` |
| `--model <id>` | модель для проверки | авто-проба |
| `--conc <n>` | параллелизм для проверки | `6` |
| `--retries <n>` | повторы на каждый вызов проверки | `3` |
| `--limit <n>` | проверить только первые `n` ключей | все |
| `--delay <ms>` | задержка между созданиями | `160` |
| `--keys <file>` | файл ключей для `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | базовый URL 9Router | `http://localhost:20128` |
| `--router-password <pw>` | пароль панели 9Router | `123456` |

| Переменная окружения | По умолчанию | Значение |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | хост API |
| `CLINE_REFRESH_TOKEN` | — | WorkOS refresh-токен (иначе `out/.cline-auth.json`, затем БД 9Router) |

## 🛰️ За прокси

**По замыслу не проксируется.** Этот путь общается с API Cline через встроенный в Node `fetch` с машины, на которой запущен Node — здесь нет браузера, нет CDP-клиента и нет прокси-модуля. Запросы уходят с вашего собственного адреса, что здесь нормально, потому что создание ключей не требует регистрации на каждый ключ: один существующий аккаунт выпускает их все. Привяжите другой хост с помощью `--base-url` только если вы сами проксируете API.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `out/cline-keys.txt` | выпущенные ключи `sk-…`, по одному на строку — игнорируется git |
| `out/cline-keys.txt.verify.txt` | подсчёт проверки |
| `out/.cline-auth.json` | сохранённый WorkOS refresh-токен — игнорируется git, никогда не коммитить |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` · `src/connect-omniroute.js` | регистрация ключей как провайдера 9Router / OmniRoute |
| `examples/bulk-create.js` | создание пакета ключей из скрипта |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый OpenAI-совместимый роутер (`npm install -g 9router && 9router`, панель на `http://localhost:20128`). Зарегистрируйте каждый ключ одной командой — провайдер-узел `cline` создаётся, если отсутствует, и каждый ключ прикрепляется как подключение:

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый OpenAI-совместимый роутер (`npm install -g omniroute && omniroute`, панель на `http://localhost:20128`). Коннектор делает ту же работу там — провайдер-узел `cline` создаётся, если отсутствует, и каждый ключ в `keys.txt` прикрепляется как подключение:

```bash
node src/connect-omniroute.js                    # every key in keys.txt
node src/connect-omniroute.js --api-key clx-…    # or one key at a time
```

Интерактивный лаунчер достигает того же потока: `node src/launcher.js --connect-omniroute`.

Значения по умолчанию: база `http://localhost:20128`, пароль `123456`, префикс `cline`, вышестоящий `https://api.cline.bot/api/v1`, модель по умолчанию `poolside/laguna-s-2.1:free`, клиентский ключ с именем `cline`. Затем модели обслуживаются как `cline/<model id>` и балансируются между всеми ключами.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **Cline** — [cline.bot](https://cline.bot) · приложение на [app.cline.bot](https://app.cline.bot) |
| 🎁 Что даёт провайдер | бесплатные модели на каждом ключе — массовые ключи sk-… из одного аккаунта WorkOS, без капчи |
| 🔑 Что даёт один ключ | ключ `sk-…`, который аутентифицируется в API Cline; его расходы следуют **балансу родительского аккаунта** (бесплатные модели `200`, платные модели `402`) |
| 🌐 Форма API | OpenAI-совместимая: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 Ваши данные | связь только с `api.cline.bot`, `api.workos.com` и вашим локальным 9Router; ключи и токен WorkOS остаются на вашей машине |

## 🐞 Проблемы

Если Cline изменит форму своего API или Cline/WorkOS сменит client id, инструмент остановится на этом шаге и сообщит об этом. **[Откройте issue](../../issues)** с командой, которую вы запустили, и точным выводом; PR приветствуются.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>