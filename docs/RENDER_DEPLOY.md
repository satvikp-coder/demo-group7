# Deploying to Render

`render.yaml` at the repository root is a Render Blueprint. It creates three resources in the Singapore region:

| Resource | Type | Purpose |
|---|---|---|
| `heritage-planner-db` | PostgreSQL 17 (free) | Catalog, accounts, saved trips. Private network only. |
| `heritage-planner-api` | Web service, Docker (free) | Express API built from `backend/Dockerfile`. |
| `heritage-planner-web` | Static site | React app. Proxies `/api/*` to the API so the browser stays same-origin. |

The public URLs are `https://heritage-planner-web.onrender.com` (the app) and
`https://heritage-planner-api.onrender.com` (the API). If Render says a name is taken, change it in
`render.yaml` in three places: the service name, `CORS_ORIGIN` and the `/api/*` rewrite destination.

## 1. Prepare two secrets (on your own machine)

**JWT secret.** Production requires at least 48 random characters, and Render's own generator is too short, so make one:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the 96-character output. Do not commit it or share it.

**Groq API key** for the Heritage Guide chatbot: create one at https://console.groq.com/keys. It starts with `gsk_`.
Use the free plan only. The app limits itself to a few model calls per minute and 60 per day per server process.

## 2. Create the Blueprint

1. Push the branch you want to deploy to GitHub (this guide assumes `final-fixes` on `satvikp-coder/demo-group7`).
2. Render dashboard, **New**, **Blueprint**, connect that repository, and choose the branch.
3. Render reads `render.yaml` and lists the database and both services. It asks for the two values marked `sync: false`:
   - `JWT_SECRET`: paste the 96-character value from step 1.
   - `GROQ_API_KEY`: paste your `gsk_...` key. (Leave it empty to run without the chatbot.)
4. Click **Apply**. The first deploy takes several minutes (database, Docker build, static build).

Nothing else is needed: `DATABASE_URL` is wired to the database automatically, and the other settings are in the file.

## 3. What happens on first start

The API container runs `node --import tsx scripts/start.js`, which calls `scripts/bootstrap.js` and then starts the server in the same process. `bootstrap.js`:

1. applies pending database migrations (safe to repeat), and
2. seeds the approved catalog **only if the database has no destinations**. An existing catalog is never reseeded.

In the API service **Logs** you should see: `Migrations are up to date.`, `Empty catalog detected: seeding the approved data once.`,
`Initial seed complete.`, then a `server_start` line.

## 4. Check it works

Replace the host names if you changed them.

| Check | Expected |
|---|---|
| `https://heritage-planner-api.onrender.com/health` | `{"status":"ok",...}` |
| `https://heritage-planner-api.onrender.com/ready` | `{"status":"ready"}` (the database is reachable) |
| `https://heritage-planner-web.onrender.com/api/destinations` | JSON list of 8 destinations (this proves the rewrite) |
| `https://heritage-planner-web.onrender.com/explore` | 8 destination cards |
| Register, sign in, generate a plan | itinerary and budget pages load |

## 5. Chatbot (Heritage Guide)

| Variable | Where it is set | Value |
|---|---|---|
| `GROQ_API_KEY` | API service, **Environment** (secret) | your `gsk_...` key |
| `GROQ_MODEL` | `render.yaml` | `openai/gpt-oss-20b` (default; change only to another Groq model you have access to) |

To add or change the key after deploying: dashboard, `heritage-planner-api`, **Environment**, edit `GROQ_API_KEY`, **Save, rebuild and deploy** (the service restarts to pick it up).

How to confirm it works: sign in, open the chat button, and ask "What is the best time to visit Somnath?". The reply should carry
an AI answer, not "Heritage Guide AI is not configured". Behaviour you will see:

- **No key set:** the chat reports `AI is not configured. Database-only mode remains available.` Everything else works.
- **Key set but Groq rate limit reached:** a friendly "temporary free usage limit" message; try again later.
- **Wrong or revoked key:** "Heritage Guide AI is temporarily unavailable" (the server maps provider errors to this message).

