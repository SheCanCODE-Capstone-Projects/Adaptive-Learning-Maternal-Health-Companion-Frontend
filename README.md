# MaternaCare

MaternaCare is a React 19 frontend for the Mama Journey Spring Boot API. The timeline, visits, diary, learning modules, quizzes, progress and support directory use authenticated API responses. The bundled demo account points to the backend's shared, fictional records.

## Run locally

Start the companion backend on port 8080 and confirm its Swagger UI opens at `http://localhost:8080/swagger-ui/index.html`. From the frontend repository root:

```sh
npm ci
npm run dev
```

Open the address Vite prints. Choose **Open demo account** to browse the seeded records. Register a separate account for personal use. The backend's documented reviewer demo is `reviewer@demo.test` with password `Review1234!`. Sign in and open **My account → Review content** to manage versioned drafts. Approval changes what readers see.

## Data and consent

- TanStack Query loads account-scoped responses and refreshes affected queries after writes. The access token is held in session storage. Expired API sessions return to sign-in.
- **My account** controls data storage and sync permissions. It also provides JSON export, account deletion and sign-out.
- Visits store UTC timestamps and display them in local time. Diary entries and offline visit edits are queued in IndexedDB under the signed-in user ID. Each edit retains a stable client ID and its edit timestamp. Select **Sync pending changes** while online to upload after granting both permissions. The server resolves conflicts using the latest accepted timestamp.
- The production service worker caches the application shell. Opened approved lesson versions are cached for offline reading and quiz practice. Personal records cached for offline use stay in the signed-in user's browser profile. Sign in online before going offline. Keeping an offline copy on a shared device carries privacy implications.
- The backend supplies facility information as one approved text document. The frontend displays the wording, sample-data labels and review date supplied by the backend. Clinical accuracy depends on the publishing review process.
- Earlier frontend-only records are left in the original browser storage. They have no recorded account owner and are never automatically assigned or uploaded.

## Production and offline checks

```sh
npm run lint
npm run build
npm run preview
```

Use the preview URL for offline checks. Open a lesson, wait for the service worker to activate, turn off network access, then reload that lesson. To check diary sync, grant storage and sync permissions while online, save a note offline, reconnect and select **Sync pending changes**.

Production settings live in `.env.production`: `VITE_API_BASE_URL` sets the API prefix and `VITE_ENABLE_DEMO=false` hides the shared demo account. Copy `.env.example` to `.env.local` for local overrides.

Deploy `dist/` over HTTPS. Serve `/api/v1/*` from the backend through the same origin and fall back to `index.html` for page routes. For a separate API origin, set `VITE_API_BASE_URL` to the full API prefix before building and add the frontend origin to the backend's CORS allowlist. The Vite dev and preview servers proxy local API requests to port 8080.
