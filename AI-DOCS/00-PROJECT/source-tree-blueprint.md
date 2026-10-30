# Source Tree Blueprint

## 1. Planned Tree

```text
Press Store/
├── package.json                     # one dependency graph and script surface
├── vite.config.js                   # client build and local /api proxy
├── index.html
├── src/                             # React client
│   ├── app/                         # app bootstrap, providers, route-manifest loader
│   ├── routes/                       # FND-owned React Router composition
│   ├── features/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── homepage/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── settings/
│   │   └── admin-dashboard/
│   ├── shared/                      # UI, HTTP, formatting, and cross-feature primitives
│   ├── assets/
│   └── main.jsx
├── server/
│   └── src/
│       ├── app/                     # Express creation and feature-router loader
│       ├── config/                  # validated environment access
│       ├── platform/                # db, sessions, errors, storage, logging
│       ├── features/                # same feature slugs; controllers/services/repos/migrations
│       ├── jobs/                    # scheduler entry and feature job registration
│       └── server.js
├── tests/
│   ├── integration/                 # cross-feature API/database scenarios
│   ├── e2e/                         # release smoke scenarios
│   ├── fixtures/
│   └── helpers/
├── public/                          # versioned public assets only; never user uploads
├── uploads/                         # runtime-only local storage; ignored except placeholder policy
├── scripts/                         # migration, admin bootstrap, and operational commands
└── AI-DOCS/                         # implementation source of truth
```

Each server feature contains only the directories it needs: `routes/`, `controllers/`, `services/`, `repositories/`, `schemas/`, `migrations/`, `jobs/`, and `tests/`. Client features use `pages/`, `components/`, `hooks/`, `api/`, `state/`, and `tests/`. Files are created only by their planned tasks.

## 2. Directory Responsibilities

| Path | Purpose | Owner | Allowed Contents | Must Not Contain |
|---|---|---|---|---|
| `src/app/` | React providers, route discovery, error boundary | FND | App-only composition and provider wiring | Business rules or feature UI |
| `src/routes/` | React Router manifest composition | FND | `RouterApp` and route-only tests | Feature pages, feature navigation, or business rules |
| `src/features/<slug>/` | Feature-owned customer/admin UI | Named feature | Pages, components, hooks, API adapters, focused tests | Another feature's canonical types or business rules |
| `src/shared/ui/` | Reusable visual primitives and states | UI | Tokens, buttons, fields, layouts, accessibility helpers | Business feature behavior |
| `src/shared/api/` | Axios instance and error normalization | FND | Transport configuration only | Feature endpoint functions |
| `src/shared/lib/` | Pure generic helpers | FND | Money/date/phone display helpers with tests | Database or network access |
| `server/src/app/` | Express composition and router discovery | FND | Middleware order, health endpoint, feature manifest loader | Feature handlers or SQL |
| `server/src/config/` | Validated server configuration | FND | Environment schema and typed access object | Secret literals or client imports |
| `server/src/platform/db/` | Pool, transactions, migration runner | FND | MySQL infrastructure | Domain queries |
| `server/src/platform/auth/` | Session store and authentication primitives | AUTH | Cookie/session infrastructure and guards | Feature-specific permission rules beyond customer/admin boundary |
| `server/src/platform/storage/` | Replaceable local upload adapter | FND | Safe file validation, naming, persistence, deletion | Product/homepage business decisions |
| `server/src/platform/http/` | Validation/error/request primitives | FND | Stable response/error middleware | Domain policies |
| `server/src/features/<slug>/` | Feature API, services, data, migrations | Named feature | Feature-owned routes, entities, queries, jobs, tests | Another feature's writes |
| `server/src/jobs/` | Minimal job runner/registry | FND | Registration and execution shell | Feature expiry logic, which remains under ORD |
| `tests/integration/<slug>/` | Cross-layer feature tests | Named feature | API/database scenarios for that owner | Another owner's fixtures without contract use |
| `tests/e2e/` | Release and integration scenarios | FND | Named cross-feature smoke tests | Unit-level duplication |
| `scripts/` | Controlled operational entry points | FND/AUTH | Migration and single-admin bootstrap commands | Business logic duplicates or embedded credentials |
| `public/` | Build-time public assets | UI | Favicons and immutable bundled assets | Runtime uploads |
| `uploads/` | Runtime local image persistence | FND runtime | Validated generated filenames | Source assets, secrets, executable uploads |

