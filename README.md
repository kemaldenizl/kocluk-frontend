# Koçluk Frontend

[Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript + Tailwind CSS ile geliştirilen web uygulaması.

## Gereksinimler

- **Node.js 22** (proje [`.nvmrc`](.nvmrc) ile sabitlenmiştir — `nvm use` yeterli)
- **npm** (repo `package-lock.json` kullanır)
- Çalışan bir **backend API** (varsayılan: `http://localhost:8080`)

## Kurulum

Projeyi ilk kez çalıştırıyorsan sırayla:

```bash
# 1. Repoyu klonla
git clone https://github.com/kemaldenizl/kocluk-frontend.git
cd kocluk-frontend

# 2. Doğru Node sürümüne geç
nvm use          # yoksa: nvm install 22

# 3. Bağımlılıkları kur
npm ci

# 4. Ortam değişkenlerini ayarla
cp .env.example .env.local
# .env.local içindeki BACKEND_API_URL'i kendi backend adresinle güncelle
```

## Geliştirme

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini aç. Dosyaları kaydettikçe sayfa otomatik güncellenir.

## Production

```bash
npm run build    # optimize edilmiş üretim derlemesi
npm run start    # derlemeyi çalıştırır (varsayılan: http://localhost:3000)
```

> **Not:** `npm run start`, önce `npm run build` çalıştırılmasını gerektirir.
> Production'da `BACKEND_API_URL` ortam değişkeninin tanımlı olması zorunludur.

## Faydalı komutlar

| Komut                   | Açıklama                                  |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Geliştirme sunucusu (hot reload)          |
| `npm run build`         | Production derlemesi                      |
| `npm run start`         | Production sunucusu (build sonrası)       |
| `npm run lint`          | ESLint ile kod kontrolü                   |
| `npm run typecheck`     | TypeScript tip kontrolü                   |
| `npm run test`          | Testleri çalıştırır                       |
| `npm run test:coverage` | Testleri coverage raporuyla çalıştırır    |

## Ortam değişkenleri

| Değişken          | Zorunlu | Açıklama                                                        |
| ----------------- | ------- | -------------------------------------------------------------- |
| `BACKEND_API_URL` | Evet    | Backend API adresi. **Sadece sunucu tarafında** kullanılır, tarayıcıya sızmaz. |

## CI/CD ve Deploy

- Her pull request ve `main`'e push'ta **GitHub Actions** çalışır: lint, tip kontrolü, test ve build.
- Deploy **Vercel** üzerinden otomatiktir: PR'lar için preview, `main`'e merge'te production.
- Detaylar için: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Uyarılar

- `.env.local` **asla commit'lenmez** (git tarafından yok sayılır). Gizli bilgiler için kullan.
- `BACKEND_API_URL` yalnızca sunucu tarafı içindir; tarayıcıya açılan bir değişken olarak eklemeyin.
- Bağımlılık kurarken `npm install` yerine `npm ci` tercih edin — lock dosyasıyla birebir, tekrarlanabilir kurulum sağlar.