The key is read only by the API. It is never sent to the browser, so do not create a `VITE_GROQ_...` variable.
Optional tuning variables, only if you need them: `CHAT_RATE_LIMIT` (default 6 per minute), `CHAT_DAILY_CALL_LIMIT` (60),
`CHAT_MAX_OUTPUT_TOKENS` (700), `CHAT_TIMEOUT_MS` (15000).

## 6. Free plan limits to expect

- The API service sleeps after about 15 minutes without traffic. The next request waits roughly a minute while it wakes and re-runs the (fast) migration check.
- The free PostgreSQL database expires after 30 days. Back up or upgrade the plan before then if you need the data.
- Rate-limit counters and chat history live in memory and reset when the service restarts.
- Free services have no shell and no pre-deploy command, which is why `bootstrap.js` exists.

## 7. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| API deploy fails with `Missing or invalid environment variables: JWT_SECRET` | The secret was left empty or is under 48 characters. Re-paste the 96-character value. |
| Browser shows "Origin not allowed" or sign-in fails with a network error | `CORS_ORIGIN` must equal the app's exact origin. If Render gave the static site a different URL, update `CORS_ORIGIN`. |
| `/api/...` on the app host returns the HTML page instead of JSON | The rewrite destination does not match the real API URL. Fix the API service name or the `routes` entry. |
| Deploy exits with status 127 and `... not found` | The service still has an old Docker Command. Set it to `node --import tsx scripts/start.js` under **Settings**; a push alone does not change it. |
| `/ready` returns 503 | The database is not reachable or still starting; check the database status and the API logs. |
| Many users get "too many attempts" | Rate limits key on the client IP. `TRUST_PROXY=uniquelocal` assumes Render's proxies use private addresses; if all users appear to share one IP, set `TRUST_PROXY` to the proxy address range shown in Render's connection logs. |

## 8. What was verified here, and what was not

Verified on the development machine:

- the backend Docker image builds and, run with production settings and the exact start command above (`node --import tsx scripts/start.js`) against an empty database, migrates, seeds, and serves `/health`, `/ready` and 8 destinations;
- the production frontend build, behind a proxy that mimics the `/api/*` rewrite and applies the security headers from `render.yaml`, completes register, sign-in, plan generation and the budget page with every API call successful and no browser console or Content-Security-Policy errors;
- the chatbot without a key returns the documented "not configured" response and requires sign-in.

Verified on the live Render deployment (9 November 2026):

- `render blueprints validate render.yaml` reports the file valid;
- the API starts with `node --import tsx scripts/start.js`, `/health` and `/ready` return 200 (so the database is reachable over the internal URL with `DATABASE_SSL=disable`), and `/api/destinations` through the app host returns the 8 destinations;
- Render's `/api/*` rewrite forwards the browser's `Origin` header unchanged: a login attempt from the app origin gets a normal 401 for bad credentials, and the same request from a foreign origin gets 403 "Origin not allowed";
- the app loads with 8 destination cards, the single-page-app fallback works for deep links, the security headers from `render.yaml` are served, and the browser console shows no errors; and
- the chatbot endpoint requires sign-in (401 without a token).

NOT VERIFIED:

- registering a real account and generating a plan on the live site (it would write to the live database; the same flow was exercised against the identical production image and headers locally);
- the live Groq answer, which needs a signed-in user asking a question (see section 5);
- whether `TRUST_PROXY=uniquelocal` matches Render's proxy addresses, which only affects per-user rate limiting.

Lesson from the first deploys: changing `render.yaml` and pushing does not update a service's stored Docker command after the
Blueprint has been created. The first command (`sh -c "..."`) was rejected by Render and kept being used until it was changed
through the Render API (`PATCH /v1/services/<id>` with `serviceDetails.envSpecificDetails.dockerCommand`), or by editing **Docker Command**
under the service's **Settings**. The Render CLI's `services update --start-command` only supports native runtimes, not Docker.

## 9. Operator accounts

Public operator registration is disabled in production. Approving an operator needs `npm run operator:approve -- email` against the database,
which requires a shell (a paid Render plan) or a temporary external database allow-list. Tourist accounts and planning work without it.