## 3. Dependency Direction

Client pages depend on feature components/hooks, which depend on feature API adapters and shared UI/transport primitives. Shared modules never import feature modules. Server routes depend on controllers, controllers on services, services on feature repositories and named external contracts, and repositories on the FND database interface. HTTP and database platform code never imports feature code except through the app's manifest discovery seam. Cross-feature calls use documented service/API contract IDs; direct repository or table access across owners is prohibited.

## 4. Naming Conventions

- Directories and non-component JavaScript files: `kebab-case`; React components/pages: `PascalCase.jsx`; hooks: `useName.js`.
- REST paths use plural lowercase nouns under `/api/v1`; JSON fields use `camelCase`; database objects use `snake_case`.
- Primary keys are `<entity>_id`; foreign keys repeat the referenced key; timestamps end `_at` and store UTC.
- SQL migrations: `<feature>_<sequence>_<imperative_description>.sql`, unique repository-wide.
- Tests mirror the source basename with `.test.js`; integration cases use `<behavior>.integration.test.js`.
- Feature manifests expose stable route/job registration without requiring consumer edits.

## 5. Feature-to-Path Map

| Feature | Primary Paths | Shared Paths | Test Paths |
|---|---|---|---|
| FND | `src/app/**`, `src/shared/api/**`, `src/shared/lib/**`, `server/src/app/**`, `server/src/config/**`, `server/src/platform/{db,http,storage,observability}/**`, `scripts/migrate*` | Root manifests/config | `tests/{helpers,e2e}/**`, FND colocated tests |
| UI | `src/shared/ui/**`, `src/styles/**`, `src/assets/**` | `public/**` | `src/shared/ui/**/*.test.js`, responsive manual evidence |
| AUTH | `src/features/auth/**`, `server/src/features/auth/**`, `server/src/platform/auth/**`, `scripts/bootstrap-admin*` | Auth guards exposed as contracts | `tests/integration/auth/**` |
| CAT | `src/features/catalog/**`, `server/src/features/catalog/**` | FND storage adapter | `tests/integration/catalog/**` |
| SET | `src/features/settings/**`, `server/src/features/settings/**` | Read-only settings contracts | `tests/integration/settings/**` |
| HOME | `src/features/homepage/**`, `server/src/features/homepage/**` | UI and storage contracts | `tests/integration/homepage/**` |
| CART | `src/features/cart/**`, `server/src/features/cart/**` | AUTH/CAT contracts | `tests/integration/cart/**` |
| ORD | `src/features/orders/**`, `server/src/features/orders/**` | CART/CAT/SET/AUTH contracts; FND job registry | `tests/integration/orders/**` |
| CUS | `src/features/customers/**`, `server/src/features/customers/**` | Read-only AUTH/ORD projections | `tests/integration/customers/**` |
| ADM | `src/features/admin-dashboard/**`, `server/src/features/admin-dashboard/**` | UI shell and read-only metrics contracts | `tests/integration/admin-dashboard/**` |

## 6. Generated and Manual Files

`dist/`, coverage, logs, upload contents, and temporary test data are generated and ignored. Lockfiles are generated but committed. SQL migrations, source, fixtures, documentation, and operational scripts are manually reviewed. Never edit generated build artifacts to implement behavior.

## 7. Configuration and Secrets Boundaries

Only `server/src/config/` reads environment variables. Expected secret names include `DATABASE_URL` or discrete MySQL settings, `SESSION_SECRET`, bootstrap admin phone/password input, and upload root. Client-exposed Vite variables must be explicitly public and contain no credentials. `.env*` with real values, session data, logs, and uploads are untracked.

## 8. Change Rules

Feature work may create/edit only its mapped paths and named documentation files. Root manifests, app composition, shared UI, database platform, session platform, storage platform, and job registry retain their owners. A cross-owner change stops until the owner task and consumers are approved together. The blueprint describes future implementation and does not authorize moving existing source outside a selected task.
