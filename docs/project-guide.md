# CareView Project Guide

## 1. What the application solves

CareView turns a healthcare workbook into a secure web application. A patient can register, sign in, and see only their own latest report, report history, doctor note, and changes over time. An administrator signs in to search the client directory, open a client profile, paginate through reports, and upload new report rows as CSV or Excel.

The project demonstrates the assessment's complete ownership requirement: UI, API design, authentication, database constraints, validation, data import, security middleware, testing, deployment configuration, and system documentation.

## 2. Repository structure

```text
client/                   React patient and admin portal
server/src/               Express routes, middleware, services and schemas
server/db/                PostgreSQL SQL migrations
server/scripts/           Original XLSX dataset importer
server/data/              Safe sample CSV and Excel files for the upload demonstration
docs/                     Diagram, Postman collection and decision records
.github/workflows/        Continuous integration checks
```

The monorepo is managed with pnpm workspaces. Root commands can build and verify both applications while each application remains independently deployable.

## 3. Data model

### User

`User` exists only for authentication and authorization. It stores a unique email, bcrypt password hash, role, and optional client link. An admin has no client link. A patient user links one-to-one to a client profile.

### Client

`Client` contains the supplied demographic and wellness fields. Its integer identifier is preserved from the workbook so imported health reports can reference it directly.

### HealthReport

`HealthReport` preserves every supplied measurement. `report_id` is the primary key, and `client_id` is a foreign key. Deleting a client cascades to reports at the schema level, although the application exposes no client deletion route.

### AuditLog

`AuditLog` records administrator import actions. It intentionally stores flexible metadata as JSON because different operational actions may require different details later.

## 4. Authentication flow

Patient registration uses `/api/auth/register`. A new patient submits full name, email, mobile number, and password. If the email and mobile number match an imported client, the API creates a `USER` account linked to that existing `client_id`. If they do not match any existing client and neither value is already taken, the API creates a new client profile with default optional profile values, no reports yet, and links the login account to it. A new patient sees a guided empty state until an administrator adds a report.

1. The browser posts email and password to `/api/auth/login`.
2. The API finds the account and compares the submitted password with the bcrypt hash.
3. The API signs an expiring JWT containing the account ID, role, and client ID.
4. The browser stores the token for the tab session and sends it in the Bearer header.
5. API authentication middleware verifies the token and adds trusted claims to the request.
6. Role middleware rejects requests that do not match the route's role.
7. Patient queries always use the client ID from the verified token, never a client ID supplied by the browser.

This last point is the important defense against insecure direct object reference attacks.

## 5. Patient workflow

After login, the patient dashboard requests the latest report and a summary concurrently through TanStack Query. The API orders reports by `report_date DESC`, while the trend endpoint returns chronological values for charting.

Metric cards show units, broad reference labels, and movement from the preceding report. The UI explicitly states that these labels are not a diagnosis. The history page requests ten rows at a time using server-side pagination.

## 6. Administrator workflow

The client directory sends search text and filters to the API. Search covers full name, email, and mobile; optional filters cover gender, city, state, and health condition. The API returns rows plus pagination metadata.

Selecting a client loads profile details, the latest report, the total report count, and the first page of report history. The API does not return password hashes or authentication internals.

Admins can add an individual report directly from the client detail page. This is useful for newly registered patients because it demonstrates the full lifecycle without preparing an import file: patient registers, admin searches the client, admin adds a report, and the patient dashboard immediately becomes useful.

## 7. CSV and Excel import workflow

The admin selects a `.csv`, `.xlsx`, or `.xls` file sent as `multipart/form-data` under the field name `file`. Multer enforces type, size, and file-count limits. The service parses headers, validates every row, and verifies all client IDs.

The required headers are:

```text
report_id,client_id,report_date,hemoglobin,vitamin_d,cholesterol,blood_sugar_fasting,creatinine,urine_protein,bmi,doctor_notes
```

If validation fails, the endpoint responds with HTTP 422 and row-level messages without inserting data. Otherwise, rows are inserted in one duplicate-safe operation and the action is audited. `server/data/sample-health-reports.csv` and `server/data/sample-health-reports.xlsx` are ready for the demonstration.

## 8. Original XLSX import

The provided workbook is application bootstrap data rather than an admin upload format. The import command reads the two known sheets, maps the workbook columns to SQL parameters, converts Excel dates, and inserts in batches. It skips existing primary keys so reruns are safe.

The workbook should not be committed. It contains person-like contact details and is excluded by `.gitignore` even if the supplied records are synthetic.

## 9. Error handling

Zod rejects malformed bodies, query parameters, route parameters, and import rows. Expected failures use `HttpError` with an HTTP status and public message. A final Express error handler maps known errors into the same JSON envelope and hides unexpected implementation details. Pino still records the original server-side error.

Example error response:

```json
{
  "error": {
    "message": "Request validation failed",
    "details": {}
  }
}
```

## 10. Testing strategy

The included tests cover JWT claim preservation, CSV coercion, invalid clinical bounds, and frontend formatting. CI runs tests, ESLint, syntax checks, and production builds.

The most valuable next tests would be API integration tests against an isolated PostgreSQL database and Playwright tests for the two complete login workflows. Those were intentionally not substituted with mocks that could conceal database behavior.

## 11. How to demonstrate the project

1. Open the deployed frontend and show the Register tab.
2. Explain that registration creates a patient profile and login account. A brand-new patient starts with a guided empty state until an administrator adds or imports report rows.
3. Sign in as the patient and show that the URL is protected and the server independently enforces the role.
4. Point out the latest report, units, doctor's note, reference labels, and trend chart.
5. Open report history and demonstrate pagination.
6. Sign out and sign in as the admin.
7. Search for a client and open the detailed record.
8. For a newly registered client, use the manual report form to add the first report and show that the patient dashboard now has metrics.
9. Upload the sample Excel workbook once; show the import count.
10. Upload it again; show that duplicate report IDs are skipped.
11. Open the audit trail and show both manual and import actions.
12. Use Postman to call an admin endpoint with a patient token and demonstrate the HTTP 403 response.

## 12. Interview questions to prepare

**Why PostgreSQL instead of MongoDB?** The model is relational, foreign-key integrity matters, and the access paths are predictable. PostgreSQL also gives typed decimals and mature indexing.

**Why separate User and Client?** Authentication lifecycle and patient profile data have different responsibilities. Admin users need accounts but no client record, while a client may exist before portal access is provisioned.

**How does new patient registration work?** Registration collects only full name, email, mobile, and password. It creates a client profile and a linked `USER` account. If the email and mobile already match an imported client, the account links to that record instead of duplicating it. If either value is already used by a different client, the API rejects the request.

**How do you prevent patients reading other reports?** Patient report routes ignore browser-supplied identifiers and use the client ID in the server-verified JWT.

**Why reject the full import file for one bad row?** Operators receive deterministic behavior and do not need to reconcile a silent partial import. A job-based pipeline would be better for very large files.

**How would you scale it?** Move file parsing to a queue worker, use object storage, adopt cursor pagination, add read replicas/caching only after measurement, and introduce monitoring and tracing.

**Is it HIPAA compliant?** No compliance claim should be made from an assessment. The application shows relevant controls, but compliance also requires organizational policies, approved infrastructure, agreements, auditing, retention, incident response, and formal review.
