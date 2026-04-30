# CloudSentinel

CloudSentinel is a full-stack DevSecOps platform for registering GitHub repositories, running SAST scans with SonarQube, storing findings in PostgreSQL, and visualizing security/compliance analytics in a React frontend.

---

## What Is Implemented

- JWT auth (email/password), Google sign-in, forgot/reset password.
- Project onboarding (GitHub repo + optional PAT), project listing, project details, delete.
- Real SAST execution pipeline (`git clone` -> optional Maven build -> `sonar-scanner` -> ingest issues -> compute score).
- Scan lifecycle tracking with `RUNNING -> COMPLETED/FAILED` in `scan_history`.
- Sonar-backed metrics in UI (bugs, vulnerabilities, hotspots, smells, coverage, duplications, LOC).
- OWASP Top 10 + CIS mapping from findings.
- Security/compliance report export (readable HTML + JSON technical export).
- Dashboard and compliance analytics pages wired to live project/scan data.

---

## Architecture

| Layer | Main Tech | Purpose |
|---|---|---|
| Frontend | React + Vite + Tailwind + Recharts | Dashboards, project management, scan views, compliance/reporting UI |
| Backend | Node.js + Express | Auth, project APIs, scan orchestration, metrics/compliance/report APIs |
| Database | PostgreSQL | Users, projects, scan history, scan results, reset tokens |
| SAST Engine | SonarQube + Sonar Scanner CLI | Static analysis and issue/metrics source |

### Split deployment support

CloudSentinel supports split environments (for example, frontend on Windows, backend + SonarQube + PostgreSQL on Ubuntu).  
Make sure frontend points to the correct backend via `VITE_API_BASE_URL`.

---

## Supported Languages

From your current SonarQube plugin set and backend flow, scans are compatible with:

- Java
- Python
- JavaScript / TypeScript / CSS
- C# / VB.NET
- Go
- PHP
- Kotlin
- Ruby
- Scala
- HTML / XML
- IaC-related config files
- Generic text/config analyzers

> Note: Java projects require compiled classes. Backend handles this by running Maven build when `pom.xml` is detected.

---

## Repository Layout

```text
cloudsentinel/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/ + utils/
│   │   └── styles.css
│   ├── .env
│   └── .env.example
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── sast.js
│   ├── middleware/
│   ├── server.js
│   ├── db.js
│   ├── .env
│   ├── .env.windows.example
│   └── .env.ubuntu.example
├── schema.sql
└── README.md
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- SonarQube server
- Sonar Scanner CLI
- Git CLI
- (For Java repos) JDK 17+ on scan server

---

## Environment Configuration

## Backend (`backend/.env`)

Required:

- `PORT=3000`
- `JWT_SECRET=...`
- `SONAR_HOST=http://<sonar-host>:9000`
- `SONAR_TOKEN=<real_sonar_token>`
- `CLONE_DIR=<absolute_path>`
- DB config via either:
  - `DATABASE_URL=postgresql://...`
  - or `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Recommended:

- `GITHUB_TOKEN=<github_pat>` (for private repos/rate limits)
- `SAST_KEEP_CLONE=true|false` (debugging clone artifacts)
- `SONAR_ENABLE_BRANCH_ANALYSIS=true|false` (keep false on Community Edition)
- `MAVEN_CMD=mvn` (optional Maven command override)

Optional auth/email:

- `GOOGLE_CLIENT_ID`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `FRONTEND_URL=http://localhost:5173`

## Frontend (`frontend/.env`)

- `VITE_API_BASE_URL=http://<backend-host>:3000/api`
- `VITE_GOOGLE_CLIENT_ID=<google_web_client_id>` (for Google button)

After changing frontend env, restart Vite dev server.

---

## Database Setup

```sql
CREATE DATABASE cloudsentinel;
CREATE USER csuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cloudsentinel TO csuser;
```

Then apply schema:

```bash
psql -U postgres -d cloudsentinel -f schema.sql
```

For PostgreSQL 15+ schema permission issues, connect specifically to `cloudsentinel` DB and grant on `public` schema there.

