# Repository Guidelines

## Project Structure & Module Organization
The Next.js App Router tree lives under `app/`, covering both UI routes and server actions. Shared interface pieces reside in `components/`, while domain logic, API wrappers, and environment helpers stay in `lib/` (see `lib/config.ts`). Static assets ship from `public/`. Tests live in `tests/`, and the compiled JavaScript in `dist-tests/` is generated automatically by the test pipeline.

## Build, Test, and Development Commands
Run `npm run dev` for a hot-reloading development server. `npm run build` mirrors the production build used in deployment. Lint with `npm run lint`, and execute the TypeScript smoke suite using `npm test`, which compiles via `tsc -p tsconfig.tests.json` before running the Node entry point in `dist-tests/tests/api-smoke.test.js`.

## Coding Style & Naming Conventions
Author TypeScript first and prefer functional React components. Keep two-space indentation, camelCase for variables, PascalCase for components, and kebab-case for route folders under `app/`. Maintain Tailwind utility ordering consistent with existing files and validate new configuration helpers following the guard patterns in `lib/config.ts`.

## Testing Guidelines
Place feature-specific tests in `tests/*.test.ts`, focusing on API contracts and hallucination detection logic. Name files after the behavior under test (for example, `claim-extraction.test.ts`). Ensure suites compile under `tsconfig.tests.json` and pass via `npm test`; add fixtures under `tests/fixtures/` when scenarios require mocks.

## Commit & Pull Request Guidelines
Git history favors clear, sentence-style subjects (e.g., "Updated to GPT model and enhanced UI by Gbolahan"). Keep messages under roughly 72 characters and describe the user-facing outcome. Pull requests should include a short summary, evidence of `npm test`/`npm run lint`, screenshots for UI updates, and a note about any environment or schema adjustments. Reference related issues or TODO entries so reviewers can follow the roadmap.

## Configuration & Secrets
Store `EXA_API_KEY`, `GROQ_API_KEY`, and other credentials inside `.env.local`, never in version control. When introducing new environment variables, extend `lib/config.ts` validation and document defaults in your pull request. Confirm that the fallback values in `tests/api-smoke.test.ts` remain confined to the test environment.
