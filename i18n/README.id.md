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

**Buat banyak API key [Cline](https://cline.bot) lewat API milik Cline sendiri (`workos` bearer) dan daftarkan setiap key ke instance [9Router](https://9router.com) yang sedang berjalan — end to end. Tanpa dependensi.**

[![License: MIT](https://img.shields.io/badge/License-MIT-3DA639.svg?style=for-the-badge)](../LICENSE)
[![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg?style=for-the-badge)](#)
[![OpenAI compatible](https://img.shields.io/badge/API-OpenAI--compatible-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6.svg?style=for-the-badge)](#-hubungkan-ke-9router)
[![Transport](https://img.shields.io/badge/transport-direct%20fetch-0EA5E9.svg?style=for-the-badge)](#-transport)
[![Auth](https://img.shields.io/badge/auth-WorkOS%20refresh%20token-22C55E.svg?style=for-the-badge)](#-transport)
[![Languages](https://img.shields.io/badge/i18n-5%20languages-F59E0B.svg?style=for-the-badge)](#)

[English](../README.md) · [Bahasa Indonesia](README.id.md) · [简体中文](README.zh.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Deutsch](README.de.md)

</div>

---

## ✨ Fitur

- 🔑 **API key massal** — buat ratusan key `sk-…` lewat API milik Cline sendiri, satu `POST` per key.
- 🔐 **Bearer WorkOS** — key terautentikasi sebagai `Authorization: Bearer workos:<jwt>` (awalan literal `workos:` wajib ada).
- 🔌 **Konektor 9Router** — setiap key didaftarkan sebagai koneksi kompatibel-OpenAI dengan awalan `cline` sekaligus dalam sekali jalan.
- 🪶 **Tanpa dependensi** — Node.js murni ≥ 18. Tanpa `npm install`, tanpa build step.
- ⚡ **Cepat** — ~70 detik per 200 key (terukur: **1000/1000 key dibuat**, 0 kegagalan).
- ✅ **Tanpa hambatan** — tanpa captcha, tanpa kartu, tanpa verifikasi telepon, tanpa inbox sekali pakai.
- 🧩 **Library atau CLI** — panggil `connectBulk()` di dalam kode, atau jalankan perintah bawaan `cline-bulk`.
- 🌍 **5 bahasa** — EN, ID, ZH, JA, ES, DE.

## 🚀 Mulai cepat

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

`create` menulis berkas key setiap sepuluh key, jadi program berhenti tidak pernah menghilangkan progres; `verify` menulis rekap `.verify.txt` di sebelahnya.

## 🛠 Penggunaan

```bash
cline-bulk auth                      # check account + balance
cline-bulk list                      # list existing API keys
cline-bulk create --count 200        # bulk-create API keys
cline-bulk verify                    # verify keys work
cline-bulk delete --name clx-001     # delete a key
cline-bulk connect                   # register keys into 9Router
```

| Flag | Keterangan | Bawaan |
| --- | --- | --- |
| `--count <n>` | jumlah key yang dibuat | `200` |
| `--prefix <p>` | awalan nama key (`<p>-NNN`) | `clx` |
| `--start <n>` | indeks pertama batch | `1` |
| `--out <file>` | berkas output key | `out/cline-keys.txt` |
| `--model <id>` | model untuk verifikasi | auto-probe |
| `--conc <n>` | konkurensi untuk verify | `6` |
| `--retries <n>` | percobaan ulang per panggilan verifikasi | `3` |
| `--limit <n>` | verifikasi hanya `n` key pertama | semua |
| `--delay <ms>` | jeda antar pembuatan | `160` |
| `--keys <file>` | berkas key untuk `verify` / `connect` | `out/cline-keys.txt` |
| `--router <url>` | URL dasar 9Router | `http://localhost:20128` |
| `--router-password <pw>` | kata sandi dashboard 9Router | `123456` |

Environment: `CLINE_API` (bawaan `https://api.cline.bot`) · `CLINE_REFRESH_TOKEN`.

## 🌐 Transport

API Cline adalah API JSON HTTPS biasa, jadi jalur ini bicara dengannya memakai `fetch` bawaan Node — tidak ada browser, tidak ada klien CDP, tidak ada modul proxy, dan tidak ada langkah inbox sekali pakai: akun Cline sudah ada, dan pembuatan key tidak butuh email verifikasi.

- **Direct fetch (satu-satunya jalur)** — permintaan dikirim ke `CLINE_API` dari mesin yang menjalankan Node. Kunci host lain dengan `--base-url`.
- **Rel autentikasi** — token refresh WorkOS berasal dari `out/.cline-auth.json`, environment variable `CLINE_REFRESH_TOKEN`, atau database 9Router lokal (bootstrap saat pertama dijalankan). Setiap refresh merotasi token, dan token terbaru disimpan.

## 🔌 Hubungkan ke 9Router

9Router adalah router kompatibel-OpenAI yang di-hosting sendiri:

```bash
npm install -g 9router && 9router        # dashboard on http://localhost:20128
```

Daftarkan semua key Anda dengan satu perintah (membuat provider-node `cline` jika belum ada dan melampirkan setiap key sebagai koneksi):

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

Kombinasi model gratis mencatat latensi rata-rata **2.7 s** setelah pemanasan.

```
Endpoint : http://localhost:20128/v1
API key  : sk-<9router client key>
Models   : cline/poolside/laguna-s-2.1:free, cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
```

Panggil seperti endpoint OpenAI biasa:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```


## 🔌 Hubungkan ke OmniRoute

OmniRoute adalah router kompatibel-OpenAI yang di-hosting sendiri:

```bash
npm install -g omniroute && omniroute        # dashboard on http://localhost:20128
```

Daftarkan semua key Anda dengan satu perintah (membuat provider-node `cline` jika belum ada dan melampirkan setiap key sebagai koneksi):

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

Kombinasi model gratis mencatat latensi rata-rata **2.7 s** setelah pemanasan.

```
Endpoint : http://localhost:20128/v1
API key  : sk-<omniroute client key>
Models   : cline/poolside/laguna-s-2.1:free, cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
```

Panggil seperti endpoint OpenAI biasa:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

## 🧠 Model yang tersedia

| Model | Panggil di 9Router | Status |
| --- | --- | --- |
| poolside/laguna-s-2.1:free | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (terukur) |
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 fallback verifikasi kedua (diprobe saat yang pertama tidak tersedia) |
| model berbayar | `cline/<model>` | ⚠️ `402 insufficient_credits` — semua key berbagi saldo akun |

`verify` tanpa `--model` melakukan probe ke `poolside/laguna-s-2.1:free` lebih dulu lalu jatuh ke yang `nvidia/…`; `--model <id>` mengunci satu model. `402` dihitung sebagai *diterima* dalam rekap — ini membuktikan key benar-benar terautentikasi.

Untuk menyegarkan daftar key di akun Anda sendiri:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 📚 Sebagai pustaka

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

## ⚙️ Cara kerja

1. **Auth** — tukar token refresh WorkOS menjadi access token (`POST https://api.workos.com/user_management/authenticate`); bearer harus membawa awalan `workos:`.
2. **Create** — `POST https://api.cline.bot/api/v1/api-keys` dengan `{name}` untuk mencetak key `sk-…`; `429`/`5xx` mundur dan diulang hingga 4 kali.
3. **Verify** — panggil `/api/v1/chat/completions` dengan setiap key terhadap model gratis untuk membuktikan key itu terautentikasi.
4. **Connect** — daftarkan key ke 9Router sebagai koneksi kompatibel-OpenAI.

### Kendala awalan `workos:`

API Cline **mewajibkan** awalan literal `workos:` pada header Authorization:

```
Authorization: Bearer workos:<jwt>   ✅ works
Authorization: Bearer <jwt>          ❌ 401 "re-authenticate your Cline account"
```

Pesan errornya menyiratkan sesi kedaluwarsa, padahal itu bug pada bentuk bearer. Toolkit menanganinya secara otomatis, dan `401` memicu satu refresh token paksa sebelum panggilan menyerah.

### Perilaku kunci

- **Key terautentikasi**, tetapi berbagi saldo akun.
- Model berbayar → `402 insufficient_credits`.
- Model gratis → `200` (mis. `poolside/laguna-s-2.1:free`).
- Key sampah → `401` (ditolak dengan benar).

Terukur: **1000/1000 key dibuat** dalam dua menjalankan (200 + 800), **0 kegagalan**, ~70 s per 200 key.

## 📁 Struktur

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

## ⚠️ Catatan

- Key berbagi saldo akun induk. Pakai model gratis untuk menghindari error `402`.
- Token refresh WorkOS hanya bisa dipakai sekali — setiap refresh merotasinya. Toolkit otomatis menyimpan token terbaru.
- Bootstrap saat pertama dijalankan: bila `out/.cline-auth.json` tidak ada, toolkit membaca token refresh dari DB 9Router.
- `delete` meminta `--yes` sebelum menghapus key secara massal.
- Untuk otomasi pribadi/pendidikan. Hormati ketentuan layanan Cline dan 9Router.

## 📄 Lisensi

[MIT](../LICENSE) © 2026 cline-bulk-apikey contributors
