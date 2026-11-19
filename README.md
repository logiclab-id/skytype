# TYPELY

A simple, zero-history SaaS for bundling API responses and text snippets—complete with formatters (JSON, YAML, and more)—into a single **end-to-end (E2E) encrypted** shareable link.

Paste your content, format it, click share, and get a link. No accounts, no history, no server-side access to your data.

## Core Concept

- **Bundle Anything**: Combine API responses, payloads, headers, logs, or plain text notes into a single shareable bundle.
- **Built-in Formatters**: Cleanly format and view blocks as **JSON**, **YAML**, or plain text.
- **End-to-End Encrypted (E2E)**:
  - Encryption and decryption happen **100% client-side** in the browser (e.g., Web Crypto API `AES-GCM`).
  - The server only stores opaque encrypted ciphertext—never plaintext.
  - The decryption key is placed in the URL fragment (`#<key>`), which browsers never send to the server.
- **Zero History**: No user accounts, no saved history, and no dashboard. As long as you have the link, you can access and decrypt the bundle.

## Tech Stack

- **Frontend (`apps/web`)**: React 19, Vite, TypeScript
- **Backend (`apps/api`)**: ASP.NET Core (`net8.0` currently configured locally)

## Project Structure

```text
TYPELY/
├── apps/
│   ├── api/                 # ASP.NET Core Web API (opaque ciphertext storage & retrieval)
│   │   ├── src/
│   │   │   ├── app.cs       # DI, CORS, middleware setup
│   │   │   ├── routes.cs    # API route registration
│   │   │   ├── db/          # Database context & setup
│   │   │   ├── middlewares/ # Custom middlewares
│   │   │   ├── modules/     # Feature modules
│   │   │   └── utils/       # Shared helpers
│   │   └── program.cs
│   └── web/                 # React + Vite + TypeScript frontend
│       └── src/
│           ├── components/  # Reusable UI components
│           ├── core/        # Core utilities (crypto, formatters, API client)
│           ├── hooks/       # Custom React hooks
│           ├── modules/     # Feature modules (bundler, viewer, formatter)
│           ├── routes/      # App routing
│           ├── stores/      # Client state management
│           └── types/       # Shared TypeScript types
├── AGENTS.md                # Guidelines for AI coding agents
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (package manager & runtime)
- .NET SDK (currently `net8.0` in `apps/api/api.csproj`)

### Run Both (Backend + Frontend) from Root

```bash
bun install
bun run dev
```

- **Backend (`apps/api`)**: `http://localhost:5000` (health check: `GET /api/health`)
- **Frontend (`apps/web`)**: `http://localhost:5173` (`/api` proxied to `http://localhost:5000`)

Or run individually:

```bash
bun run dev:api   # Backend only
bun run dev:web   # Frontend only
bun run build     # Build both API and Web
```
