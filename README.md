# EventHub Automation

A Playwright + TypeScript framework that automates user story **US-114 ("Book tickets for an event")** on the EventHub web app (https://eventhub.rahulshettyacademy.com) and on its REST API (documented at https://api.eventhub.rahulshettyacademy.com/api/docs).

It covers all five acceptance criteria through UI and API tests, plus negative cases. Authorization is handled once by the framework, so tests never touch tokens.

It is built to grow: organised by feature at the top level (events, bookings, ...), with layers inside each feature (tests → fixtures → facade → page objects / API clients), and shared code in `core/`. A new feature is a new folder plus one entry in the fixtures.

Repository: https://github.com/srh-farghaly/eventhub-automation

---

## How to run

### Prerequisites
- Node.js 20 or newer
- Git

### Setup
```bash
git clone https://github.com/srh-farghaly/eventhub-automation.git
cd eventhub-automation
npm ci
npx playwright install chromium
```

### Configuration
Copy the example file and fill in the values:
```bash
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```

| Variable | Meaning |
|---|---|
| `BASE_URL` | the web app, e.g. `https://eventhub.rahulshettyacademy.com` |
| `API_BASE_URL` | the API, e.g. `https://api.eventhub.rahulshettyacademy.com/api` |
| `TEST_USER_EMAIL` | test account email |
| `TEST_USER_PASSWORD` | test account password |

The framework stops with a clear error if a variable is missing.

**Credentials:** a dedicated test account is provided in the submission form. You can also register your own EventHub user and use it. `.env` is git-ignored and must never be committed.

### Run the tests
| Command | What it does |
|---|---|
| `npm test` | everything (login setup, API and UI tests) |
| `npm run test:api` | API tests only |
| `npm run test:ui` | UI tests only |
| `npm run report` | open the last HTML report |

Run a single test or file:
```bash
npx playwright test -g "AC4"
npx playwright test tests/ui/booking.spec.ts
```

Every run logs in once (the `setup` project) and reuses the session; tests never log in themselves. Tests create their own bookings and delete them afterwards, even when a test fails.

To use another environment, create `.env.<name>` and run with `TEST_ENV=<name>`. If the file is missing, the framework stops with `Environment file ".env.<name>" not found`.
```bash
TEST_ENV=staging npm test                  # macOS / Linux / Git Bash
$env:TEST_ENV="staging"; npm test          # PowerShell
```

### CI
A GitHub Actions workflow (`.github/workflows/playwright.yml`) runs the suite on every push and pull request and can be started manually. It needs the four variables above as repository secrets (`BASE_URL`, `API_BASE_URL`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`). It installs Chromium only and uploads the HTML report as an artifact.

---

## Story review (US-114)

The review is in [`docs/story-review.pdf`](docs/story-review.pdf): what is missing, unclear or inconsistent in the story, and the questions I would ask the Product Owner.

**Main points**
- **The story covers the happy path only.** It does not define who can book (it says "visitor", but the app requires login), ticket limits (1–10), field validation, sold-out behaviour, what "cancel" means, or what the API response looks like.
- **Past events are listed as "Upcoming" and can still be booked**, in both the UI and the API.
- **The booking reference format differs from the API docs** (`H-XXXXXX` instead of `EVT-XXXXXX`).
- **The docs contradict themselves on cancel:** the endpoint says it permanently deletes the booking, while the schema has a `cancelled` status. In practice it is a hard delete.
- **Roles are undefined:** a regular user sees the Admin menu, and it is unclear who may create events.

---

## Key decisions

### Project structure
```
src/
  core/                    shared by every feature
    config/env.ts          reads and validates environment variables
    auth/                  login once, save the session (AuthApi, session, setup)
    api/types.ts           shared API response shape
    fixtures.ts            `api` (authenticated) and `anonymousApi`
  features/
    events/                EventsApi, EventsPage, types, constants, fixtures
    bookings/              BookingsApi, BookingFacade, pages/, data builder,
                           money, messages, types, fixtures
  fixtures/index.ts        merges every feature's fixtures into one `test`
tests/
  api/                     API tests
  ui/                      UI tests
docs/
  story-review.pdf         story review
```

**Layers**
```
UI test  → fixtures → facade → page objects
                    → API client   (setup and cleanup)
API test → fixtures → API client
                 both → types
```

**Rules that keep it clean**
- Tests get `test` and `expect` from `src/fixtures`. They may import a feature's data builders, constants and messages, but never its pages or API clients directly.
- Page objects contain locators only.
- API clients make calls and throw on unexpected status codes; they never use `expect`. `BookingsApi` also tracks what it creates so it can clean up.
- Each API client owns its endpoint paths.
- `core/` never imports from `features/`.
- Tests create their own bookings, through the API or the UI, and every booking is cleaned up automatically, even when a test fails. Events are shared, read-only data.

**How to add a new feature (for example "reviews")**
1. Create `src/features/reviews/`.
2. Add `ReviewsApi.ts`, `ReviewsPage.ts` and `types.ts` (and a facade if there is a UI flow).
3. Add `fixtures.ts` that provides them to tests.
4. Add the import and the argument to `mergeTests(...)` in `src/fixtures/index.ts`.
5. Write tests under `tests/api` and `tests/ui`.

**How to add a role or an environment**
- *Role:* add its credentials to `.env` → a setup step that logs in and saves `auth-states/<role>.json` → a UI project that uses that `storageState` → an API fixture that reads that file's token.
- *Environment:* create `.env.<name>` and run with `TEST_ENV=<name>`.

### Decisions and trade-offs

1. **Feature-first layout with layers inside, plus a small `core/`.**
   Each feature owns its API client, pages, types and fixtures, so a new feature is a new folder plus one entry in `mergeTests`.
   *Trade-off:* more folders than a flat layout, and shared things need a deliberate home in `core/`.

2. **Authorization is handled once, by the framework.**
   A `setup` project logs in through the API and saves the session. UI projects reuse it (`storageState`); API tests get an `api` fixture that adds the Bearer token. Tests never touch credentials or tokens.
   *Trade-off:* one role for now, and the session depends on the app's `eventhub_token` storage key.

3. **Set up and clean up through the API, verify through the UI.**
   It is fast and stable, and UI tests fail only for UI reasons.
   *Trade-off:* an API bug can break a UI test.

4. **A facade per feature holds the business flow and assertions; page objects hold locators only.**
   *Trade-off:* a facade can grow, so it gets split by sub-goal when it does.

5. **API clients: one per resource, each owns its paths.**
   `create` throws on failure; `createRaw` returns the raw response for negative tests.
   *Trade-off:* status checks repeat across clients (a shared `BaseApi` is the next step).

6. **Test data: random builders (Faker) with overrides; tests own their bookings.**
   Events are shared, read-only data, chosen at run time instead of by hard-coded ID.
   *Trade-off:* seats on shared events are limited, so tests depend on events having free seats.

7. **Two ways into the booking form:** directly by URL (most tests) and through the events list (one journey test), because the story is about booking, not browsing.
   *Trade-off:* the list path depends on how many events the page shows (`EVENTS_SHOWN_ON_LIST`).

8. **"Bookable" means "has enough seats".** The app currently allows booking past events (story review M7), and the rule lives in one method.
   *Trade-off:* it breaks if the business starts blocking past bookings; the date condition would go in that one method.

9. **Configuration fails fast** with a clear message, and `TEST_ENV` selects `.env.<name>`. Reporters, retries and workers differ between local runs and CI.
   *Trade-off:* secrets live in files or CI secrets, so a dedicated test account is used.

---

## What I'd do with more time

- Tests create their own events (needs confirmation of who may create events) for full isolation
- An admin role and role-based sessions
- A shared `BaseApi` for status checks and response parsing
- **A dedicated cleanup class** (for example `core/cleanup/CleanupTracker.ts`) instead of cleanup living inside `BookingsApi`
- Walk API pagination; schema validation of responses
- A seat-accounting test: seats drop when booking and return when cancelling
- A sold-out API test, and tests that pin the known defects (past events can be booked, reference format, quantity accepted as a string)
- Negative login tests and more field-validation cases
