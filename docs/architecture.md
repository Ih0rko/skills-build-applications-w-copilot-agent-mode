# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Build a responsive React 19 single-page app with Vite, React Router, and Bootstrap. Keep components focused on rendering and interaction, and use the shared API client with relative `/api` paths. Show loading, empty, and error states.
- Logic tier decision: Use the Express/TypeScript API as the boundary for input validation and business rules. Keep route handlers thin and put reusable behavior in services; return deliberate 4xx responses for invalid or missing resources. Keep the API unauthenticated for this exercise, as specified by the project constraints.
- Data tier decision: Persist users, teams, and activities in MongoDB through Mongoose models. Use schema validation and references for relationships; only the API accesses the database. Keep seed data deterministic so tests and local development are repeatable.
- Activity tracking approach: Accept only the documented activity fields, validate the user and team references and activity values on the server, and calculate points there rather than trusting client-supplied scores. Store the activity with its team and user references and a server-generated `occurredAt` timestamp.
- Team management approach: Store each team and its member references in MongoDB. Validate member references when creating or updating membership, avoid duplicate members, and return the team name and mascot consistently from the API.
- Leaderboard approach: Calculate team totals from persisted activity points in the API/data layer, sort by total points descending, and assign ranks starting at 1. Use a stable tie-breaker so equal totals produce deterministic results.
- Workout suggestions approach: Generate suggestions with a deterministic, rule-based service using the user's goal and recent activity patterns. Include a concise reason for each suggestion, avoid external recommendation services, and return a deliberate 4xx response when the requested user does not exist.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
- API command: `npm run test:api --prefix octofit-tracker/backend`
- Frontend command: `npm test --prefix octofit-tracker/frontend`
- Backend build command: `npm run build --prefix octofit-tracker/backend`
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
