# Footwear E-Commerce Platform

Production-oriented foundation for a mobile-first footwear storefront, customer portal, admin UI, and REST API. This repository intentionally contains infrastructure and boundaries rather than finished commerce features.

## Architecture

- `apps/web` — Next.js App Router storefront, account, checkout, and admin route shells. React Server Components are the default; TanStack Query is available only for interactive server state.
- `apps/api` — NestJS REST API with `/api` prefix, Zod environment validation, global request validation/error handling, Swagger, Prisma, Redis/BullMQ configuration, and `GET /api/health`.
- `packages/database` — PostgreSQL/Prisma schema, generated client boundary, migration, and local extension initialization.
- `packages/shared` — framework-neutral Zod contracts, types, and domain constants.
- `packages/config` — strict shared TypeScript defaults.
- `tests/e2e` — Playwright cross-application test foundation.

Products are merchandising parents. `ProductVariant` is the sellable SKU and exclusively owns inventory, regional size values, and optional price overrides. Media can be product-wide or variant-specific. This prevents product-level stock from becoming authoritative.

Search stays inside PostgreSQL. The initial migration enables `pg_trgm`; PostgreSQL full-text search is built in and future search migrations can add generated `tsvector` columns, GIN indexes, dictionaries, and synonym tables when search behavior is defined.

Better Auth provides email/password identity and database-backed cookie sessions through Next.js. NestJS validates the same sessions for protected account and admin boundaries. Customer profiles and ownership-scoped addresses are persisted separately from provider identity records; guest checkout remains independent of authentication.

The cart supports both authenticated customers and guests. Guest carts are identified by a random HTTP-only cookie while only its hash is stored in PostgreSQL. Cart lines reference sellable variants, and the API owns pricing, stock validation, totals, and transactional guest-to-customer merging. Cart quantities do not reserve or decrement inventory.

Checkout converts the current guest or customer cart into an immutable order inside a serializable transaction. Current catalog prices and stock are revalidated, inventory is conditionally decremented, order/contact/address snapshots are created, and the cart is cleared only on commit. Initial delivery is an internal standard-delivery method and payment is cash on delivery; no payment or courier provider is integrated.

## Prerequisites

- Node.js 20.19+ (Node 22 LTS recommended)
- pnpm 10 (`corepack enable` then `corepack prepare pnpm@10.15.1 --activate`)
- Docker with Docker Compose

## Setup

```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Open the web app at `http://localhost:3000`, API health at `http://localhost:4000/api/health`, and development Swagger UI at `http://localhost:4000/api/docs`.

The checked-in migration is suitable for a clean database. For later schema changes, edit `packages/database/prisma/schema.prisma`, run `pnpm db:migrate`, name the migration, and commit both schema and migration. Use `pnpm db:studio` to inspect local data.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run web and API watchers |
| `pnpm dev:web` / `pnpm dev:api` | Run one application |
| `pnpm build` | Build all workspaces |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | Strict TypeScript checks |
| `pnpm test` | Unit and API smoke tests |
| `pnpm test:e2e` | Playwright storefront smoke test |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Create/apply a development migration |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed the development footwear catalog |

## Environment

Copy `.env.example` to `.env`. Local defaults cover web/API URLs, PostgreSQL, and Redis. Replace `BETTER_AUTH_SECRET` with a random value of at least 32 characters. Configure `S3_*` only when object storage is introduced; the variables are provider-neutral. `NEXT_PUBLIC_GTM_ID` and `NEXT_PUBLIC_GA_MEASUREMENT_ID` are optional and analytics are disabled outside production.

Never commit `.env` or credentials. The application must never store raw payment card data or log authentication/payment secrets.

## Verification

```bash
pnpm db:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI repeats these checks and applies migrations against ephemeral PostgreSQL. Production deployment, payment/courier providers, checkout, workers, media SDKs, and search ranking are intentionally deferred until their feature requirements are implemented.
