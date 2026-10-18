# Tech Stack

## 1. Stack Summary

| Layer | Choice | Version/Constraint | PRD Source | Rationale |
|---|---|---|---|---|
| Customer/admin UI | React | Existing repository uses React 19; do not upgrade without approval | §3 Frontend and repository | Required component model |
| Build tool | Vite | Existing repository uses Vite 8 | Existing repository | Preserve established scaffold |
| Styling | Tailwind CSS plus css-loader where required | Select versions compatible with React/Vite | §3 Frontend | Required visual implementation stack |
| HTTP/data | Axios and React Query | Compatible maintained releases | §3 Frontend | REST transport and server-state cache |
| Client state | Zustand | Compatible maintained release | §3 Frontend | Small client-only/session UI state |
| Carousel | Swiper | Compatible maintained release | §3 and §7.2 | Hero carousel |
| Server | Node.js and Express.js | Hostinger-supported maintained Node LTS | §3 Backend; user decision | One web application and REST API |
| Database | MySQL | Hostinger-supported version | §3 Database | Relational domain and transactions |
| Authentication | MySQL-backed server sessions in Secure HttpOnly cookies | Same-origin | User decision 2026-10-18 | Revocable secure sessions without client token storage |
| File storage | Hostinger local persistent uploads | V1 only | User decision 2026-10-18 | Minimum infrastructure |
| Hosting | Hostinger web app | No VPS; no Docker | §3 and §36 | Required deployment target |

## 2. Approved Libraries and Services

The PRD-approved frontend libraries and existing React/Vite/ESLint packages are allowed. An implementation task may propose narrowly necessary packages for MySQL access, sessions, password hashing, multipart uploads, validation, migrations, and testing; it must document the choice before installation and avoid overlapping libraries.

## 3. Prohibited or Replaced Technologies

TypeScript migration, Next.js, alternate frontend frameworks, NoSQL, microservices, Redis, Elasticsearch, Docker, VPS-only services, and automated payment gateways are not approved. Do not replace Axios, Zustand, React Query, Swiper, Express, or MySQL without a project decision and user approval.

## 4. Runtime and Environment Matrix

| Environment | Client | Server | Database | Uploads | Secrets |
|---|---|---|---|---|---|
| Local | Vite dev server | Node/Express | Local/test MySQL | Local non-production directory | Local ignored env |
| Test | Built or test DOM | Test Express instance | Isolated MySQL database | Temporary test directory | Test-only values |
| Production | Static build served by Express | Hostinger Node app | Hostinger MySQL | Persistent Hostinger directory | Hostinger environment settings |

## 5. Package and Version Policy

Commit lockfile changes with the task that adds a dependency. Pin runtime compatibility to the actual Hostinger plan before deployment. Prefer maintained stable releases and one library per concern. Do not perform opportunistic upgrades.

## 6. Stack Change Gate

Any new dependency needs a bounded rationale, ownership, security check, and verification. Architecture, persistence, authentication, storage, or hosting changes need an approved `DEC-*` record and explicit user approval.
