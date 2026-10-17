<div align="center">

```
 ██████╗   ██╗     ██   ███╗     ███╗   ██╗ ███████╗
██╔════╝   ██║     ██  █████╗    ████╗  ██║ ██╔════╝
█████╗     ██║     ██  ██╔██║    ██╔██╗ ██║ █████╗
██╔══╝     ██║     ██  ██║╚██║   ██║╚██╗██║ ██╔══╝
███████╗   ███████╗    ██████║   ██║ ╚████║ ███████╗
╚══════╝   ╚══════╝    ╚═════╝   ╚═╝  ╚═══╝ ╚══════╝
```

<img src="../brand/logo.svg" alt="cline-bulk" width="150" />

# cline-bulk-apikey

**Erstelle massenhaft [Cline](https://cline.bot) API-Keys über Clines eigene API (`workos` Bearer) und registriere jeden Key in einer laufenden [9Router](https://9router.com)-Instanz — durchgängig. Null Abhängigkeiten.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-mit-9router-verbinden)
[![Transport](https://img.shields.io/badge/transport-direct%20fetch-0EA5E9.svg?style=for-the-badge)](#-transports)
[![Auth](https://img.shields.io/badge/auth-WorkOS%20refresh%20token-22C55E.svg?style=for-the-badge)](#-transports)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ Funktionen

- 🔑 **API-Keys en masse** — erstelle hunderte `sk-…`-Keys über Clines eigene API, ein `POST` pro Key.
- 🔐 **WorkOS Bearer** — Keys authentifizieren sich als `Authorization: Bearer workos:<jwt>` (das literale `workos:`-Präfix ist zwingend).
- 🔌 **9Router-Konnektor** — jeder Key wird in einem Durchgang als OpenAI-kompatible Verbindung unter dem Präfix `cline` registriert.
- 🪶 **Null Abhängigkeiten** — reines Node.js ≥ 18. Kein `npm install`, kein Build-Schritt.
- ⚡ **Schnell** — ~70 Sekunden pro 200 Keys (gemessen: **1000/1000 Keys erstellt**, 0 Fehler).
- ✅ **Keine Hürden** — kein Captcha, keine Karte, keine Telefonverifizierung, kein Wegwerf-Postfach nötig.
- 🧩 **Bibliothek oder CLI** — rufe `connectBulk()` im Code auf oder führe das mitgelieferte Kommando `cline-bulk` aus.
- 🌍 **5 Sprachen** — EN, ID, ZH, JA, ES, DE.

## 🚀 Schnellstart

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

`create` schreibt die Key-Datei nach jeweils zehn Keys, sodass ein Absturz nie Fortschritt verliert; `verify` schreibt daneben eine `.verify.txt`-Bilanz.

## 🛠 Verwendung

```bash
cline-bulk auth                      # check account + balance
cline-bulk list                      # list existing API keys
cline-bulk create --count 200        # bulk-create API keys
cline-bulk verify                    # verify keys work
cline-bulk delete --name clx-001     # delete a key
cline-bulk connect                   # register keys into 9Router
```

| Flag | Beschreibung | Standard |
| --- | --- | --- |
| `--count <n>` | Anzahl der zu erstellenden Keys | `200` |
| `--prefix <p>` | Namenspräfix der Keys (`<p>-NNN`) | `clx` |
| `--start <n>` | erster Index des Stapels | `1` |
| `--out <file>` | Ausgabedatei für die Keys | `out/cline-keys.txt` |
| `--model <id>` | Modell für die Verifikation | auto-probe |
| `--conc <n>` | Parallelität für verify | `6` |
| `--retries <n>` | Wiederholungen pro Verifikationsaufruf | `3` |
| `--limit <n>` | nur die ersten `n` Keys verifizieren | alle |
| `--delay <ms>` | Wartezeit zwischen den Erstellungen | `160` |
| `--keys <file>` | Key-Datei für `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | Basis-URL von 9Router | `http://localhost:20128` |
| `--router-password <pw>` | Passwort des 9Router-Dashboards | `123456` |

Umgebung: `CLINE_API` (Standard `https://api.cline.bot`) · `CLINE_REFRESH_TOKEN`.

## 🌐 Transports

Clines API ist eine schlichte HTTPS-JSON-API, daher spricht diese Lane sie mit Nodes eingebautem `fetch` an — kein Browser, kein CDP-Client, kein Proxy-Modul und kein Wegwerf-Postfach-Schritt: ein Cline-Konto existiert bereits, und die Key-Erstellung braucht keine Bestätigungsmail.

- **Direkter Fetch (einziger Weg)** — Anfragen gehen von dem Rechner, der Node ausführt, an `CLINE_API`. Mit `--base-url` einen anderen Host festlegen.
- **Auth-Schiene** — der WorkOS-Refresh-Token stammt aus `out/.cline-auth.json`, aus der Umgebungsvariable `CLINE_REFRESH_TOKEN` oder aus der lokalen 9Router-Datenbank (Bootstrap beim ersten Start). Jeder Refresh rotiert den Token, und der neueste wird gespeichert.

## 🔌 Mit 9Router verbinden

9Router ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Registriere alle deine Keys mit einem einzigen Kommando (erlegt den Provider-Node `cline` an, falls er nicht existiert, und hängt jeden Key als Verbindung an):

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

Die Kombination kostenloser Modelle erreichte nach dem Aufwärmen eine durchschnittliche Latenz von **2.7 s**.

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>
Models   : cline/poolside/laguna-s-2.1:free, cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
```

Rufe es wie jeden OpenAI-Endpoint auf:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🧠 Verfügbare Modelle

| Modell | Aufruf in 9Router | Status |
| --- | --- | --- |
| poolside/laguna-s-2.1:free | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (gemessen) |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 zweiter Verifikations-Fallback (wird abgefragt, wenn der erste nicht verfügbar ist) |
| kostenpflichtige Modelle | `cline/<model>` | ⚠️ `402 insufficient_credits` — alle Keys teilen sich das Guthaben des Kontos |

`verify` ohne `--model` fragt zuerst `poolside/laguna-s-2.1:free` ab und fällt auf `nvidia/…` zurück; `--model <id>` legt ein einzelnes Modell fest. `402` zählt in der Bilanz als *akzeptiert* — es belegt, dass sich der Key authentisiert.

So aktualisierst du die Key-Liste in deinem eigenen Konto:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 📚 Als Bibliothek verwenden

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

## ⚙️ So funktioniert es

1. **Auth** — tausche einen WorkOS-Refresh-Token gegen einen Access-Token (`POST https://api.workos.com/user_management/authenticate`); der Bearer muss das Präfix `workos:` tragen.
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` mit `{name}`, um `sk-…`-Keys zu prägen; bei `429`/`5xx` wird mit Backoff bis zu 4-mal erneut versucht.
3. **Verify** — rufe `/api/v1/chat/completions` mit jedem Key gegen ein kostenloses Modell auf, um zu belegen, dass er sich authentisiert.
4. **Connect** — registriert die Keys als OpenAI-kompatible Verbindungen in 9Router.

### Die `workos:`-Falle

Clines API **verlangt** das literale `workos:`-Präfix im Authorization-Header:

```
Authorization: Bearer workos:<jwt>   ✅ works
Authorization: Bearer <jwt>          ❌ 401 "re-authenticate your Cline account"
```

Die Fehlermeldung deutet eine abgelaufene Sitzung an, tatsächlich ist es ein Bug in der Bearer-Form. Das Toolkit übernimmt das automatisch, und ein `401` löst einen erzwungenen Token-Refresh aus, bevor der Aufruf aufgegeben wird.

### Verhalten der Keys

- **Keys authentifizieren sich**, teilen sich aber das Guthaben des Kontos.
- Kostenpflichtige Modelle → `402 insufficient_credits`.
- Kostenlose Modelle → `200` (z. B. `poolside/laguna-s-2.1:free`).
- Ein Unsinns-Key → `401` (korrekt abgelehnt).

Gemessen: **1000/1000 Keys erstellt** in zwei Läufen (200 + 800), **0 Fehler**, ~70 s pro 200 Keys.

## 📁 Aufbau

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

## ⚠️ Hinweise

- Keys teilen sich das Guthaben des übergeordneten Kontos. Nutze die kostenlosen Modelle, um `402`-Fehler zu vermeiden.
- Der WorkOS-Refresh-Token ist einmalig nutzbar — jeder Refresh rotiert ihn. Das Toolkit speichert den neuesten Token automatisch.
- Bootstrap beim ersten Start: Fehlt `out/.cline-auth.json`, liest das Toolkit den Refresh-Token aus der 9Router-DB.
- `delete` fragt nach `--yes`, bevor Keys in Masse entfernt werden.
- Für persönliche/educational Automation. Beachte die Nutzungsbedingungen von Cline und 9Router.

## 📄 Lizenz

[MIT](../LICENSE) © 2026 cline-bulk-apikey contributors
