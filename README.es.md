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

**Crea claves API de Cline en masa a través de la propia API de Cline (workos bearer) y registra cada clave en 9Router — inferencia compatible con OpenAI + conector de 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-2-of-them) · [🧪 Usar la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

Cline emite claves API a través de su propia API JSON HTTPS simple — un `POST` por clave, sin captcha, sin tarjeta, sin verificación por teléfono, sin bandeja de entrada desechable. **cada clave creada** en dos ejecuciones (200 + 800) con **0 fallos** a ~70 s por cada 200 claves. Cada clave se registra luego como una conexión compatible con OpenAI bajo un único nodo proveedor `cline` en 9Router.

## 🎁 Nivel gratuito — cuánto obtienes

**Una cuenta de Cline produce claves `sk-…` ilimitadas, y las claves que usan los modelos gratuitos no cuestan nada — sin tarjeta, sin teléfono, sin bandeja de entrada.**

| Qué | Valor |
| --- | --- |
| Coste de una clave | **$0** — la creación de claves es gratuita e ilimitada (medido: claves, 0 fallos) |
| Tarjeta requerida | **No** |
| Límite de tasa | `429`/`5xx` al crear aplican retroceso y reintentan hasta 4 veces; `--delay 160` ms entre creaciones |
| Registro | ninguno — la herramienta reutiliza una cuenta de Cline existente mediante su token de refresco de WorkOS |
| Qué puede gastar una clave | el **saldo de la cuenta principal**: los modelos gratuitos responden `200`, los modelos de pago responden `402 insufficient_credits` — cada clave comparte ese único saldo |
| La unidad que escala | **una cuenta = muchas claves** (a diferencia de los proveedores de una cuenta por clave) → `--count N` en realidad significa "N claves del mismo saldo" |

> 💡 El nivel gratuito lo define Cline y puede cambiar. Consulta las cifras en vivo en [cline.bot](https://cline.bot) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 2 que hay

El catálogo de Cline es más amplio y está limitado por el saldo de la cuenta principal; los dos ids que una clave nueva puede usar realmente — y lo que `verify` sondea — son:

| ID del modelo | Llamada como en 9Router | Estado |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (medido) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 segundo respaldo de verificación |
| modelos de pago | `cline/<model>` | ⚠️ `402 insufficient_credits` — cada clave comparte el saldo de la cuenta |

`--model <id>` fija un único modelo. `402` cuenta como *aceptado* en el recuento de verificación — demuestra que la clave se autentica. Para listar el catálogo en tu propia cuenta:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 Cómo usar la API

La URL base ascendente es **`https://api.cline.bot/api/v1`**; la clave se introduce como el valor completo del bearer (`Authorization: Bearer sk-…` en la API de Cline, `Bearer workos:<jwt>` para el token de cuenta). Una vez que las claves están en 9Router, llama al router en su lugar — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Directamente contra Cline (lo que hace `verify` por cada clave):

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

La combinación de modelo gratuito midió **2.7 s de latencia media** en 9Router tras el calentamiento.

## 🛠 Inicio rápido

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

### 🖱️ El lanzador

Aquí no hay menú interactivo — `src/cli.js` es toda la interfaz (`auth`, `list`, `create`, `verify`, `delete`, `connect`), y cada opción se puede establecer en la línea de comandos. `src/launcher.js` solo muestra el banner ASCII de CLINE.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | **cada clave creada**, 0 fallos, ~70 s por cada 200 |
| `POST /api/v1/chat/completions` en `poolside/laguna-s-2.1:free` | **200** — la clave se autentica |
| modelo de pago | **402 insufficient_credits** — la autenticación está bien, el saldo compartido es la barrera |
| una clave basura | **401** — rechazada correctamente |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **Controles de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar a herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación cuando quieras;
> los fallos se reportan, nunca se ocultan.

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **Autenticación** — intercambia un token de refresco de WorkOS por un token de acceso (`POST https://api.workos.com/user_management/authenticate`); el bearer debe llevar el prefijo `workos:`.
2. **Creación** — `POST https://api.cline.bot/api/v1/api-keys` con `{name}` para emitir claves `sk-…`; `429`/`5xx` aplican retroceso y reintentan hasta 4 veces.
3. **Verificación** — llama a `/api/v1/chat/completions` con cada clave contra un modelo gratuito para demostrar que se autentica.
4. **Conexión** — registra las claves en 9Router como conexiones compatibles con OpenAI.

**La trampa del prefijo `workos:`:** la API de Cline requiere el prefijo literal — `Authorization: Bearer workos:<jwt>` funciona, `Bearer <jwt>` responde `401 "re-authenticate your Cline account"`. El mensaje de error sugiere una sesión caducada, pero es un fallo de forma del bearer; el kit de herramientas lo maneja automáticamente y fuerza un refresco de token ante `401` antes de rendirse.

El token de refresco de WorkOS es de un solo uso y rota en cada refresco; el más reciente se persiste en `out/.cline-auth.json` (o se lee de `CLINE_REFRESH_TOKEN`, o se inicializa desde la base de datos local de 9Router).

## ⚙️ Opciones de CLI

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| Opción | Descripción | Predeterminado |
| --- | --- | --- |
| `--count <n>` | número de claves a crear | `200` |
| `--prefix <p>` | prefijo del nombre de clave (`<p>-NNN`) | `clx` |
| `--start <n>` | primer índice del lote | `1` |
| `--out <file>` | archivo de claves de salida | `out/cline-keys.txt` |
| `--model <id>` | modelo para la verificación | auto-sondeo |
| `--conc <n>` | concurrencia para la verificación | `6` |
| `--retries <n>` | reintentos por llamada de verificación | `3` |
| `--limit <n>` | verificar solo las primeras `n` claves | todas |
| `--delay <ms>` | retardo entre creaciones | `160` |
| `--keys <file>` | archivo de claves para `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | URL base de 9Router | `http://localhost:20128` |
| `--router-password <pw>` | contraseña del panel de 9Router | `123456` |

| Variable de entorno | Predeterminado | Significado |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | el host de la API |
| `CLINE_REFRESH_TOKEN` | — | token de refresco de WorkOS (si no, `out/.cline-auth.json`, luego la base de datos de 9Router) |

## 🛰️ Detrás de un proxy

**Sin proxy por diseño.** Este canal habla con la API de Cline usando el `fetch` integrado de Node desde la máquina que ejecuta Node — no hay navegador, ni cliente CDP, ni módulo de proxy. Las solicitudes salen desde tu propia dirección, lo cual está bien aquí porque la creación de claves no requiere registro por clave: una cuenta existente las emite todas. Fija otro host con `--base-url` solo si tú mismo pones un frontend a la API.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `out/cline-keys.txt` | las claves `sk-…` emitidas, una por línea — ignorado por git |
| `out/cline-keys.txt.verify.txt` | el recuento de verificación |
| `out/.cline-auth.json` | el token de refresco de WorkOS persistido — ignorado por git, nunca lo confirmes |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` | registra las claves como un proveedor de 9Router |
| `examples/bulk-create.js` | crea un lote de claves desde un script |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI (`npm install -g 9router && 9router`, panel en `http://localhost:20128`). Registra cada clave con un solo comando — el nodo proveedor `cline` se crea si falta y cada clave se adjunta como una conexión:

```bash
node src/cli.js connect --keys out/cline-keys.txt

# or as a library:
#   import { connectBulk } from './src/connect-9router.js';
```

Predeterminados: base `http://localhost:20128`, contraseña `123456`, prefijo `cline`, ascendente `https://api.cline.bot/api/v1`, modelo predeterminado `poolside/laguna-s-2.1:free`, clave de cliente llamada `cline`. Los modelos se sirven entonces como `cline/<model id>` y se balancean la carga entre todas las claves.

## 🔌 Conectar con OmniRoute

[OmniRoute](https://omniroute.online) es un router autoalojado y compatible con OpenAI (`npm install -g omniroute && omniroute`, panel en `http://localhost:20128`). Registra cada clave con un solo comando — el nodo proveedor `cline` se crea si falta y cada clave se adjunta como una conexión:

```bash
node src/cli.js connect --keys out/cline-keys.txt
# or as a library:
#   import { connectBulk } from './src/connect-omniroute.js';
```

Predeterminados: base `http://localhost:20128`, contraseña `123456`, prefijo `cline`, ascendente `https://api.cline.bot/api/v1`, modelo predeterminado `poolside/laguna-s-2.1:free`, clave de cliente llamada `cline`. Los modelos se sirven entonces como `cline/<model id>` y se balancean la carga entre todas las claves.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **Cline** — [cline.bot](https://cline.bot) · app en [app.cline.bot](https://app.cline.bot) |
| 🎁 Qué da el proveedor | modelos gratuitos en cada clave — claves sk-… en masa desde una cuenta de WorkOS, sin captcha |
| 🔑 Qué te da una clave | una clave `sk-…` que se autentica contra la API de Cline; su gasto sigue el **saldo de la cuenta principal** (modelos gratuitos `200`, modelos de pago `402`) |
| 🌐 Forma de la API | Compatible con OpenAI: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con `api.cline.bot`, `api.workos.com` y tu 9Router local; las claves y el token de WorkOS permanecen en tu máquina |

## 🐞 Problemas

Si Cline cambia la forma de su API o Cline/WorkOS rota el id de cliente, la herramienta se detiene en ese paso y lo indica. **[Abre un issue](../../issues)** con el comando que ejecutaste y la salida exacta; los PR son bienvenidos.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>