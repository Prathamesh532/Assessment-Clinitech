# CareView Healthcare Dashboard

CareView is a full-stack healthcare report portal with separate patient and administrator experiences. Patients can review their latest report, historical results, and metric trends. Administrators can search clients, inspect client records, import report CSV/Excel files, and review an audit trail.

## Technology

- React 19, Vite, JavaScript, TanStack Query, Recharts
- shadcn/ui registry components for cards, buttons, inputs, badges, Radix selects, and tables
- Node.js, Express 5, JavaScript, Zod
- PostgreSQL with parameterized SQL through `pg`
- JWT authentication, bcrypt password hashing, RBAC
- Vitest, ESLint, Docker Compose, GitHub Actions

## Local Setup

Requirements: Node.js 22+, pnpm 11+, and Docker Desktop (or an existing PostgreSQL database).

```bash
git clone <repository-url>
cd careview-health-dashboard
pnpm install
docker compose up -d
copy server\.env.example server\.env
copy client\.env.example client\.env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:5173`. The API health endpoint is `http://localhost:4000/health`.

Demo credentials:

| Role | Email | Password |
|---|---|---|
| Patient | `user1@example.com` | `User@12345` |
| Administrator | `admin@careview.local` | `Admin@12345` |

Change all seeded passwords before using a public deployment.

## Import the Supplied Dataset

The import script expects an XLSX workbook containing `clients` and `health_reports` sheets. Pass the workbook path explicitly:

```bash
pnpm data:import -- "C:\Users\prath\Downloads\healthcare dataset (2).xlsx"
```

For a full demonstration, run the workbook import after migration and then run the demo seed to provision login accounts. Inserts are batched and duplicate IDs are skipped.

## Useful Commands

```bash
pnpm dev             # frontend and API in watch mode
pnpm build           # production builds
pnpm test            # API and frontend tests
pnpm lint            # ESLint checks
pnpm db:seed         # demo accounts and reports
pnpm data:import -- <path-to-xlsx>
```

## API Overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a patient profile and login account |
| POST | `/api/auth/login` | Public | Obtain JWT access token |
| GET | `/api/auth/me` | Authenticated | Current profile |
| GET | `/api/reports/me/latest` | Patient | Latest report |
| GET | `/api/reports/me` | Patient | Paginated report history |
| GET | `/api/reports/me/summary` | Patient | Trend and averages |
| GET | `/api/admin/clients` | Admin | Search/filter clients |
| GET | `/api/admin/clients/:id` | Admin | Client detail |
| GET | `/api/admin/clients/:id/reports` | Admin | Client reports |
| POST | `/api/admin/clients/:id/reports` | Admin | Add a report manually for a client |
| POST | `/api/admin/reports/import` | Admin | CSV or Excel report import |
| GET | `/api/admin/audit-logs` | Admin | Import audit history |

All protected requests require `Authorization: Bearer <token>`.

Patient registration asks for full name, email, mobile number, and password. It creates a `USER` account and links it to a client profile. If the email and mobile match an existing imported client, that client is claimed. Otherwise a new client profile is created with sensible default profile values and no health reports yet. Admins can add the first report manually from the client detail page or upload reports through CSV/Excel import.

The admin import screen accepts both `server/data/sample-health-reports.csv` and `server/data/sample-health-reports.xlsx`.

## Submission Documents

- [Architecture diagram](docs/architecture.png)
- [Technical decisions](docs/technical-decisions.md)
- [Detailed project guide](docs/project-guide.md)
- [JavaScript and SQL walkthrough](docs/javascript-sql-walkthrough.md)
- [Deployment guide](docs/deployment.md)
- [Postman collection](docs/CareView.postman_collection.json)

## Deployment

The intended deployment is Render for the API/database and Vercel for the React client.

1. Deploy the API from `render.yaml`. It provisions `careview-api` and `careview-db`.
2. Set Render secrets: `JWT_SECRET`, `CLIENT_ORIGIN`, and `CLIENT_ORIGINS`.
3. Deploy Vercel with root directory `client`.
4. Set Vercel `VITE_API_URL` to `<render-url>/api`.
5. Seed demo accounts once against the deployed database.
6. Run the Postman collection and manually verify both role workflows.

See [Deployment guide](docs/deployment.md) for the exact commands and smoke-test checklist.

Free-tier policies change; verify current provider limits before deployment.

## Security Scope

This assessment demonstrates application security controls, but it is not represented as HIPAA-compliant. A real clinical deployment would additionally require managed secrets, encryption key governance, short-lived/rotated sessions, consent and retention policies, immutable audit storage, monitoring, backups, incident response, and a signed compliance review.
