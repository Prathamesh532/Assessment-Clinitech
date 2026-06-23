# JavaScript and SQL Walkthrough

This guide describes the parts you should be able to explain before submitting.

## Request flow

The React application calls `apiRequest()` in `client/src/lib/api.js`. That helper reads the JWT from session storage, adds the Bearer header, calls `fetch`, parses JSON, and throws `ApiError` when the response is unsuccessful.

Express starts in `server/src/server.js`. `app.js` installs security middleware, JSON parsing, CORS, login rate limiting, and route modules. A request then follows this order:

```text
React component -> fetch -> Express route -> auth middleware -> validation -> SQL -> JSON response
```

## Login

`auth.routes.js` selects the account by email using `$1`, which is a PostgreSQL parameter placeholder. The submitted password is compared against the stored bcrypt hash. The JWT contains:

```js
{
  sub: user.id,
  role: user.role,
  clientId: user.client_id
}
```

`auth.js` verifies the signature, issuer, audience, and expiry. `requireRole("ADMIN")` or `requireRole("USER")` then controls access to the route.

## Why SQL parameters matter

Do not build SQL by concatenating user input. This is unsafe:

```js
`SELECT * FROM users WHERE email = '${email}'`
```

The project uses:

```js
query("SELECT * FROM users WHERE email = $1", [email])
```

The PostgreSQL driver sends the SQL and values separately, preventing the email from becoming executable SQL.

## Database connection

`src/db.js` creates a PostgreSQL connection pool. A pool reuses a limited number of connections instead of opening one for every request. The exported `query()` function is used for normal queries. `withTransaction()` is used when several writes must succeed or fail together.

## Patient data protection

Patient report URLs do not accept a client ID. The API uses `request.auth.clientId`, which came from the verified JWT. Therefore, changing a URL cannot select another patient.

The latest report query is:

```sql
SELECT *
FROM health_reports
WHERE client_id = $1
ORDER BY report_date DESC
LIMIT 1;
```

## Search and pagination

The admin client route builds a list of allowed filter conditions. Values still use placeholders. The result query uses `LIMIT` and `OFFSET`, while a separate count query provides `totalPages`.

The database indexes the fields used by frequent searches and report ordering. The composite report index begins with `client_id` because patient history first filters by client and then sorts by date.

## CSV and Excel import

Multer accepts one CSV or Excel file up to 2 MB. `csv-parse` handles CSV rows, `xlsx` handles workbook rows, and Zod checks every value through the same schema. The service confirms every `client_id` exists before writing.

All inserts run inside `withTransaction()`. A failure executes `ROLLBACK`; success executes `COMMIT`. `ON CONFLICT (report_id) DO NOTHING` makes repeated uploads safe.

## React pages

- `login-page.jsx`: controlled email/password inputs and login call.
- `user-dashboard.jsx`: two React Query requests, metric cards, and Recharts trend data.
- `report-history.jsx`: page state and server pagination.
- `admin-clients.jsx`: search/filter state and client table.
- `client-details.jsx`: route parameter and parallel profile/report requests.
- `import-reports.jsx`: file input and mutation request.

React Query handles loading, error, caching, and re-fetch behavior. The code splits pages with `React.lazy`, so the initial browser bundle does not include every route.

## Questions to answer confidently

1. Why is API role checking required when React already hides routes?
2. Why does the patient report endpoint not accept `clientId`?
3. How do `$1` placeholders prevent SQL injection?
4. What is the difference between `COMMIT` and `ROLLBACK`?
5. Why are reports indexed by client and descending date?
6. How does the app avoid duplicate file imports?
7. Why use a connection pool?
8. What happens when the JWT expires?

If you can explain these without reading the code, you can defend the core project honestly.
