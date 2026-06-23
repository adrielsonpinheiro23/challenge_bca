# QA Automation Take-Home Assessment

Automation test suite for the take-home challenge using Playwright Test and TypeScript.

## What Is Covered

- ReqRes API tests for CRUD, authentication, negative cases, delayed responses, and schema validation.
- OrangeHRM UI tests for login, logout, PIM employee flows, dashboard widgets, and sidebar navigation across Chromium, Firefox, and WebKit.
- Page Object Model for the UI layer.
- Reusable API client for ReqRes.
- Playwright HTML and JSON reports.
- GitHub Actions workflow for CI.

## Prerequisites

- Node.js 22 or newer
- npm

## Setup

```bash
npm install
npx playwright install
```

Optional local config:

```bash
copy .env.example .env
```

## Commands

```bash
# Run all API and UI tests
npm test

# Run only API tests
npm run test:api

# Run only UI tests in Chromium, Firefox, and WebKit
npm run test:ui

# Run UI tests with visible browser
npm run test:headed

# TypeScript validation
npm run typecheck

# Open latest HTML report
npm run report
```

Reports are generated under `reports/`.

ReqRes currently requires an `x-api-key` header for every request. Without `REQRES_API_KEY`,
the API suite fails fast with a clear configuration error so required API coverage is not silently skipped.

Latest local verification with `REQRES_API_KEY` configured: `npm run test:ui` passed 30 browser-project tests across Chromium, Firefox, and WebKit. The full suite now contains 43 tests: 13 API tests plus 30 UI browser-project tests.

## Project Structure

```text
src/
  api/
    clients/       ReqRes API helper
    schemas/       JSON schema validation
    tests/         API specs
  ui/
    fixtures/      UI test data
    pages/         Page Object Model classes
    tests/         UI specs
  utils/           Shared helpers
```

## Design Decisions

- Playwright Test is used for both API and UI so the project stays small and consistent.
- The UI suite follows the reference repository by running the same UI tests in Chromium, Firefox, and WebKit.
- TypeScript is strict, but the architecture remains simple enough for a mid-level assessment.
- UI tests use Page Object Model with three page objects: `LoginPage`, `DashboardPage`, and `PimPage`.
- API tests use a small `ReqresClient` so endpoints are not duplicated across tests.
- Schema validation uses AJV for the user list endpoint.
- Playwright captures screenshots and videos on failure through config.

## Environment Variables

See `.env.example`.

- `REQRES_BASE_URL`: defaults to `https://reqres.in`
- `REQRES_API_KEY`: ReqRes API key. Current ReqRes docs say every request requires `x-api-key`.
- `ORANGE_HRM_BASE_URL`: defaults to `https://opensource-demo.orangehrmlive.com`
- `ORANGE_HRM_USERNAME`: defaults to `Admin`
- `ORANGE_HRM_PASSWORD`: defaults to `admin123`

For GitHub Actions, add `REQRES_API_KEY` as a repository secret. The workflow passes it to `npm test`.

## Assumptions and Known Risks

- ReqRes and OrangeHRM are public demo systems and may be slow or temporarily unavailable.
- The PDF says ReqRes needs no API key, but the current ReqRes docs require `x-api-key` for all requests.
- OrangeHRM demo data is shared publicly, so employee records may change between runs.
- The Add Employee test creates a unique employee name per run to reduce collisions.
- Set `REQRES_API_KEY` in `.env` or CI secrets before running the API suite.

## CI

GitHub Actions runs:

1. `npm ci`
2. `npx playwright install --with-deps`
3. `npm run typecheck`
4. `npm test`
5. Uploads `reports/` as an artifact
