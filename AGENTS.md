# Repository Guidelines

## Project Structure & Module Organization
This project is a Next.js 14 App Router app with TypeScript.
- `app/`: routes and layouts (`app/page.tsx`, `app/calendar/page.tsx`, `app/auth/callback/route.ts`).
- `components/`: reusable UI and feature components (for example `CsvUploader.tsx`).
- `lib/`: shared utilities and integrations, including Supabase clients in `lib/supabase/`.
- `types/`: shared TypeScript types.
- Root config: `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `.eslintrc.json`.
- Sample data: `sample-schedules.csv`.

## Build, Test, and Development Commands
Use npm (lockfile is `package-lock.json`).
- `npm run dev`: start local dev server at `http://localhost:3000`.
- `npm run build`: create production build.
- `npm run start`: run production server from built output.
- `npm run lint`: run Next.js ESLint checks (`next/core-web-vitals` + TypeScript rules).

Before opening a PR, run:
```bash
npm run lint
npm run build
```

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts`/`.tsx`) with `strict: true`.
- Indentation: 2 spaces; keep imports grouped and sorted logically (React/Next, third-party, local).
- Components: PascalCase file and export names (`ScheduleForm.tsx`).
- Routes: follow App Router conventions (`app/<segment>/page.tsx`, `route.ts`).
- Utilities: camelCase function names; keep Supabase helpers under `lib/supabase/`.
- Use the `@/*` import alias for root-relative imports when it improves readability.

## Testing Guidelines
There is currently no dedicated test runner configured. For now, treat lint and build as required quality gates.
- Minimum check for every change: `npm run lint && npm run build`.
- If you add tests, prefer colocated `*.test.ts(x)` files or a `__tests__/` directory per feature.
- Focus first on parsing/import logic, date transformations, and Supabase data access paths.

## Commit & Pull Request Guidelines
Git history currently contains only `Initial commit`, so no strict convention is established yet.
- Commit messages: use imperative, scoped subjects (example: `feat(import): validate CSV headers`).
- Keep commits focused and atomic; avoid mixing refactors with feature behavior changes.
- PRs should include: purpose, key changes, verification steps, related issue (if any), and UI screenshots for page/component updates.
- Note any environment or schema assumptions (for example required `SUPABASE_*` variables).
