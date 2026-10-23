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

**Créez en masse des clés API Cline via l'API de Cline elle-même (bearer workos) et enregistrez chaque clé dans 9Router — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-2-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cela existe

Cline génère des clés API via sa propre API JSON HTTPS simple — un `POST` par clé, pas de captcha, pas de carte, pas de vérification téléphonique, pas de boîte jetable. **chaque clé créée** en deux exécutions (200 + 800) avec **0 échec** à environ 70 s pour 200 clés. Chaque clé est ensuite enregistrée comme une connexion compatible OpenAI sous un seul nœud fournisseur `cline` dans 9Router.

## 🎁 Offre gratuite — ce que vous obtenez

**Un seul compte Cline produit un nombre illimité de clés `sk-…`, et les clés qui utilisent les modèles gratuits ne coûtent rien — pas de carte, pas de téléphone, pas de boîte mail.**

| Quoi | Valeur |
| --- | --- |
| Coût d'une clé | **0 $** — la création de clé est gratuite et illimitée (mesuré : clés, 0 échec) |
| Carte requise | **Non** |
| Limite de débit | `429`/`5xx` à la création : backoff et nouvelle tentative jusqu'à 4 fois ; `--delay 160` ms entre les créations |
| Inscription | aucune — l'outil réutilise un compte Cline existant via son refresh token WorkOS |
| Ce qu'une clé peut dépenser | le **solde du compte parent** : les modèles gratuits répondent `200`, les modèles payants répondent `402 insufficient_credits` — chaque clé partage ce solde unique |
| L'unité qui évolue | **un compte = plusieurs clés** (contrairement aux fournisseurs avec un compte par clé) → `--count N` signifie en réalité « N clés issues du même solde » |

> 💡 L'offre gratuite est définie par Cline et peut changer. Consultez les chiffres en direct sur [cline.bot](https://cline.bot) — et laissez le contrôle de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 2 au complet

Le catalogue de Cline est plus large et conditionné par le solde du compte parent ; les deux identifiants qu'une clé fraîche peut réellement utiliser — et que `verify` teste — sont :

| ID du modèle | Appel tel quel dans 9Router | Statut |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (mesuré) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 second recours de vérification |
| modèles payants | `cline/<model>` | ⚠️ `402 insufficient_credits` — chaque clé partage le solde du compte |

`--model <id>` fixe un seul modèle. `402` compte comme *accepté* dans le décompte de vérification — cela prouve que la clé s'authentifie. Pour lister le catalogue sur votre propre compte :

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 Comment utiliser l'API

L'URL de base en amont est **`https://api.cline.bot/api/v1`** ; la clé est insérée comme valeur complète du bearer (`Authorization: Bearer sk-…` sur l'API de Cline, `Bearer workos:<jwt>` pour le token de compte). Une fois les clés dans 9Router, appelez plutôt le routeur — `http://localhost:20128/v1` :

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Directement contre Cline (ce que fait `verify` pour chaque clé) :

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

La combinaison de modèles gratuits a mesuré une latence moyenne de **2,7 s** dans 9Router après échauffement.

## 🛠 Démarrage rapide

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

`create` écrit le fichier de clés après chaque dizaine de clés, donc un crash ne perd jamais la progression ; `verify` écrit un décompte `.verify.txt` à côté.

### 🖱️ Le lanceur

Il n'y a pas de menu interactif ici — `src/cli.js` est toute l'interface (`auth`, `list`, `create`, `verify`, `delete`, `connect`), et chaque option est définissable en ligne de commande. `src/launcher.js` ne fait qu'afficher la bannière ASCII CLINE.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | **chaque clé créée**, 0 échec, ~70 s pour 200 |
| `POST /api/v1/chat/completions` sur `poolside/laguna-s-2.1:free` | **200** — la clé s'authentifie |
| modèle payant | **402 insufficient_credits** — l'authentification est bonne, le solde partagé est le verrou |
| une clé bidon | **401** — correctement rejetée |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **Contrôles qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combinaisons du routeur suivent la même règle au niveau du modèle : une entrée est
> ajoutée **uniquement si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans support des outils,
> une clé morte ou un fournisseur mort est écarté au lieu d'être ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais masqués.

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **Auth** — échangez un refresh token WorkOS contre un access token (`POST https://api.workos.com/user_management/authenticate`) ; le bearer doit porter le préfixe `workos:`.
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` avec `{name}` pour générer des clés `sk-…` ; `429`/`5xx` : backoff et nouvelle tentative jusqu'à 4 fois.
3. **Verify** — appelez `/api/v1/chat/completions` avec chaque clé sur un modèle gratuit pour prouver qu'elle s'authentifie.
4. **Connect** — enregistrez les clés dans 9Router comme connexions compatibles OpenAI.

**Le piège du préfixe `workos:` :** l'API de Cline exige le préfixe littéral — `Authorization: Bearer workos:<jwt>` fonctionne, `Bearer <jwt>` répond `401 "re-authenticate your Cline account"`. Le message d'erreur suggère une session expirée, mais c'est un bug de forme du bearer ; la boîte à outils le gère automatiquement et force un rafraîchissement de token sur `401` avant d'abandonner.

Le refresh token WorkOS est à usage unique et tourne à chaque rafraîchissement ; le plus récent est persisté dans `out/.cline-auth.json` (ou lu depuis `CLINE_REFRESH_TOKEN`, ou amorcé depuis la base locale de 9Router).

## ⚙️ Options CLI

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| Option | Description | Défaut |
| --- | --- | --- |
| `--count <n>` | nombre de clés à créer | `200` |
| `--prefix <p>` | préfixe du nom de clé (`<p>-NNN`) | `clx` |
| `--start <n>` | premier index du lot | `1` |
| `--out <file>` | fichier de sortie des clés | `out/cline-keys.txt` |
| `--model <id>` | modèle pour la vérification | auto-probe |
| `--conc <n>` | concurrence pour la vérification | `6` |
| `--retries <n>` | tentatives par appel de vérification | `3` |
| `--limit <n>` | vérifier uniquement les `n` premières clés | toutes |
| `--delay <ms>` | délai entre les créations | `160` |
| `--keys <file>` | fichier de clés pour `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | URL de base de 9Router | `http://localhost:20128` |
| `--router-password <pw>` | mot de passe du tableau de bord 9Router | `123456` |