---

## Run Locally

## Backend

```bash
cd backend
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

- `http://localhost:5173/`
- `http://localhost:5173/landing`

---

## API Overview

Base prefix: `/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `POST /auth/github/exchange`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `PATCH /auth/profile`

## Projects

- `POST /projects/analyze`
- `POST /projects`
- `GET /projects`
- `GET /projects/:id`
- `GET /projects/:id/scans`
- `DELETE /projects/:id`

## SAST

- `POST /sast/scan/:projectId`
- `GET /sast/:projectId`
- `GET /sast/compliance/:projectId`
- `GET /sast/report/:projectId`
- `GET /sast/analytics/overview`

---

## SAST Pipeline (Current Behavior)

1. Create `scan_history` row as `RUNNING`.
2. Clone repository into `CLONE_DIR/<projectId>`.
3. If Java project (`pom.xml`), run Maven build (`mvnw`/`mvn`) before scanner.
4. Run `sonar-scanner` from cloned repo (`sonar.projectBaseDir`, `sonar.sources=.`).
5. Validate Sonar indexed code (`ncloc` + `files` > 0).
6. Pull issues from Sonar API.
7. Replace `scan_results` rows for the project.
8. Update scan summary and `projects.security_score`.
9. Mark scan `COMPLETED` or `FAILED`.
10. Cleanup clone dir unless `SAST_KEEP_CLONE=true`.

---

## Compliance & Reporting

CloudSentinel maps SAST findings into:

- OWASP Top 10 controls
- CIS Controls categories

Report exports:

- **Readable report**: HTML
- **Technical report**: JSON

Compliance page is project-selectable and backed by live data from `scan_results`.

---

## Frontend Routes

- `/` and `/landing` - marketing landing
- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/dashboard`
- `/projects`
- `/projects/:id`
- `/projects/:id/sast`
- `/projects/:id/dast`
- `/cicd`, `/dependencies`, `/iac`, `/cloud`, `/kubernetes`, `/compliance`, `/monitoring`, `/secrets`
- `/settings`

---

## Troubleshooting

## `psql` not recognized on Windows

Use full path to `psql.exe` or run DB commands from Ubuntu/PostgreSQL host.

## Sonar says no lines of code

- Verify clone contains source files.
- Confirm correct branch and repo URL.
- Ensure scanner points to cloned source directory.

## Community edition branch error

If Sonar rejects `sonar.branch.name`, keep:

- `SONAR_ENABLE_BRANCH_ANALYSIS=false`

## Java scan fails

- `sonar.java.binaries` errors: ensure Maven build produces `target/classes`.
- `release version 17 not supported`: install/select JDK 17 on scan host.
- `spawn ./mvnw EACCES`: run wrapper via `sh mvnw ...` (already implemented).

## Google login issues

- Frontend needs valid `VITE_GOOGLE_CLIENT_ID`.
- Backend needs valid `GOOGLE_CLIENT_ID`.
- Ensure both are from same Google OAuth app setup.

---

## Security Notes

- Never commit `.env` or real secrets.
- Rotate tokens/passwords if exposed.
- Use HTTPS in production.
- Use least-privilege PATs and DB credentials.

---

## Current Maturity

CloudSentinel currently provides an operational end-to-end SAST and compliance workflow suitable for FYP/demo and iterative production hardening.
# CloudSentinel

Full-stack **DevSecOps / security dashboard**: register GitHub projects, run **SAST** via **SonarQube** (`sonar-scanner`), store findings and scores in **PostgreSQL**, and browse results in a **React (Vite)** UI.

This README documents **everything implemented to date**, **split Windows ↔ Ubuntu deployment**, **errors we hit and how they were fixed**, and **how to resume work tomorrow**.

---

## Table of contents

