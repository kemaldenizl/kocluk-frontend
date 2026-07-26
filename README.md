# Koçluk Frontend

A web application built with [Next.js](https://nextjs.org) (App Router) + React 19 + TypeScript + Tailwind CSS.

## Requirements

- **Node.js 22** (pinned via [`.nvmrc`](.nvmrc) — `nvm use` is enough)
- **npm** (the repo uses `package-lock.json`)
- A running **backend API** (default: `http://localhost:8080`)

## Setup

If you're running the project for the first time, follow these steps in order:

```bash
# 1. Clone the repo
git clone https://github.com/kemaldenizl/kocluk-frontend.git
cd kocluk-frontend

# 2. Switch to the correct Node version
nvm use          # if missing: nvm install 22

# 3. Install dependencies
npm ci

# 4. Configure environment variables
cp .env.example .env.local
# Update BACKEND_API_URL in .env.local with your own backend address
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The page updates automatically as you save files.

## Production

```bash
npm run build    # optimized production build
npm run start    # runs the build (default: http://localhost:3000)
```

> **Note:** `npm run start` requires `npm run build` to be run first.
> In production, the `BACKEND_API_URL` environment variable must be defined.

## Useful commands

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Development server (hot reload)           |
| `npm run build`         | Production build                          |
| `npm run start`         | Production server (after build)           |
| `npm run lint`          | Lint code with ESLint                     |
| `npm run typecheck`     | TypeScript type checking                  |
| `npm run test`          | Run the tests                             |
| `npm run test:coverage` | Run the tests with a coverage report      |

## Environment variables

| Variable          | Required | Description                                                     |
| ----------------- | -------- | -------------------------------------------------------------- |
| `BACKEND_API_URL` | Yes      | Backend API address. Used **only on the server side**; never exposed to the browser. |

## CI/CD and Deploy

- **GitHub Actions** runs on every pull request and push to `main`: lint, type checking, tests, and build.
- Deployment is automated via **Vercel**: previews for PRs, production on merge to `main`.
- For details: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Warnings

- `.env.local` is **never committed** (ignored by git). Use it for secrets.
- `BACKEND_API_URL` is for server-side use only; do not add it as a browser-exposed variable.
- When installing dependencies, prefer `npm ci` over `npm install` — it provides an exact, reproducible install that matches the lock file.