| Variable d'environnement | Défaut | Signification |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | l'hôte de l'API |
| `CLINE_REFRESH_TOKEN` | — | refresh token WorkOS (sinon `out/.cline-auth.json`, puis la base 9Router) |

## 🛰️ Derrière un proxy

**Non proxifié par conception.** Cette voie parle à l'API de Cline avec le `fetch` intégré de Node depuis la machine qui exécute Node — il n'y a pas de navigateur, pas de client CDP et pas de module proxy. Les requêtes partent de votre propre adresse, ce qui est acceptable ici car la création de clé ne nécessite aucune inscription par clé : un compte existant les génère toutes. Fixez un autre hôte avec `--base-url` uniquement si vous placez vous-même un frontal devant l'API.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `out/cline-keys.txt` | les clés `sk-…` générées, une par ligne — ignoré par git |
| `out/cline-keys.txt.verify.txt` | le décompte de vérification |
| `out/.cline-auth.json` | le refresh token WorkOS persisté — ignoré par git, ne jamais committer |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` | enregistre les clés comme fournisseur 9Router |
| `examples/bulk-create.js` | crée un lot de clés depuis un script |

## 🔌 Se connecter à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI (`npm install -g 9router && 9router`, tableau de bord sur `http://localhost:20128`). Enregistrez chaque clé en une seule commande — le nœud fournisseur `cline` est créé s'il est absent et chaque clé est attachée comme connexion :

```bash
node src/cli.js connect --keys out/cline-keys.txt

# or as a library:
#   import { connectBulk } from './src/connect-9router.js';
```

Défauts : base `http://localhost:20128`, mot de passe `123456`, préfixe `cline`, amont `https://api.cline.bot/api/v1`, modèle par défaut `poolside/laguna-s-2.1:free`, clé client nommée `cline`. Les modèles sont alors servis comme `cline/<model id>` et répartis en charge sur chaque clé.

## 🔌 Se connecter à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé compatible OpenAI (`npm install -g omniroute && omniroute`, tableau de bord sur `http://localhost:20128`). Enregistrez chaque clé en une seule commande — le nœud fournisseur `cline` est créé s'il est absent et chaque clé est attachée comme connexion :

```bash
node src/cli.js connect --keys out/cline-keys.txt
# or as a library:
#   import { connectBulk } from './src/connect-omniroute.js';
```

Défauts : base `http://localhost:20128`, mot de passe `123456`, préfixe `cline`, amont `https://api.cline.bot/api/v1`, modèle par défaut `poolside/laguna-s-2.1:free`, clé client nommée `cline`. Les modèles sont alors servis comme `cline/<model id>` et répartis en charge sur chaque clé.

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **Cline** — [cline.bot](https://cline.bot) · application sur [app.cline.bot](https://app.cline.bot) |
| 🎁 Ce que le fournisseur donne | modèles gratuits sur chaque clé — clés sk-… en masse depuis un compte WorkOS, sans captcha |
| 🔑 Ce qu'une clé vous apporte | une clé `sk-…` qui s'authentifie auprès de l'API de Cline ; sa dépense suit le **solde du compte parent** (modèles gratuits `200`, modèles payants `402`) |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 Vos données | seuls `api.cline.bot`, `api.workos.com` et votre 9Router local sont contactés ; les clés et le token WorkOS restent sur votre machine |

## 🐞 Problèmes

Si Cline modifie la forme de son API ou si Cline/WorkOS fait tourner l'id client, l'outil s'arrête à cette étape et le signale. **[Ouvrez un ticket](../../issues)** avec la commande exécutée et la sortie exacte ; les PR sont bienvenues.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>