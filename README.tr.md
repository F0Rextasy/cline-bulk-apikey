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

**Cline API anahtarlarını Cline'in kendi API'si (workos bearer) üzerinden toplu oluşturun ve her anahtarı 9Router'a kaydedin — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-2%20served-412991?style=for-the-badge)](https://api.cline.bot)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-2-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

Cline, API anahtarlarını kendi düz HTTPS JSON API'si üzerinden üretir — anahtar başına bir `POST`, captcha yok, kart yok, telefon doğrulaması yok, tek kullanımlık gelen kutusu yok. Anahtarlar toplu olarak, gözlemlenen hiçbir hata olmadan, 200 anahtar başına yaklaşık 70 saniyede oluşturulur. Ardından her anahtar, 9Router'da tek bir `cline` sağlayıcı düğümü altında OpenAI uyumlu bir bağlantı olarak kaydedilir.

## 🎁 Ücretsiz katman — ne kadar elde edersiniz

**Bir Cline hesabı sınırsız `sk-…` anahtarı üretir ve ücretsiz modellere ulaşan anahtarlar hiçbir ücrete tabi değildir — kart yok, telefon yok, gelen kutusu yok.**

| Ne | Değer |
| --- | --- |
| Bir anahtarın maliyeti | **$0** — anahtar oluşturma ücretsiz ve ölçüsüzdür (ölçüldü: 1000 anahtar, 0 hata) |
| Kart gerekli mi | **Hayır** |
| Hız sınırı | Oluşturmada `429`/`5xx` geri çekilir ve 4 kez yeniden dener; oluşturmalar arasında `--delay 160` ms |
| Kayıt | yok — araç, WorkOS yenileme token'ı aracılığıyla mevcut bir Cline hesabını yeniden kullanır |
| Bir anahtarın harcayabileceği | **ana hesabın bakiyesi**: ücretsiz modeller `200` yanıtlar, ücretli modeller `402 insufficient_credits` yanıtlar — her anahtar o tek bakiyeyi paylaşır |
| Ölçeklenen birim | **bir hesap = birçok anahtar** (anahtar başına hesap sağlayan sağlayıcıların aksine) → `--count N` aslında "aynı bakiyeden N anahtar" demektir |

