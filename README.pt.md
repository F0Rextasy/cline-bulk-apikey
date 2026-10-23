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

**Crie chaves de API da Cline em massa através da própria API da Cline (workos bearer) e registre cada chave no 9Router — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-2-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isso existe

A Cline emite chaves de API através de sua própria API JSON HTTPS simples — um `POST` por chave, sem captcha, sem cartão, sem verificação por telefone, sem caixa de entrada descartável. **todas as chaves criadas** em duas execuções (200 + 800) com **0 falhas** a ~70 s por 200 chaves. Cada chave é então registrada como uma conexão compatível com OpenAI sob um único nó de provedor `cline` no 9Router.

## 🎁 Nível gratuito — quanto você recebe

**Uma conta Cline gera chaves `sk-…` ilimitadas, e chaves que usam os modelos gratuitos não custam nada — sem cartão, sem telefone, sem caixa de entrada.**

| O quê | Valor |
| --- | --- |
| Custo de uma chave | **$0** — a criação de chaves é gratuita e ilimitada (medido: chaves, 0 falhas) |
| Cartão exigido | **Não** |
| Limite de taxa | `429`/`5xx` na criação fazem backoff e tentam novamente até 4 vezes; `--delay 160` ms entre criações |
| Cadastro | nenhum — a ferramenta reutiliza uma conta Cline existente através de seu token de atualização WorkOS |
| O que uma chave pode gastar | o **saldo da conta principal**: modelos gratuitos respondem `200`, modelos pagos respondem `402 insufficient_credits` — toda chave compartilha esse único saldo |
| A unidade que escala | **uma conta = muitas chaves** (diferente de provedores de uma conta por chave) → `--count N` na verdade significa "N chaves do mesmo saldo" |

