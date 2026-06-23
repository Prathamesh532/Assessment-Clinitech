# Technical Decisions

## Architecture and stack

The application uses a separately deployable React client and Express API. Although Next.js could host both UI and server routes, the assessment explicitly requests Node.js with Express. Keeping the API independent makes that responsibility visible, avoids mixing browser and server concerns, and permits each service to scale or deploy separately.

JavaScript is used throughout because it matches the team's existing React and Express experience and keeps the assessment easy to maintain. PostgreSQL was chosen over MongoDB because the source naturally represents a one-to-many relationship: one client owns many health reports. Foreign keys, unique constraints, decimal types, and transactions are valuable for this data.

The API uses the standard `pg` driver with parameterized SQL instead of an ORM. This keeps joins, indexes, pagination and transactions visible, while placeholders such as `$1` prevent SQL injection. Versioned SQL files provide repeatable migrations. Clinical measurements use database decimal columns and are converted to JSON numbers at the API boundary.

The frontend uses shadcn/ui registry components for common surfaces such as cards, buttons, inputs, badges, Radix selects, and tables. The components are copied into the repository, which is the standard shadcn/ui model, so the app keeps full source ownership while still following the registry's Tailwind and CSS-variable conventions.

## Authentication and authorization

Passwords are hashed with bcrypt using a cost factor of 12. Patient registration collects only the fields needed to create access: full name, email, mobile number, and password. If the supplied email and mobile match an imported client, the account links to that record; otherwise a new client profile is created with default optional profile values and no reports yet. Each client can have only one portal account. A successful registration or login returns a signed JWT containing only the user identifier, role, and linked client identifier. The API verifies issuer, audience, signature, and expiration for every protected request.

Authorization is enforced in the API, not only in React. Patient routes require the `USER` role and derive the client identifier from the verified token, preventing a patient from requesting another client's record. Administrative routes require `ADMIN`. Frontend route guards improve usability but are not treated as a security boundary.

Tokens use session storage so closing the browser tab clears the session. This is a practical assessment tradeoff. A higher-security production system would use short-lived access tokens held in memory and rotated refresh tokens in secure, HTTP-only, same-site cookies.

## CSV and Excel import

CSV and Excel uploads are held in memory with a 2 MB limit. The same import contract is used for `.csv`, `.xlsx`, and `.xls`: exact headers, typed fields, permitted urine-protein values, sensible broad bounds, and note length. Referenced clients are checked before insertion. If any validation error exists, no rows are inserted and row-level errors are returned. Valid rows are inserted with parameterized SQL inside a database transaction, and duplicate report IDs use `ON CONFLICT DO NOTHING`.

This approach favors predictable behavior over partially importing a damaged file. For much larger imports, the design would move processing to object storage and a background queue, produce an import job identifier, and stream validation results.

## Search, pagination, and indexing

Search and pagination run on the server so the browser never loads all 5,000 clients or 24,882 reports. The database indexes client name, city, state, report date, and the composite `(client_id, report_date DESC)` access path used for latest/history queries. Emails, mobile numbers, and report identifiers are unique.

Offset pagination is easy to understand and sufficient for this dataset. Cursor pagination would be preferable for very large or rapidly changing report feeds.

## Additional features

The first additional feature is the patient trend dashboard. The API calculates summary averages and returns time-ordered measurements; the client renders longitudinal cholesterol and fasting-sugar trends. This demonstrates useful transformation without placing clinical diagnosis logic in the application.

The second additional feature is admin report operations. Admins can upload reports in CSV/Excel batches or add a single report from the client detail page. The manual path makes the new-patient registration workflow complete without requiring file preparation.

The third additional feature is an audit trail. File imports and manual report creation record the administrator, outcome, row or entity details, IP address, and timestamp. This gives operators traceability and demonstrates a healthcare-relevant operational concern.

## Operational considerations

Environment variables are validated at process startup. Helmet applies secure HTTP headers, CORS permits only the configured web origin, login attempts are rate limited, request bodies and uploads have size limits, and errors return consistent messages without exposing stack traces.

The repository includes Docker-based local PostgreSQL, a production API Dockerfile, Render and Vercel configuration, migrations, seed data, tests, and a GitHub Actions workflow. Logging uses structured Pino output so hosted logs remain searchable.

This is a production-oriented assessment, not a claim of regulatory compliance. Real protected health information would require a formal threat model, encryption and key policies, immutable auditing, retention controls, backups, monitoring, incident response, provider agreements, and legal/compliance approval.
