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

**Erstelle Cline-API-Schlüssel in großen Mengen über Clines eigene API (workos bearer) und registriere jeden Schlüssel in 9Router — OpenAI-kompatible Inferenz + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Free-Tier](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-2-of-them) · [🧪 Die API nutzen](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

Cline erzeugt API-Schlüssel über seine eigene einfache HTTPS-JSON-API — ein `POST` pro Schlüssel, kein Captcha, keine Karte, keine Telefonverifizierung, kein Wegwerf-Postfach. Schlüssel werden in Stapeln ohne beobachtete Fehler erstellt, mit etwa 70 s pro 200 Schlüssel. Jeder Schlüssel wird dann als OpenAI-kompatible Verbindung unter einem einzigen `cline`-Provider-Node in 9Router registriert.

## 🎁 Free-Tier — wie viel du bekommst

**Ein Cline-Konto liefert unbegrenzt viele `sk-…`-Schlüssel, und Schlüssel, die die kostenlosen Modelle nutzen, kosten nichts — keine Karte, kein Telefon, kein Postfach.**

| Was | Wert |
| --- | --- |
| Kosten eines Schlüssels | **$0** — die Schlüsselerstellung ist kostenlos und unbegrenzt (gemessen: 1000 Schlüssel, 0 Fehler) |
| Karte erforderlich | **Nein** |
| Rate Limit | `429`/`5xx` beim Erstellen werden mit Backoff und bis zu 4 Wiederholungen behandelt; `--delay 160` ms zwischen Erstellungen |
| Registrierung | keine — das Tool verwendet ein bestehendes Cline-Konto über dessen WorkOS-Refresh-Token wieder |
| Was ein Schlüssel ausgeben kann | das **Guthaben des übergeordneten Kontos**: kostenlose Modelle antworten mit `200`, kostenpflichtige Modelle mit `402 insufficient_credits` — jeder Schlüssel teilt sich dieses eine Guthaben |
| Die Einheit, die skaliert | **ein Konto = viele Schlüssel** (anders als bei Anbietern mit einem Konto pro Schlüssel) → `--count N` bedeutet wirklich „N Schlüssel aus demselben Guthaben" |

> 💡 Der Free-Tier wird von Cline festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [cline.bot](https://cline.bot) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js verify            # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 2 davon

Clines Katalog ist größer und wird durch das Guthaben des übergeordneten Kontos beschränkt; die zwei IDs, die ein frischer Schlüssel tatsächlich nutzen kann — und die `verify` prüft — sind:

| Modell-ID | Aufruf wie in 9Router | Status |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (gemessen) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 zweiter Verify-Fallback |
| kostenpflichtige Modelle | `cline/<model>` | ⚠️ `402 insufficient_credits` — jeder Schlüssel teilt sich das Kontoguthaben |

`--model <id>` legt ein einzelnes Modell fest. `402` zählt in der Verify-Auswertung als *akzeptiert* — es beweist, dass der Schlüssel sich authentifiziert. Um den Katalog im eigenen Konto aufzulisten:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 So nutzt du die API

Die Upstream-Basis-URL ist **`https://api.cline.bot/api/v1`**; der Schlüssel wird als vollständiger Bearer-Wert übergeben (`Authorization: Bearer sk-…` bei Clines API, `Bearer workos:<jwt>` für das Konto-Token). Sobald die Schlüssel in 9Router sind, rufe stattdessen den Router auf — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Direkt gegen Cline (was `verify` pro Schlüssel macht):

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Die Free-Model-Kombination erreichte in 9Router nach dem Aufwärmen eine durchschnittliche Latenz von **2,7 s**.

## 🛠 Schnellstart

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

`create` schreibt die Schlüsseldatei nach jeweils zehn Schlüsseln, sodass ein Absturz nie Fortschritt verliert; `verify` schreibt eine `.verify.txt`-Auswertung daneben.

### 🖱️ Der Launcher

`node src/launcher.js` öffnet ein kleines Menü — Schlüssel erzeugen, verifizieren oder bei einem lokalen 9Router / OmniRoute registrieren (`--connect-9router`, `--connect-omniroute`) — und merkt sich die Antworten in `launcher.config.json`. Alles, was es tut, ist auch ein einfacher `src/cli.js`-Befehl (`auth`, `list`, `create`, `verify`, `delete`, `connect`), das Menü ist also optional.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | Schlüssel in einem Stapel erstellt, keine Fehler, ~70 s pro 200 |
| `POST /api/v1/chat/completions` auf `poolside/laguna-s-2.1:free` | **200** — der Schlüssel authentifiziert sich |
| kostenpflichtiges Modell | **402 insufficient_credits** — Auth ist in Ordnung, das geteilte Guthaben ist die Hürde |
| ein ungültiger Schlüssel | **401** — korrekt abgelehnt |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **Qualitätsgates.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt` geschrieben wurde
> (tote Schlüssel werden nie ausgeliefert). Router-Kombinationen folgen derselben Regel auf Modellebene: ein Eintrag wird
> **nur hinzugefügt, wenn das Modell mit `chat-200` antwortet und Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung,
> ein toter Schlüssel oder ein toter Anbieter wird verworfen statt hinzugefügt. Führe den Verify-Schritt jederzeit erneut aus;
> Fehler werden gemeldet, nie verborgen.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **Auth** — tausche ein WorkOS-Refresh-Token gegen ein Access-Token (`POST https://api.workos.com/user_management/authenticate`); der Bearer muss das Präfix `workos:` tragen.
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` mit `{name}`, um `sk-…`-Schlüssel zu erzeugen; `429`/`5xx` werden mit Backoff und bis zu 4 Wiederholungen behandelt.
3. **Verify** — rufe `/api/v1/chat/completions` mit jedem Schlüssel gegen ein kostenloses Modell auf, um zu beweisen, dass er sich authentifiziert.
4. **Connect** — registriere die Schlüssel in 9Router als OpenAI-kompatible Verbindungen.

**Die `workos:`-Präfix-Falle:** Clines API erfordert das wörtliche Präfix — `Authorization: Bearer workos:<jwt>` funktioniert, `Bearer <jwt>` antwortet mit `401 "re-authenticate your Cline account"`. Die Fehlermeldung legt eine abgelaufene Sitzung nahe, aber es ist ein Bearer-Formfehler; das Toolkit behandelt das automatisch und erzwingt bei `401` eine Token-Aktualisierung, bevor es aufgibt.

Das WorkOS-Refresh-Token ist einmalig verwendbar und rotiert bei jeder Aktualisierung; das neueste wird in `out/.cline-auth.json` persistiert (oder aus `CLINE_REFRESH_TOKEN` gelesen, oder aus der lokalen 9Router-DB gebootstrappt).

## ⚙️ CLI-Optionen

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| Flag | Beschreibung | Standard |
| --- | --- | --- |
| `--count <n>` | Anzahl der zu erstellenden Schlüssel | `200` |
| `--prefix <p>` | Präfix des Schlüsselnamens (`<p>-NNN`) | `clx` |
| `--start <n>` | erster Index des Stapels | `1` |
| `--out <file>` | Ausgabedatei für Schlüssel | `out/cline-keys.txt` |
| `--model <id>` | Modell zur Verifizierung | auto-probe |
| `--conc <n>` | Parallelität für Verify | `6` |
| `--retries <n>` | Wiederholungen pro Verifizierungsaufruf | `3` |
| `--limit <n>` | nur die ersten `n` Schlüssel verifizieren | alle |
| `--delay <ms>` | Verzögerung zwischen Erstellungen | `160` |
| `--keys <file>` | Schlüsseldatei für `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | 9Router-Basis-URL | `http://localhost:20128` |
| `--router-password <pw>` | 9Router-Dashboard-Passwort | `123456` |

| Umgebungsvariable | Standard | Bedeutung |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | der API-Host |
| `CLINE_REFRESH_TOKEN` | — | WorkOS-Refresh-Token (sonst `out/.cline-auth.json`, dann die 9Router-DB) |

## 🛰️ Hinter einem Proxy

**Bewusst nicht über Proxy.** Dieser Weg spricht mit Clines API über Nodes eingebautes `fetch` von der Maschine, die Node ausführt — es gibt keinen Browser, keinen CDP-Client und kein Proxy-Modul. Anfragen gehen von deiner eigenen Adresse aus, was hier in Ordnung ist, weil die Schlüsselerstellung keine Registrierung pro Schlüssel erfordert: ein bestehendes Konto erzeugt sie alle. Lege einen anderen Host nur dann mit `--base-url` fest, wenn du die API selbst voranstellst.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `out/cline-keys.txt` | die erzeugten `sk-…`-Schlüssel, einer pro Zeile — von Git ignoriert |
| `out/cline-keys.txt.verify.txt` | die Verify-Auswertung |
| `out/.cline-auth.json` | das persistierte WorkOS-Refresh-Token — von Git ignoriert, niemals committen |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` · `src/connect-omniroute.js` | die Schlüssel als 9Router- / OmniRoute-Provider registrieren |
| `examples/bulk-create.js` | einen Stapel Schlüssel per Skript erstellen |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router (`npm install -g 9router && 9router`, Dashboard auf `http://localhost:20128`). Registriere jeden Schlüssel mit einem Befehl — der `cline`-Provider-Node wird erstellt, falls er fehlt, und jeder Schlüssel wird als Verbindung angehängt:

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router (`npm install -g omniroute && omniroute`, Dashboard auf `http://localhost:20128`). Der Connector erledigt dort dieselbe Aufgabe — der `cline`-Provider-Node wird erstellt, falls er fehlt, und jeder Schlüssel in `keys.txt` wird als Verbindung angehängt:

```bash
node src/connect-omniroute.js                    # every key in keys.txt
node src/connect-omniroute.js --api-key clx-…    # or one key at a time
```

Der interaktive Launcher erreicht denselben Ablauf: `node src/launcher.js --connect-omniroute`.

Standardwerte: Basis `http://localhost:20128`, Passwort `123456`, Präfix `cline`, Upstream `https://api.cline.bot/api/v1`, Standardmodell `poolside/laguna-s-2.1:free`, Client-Schlüssel namens `cline`. Modelle werden dann als `cline/<model id>` bereitgestellt und über alle Schlüssel lastverteilt.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **Cline** — [cline.bot](https://cline.bot) · App unter [app.cline.bot](https://app.cline.bot) |
| 🎁 Was der Anbieter gibt | kostenlose Modelle bei jedem Schlüssel — Massen-`sk-…`-Schlüssel aus einem WorkOS-Konto, kein Captcha |
| 🔑 Was ein Schlüssel dir bringt | ein `sk-…`-Schlüssel, der sich gegen Clines API authentifiziert; seine Ausgaben folgen dem **Guthaben des übergeordneten Kontos** (kostenlose Modelle `200`, kostenpflichtige Modelle `402`) |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 Deine Daten | nur `api.cline.bot`, `api.workos.com` und dein lokaler 9Router werden kontaktiert; Schlüssel und das WorkOS-Token bleiben auf deiner Maschine |

## 🐞 Issues

Wenn Cline seine API-Form ändert oder Cline/WorkOS die Client-ID rotiert, stoppt das Tool an diesem Schritt und sagt es. **[Öffne ein Issue](../../issues)** mit dem ausgeführten Befehl und der exakten Ausgabe; PRs sind willkommen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>