# AGENTS.md

Instructions and architectural invariants for AI coding agents working on **SKYTYPE**.

## Product Overview

SKYTYPE is a minimal, zero-history SaaS for bundling API responses and text snippets with formatters (JSON, YAML, etc.) into a single **end-to-end (E2E) encrypted** shareable link.

User flow:
1. User enters/pastes one or more text/API response blocks and selects/applies formatters (JSON, YAML, etc.).
2. User clicks **Share** — the bundle is serialized and encrypted **in the browser**, the ciphertext is uploaded to the API, and a shareable link is returned with the decryption key in the URL hash fragment (`#<key>`).
3. Anyone with the link fetches the ciphertext from the API and decrypts it locally in the browser.

## Non-Negotiable Invariants

1. **Strict Client-Side E2E Encryption**:
   - Plaintext bundle content and encryption keys **MUST NEVER** be sent to the backend.
   - Encryption/decryption must run in the browser (e.g., Web Crypto API `AES-GCM`).
   - Decryption keys must live in the URL fragment (`window.location.hash`), **never** in URL query parameters or HTTP request bodies/headers.
2. **Zero History / Stateless Privacy**:
   - Do not add user accounts, login flows, or per-user history lists.
   - The backend must treat stored payloads as opaque ciphertext blobs keyed by an unguessable random ID—no server-side parsing, indexing, or logging of bundle contents.
3. **Keep It Simple**:
   - Avoid unnecessary complexity or over-engineering. Prioritize fast paste → format → encrypt → share UX.

## Repository Structure & Conventions

### Frontend (`apps/web`)
- **Stack**: React 19 + Vite + TypeScript (`strict: true`).
- **Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json` and `vite.config.ts`).
- **API calls**: Use relative `/api/...` paths; Vite proxies `/api` to `http://localhost:5000` in development.
- **Directory roles**:
  - `src/core/` — crypto helpers, formatters (JSON, YAML, etc.), API client
  - `src/modules/` — feature-specific views and logic (editor/bundler, shared link viewer)
  - `src/components/` — shared UI components
  - `src/hooks/` — reusable React hooks
  - `src/stores/` — client state
  - `src/routes/` — route definitions
  - `src/types/` — TypeScript interfaces/types

### Backend (`apps/api`)
- **Stack**: ASP.NET Core Web API (`apps/api/api.csproj`).
- **Entry & Wiring**:
  - `program.cs` calls `ConfigureServices()`, `ConfigureMiddleware()`, and `MapApiRoutes()`.
  - `src/app.cs` configures DI, CORS (`FrontendCors` for `http://localhost:5173`), and middleware.
  - `src/routes.cs` maps `/api` route groups.
  - `src/db/` contains `AppDbContext` (`context.cs`) and DB registration (`index.cs`).
  - `src/modules/`, `src/middlewares/`, `src/utils/` hold feature endpoints, middleware, and utilities.

## Build & Verification

Run from the repository root (note: on Windows PowerShell with script execution restricted, use `bun.cmd` instead of `bun`):

- **Full build (API + Web)**:
  ```powershell
  bun.cmd run build
  ```
- **Individual builds**:
  ```powershell
  bun.cmd run build:api   # dotnet build apps/api/api.csproj
  bun.cmd run build:web   # tsc --noEmit && vite build in apps/web
  ```
