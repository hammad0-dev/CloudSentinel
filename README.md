# CloudSentinel

CloudSentinel is a full-stack DevSecOps cybersecurity dashboard built with React + Node.js + PostgreSQL.

## Tech Stack

- Frontend: React (Vite), React Router v6, Tailwind CSS, Recharts, Lucide React, Axios, React Hot Toast
- Backend: Node.js, Express, PostgreSQL (`pg`), JWT, bcrypt, Axios, Nodemailer
- Integrations: GitHub API, SonarQube (`sonar-scanner`)

## Project Structure

```text
cloudsentinel/
├── frontend/
├── backend/
├── schema.sql
└── README.md
```

## Prerequisites

- Node.js 18+ (you currently use Node 24)
- PostgreSQL (local)
- Optional: Docker for SonarQube

## Environment Variables

### `backend/.env`

```env
PORT=5000
DATABASE_URL=postgresql://postgres:<YOUR_REAL_DB_PASSWORD>@localhost:5432/cloudsentinel
JWT_SECRET=your_super_secret_jwt_key_here
GITHUB_TOKEN=ghp_your_github_pat_token_here
SONAR_TOKEN=your_sonarqube_token_here
SONAR_URL=http://localhost:9000
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=cloudsentinel.noreply@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=CloudSentinel <cloudsentinel.noreply@gmail.com>
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GITHUB_OAUTH_CLIENT_ID=your_github_oauth_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_oauth_client_secret
```

### `frontend/.env`

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5174/github/callback
```

## Database Setup

1. Create database (if missing):

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE cloudsentinel;"
```

2. Import schema:

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloudsentinel -f D:\FYP\website\cloudsentinel\schema.sql
```

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

API base: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App URL: `http://localhost:5173` (or `5174` if `5173` is busy)

## Implemented Frontend Pages

- Public: `Landing`, `Login`, `Register`, `ForgotPassword`, `ResetPassword`
- Protected: `Dashboard`, `AllProjects`, `AddProject`, `SASTResults`, `DASTResults`, `CICDPipeline`, `Dependencies`, `IaCSecurity`, `CloudDeployment`, `KubernetesSecurity`, `ComplianceDashboard`, `MonitoringAlerts`, `SecretsManagement`, `ProfileSettings`

## Implemented Backend API

- Auth:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/google`
  - `POST /api/auth/github/exchange`
  - `GET /api/auth/me`
  - `PATCH /api/auth/profile`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
- Projects:
  - `POST /api/projects/analyze`
  - `POST /api/projects`
  - `GET /api/projects`
  - `GET /api/projects/:id`
  - `DELETE /api/projects/:id`
- SAST:
  - `POST /api/sast/scan/:projectId`
  - `GET /api/sast/:projectId`
- Health:
  - `GET /`
  - `GET /api/health`

## Database Schema

The following tables are created by `schema.sql`:

- `users`
- `projects`
- `scan_results`
- `scan_history`
- `password_resets`

## Where Data Is Stored

- Persistent app data: PostgreSQL database `cloudsentinel`
- Auth token: browser `localStorage` key `cloudsentinel_token`
- Temporary SAST clone path: `C:\tmp\repos\...` (cleaned after scan)

## Common Issues

- `EADDRINUSE:5000`: another backend instance is running on port 5000.
- Registration fails with DB error:
  - check `DATABASE_URL`
  - ensure PostgreSQL service is running
  - ensure schema is imported
- `Cannot GET /` on backend root is resolved; root now returns API status JSON.
- Forgot password email:
  - configure SMTP values in `backend/.env`
  - for Gmail use App Password in `SMTP_PASS`
  - if SMTP is missing, backend logs reset link in terminal for development

## Email Sending Model (Production)

- Use one app-managed sender mailbox (do not use each user's Gmail credentials).
- All reset emails are sent by backend using:
  - `SMTP_USER` (app sender account)
  - `SMTP_PASS` (app password)
  - `SMTP_FROM` (branded sender identity)
- Any end-user can request password reset for their own email; app sends the reset link to that email from the single sender account.

## Google Login Setup

1. Create OAuth 2.0 Client ID in Google Cloud Console.
2. Add authorized JavaScript origin:
   - `http://localhost:5173`
   - `http://localhost:5174`
3. Put same client ID in:
   - `backend/.env` as `GOOGLE_CLIENT_ID`
   - `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`
4. Restart backend and frontend.

## GitHub OAuth Connect Setup

1. Create a GitHub OAuth App in GitHub Developer Settings.
2. Set Authorization callback URL to:
   - `http://localhost:5174/github/callback`
3. Put values in:
   - `backend/.env`:
     - `GITHUB_OAUTH_CLIENT_ID`
     - `GITHUB_OAUTH_CLIENT_SECRET`
   - `frontend/.env`:
     - `VITE_GITHUB_CLIENT_ID`
     - `VITE_GITHUB_REDIRECT_URI`
4. Restart backend and frontend.

## Maintenance Note

This README will be updated whenever meaningful features/config/routes are added or changed.
