# Deployment Plan (wecare-app)

## 1. Environments

| Environment  | URL                      | Provider | Notes                           |
|--------------|--------------------------|----------|---------------------------------|
| Development  | https://wecare-dev.vercel.app   | Vercel   | Branch: `develop`                |
| Staging      | https://wecare-staging.vercel.app | Vercel   | Branch: `staging`                |
| Production   | https://wecare.vercel.app      | Vercel   | Branch: `main`                   |

## 2. CI/CD Pipeline (GitHub Actions)

- **Workflows**:
  - `ci.yml`: Run on `push` to any branch
    - Steps: Checkout → Install dependencies → Lint → Test → Build
  - `deploy-staging.yml`: Run on `push` to `staging`
    - Steps: Checkout → Install → Build → `vercel --prod --confirm --token ${{ secrets.VERCEL_TOKEN }} --scope wecare-app`
  - `deploy-production.yml`: Run on `push` to `main`
    - Same as deploy-staging but deploy to Production environment

- **Key Actions**:
  - actions/checkout@v3
  - actions/setup-node@v3
  - actions/cache@v3 (cache `node_modules`)
  - shivammathur/setup-yarn@v2 (if using Yarn)
  - vercel/vercel-action@v20

## 3. Deployment Scripts

- **Build**: `npm run build`
- **Start (preview)**: `npm run start`
- **Database Migrations** (Supabase):
  ```bash
  npx supabase db push
  ```
  - Ensure migrations are version-controlled under `supabase/migrations`

## 4. Environment Variables & Secrets

| Name                     | Where                   | Purpose                         |
|--------------------------|-------------------------|---------------------------------|
| SUPABASE_URL             | GitHub Secrets & Vercel | Supabase project URL            |
| SUPABASE_ANON_KEY        | GitHub Secrets & Vercel | Public API key for client SDK   |
| SUPABASE_SERVICE_ROLE_KEY| GitHub Secrets only     | Service role for migrations     |
| VERCEL_TOKEN             | GitHub Secrets only     | Deploy authentication           |
| NEXT_PUBLIC_API_BASE_URL | Vercel Environment      | Frontend API base path          |
| NODE_ENV                 | Vercel Environment      | `development`/`production`      |

- **GitHub**: store under Settings → Secrets → Actions
- **Vercel**: set under Project Settings → Environment Variables (per environment)

## 5. Smoke Tests & Health Checks

- After deployment, run basic checks via GitHub Actions step or external monitor:
  ```bash
  curl -o /dev/null -s -w "%{http_code} %{time_total}s" https://wecare.vercel.app/api/health
  curl -o /dev/null -s -w "%{http_code} %{time_total}s" https://wecare.vercel.app/dashboard
  ```
- Verify HTTP status `200` and response time < 500ms

## 6. Rollback Plan

- **Vercel UI**: Use "Rollback" to previous deployment
- **GitHub**: `git revert <commit>` on `main` and push → triggers deploy-production
- Document incidents and revert reason in release notes

## 7. Release Schedule & Communication

- **Release Window**:
  - Monday–Friday, 09:00–11:00 UTC+7
- **Stakeholders**:
  - Notify QA (Slack), Blocker: #wecare-release
  - Email summary to Product and Ops teams
- **Post-Release**:
  - Monitor logs via Vercel Dashboard & Supabase logs for 1 hour
  - Confirm no critical errors, then close release ticket