1. [Architecture (current)](#architecture-current)
2. [Tech stack](#tech-stack)
3. [Repository layout](#repository-layout)
4. [What we built (feature list)](#what-we-built-feature-list)
5. [Behaviour changes & fixes (session history)](#behaviour-changes--fixes-session-history)
6. [Environment configuration (full detail)](#environment-configuration-full-detail)
7. [Database (PostgreSQL 15+ notes)](#database-postgresql-15-notes)
8. [Run the stack](#run-the-stack)
9. [SAST pipeline (step-by-step)](#sast-pipeline-step-by-step)
10. [SonarQube: “no lines of code” / branch mismatch](#sonarqube-no-lines-of-code--branch-mismatch)
11. [Where scan results appear](#where-scan-results-appear)
12. [HTTP API](#http-api)
13. [Frontend routes](#frontend-routes)
14. [Debugging from Ubuntu terminal](#debugging-from-ubuntu-terminal)
15. [Troubleshooting (expanded)](#troubleshooting-expanded)
16. [Git workflow](#git-workflow)
17. [Resume tomorrow (checklist)](#resume-tomorrow-checklist)
18. [Security](#security)

---

## Architecture (current)

| Piece | Where it usually runs | Role |
|--------|------------------------|------|
| **Frontend (Vite)** | Windows (or Ubuntu if you run Vite there) | Browser UI, typically `http://localhost:5173` |
| **Backend (Express)** | Ubuntu VM and/or Windows | REST API on **`PORT`** (e.g. **3000**), JWT auth, DB, orchestrates **`git clone`** + **`sonar-scanner`** |
| **PostgreSQL** | Same machine as the backend you are using | App data: users, projects, scans, issues |
| **SonarQube** | Often the same Ubuntu host as the backend | Web UI **`http://localhost:9000`** on that host; scan analysis + issue API |

**Important:** There are **two separate Postgres databases** if you run the backend on **both** Windows and Ubuntu — users/projects on Windows are **not** the same rows as on Ubuntu unless you replicate data.

The frontend targets one API via **`VITE_API_BASE_URL`** in **`frontend/.env`** (must include **`/api`**, e.g. `http://192.168.141.128:3000/api`).

**CORS** is set in **`backend/server.js`** (`allowedOrigins`). Add your Windows LAN origin if you open the app as `http://<windows-ip>:5173`. Replace the placeholder **`http://YOUR_WINDOWS_IP:5173`** with your real IP.

---

## Tech stack

- **Frontend:** React (Vite), React Router v6, Tailwind CSS, Axios, React Hot Toast, Lucide, Recharts (where used).
- **Backend:** Node.js, Express, `pg`, JWT, bcrypt, Axios, Nodemailer; optional Google/GitHub OAuth routes in **`auth.js`** (primary flow is email/password).
- **Database:** PostgreSQL — **`schema.sql`** at repo root.
- **Analysis:** Git CLI + Sonar Scanner CLI → SonarQube Web API (`/api/issues/search`) → stored in **`scan_results`**.

---

## Repository layout

```text
cloudsentinel/
├── frontend/
│   ├── .env                      # VITE_API_BASE_URL (gitignored)
│   ├── .env.example
│   └── src/
│       ├── lib/api.js            # Axios: baseURL from import.meta.env.VITE_API_BASE_URL
│       ├── utils/api.js          # Re-exports lib/api.js
│       └── pages/                # Login, Register, Projects, ProjectDetails, SASTResults, ...
├── backend/
│   ├── server.js                 # dotenv path; CORS; mounts /api/auth, /api/projects, /api/sast
│   ├── db.js                     # DATABASE_URL or DB_* vars
│   ├── middleware/auth.js
│   ├── routes/auth.js
│   ├── routes/projects.js        # analyze, CRUD, scans list (fake /projects/:id/scan removed)
│   ├── routes/sast.js          # git clone, sonar-scanner, issues ingest, RUNNING→COMPLETED/FAILED
│   ├── .env                    # machine-specific (gitignored)
│   ├── .env.windows.example
│   └── .env.ubuntu.example
├── schema.sql
├── .gitignore                    # .env, node_modules
└── README.md                     # This file
```

---

## What we built (feature list)

### Authentication

- Register with **full name**, **email**, **password** (hashed with bcrypt).
- Login returns **JWT**; frontend stores it as **`cloudsentinel_token`** in **`localStorage`**.
- **Forgot / reset password** via email when SMTP is configured (otherwise reset link may be logged server-side for dev).
- **`GET /api/auth/me`** for session bootstrap.

### Registration UX (explicit change)

- After **successful register**, the app **does not** auto-login or redirect to the dashboard.
- It shows a success toast, then **`navigate("/login", { state: { email } })`** so the user **signs in manually**.
- The login page **prefills email** when arriving from registration (`location.state.email`).

### Projects

- **Add project:** name, **HTTPS GitHub URL**, optional **GitHub PAT** (stored per project for private repos / clone).
- **`POST /api/projects/analyze`** — calls GitHub API to infer stack/language from **`package.json`**, **`requirements.txt`**, **`pom.xml`**, etc., where present.
- **`GET /api/projects`** includes **`latestScan`** summary per project for the UI.
- **Delete project** supported.

### SAST

- **Only real scan endpoint:** **`POST /api/sast/scan/:projectId`** (authenticated).
- **Removed** the old dummy **`POST /api/projects/:id/scan`** that inserted fake “completed” rows without running Sonar.
- **Project details** and **projects list** “Scan” buttons call **`/sast/scan/:id`**, then refresh project data from the API.
- Clone directory: **`CLONE_DIR`** env (Linux: e.g. **`/tmp/cloudsentinel-scans/<projectId>`**; Windows: e.g. **`D:/temp/cloudsentinel-scans/<projectId>`**).
- Java repos (**`pom.xml`** present) are automatically built before scan (`mvnw`/`mvn`) so Sonar Java analysis has **`target/classes`**.
- Sonar branch analysis is gated by env **`SONAR_ENABLE_BRANCH_ANALYSIS=true`** (disabled by default for Community Edition compatibility).
- Optional debug mode: **`SAST_KEEP_CLONE=true`** keeps clone folders after scan for investigation.

### Scan history semantics (explicit change)

- Each scan creates **one** **`scan_history`** row with status **`RUNNING`**, then **`UPDATE`**s that same row to **`COMPLETED`** (with issue counts) or **`FAILED`** on error — **no second INSERT** for completion (avoids duplicate rows and confusing ordering).
- Frontend maps **`FAILED`** to a **Failed** badge (red).

---

## Behaviour changes & fixes (session history)

These are the concrete fixes so you remember **why** the code looks the way it does:

| Problem | Root cause | What we changed |
|---------|------------|------------------|
| **`Username for 'https://github.com':`** on Ubuntu | `git clone` over HTTPS without PAT; blocking **`execSync`** | PAT embedded via **`x-access-token`** URL; **`GIT_TERMINAL_PROMPT=0`**, **`GIT_ASKPASS=/bin/false`** on Linux; **`spawn`** instead of blocking sync where needed |
| Frontend stuck **“Loading project…”** | **`spawnSync`/`execSync`** blocked the **entire Node event loop** during clone/Sonar | **`gitCloneAsync`**, **`runSonarScannerAsync`** using **`child_process.spawn`** + Promises so **GET /projects/:id** can respond during a scan |
| **Sonar “Not authorized”** / token shown as **`PASTE_SONAR_USER_TOKEN`** | **`SONAR_TOKEN`** in **`.env`** left as template text | Set a **real** Sonar user token from Sonar UI (**My Account → Security → Tokens**) |
| **`scan_results` empty** + **`Invalid token`** with curl | Used literal **`YOUR_JWT`** / wrong project id; or scan never completed | Use JWT from **`POST /api/auth/login`** or browser **`localStorage`**; use numeric **`project_id`** in **`/api/sast/:id`** |
| **Sonar UI: “The main branch has no lines of code”** while **GitHub `main` has files** | Wrong repo registered, clone empty, wrong branch, or Sonar branch/plugin mismatch | Verify **registered URL** matches repo; **`GIT_CLONE_BRANCH`**; inspect **`/tmp/cloudsentinel-scans/<id>`**; Sonar **Python** plugin; **`sonar.branch.name`** aligned with checked-out branch (see [dedicated section](#sonarqube-no-lines-of-code--branch-mismatch)) |
| UI shows **Scanning** but **Security Score 100** | Latest row **`RUNNING`** while score still reflects **previous** **`COMPLETED`** run | Expected until current scan finishes; refresh after scan completes |
| **`Invalid email or password`** after DB “works” | User exists only on **other** machine’s database | **`VITE_API_BASE_URL`** must point to the backend whose Postgres you registered against |
| **`password authentication failed for user "csuser"`** on Windows | **`.env`** copied from Ubuntu | Windows **`DATABASE_URL`** with local **`postgres`** user/password (see **`.env.windows.example`**) |
| **`bcrypt_lib.node: invalid ELF header`** on Linux | **`node_modules`** copied from Windows | **`rm -rf node_modules && npm install`** on Ubuntu |
| **`permission denied for schema public`** (PG 15+) | Grants applied while connected to **`postgres`** DB instead of **`cloudsentinel`** | Run **`GRANT`** … **`ON SCHEMA public`** while **`\\c cloudsentinel`** |
| **`Validation of project failed: To use the property "sonar.branch.name"... Developer Edition required`** | Running Community Edition while scanner always sent branch property | Gate branch arg behind **`SONAR_ENABLE_BRANCH_ANALYSIS=true`**; keep it disabled on Community |
| **`org.sonar.java.AnalysisException ... sonar.java.binaries`** | Java analyzer needs compiled classes | Build Java project before scanning and pass **`-Dsonar.java.binaries=target/classes`** |
| **`Fatal error compiling: release version 17 not supported`** | Scan server Java runtime too old for project toolchain | Install/select **JDK 17** (`java -version`, `javac -version`) on scan server |
| **`spawn ./mvnw EACCES`** | Maven wrapper not executable on Linux clone | Run wrapper via shell: **`sh mvnw -DskipTests clean package`** |

---

## Environment configuration (full detail)

### Backend (`backend/.env`)

**Windows (typical local dev)**

- **`PORT=3000`** (or free port).
- **`DATABASE_URL=postgresql://postgres:<password>@localhost:5432/cloudsentinel`** — matches **your** Windows Postgres password (not necessarily **`csuser`**).
- **`SONAR_HOST=http://<ubuntu-vm-ip>:9000`** if Sonar runs only on the VM (not `localhost` unless Sonar is on the same PC).
- **`CLONE_DIR=D:/temp/cloudsentinel-scans`** (create folder or adjust path).
- **`GITHUB_TOKEN`** — real **`ghp_…`** PAT with repo access for clones/analysis.
- **`SMTP_PASS`** — Gmail app passwords often need **quotes** if they contain spaces: `SMTP_PASS="xxxx xxxx xxxx xxxx"`.

**Ubuntu (typical API + Sonar + Postgres on same VM)**

- **`PORT=3000`**
- **`SONAR_HOST=http://localhost:9000`**
- **`SONAR_TOKEN=squ_…`** — **never** leave **`PASTE_SONAR_USER_TOKEN`** or placeholders.
- **`CLONE_DIR=/tmp/cloudsentinel-scans`**
- **`DB_*`** or **`DATABASE_URL`** for **`csuser`** / **`cloudsentinel`** as you created in Postgres.
- **`GITHUB_TOKEN`** — real PAT.

**Optional clone / Sonar branch tuning**

- **`GIT_CLONE_BRANCH=master`** — shallow clone that branch if **`main`** is empty but **`master`** has code (documented in **`.env.ubuntu.example`**).
- **`SONAR_BRANCH_NAME`** — override if git is in detached HEAD and detection falls back wrong.
- **`SONAR_ENABLE_BRANCH_ANALYSIS=true`** — only set when Sonar edition supports branch analysis.
- **`SAST_KEEP_CLONE=true`** — keep cloned repo on disk after scan (debugging).
- **`MAVEN_CMD=mvn`** — override Maven executable when wrapper is unavailable.

**Loading a different env file**

```bash
BACKEND_ENV_FILE=/path/to/.env node server.js
```

(`server.js` uses **`require("dotenv").config({ path: process.env.BACKEND_ENV_FILE || ... })`**.)

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://<backend-host>:3000/api
```

Examples:

- API on **Ubuntu VM**: `http://192.168.141.128:3000/api` (replace with **`hostname -I`** on the VM).
- API on **same Windows machine**: `http://localhost:3000/api`.

Restart **`npm run dev`** after changing **`VITE_*`** vars.

Axios **`baseURL`** is **`VITE_API_BASE_URL`**; request paths are **`/projects`**, **`/auth/login`**, **`/sast/scan/:id`** (no second **`/api`** prefix in path strings).

See **`frontend/.env.example`**.

---

## Database (PostgreSQL 15+ notes)

1. Create database and role (example):

   ```sql
   CREATE DATABASE cloudsentinel;
   CREATE USER csuser WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE cloudsentinel TO csuser;
   ```

2. **Must** connect to **`cloudsentinel`** before fixing **`public`** grants:

   ```bash
   sudo -u postgres psql -d cloudsentinel
   ```

   ```sql
   GRANT CREATE, USAGE ON SCHEMA public TO csuser;
   GRANT ALL ON SCHEMA public TO csuser;
   ```

   If you ran grants only while connected to database **`postgres`**, **`csuser`** still fails inside **`cloudsentinel`**.

3. Apply tables:

   ```bash
   sudo -u postgres psql -d cloudsentinel -f schema.sql
   ```

   Re-running when tables exist shows **“already exists”** — safe to ignore unless you need a clean reset.

**Tables:** `users`, `projects`, `scan_results`, `scan_history`, `password_resets`.

---

## Run the stack

### Backend

```bash
cd backend
npm install
npm run dev
```

Verify:

```bash
curl -s http://localhost:3000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Browser: **`http://localhost:5173`**.

### Rule

Never copy **`node_modules`** from Windows to Linux (or vice versa). Native modules (**bcrypt**) must be built on the target OS.

---

## SAST pipeline (step-by-step)

1. Client calls **`POST /api/sast/scan/:projectId`** with **`Authorization: Bearer <jwt>`**.
2. Insert **`scan_history`** row: **`RUNNING`**, capture **`id`** (`scanHistoryId`).
3. mkdir **`CLONE_DIR`**, delete previous **`CLONE_DIR/<projectId>`** if present.
4. Build authenticated clone URL for **github.com** when **`GITHUB_TOKEN`** or **`projects.github_token`** is usable (**`x-access-token`** format).
5. **`git clone`** (optional **`GIT_CLONE_BRANCH`** → **`git clone -b <branch> --single-branch`**).
6. If **`pom.xml`** exists: run Maven build (`mvnw`/`mvn`) with `-DskipTests clean package` to generate Java binaries.
7. Detect branch: **`git rev-parse --abbrev-ref HEAD`** in clone dir; pass **`-Dsonar.branch.name=...`** only when **`SONAR_ENABLE_BRANCH_ANALYSIS=true`**.
8. Run **`sonar-scanner`** from clone directory with **`sonar.projectBaseDir=<clone dir>`**, **`sonar.sources=.`**, **`sonar.java.binaries=target/classes`**, **`sonar.host.url`**, **`sonar.token`**, **`sonar.scm.disabled=true`**.
9. Wait ~8 seconds for Sonar indexing.
10. Validate Sonar indexed code via **`ncloc`** and **`files`** metrics; fail scan if either is zero.
11. **`GET <SONAR_HOST>/api/issues/search?projectKeys=cloudsentinel_<projectId>`** with token auth.
12. Replace **`scan_results`** for that project; **`UPDATE scan_history`** row **`scanHistoryId`** → **`COMPLETED`** + counts; **`UPDATE projects.security_score`**.
13. Delete clone dir unless **`SAST_KEEP_CLONE=true`**.
14. On any thrown error: **`UPDATE scan_history`** → **`FAILED`** for **`scanHistoryId`**; return **500** JSON **`{ error: "<message>" }`**.

---

## SonarQube: “no lines of code” / branch mismatch

Sonar’s message **“The main branch has no lines of code”** means: **for the Sonar project + branch you are looking at**, the last analysis recorded **zero** lines of code.

It does **not** always mean GitHub **`main`** is empty. Common cases:

1. **Registered wrong repository URL** in CloudSentinel (e.g. another fork/org). Fix the project’s **`repo_url`** or re-add the project pointing at **`https://github.com/<owner>/<repo>.git`** that actually contains **`main.py`**, etc.

2. **Default branch vs empty `main`:** GitHub’s **default branch** might be **`master`** or **`develop`** with all code, while **`main`** exists but is empty. Then:
   - Either push code to **`main`**, or  
   - Set **`GIT_CLONE_BRANCH=master`** (or the branch that has files) in **`backend/.env`** on the scan server.

3. **Verify the clone on the server** (during or after a scan, use your real **`projectId`**):

   ```bash
   ls -la /tmp/cloudsentinel-scans/<projectId>
   find /tmp/cloudsentinel-scans/<projectId> -name '*.py'
   ```

   If **`find`** prints nothing, Sonar will also see no Python sources.

4. **Sonar plugins:** Admin → **Marketplace** / **Plugins** — ensure **Python** (and Java, etc.) language packs are installed for your stack.

5. **Sonar server banner** (“version no longer active”): plan an upgrade; old servers can misbehave with newer scanners.

6. **Branch name in Sonar UI:** After analysis, open project **`cloudsentinel_<id>`** and select the **branch** that matches what was cloned (scanner passes **`-Dsonar.branch.name`** from **`git rev-parse`** when possible).

---

## Where scan results appear

| Location | What you see |
|----------|----------------|
| **CloudSentinel UI** | **Projects → View project** → Scan history + score; **`/projects/:id/sast`** → issue table + Sonar metric cards + charts |
| **PostgreSQL** | **`scan_results`** (issues), **`scan_history`** (runs), **`projects.security_score`** |
| **SonarQube Web** | **`http://<sonar-host>:9000`** → project key **`cloudsentinel_<numeric_project_id>`** |
| **Disk** | Clone under **`CLONE_DIR/<projectId>`** — deleted after a successful/failed scan path cleanup |

---

## HTTP API

Prefix: **`/api`** (included in **`VITE_API_BASE_URL`**).

**Auth**

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | `fullName`, `email`, `password` |
| POST | `/api/auth/login` | `email`, `password` → `{ token, user }` |
| POST | `/api/auth/google` | If configured |
| POST | `/api/auth/github/exchange` | If client uses it |
| GET | `/api/auth/me` | Bearer |
| PATCH | `/api/auth/profile` | Bearer |
| POST | `/api/auth/forgot-password` | email |
| POST | `/api/auth/reset-password` | token, password |

**Projects**

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/projects/analyze` | Preview stack (Bearer) |
| POST | `/api/projects` | Create (Bearer) |
| GET | `/api/projects` | List (Bearer) |
| GET | `/api/projects/:id` | Detail + latest scan (Bearer) |
| GET | `/api/projects/:id/scans` | History (Bearer) |
| DELETE | `/api/projects/:id` | Delete (Bearer) |

**SAST**

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/sast/scan/:projectId` | Run scan (Bearer); long-running |
| GET | `/api/sast/:projectId` | Issues + summary + `sonarMetrics` (bugs, vulnerabilities, hotspots, codeSmells, coverage, duplications, ncloc) |

**Health**

- `GET /` — API banner  
- `GET /health` and `GET /api/health` — `{ ok: true, service: "CloudSentinel API" }`

---

## Frontend routes

| Path | Screen |
|------|--------|
| `/` | Landing |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth |
| `/dashboard` | Dashboard |
| `/projects` | Project list + add modal |
| `/projects/:id` | Project details, Scan, history |
| `/projects/:id/sast` | SAST results |
| `/projects/:id/dast` | DAST placeholder |
| `/cicd`, `/dependencies`, `/iac`, `/cloud`, `/kubernetes`, `/compliance`, `/monitoring`, `/secrets` | Placeholder / extended modules |
| `/settings` | Profile |

---

## Debugging from Ubuntu terminal

**Health (no auth)**

```bash
curl -s http://localhost:3000/health
```

**Login → token**

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'
```

Copy **`token`** from JSON, then:

```bash
export TOKEN="<paste jwt>"
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/projects | jq
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/sast/3" | jq
```

Use the **numeric** project **`id`** from **`/api/projects`**, not the string **`PROJECT_ID`**.

**SQL**

```bash
sudo -u postgres psql -d cloudsentinel -c "SELECT id,email FROM users LIMIT 5;"
sudo -u postgres psql -d cloudsentinel -c "SELECT project_id,status,total_issues,completed_at FROM scan_history ORDER BY started_at DESC LIMIT 10;"
sudo -u postgres psql -d cloudsentinel -c "SELECT COUNT(*) FROM scan_results;"
```

---

## Troubleshooting (expanded)

| Symptom | What to check |
|---------|----------------|
| **Invalid email or password** | Same API URL as DB where you registered (`VITE_API_BASE_URL`); typo in email; wrong password |
| **Git asks for username in terminal** | Old backend build; missing **`GITHUB_TOKEN`**; pull latest **`sast.js`**, restart |
| **Sonar “Not authorized”** | **`SONAR_TOKEN`** must be real (**`squ_...`** from Sonar), not placeholder text |
| **Sonar “no lines of code”** | [Section above](#sonarqube-no-lines-of-code--branch-mismatch); **`GIT_CLONE_BRANCH`**; correct repo URL |
| **`scan_results` count = 0** | Scan **`FAILED`**; Sonar returned 0 issues; or analysis never wrote — check **`scan_history.status`** |
| **`Loading project…` forever** | Backend down; wrong URL; very old blocking git — update backend and restart |
| **Two databases confusion** | Register/login against the backend you intend; use separate **`.env`** per OS |

---

## Git workflow

```bash
git status
git pull origin main    # use your branch name
```

Commit **`README.md`** and code; never commit **`.env`**.

If **`remote origin`** points at another user’s repo, use **`git remote set-url origin https://github.com/<you>/<repo>.git`**.

---

## Resume tomorrow (checklist)

1. Start **PostgreSQL**; confirm **`cloudsentinel`** exists and **`schema.sql`** applied; **`public`** grants for app user on **PG 15+**.
2. **`backend/.env`** complete: **`PORT`**, DB, **`JWT_SECRET`**, **`GITHUB_TOKEN`**, **`SONAR_HOST`**, **`SONAR_TOKEN`** (real), **`CLONE_DIR`**, optional **`GIT_CLONE_BRANCH`**.
3. **`frontend/.env`**: **`VITE_API_BASE_URL=http://<api-host>:3000/api`**.
4. **`npm install`** in **`backend`** and **`frontend`** (fresh on Linux if needed).
5. **`npm run dev`** backend → **`curl /health`** OK.
6. **`npm run dev`** frontend → **`http://localhost:5173`**.
7. Register or login → Projects → correct GitHub URL → Scan → SAST page + Sonar UI **`cloudsentinel_<id>`**.
8. For Java repos, ensure scan server has **JDK 17+** when project requires it.

---

## Security

- Never commit **`.env`** or live tokens.
- Rotate Sonar/GitHub/database passwords if exposed.
- Use HTTPS for production deployments; this README describes dev/split-LAN setups.

---

*This document reflects the codebase and operational lessons through the session that included: split Windows/Ubuntu env templates, `DATABASE_URL` vs `DB_*`, CORS, non-interactive Git clone with PAT, async SAST, scan_history RUNNING/COMPLETED/FAILED single-row updates, register→login redirect, Sonar token/branch troubleshooting, Java (Maven) pre-build with `sonar.java.binaries`, `SONAR_ENABLE_BRANCH_ANALYSIS` gating for Community Edition, `SAST_KEEP_CLONE` debugging mode, and SAST UI Sonar metrics cards/charts.*
