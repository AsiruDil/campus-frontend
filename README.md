# Campus recruitment frontend

React 19, Vite 7 and Tailwind CSS 4. Validated with Node.js 24.

```sh
npm ci
npm run dev
```

Preserve the existing ignored `.env`, or supply these values in your local environment:

- `VITE_BACKEND_URL`: backend origin, e.g. `http://localhost:3000` (without `/api`).
- `VITE_SUPABASE_URL`: existing Supabase project URL.
- `VITE_SUPABASE_KEY`: public anonymous/publishable key for the existing profile-image integration. Never use a service-role key in the frontend.

The backend README describes MongoDB, email delivery and private document storage configuration.

## Recruitment workflow

Applicants keep the existing vacancy browsing, login and profile flows. **Apply Now** opens a form requiring manually entered NIC and mobile number, one PDF CV up to 2 MiB and optional certificates/research papers (up to ten PDF/PNG/JPEG files, 5 MiB each). The backend validates the files and automatically stores them as one private ZIP. Applicants do not need to prepare a ZIP themselves.

Roles are **User**, **Admin** (formerly Madam) and **Super Admin** (formerly Admin). Sign in again after the backend's role migration:

- `/home`: applicant vacancy browsing and applications.
- `/admin`: faculty/department-scoped application review. Filter by category (lecturer/probationary lecturer/demonstrator), status, vacancy or name/NIC/email. Shortlist rows, email selected applicants together, download ZIP or CV, and approve/select, reject, hold or return to pending. Click an applicant name for details and review history.
- `/super-admin/users`: assign roles and Admin faculty/department access.
- `/super-admin/vacancies`: manage vacancies, categories and exact application deadlines.
- `/super-admin/applications`: review all applications and delete document packages at least five years old, after a count preview and confirmation. Recent documents and application records remain.

The historical `/madam` URL redirects to `/admin`. Backend authorization enforces role and scope independently of the browser.

## Checks

```sh
npm run lint
npm run build
```

Browser workflows use Playwright and the sibling `../campus-backend` checkout. Install both repositories' dependencies first. Install Chromium using `npx playwright install chromium` if needed, or point `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` at an existing Chromium executable. Test output is ignored by Git.

```sh
# Uses the dedicated test MongoDB server from the backend README.
MONGODB_TEST_URL=mongodb://127.0.0.1:27018 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
npm run test:e2e
```

The four browser tests start their own Vite (5174) and backend (3001) processes and an isolated database. They exercise applicant login/upload, Admin filtering/shortlisting/email/ZIP download/decisions, Super Admin deadline editing/retention, and the mobile review layout. Test email delivery is stubbed; the fixture removes its database and uploaded files afterward. Without `MONGODB_TEST_URL`, the fixture uses checksum-verified MongoDB 8.0.12 via `mongodb-memory-server`.

The build currently emits a bundle-size warning; it still completes successfully. Production MongoDB access, Gmail delivery, Google OAuth and Supabase profile storage need the deployment's real configuration.