> 💡 Ücretsiz katman Cline tarafından belirlenir ve değişebilir. Güncel sayıları [cline.bot](https://cline.bot) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js verify            # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — hepsi 2 tane

Cline'in kataloğu daha geniştir ve ana hesabın bakiyesiyle kapılıdır; yeni bir anahtarın gerçekten kullanabileceği iki kimlik — ve `verify`'ın yokladığı şey — şunlardır:

| Model Kimliği | 9Router'da çağrım | Durum |
| --- | --- | --- |
| `poolside/laguna-s-2.1:free` | `cline/poolside/laguna-s-2.1:free` | ✅ `200` (ölçüldü) |
| `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | `cline/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | 🔁 ikinci doğrulama yedeği |
| ücretli modeller | `cline/<model>` | ⚠️ `402 insufficient_credits` — her anahtar hesap bakiyesini paylaşır |

`--model <id>` tek bir modeli sabitler. `402`, doğrulama sayımında *kabul edilmiş* sayılır — anahtarın kimlik doğruladığını kanıtlar. Kendi hesabınızdaki kataloğu listelemek için:

```bash
curl https://api.cline.bot/api/v1/models -H "Authorization: Bearer workos:<your workos access token>"
```

## 🧪 API nasıl kullanılır

Yukarı akış temel URL'si **`https://api.cline.bot/api/v1`**'dir; anahtar, bearer değerinin tamamı olarak girer (Cline'in API'sinde `Authorization: Bearer sk-…`, hesap token'ı için `Bearer workos:<jwt>`). Anahtarlar 9Router'a girdikten sonra, bunun yerine router'ı çağırın — `http://localhost:20128/v1`:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline/poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}]}'
```

Doğrudan Cline'e karşı (her anahtar için `verify`'ın yaptığı şey):

```bash
curl https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer sk-<cline key>" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: https://app.cline.bot" \
  -d '{"model":"poolside/laguna-s-2.1:free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Ücretsiz model kombinasyonu, ısınma sonrasında 9Router'da ortalama **2,7 saniye** gecikme ölçtü.

## 🛠 Hızlı başlangıç

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

`create`, anahtar dosyasını her on anahtardan sonra yazar, böylece bir çökme ilerlemeyi asla kaybetmez; `verify` yanına bir `.verify.txt` sayımı yazar.

### 🖱️ Başlatıcı

`node src/launcher.js` küçük bir menü açar — anahtar üret, doğrula veya yerel bir 9Router / OmniRoute ile kaydet (`--connect-9router`, `--connect-omniroute`) — ve yanıtları `launcher.config.json` içinde hatırlar. Yaptığı her şey aynı zamanda düz bir `src/cli.js` komutudur (`auth`, `list`, `create`, `verify`, `delete`, `connect`), yani menü isteğe bağlıdır.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `POST https://api.cline.bot/api/v1/api-keys` (`{name}`) | anahtarlar tek partide oluşturuldu, hata yok, 200 başına ~70 sn |
| `poolside/laguna-s-2.1:free` üzerinde `POST /api/v1/chat/completions` | **200** — anahtar kimlik doğrular |
| ücretli model | **402 insufficient_credits** — kimlik doğrulama sorunsuz, kapı paylaşılan bakiye |
| bozuk bir anahtar | **401** — doğru şekilde reddedildi |

```bash
node src/cli.js verify --limit 20    # spot-check the first 20 keys
```

> **Kalite kapıları.** Buradaki her anahtar, `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Router kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtlıyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> hatalar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: Cline page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.cline.bot/api/v1/chat/completions → real content = the key is live
```

1. **Kimlik doğrulama** — bir WorkOS yenileme token'ını erişim token'ıyla değiştirin (`POST https://api.workos.com/user_management/authenticate`); bearer `workos:` önekini taşımalıdır.
2. **Oluşturma** — `sk-…` anahtarları üretmek için `{name}` ile `POST https://api.cline.bot/api/v1/api-keys`; `429`/`5xx` geri çekilir ve 4 kez yeniden dener.
3. **Doğrulama** — her anahtarla ücretsiz bir modele karşı `/api/v1/chat/completions` çağırın ve kimlik doğruladığını kanıtlayın.
4. **Bağlama** — anahtarları 9Router'a OpenAI uyumlu bağlantılar olarak kaydedin.

**`workos:` öneki tuzağı:** Cline'in API'si birebir öneki gerektirir — `Authorization: Bearer workos:<jwt>` çalışır, `Bearer <jwt>` ise `401 "re-authenticate your Cline account"` yanıtlar. Hata mesajı süresi dolmuş bir oturumu ima eder, ancak bu bir bearer biçimi hatasıdır; araç seti bunu otomatik olarak ele alır ve pes etmeden önce `401` üzerine bir kez token yenilemeyi zorlar.

WorkOS yenileme token'ı tek kullanımlıktır ve her yenilemede döner; en yenisi `out/.cline-auth.json` dosyasına kalıcı olarak yazılır (veya `CLINE_REFRESH_TOKEN`'dan okunur ya da yerel 9Router DB'sinden başlatılır).

## ⚙️ CLI seçenekleri

```bash
node src/cli.js auth                      # check account + balance
node src/cli.js list                      # list existing API keys
node src/cli.js create --count 200        # bulk-create API keys
node src/cli.js verify                    # verify keys work
node src/cli.js delete --name clx-001     # delete a key (--yes for bulk)
node src/cli.js connect                   # register keys into 9Router
```

| Bayrak | Açıklama | Varsayılan |
| --- | --- | --- |
| `--count <n>` | oluşturulacak anahtar sayısı | `200` |
| `--prefix <p>` | anahtar adı öneki (`<p>-NNN`) | `clx` |
| `--start <n>` | partinin ilk indeksi | `1` |
| `--out <file>` | çıktı anahtar dosyası | `out/cline-keys.txt` |
| `--model <id>` | doğrulama için model | otomatik yoklama |
| `--conc <n>` | doğrulama için eşzamanlılık | `6` |
| `--retries <n>` | doğrulama çağrısı başına yeniden deneme | `3` |
| `--limit <n>` | yalnızca ilk `n` anahtarı doğrula | tümü |
| `--delay <ms>` | oluşturmalar arası gecikme | `160` |
| `--keys <file>` | `verify` / `connect` için anahtar dosyası | `out/cline-keys.txt` |
| `--router <url>` | 9Router temel URL'si | `http://localhost:20128` |
| `--router-password <pw>` | 9Router kontrol paneli parolası | `123456` |

| Ortam değişkeni | Varsayılan | Anlamı |
| --- | --- | --- |
| `CLINE_API` | `https://api.cline.bot` | API ana makinesi |
| `CLINE_REFRESH_TOKEN` | — | WorkOS yenileme token'ı (aksi halde `out/.cline-auth.json`, sonra 9Router DB'si) |

## 🛰️ Proxy arkasında

**Tasarım gereği proxy'lenmez.** Bu hat, Node'u çalıştıran makineden Node'un yerleşik `fetch`'i ile Cline'in API'sini konuşur — tarayıcı yok, CDP istemcisi yok ve proxy modülü yok. İstekler kendi adresinizden çıkar; burada bu sorun değildir çünkü anahtar oluşturma anahtar başına kayıt gerektirmez: mevcut bir hesap hepsini üretir. API'yi kendiniz önüne koyuyorsanız, yalnızca başka bir ana makineyi `--base-url` ile sabitleyin.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `out/cline-keys.txt` | üretilen `sk-…` anahtarları, satır başına bir tane — git tarafından yok sayılır |
| `out/cline-keys.txt.verify.txt` | doğrulama sayımı |
| `out/.cline-auth.json` | kalıcı olarak yazılan WorkOS yenileme token'ı — git tarafından yok sayılır, asla commit etmeyin |
| `src/cli.js` | `auth` · `list` · `create` · `delete` · `verify` · `connect` |
| `src/connect-9router.js` · `src/connect-omniroute.js` | anahtarları bir 9Router / OmniRoute sağlayıcısı olarak kaydedin |
| `examples/bulk-create.js` | bir betikten toplu anahtar oluşturun |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir router'dır (`npm install -g 9router && 9router`, kontrol paneli `http://localhost:20128` adresinde). Her anahtarı tek komutla kaydedin — `cline` sağlayıcı düğümü yoksa oluşturulur ve her anahtar bir bağlantı olarak eklenir:

```bash
node src/cli.js connect --keys out/cline-keys.txt
```

## 🔌 OmniRoute'a bağlan

[OmniRoute](https://omniroute.online) kendi kendine barındırılan, OpenAI uyumlu bir router'dır (`npm install -g omniroute && omniroute`, kontrol paneli `http://localhost:20128` adresinde). Bağlayıcı orada da aynı işi yapar — `cline` sağlayıcı düğümü yoksa oluşturulur ve `keys.txt` içindeki her anahtar bir bağlantı olarak eklenir:

```bash
node src/connect-omniroute.js                    # every key in keys.txt
node src/connect-omniroute.js --api-key clx-…    # or one key at a time
```

Etkileşimli başlatıcı aynı akışa ulaşır: `node src/launcher.js --connect-omniroute`.

Varsayılanlar: temel `http://localhost:20128`, parola `123456`, önek `cline`, yukarı akış `https://api.cline.bot/api/v1`, varsayılan model `poolside/laguna-s-2.1:free`, `cline` adlı istemci anahtarı. Modeller daha sonra `cline/<model id>` olarak sunulur ve her anahtar arasında yük dengelenir.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **Cline** — [cline.bot](https://cline.bot) · uygulama [app.cline.bot](https://app.cline.bot) adresinde |
| 🎁 Sağlayıcının verdikleri | her anahtarda ücretsiz modeller — bir WorkOS hesabından toplu sk-… anahtarları, captcha yok |
| 🔑 Bir anahtar size ne kazandırır | Cline'in API'sine karşı kimlik doğrulayan bir `sk-…` anahtarı; harcaması **ana hesabın bakiyesini** izler (ücretsiz modeller `200`, ücretli modeller `402`) |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://api.cline.bot/api/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca `api.cline.bot`, `api.workos.com` ve yerel 9Router'ınızla iletişim kurulur; anahtarlar ve WorkOS token'ı makinenizde kalır |

## 🐞 Sorunlar

Cline API biçimini değiştirirse veya Cline/WorkOS istemci kimliğini döndürürse, araç o adımda durur ve bunu bildirir. Çalıştırdığınız komut ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**; PR'lar memnuniyetle karşılanır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 cline-bulk-apikey katkıda bulunanlar

</div>