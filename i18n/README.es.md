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

**Crea en masa claves de API de [Cline](https://cline.bot) mediante la propia API de Cline (`workos` bearer) y registra cada clave en una instancia de [9Router](https://9router.com) en ejecución — de principio a fin. Cero dependencias.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-conectar-con-9router)
[![Transport](https://img.shields.io/badge/transport-direct%20fetch-0EA5E9.svg?style=for-the-badge)](#-transportes)
[![Auth](https://img.shields.io/badge/auth-WorkOS%20refresh%20token-22C55E.svg?style=for-the-badge)](#-transportes)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ Características

- 🔑 **Claves de API en masa** — crea cientos de claves `sk-…` mediante la propia API de Cline, un `POST` por clave.
- 🔐 **Bearer de WorkOS** — las claves se autentican como `Authorization: Bearer workos:<jwt>` (el prefijo literal `workos:` es obligatorio).
- 🔌 **Conector de 9Router** — cada clave se registra como conexión compatible con OpenAI bajo el prefijo `cline` en una sola pasada.
- 🪶 **Cero dependencias** — Node.js puro ≥ 18. Sin `npm install`, sin paso de compilación.
- ⚡ **Rápido** — ~70 segundos por 200 claves (medido: **1000/1000 claves creadas**, 0 fallos).
- ✅ **Sin fricción** — sin captcha, sin tarjeta, sin verificación telefónica, sin bandeja desechable.
- 🧩 **Biblioteca o CLI** — llama a `connectBulk()` desde el código, o ejecuta el comando incluido `cline-bulk`.
- 🌍 **5 idiomas** — EN, ID, ZH, JA, ES, DE.

## 🚀 Inicio rápido

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

`create` escribe el archivo de claves cada diez claves, así que un fallo nunca pierde el progreso; `verify` escribe un recuento `.verify.txt` junto a él.

## 🛠 Uso

```bash
cline-bulk auth                      # check account + balance
cline-bulk list                      # list existing API keys
cline-bulk create --count 200        # bulk-create API keys
cline-bulk verify                    # verify keys work
cline-bulk delete --name clx-001     # delete a key
cline-bulk connect                   # register keys into 9Router
```

| Flag | Descripción | Por defecto |
| --- | --- | --- |
| `--count <n>` | número de claves a crear | `200` |
| `--prefix <p>` | prefijo del nombre de la clave (`<p>-NNN`) | `clx` |
| `--start <n>` | primer índice del lote | `1` |
| `--out <file>` | archivo de claves de salida | `out/cline-keys.txt` |
| `--model <id>` | modelo para la verificación | auto-probe |
| `--conc <n>` | concurrencia para verify | `6` |
| `--retries <n>` | reintentos por llamada de verificación | `3` |
| `--limit <n>` | verificar solo las primeras `n` claves | todas |
| `--delay <ms>` | espera entre creaciones | `160` |
| `--keys <file>` | archivo de claves para `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | URL base de 9Router | `http://localhost:20128` |
| `--router-password <pw>` | contraseña del panel de 9Router | `123456` |

Entorno: `CLINE_API` (por defecto `https://api.cline.bot`) · `CLINE_REFRESH_TOKEN`.

## 🌐 Transportes

La API de Cline es una API JSON HTTPS corriente, así que esta vía habla con ella mediante el `fetch` integrado de Node — no hay navegador, ni cliente CDP, ni módulo de proxy, ni paso de bandeja desechable: la cuenta de Cline ya existe y la creación de claves no necesita correo de verificación.

- **Fetch directo (único camino)** — las peticiones van a `CLINE_API` desde la máquina que ejecuta Node. Fija otro host con `--base-url`.
- **Vía de autenticación** — el refresh token de WorkOS procede de `out/.cline-auth.json`, de la variable de entorno `CLINE_REFRESH_TOKEN` o de la base de datos local de 9Router (bootstrap de la primera ejecución). Cada refresco rota el token y se persiste el más reciente.

## 🔌 Conectar con 9Router

9Router es un router compatible con OpenAI y autoalojado:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Registra todas tus claves con un solo comando (crea el provider-node `cline` si no existe y adjunta cada clave como conexión):

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

La combinación de modelos gratuitos midió una latencia media de **2.7 s** tras el calentamiento.

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>
Models   : cline/poolside/laguna-s-2.1:free, cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
```

Llámalo como cualquier endpoint de OpenAI:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🧠 Modelos disponibles

| Modelo | Cómo llamarlo en 9Router | Estado |
| --- | --- | --- |
| poolside/laguna-s-2.1:free | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (medido) |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 segundo respaldo de verificación (sondea cuando el primero no está disponible) |
| modelos de pago | `cline/<model>` | ⚠️ `402 insufficient_credits` — todas las claves comparten el saldo de la cuenta |

`verify` sin `--model` sondea primero `poolside/laguna-s-2.1:free` y cae al `nvidia/…`; `--model <id>` fija un único modelo. `402` cuenta como *aceptado* en el recuento: demuestra que la clave se autentica.

Para actualizar la lista de claves en tu propia cuenta:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 📚 Como biblioteca

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

## ⚙️ Cómo funciona

1. **Auth** — cambia un refresh token de WorkOS por un access token (`POST https://api.workos.com/user_management/authenticate`); el bearer debe llevar el prefijo `workos:`.
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` con `{name}` para acuñar claves `sk-…`; ante `429`/`5xx` se hace backoff y se reintenta hasta 4 veces.
3. **Verify** — llama a `/api/v1/chat/completions` con cada clave contra un modelo gratuito para demostrar que se autentica.
4. **Connect** — registra las claves en 9Router como conexiones compatibles con OpenAI.

### La trampa del prefijo `workos:`

La API de Cline **exige** el prefijo literal `workos:` en la cabecera Authorization:

```
Authorization: Bearer workos:<jwt>   ✅ works
Authorization: Bearer <jwt>          ❌ 401 "re-authenticate your Cline account"
```

El mensaje de error sugiere una sesión caducada, pero en realidad es un bug en la forma del bearer. El toolkit lo gestiona automáticamente, y un `401` dispara una renovación forzada del token antes de abandonar la llamada.

### Comportamiento de las claves

- **Las claves se autentican** pero comparten el saldo de la cuenta.
- Modelos de pago → `402 insufficient_credits`.
- Modelos gratuitos → `200` (p. ej. `poolside/laguna-s-2.1:free`).
- Una clave basura → `401` (rechazada correctamente).

Medido: **1000/1000 claves creadas** en dos ejecuciones (200 + 800), **0 fallos**, ~70 s por 200 claves.

## 📁 Estructura

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

## ⚠️ Notas

- Las claves comparten el saldo de la cuenta principal. Usa los modelos gratuitos para evitar errores `402`.
- El refresh token de WorkOS es de un solo uso: cada refresco lo rota. El toolkit persiste automáticamente el token más reciente.
- Bootstrap de la primera ejecución: si falta `out/.cline-auth.json`, el toolkit lee el refresh token de la base de datos de 9Router.
- `delete` pide `--yes` antes de eliminar claves en masa.
- Para automatización personal/educativa. Respeta los términos de servicio de Cline y de 9Router.

## 📄 Licencia

[MIT](../LICENSE) © 2026 cline-bulk-apikey contributors