> 💡 O nível gratuito é definido pela Cline e pode mudar. Confira os números ao vivo em [cline.bot](https://cline.bot) — e deixe o próprio gate da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 2 deles

O catálogo da Cline é maior e controlado pelo saldo da conta principal; os dois ids que uma chave nova consegue realmente usar — e o que `verify` testa — são:

| ID do Modelo | Chamada como no 9Router | Status |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (medido) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 segundo fallback de verificação |
| modelos pagos | `cline/<model>` | ⚠️ `402 insufficient_credits` — toda chave compartilha o saldo da conta |

`--model <id>` fixa um único modelo. `402` conta como *aceito* na contagem de verificação — prova que a chave autentica. Para listar o catálogo na sua própria conta:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 Como usar a API

A URL base upstream é **`https://api.cline.bot/api/v1`**; a chave entra como o valor completo do bearer (`Authorization: Bearer sk-…` na API da Cline, `Bearer workos:<jwt>` para o token da conta). Depois que as chaves estiverem no 9Router, chame o roteador — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Diretamente contra a Cline (o que `verify` faz por chave):

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

A combinação de modelo gratuito mediu **2,7 s em média** de latência no 9Router após o aquecimento.

## 🛠 Início rápido

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

`create` grava o arquivo de chaves a cada dez chaves, então uma falha nunca perde o progresso; `verify` grava uma contagem `.verify.txt` ao lado dele.

### 🖱️ O inicializador

Não há menu interativo aqui — `src/cli.js` é toda a interface (`auth`, `list`, `create`, `verify`, `delete`, `connect`), e cada flag é configurável na linha de comando. `src/launcher.js` apenas renderiza o banner ASCII CLINE.

## ✅ Verificado e funcionando — toda chave é testada

| Verificação | Resultado |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | **todas as chaves criadas**, 0 falhas, ~70 s por 200 |
| `POST /api/v1/chat/completions` em `poolside/laguna-s-2.1:free` | **200** — a chave autentica |
| modelo pago | **402 insufficient_credits** — a autenticação está ok, o saldo compartilhado é o gate |
| uma chave inválida | **401** — corretamente rejeitada |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **Gates de qualidade.** Toda chave aqui passou por um `chat-200` ao vivo antes de ser gravada em `keys.txt`
> (chaves mortas nunca são entregues). As combinações do roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e conseguir chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Reexecute a etapa de verificação a qualquer momento;
> as falhas são reportadas, nunca escondidas.

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **Auth** — troque um token de atualização WorkOS por um token de acesso (`POST https://api.workos.com/user_management/authenticate`); o bearer deve carregar o prefixo `workos:`.
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` com `{name}` para emitir chaves `sk-…`; `429`/`5xx` fazem backoff e tentam novamente até 4 vezes.
3. **Verify** — chame `/api/v1/chat/completions` com cada chave contra um modelo gratuito para provar que ela autentica.
4. **Connect** — registre as chaves no 9Router como conexões compatíveis com OpenAI.

**A pegadinha do prefixo `workos:`:** a API da Cline exige o prefixo literal — `Authorization: Bearer workos:<jwt>` funciona, `Bearer <jwt>` responde `401 "re-authenticate your Cline account"`. A mensagem de erro sugere uma sessão expirada, mas é um bug de formato do bearer; o toolkit lida com isso automaticamente e força uma atualização de token em `401` antes de desistir.

O token de atualização WorkOS é de uso único e rotaciona a cada atualização; o mais recente é persistido em `out/.cline-auth.json` (ou lido de `CLINE_REFRESH_TOKEN`, ou inicializado a partir do banco de dados local do 9Router).

## ⚙️ Opções da CLI

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| Flag | Descrição | Padrão |
| --- | --- | --- |
| `--count <n>` | número de chaves a criar | `200` |
| `--prefix <p>` | prefixo do nome da chave (`<p>-NNN`) | `clx` |
| `--start <n>` | primeiro índice do lote | `1` |
| `--out <file>` | arquivo de saída das chaves | `out/cline-keys.txt` |
| `--model <id>` | modelo para verificação | auto-probe |
| `--conc <n>` | concorrência para verificação | `6` |
| `--retries <n>` | tentativas por chamada de verificação | `3` |
| `--limit <n>` | verificar apenas as primeiras `n` chaves | todas |
| `--delay <ms>` | atraso entre criações | `160` |
| `--keys <file>` | arquivo de chaves para `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | URL base do 9Router | `http://localhost:20128` |
| `--router-password <pw>` | senha do painel do 9Router | `123456` |

| Variável de ambiente | Padrão | Significado |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | o host da API |
| `CLINE_REFRESH_TOKEN` | — | token de atualização WorkOS (caso contrário `out/.cline-auth.json`, depois o banco de dados do 9Router) |

## 🛰️ Atrás de um proxy

**Não usa proxy por design.** Esta via fala com a API da Cline usando o `fetch` embutido do Node a partir da máquina que executa o Node — não há navegador, nem cliente CDP, nem módulo de proxy. As requisições saem do seu próprio endereço, o que é aceitável aqui porque a criação de chaves não exige cadastro por chave: uma conta existente emite todas elas. Fixe outro host com `--base-url` apenas se você mesmo fizer o front da API.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `out/cline-keys.txt` | as chaves `sk-…` emitidas, uma por linha — ignorado pelo git |
| `out/cline-keys.txt.verify.txt` | a contagem de verificação |
| `out/.cline-auth.json` | o token de atualização WorkOS persistido — ignorado pelo git, nunca faça commit |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` | registra as chaves como um provedor do 9Router |
| `examples/bulk-create.js` | cria um lote de chaves a partir de um script |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI (`npm install -g 9router && 9router`, painel em `http://localhost:20128`). Registre cada chave em um único comando — o nó de provedor `cline` é criado se estiver ausente e cada chave é anexada como uma conexão:

```bash
node src/cli.js connect --keys out/cline-keys.txt

# or as a library:
#   import { connectBulk } from './src/connect-9router.js';
```

Padrões: base `http://localhost:20128`, senha `123456`, prefixo `cline`, upstream `https://api.cline.bot/api/v1`, modelo padrão `poolside/laguna-s-2.1:free`, chave de cliente chamada `cline`. Os modelos são então servidos como `cline/<model id>` e balanceados entre todas as chaves.

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI (`npm install -g omniroute && omniroute`, painel em `http://localhost:20128`). Registre cada chave em um único comando — o nó de provedor `cline` é criado se estiver ausente e cada chave é anexada como uma conexão:

```bash
node src/cli.js connect --keys out/cline-keys.txt
# or as a library:
#   import { connectBulk } from './src/connect-omniroute.js';
```

Padrões: base `http://localhost:20128`, senha `123456`, prefixo `cline`, upstream `https://api.cline.bot/api/v1`, modelo padrão `poolside/laguna-s-2.1:free`, chave de cliente chamada `cline`. Os modelos são então servidos como `cline/<model id>` e balanceados entre todas as chaves.

## 🔑 O que uma chave te dá

| | |
| --- | --- |
| 🏢 Provedor | **Cline** — [cline.bot](https://cline.bot) · app em [app.cline.bot](https://app.cline.bot) |
| 🎁 O que o provedor oferece | modelos gratuitos em toda chave — chaves sk-… em massa de uma conta WorkOS, sem captcha |
| 🔑 O que uma chave te dá | uma chave `sk-…` que autentica contra a API da Cline; seu gasto segue o **saldo da conta principal** (modelos gratuitos `200`, modelos pagos `402`) |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 Seus dados | apenas `api.cline.bot`, `api.workos.com` e seu 9Router local são contatados; as chaves e o token WorkOS ficam na sua máquina |

## 🐞 Problemas

Se a Cline mudar o formato de sua API ou se a Cline/WorkOS rotacionar o client id, a ferramenta para nessa etapa e avisa. **[Abra uma issue](../../issues)** com o comando que você executou e a saída exata; PRs são bem-vindos.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey contributors

</div>