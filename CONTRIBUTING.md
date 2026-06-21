# Contributing to TrimURL

We welcome contributions to improve TrimURL! Follow the guidelines below to modify the backend, database schemas, frontend, and run tests.

---

## Code Style & Standards

### Backend (Spring Boot / Java 21)
- Write stateless, reusable components in their respective packages (`controller`, `service`, `repository`, `model`, `dto`, `mapper`, `exception`).
- Document all core endpoints in `API_REFERENCE.md`.
- Keep the `Base62Encoder` utility decoupled from JPA logic to remain fully unit testable.
- Secure resources by validating user ownership in the service layer using `userService.getCurrentUser()`.

### Database Schema (Flyway Migrations)
Database schemas must only be modified using Flyway migration scripts located in:
`backend/src/main/resources/db/migration/`
- Filename format: `V<Version_Number>__<description>.sql` (e.g. `V4__add_index_to_urls.sql`).
- Do not modify existing SQL migration files after they have been checked in or run. Write a new migration script to make alter adjustments.

### Frontend (React / TypeScript / Tailwind CSS)
- Maintain semantic CSS styling. Use global classes (like `.glass` and `.glass-hover`) from `index.css`.
- Ensure strict type definitions. Do not use `any` unless absolutely necessary.
- Import API interfaces (`UrlItem`, `UserSession`, `AnalyticsData`) using type-only import syntax (`import type { ... } from './services/api'`) to align with Vite's typescript compiler settings.

---

## Verifying Changes

### Running Tests Locally
Before submitting a PR, make sure all tests pass:

1. **Backend Tests**:
   ```bash
   cd backend
   ../.maven/apache-maven-3.9.6/bin/mvn clean test
   ```

2. **Frontend Builds**:
   Make sure TypeScript compiles and Vite builds successfully without errors:
   ```bash
   cd frontend
   npm run build
   ```

3. **Redirection Load Testing**:
   Ensure redirection latency remains under 50ms:
   ```bash
   k6 run tests/load-test.js
   ```
