# AGENTS.md

## What this repo is

Next.js 16 photo-capture app for mobile devices. Users take photos via camera API, select/reject in a strip, upload to Nextcloud. Offline-first with IndexedDB local storage and background upload.

**Read `CONTEXT.md` for domain glossary and `@.scratch/photo-docs/PRD.md` for the wayfinder map.** Specs and implementation tickets live in `.scratch/photo-docs/issues/`.

## Repo structure

`main` is the single source of truth and is always deployable. All feature work happens in git worktrees, one per ticket.

```
.scratch/photo-docs/
  PRD.md                    # Wayfinder map (resolved decisions)
  issues/                   # Specs (09) and implementation tickets (10–24)
  research/                 # Research artifacts (camera, storage, error modes, backend)
```

Active worktrees live under `.worktrees/` (gitignored). Each contains the full Next.js app: `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`, `tests/e2e/`.

## Commands

All commands run **inside a worktree directory** (e.g. `.worktrees/t_<hash>/`), not the repo root.

```bash
pnpm install               # install deps (pnpm@11.22.0 — do not use npm/yarn)
pnpm run dev               # start Next.js dev server (localhost:3000)
pnpm run test              # vitest run (single pass)
pnpm run test:watch        # vitest watch mode
pnpm run build             # next build
npx playwright test        # E2E tests (starts dev server automatically)
```

There is **no lint or typecheck script** configured yet. Run `npx tsc --noEmit` manually if needed.

## Tech stack

- **Next.js 16.3.1** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** (PostCSS plugin, no `tailwind.config.ts` — config is in CSS)
- **ShadCN UI** (new-york style, Radix primitives) — `components/ui/`
- **Vitest 4** (jsdom, Testing Library) for unit/integration tests
- **Playwright** + **Serality/JS** (screenplay pattern) for E2E in `tests/e2e/`
- **pnpm 11.22.0** as package manager (`packageManager` field in package.json)

## Branch strategy: trunk-based

- `main` = single source of truth, always deployable
- Feature branches: `wt/t_<ticket-hash>` — one worktree per ticket
- Create worktrees with: `git worktree add .worktrees/t_<hash> -b wt/t_<hash>`
- Commits use **conventional commits** format: `feat(scope): description`
- `.worktrees/` is gitignored and not tracked

### Integration rules

- **Merge method:** Squash merge only — one clean commit per ticket on `main`
- **Pre-merge gates:** Tests (`pnpm run test`) and typecheck (`npx tsc --noEmit`) must pass before merge. Add lint once configured.
- **Remote workflow:** Always push the worktree branch to `origin` and open a GitHub PR. PR title = ticket title. PR description = summary of changes.
- **Merge governance:** Agent creates the PR. Human reviews and merges.
- **Worktree lifecycle:** Create at ticket start. Destroy immediately after merge (`git worktree remove` + `git branch -d`). One active worktree at a time.

## Workflow

This repo uses **mattpocock-skills** for the full lifecycle:

1. **Grill** → sharpen requirements (`grilling` / `grill-with-docs` skill)
2. **Research** → investigate technical questions (`research` skill)
3. **Spec** → write specifications (`to-spec` skill)
4. **Tickets** → break spec into implementation tickets (`to-tickets` skill)
5. **Implement** → build ticket-by-ticket with TDD (`implement` / `tdd` skill)
6. **Review** → code review each completed work (`code-review` skill)

Tickets in `.scratch/photo-docs/issues/` have status labels:
- `open` = spec in progress
- `ready-for-agent` = ticket is unblocked and can be implemented
- `closed` = done

**Ticket dependency chain:** 10a (Next.js app) → 10b (unit testing) → 11 (Storage + MockStorage) → 12 (NextCloudStorage) → 13 (camera pipeline) → 14 (photo strip) → 15 (upload service) → 16 (background upload) → 17 (error handling) → 18 (session persistence) → 19 (folder navigation) → 20 (auth flow) → 21 (PWA) → 22 (responsive layouts). Parallel branches: 10a → 10c (ShadCN/Tailwind) → 13, 10a → 10d (E2E testing) → 13.

## Testing

- **Unit/integration:** Vitest with jsdom + `@testing-library/react`. Setup file: `vitest.setup.ts`. Tests collocated in `__tests__/` or alongside source as `*.test.ts(x)`.
- **E2E:** Playwright with Serality/JS. Config: `playwright.config.ts`. Tests in `tests/e2e/`. Web server starts automatically via `pnpm run dev`.
- **TDD is the default approach** — write tests before implementation per the `implement` and `tdd` skills.
- The `Storage` interface is the primary seam for testing. `MockStorage` supports error injection (quota, network, auth, 5xx).

## Key architectural decisions

- **Storage abstraction:** `src/lib/storage/types.ts` defines the `Storage` interface. `createStorage()` factory in `src/lib/storage/index.ts` driven by `STORAGE_BACKEND` env var (`mock` | `nextcloud`). Implementations: `src/lib/storage/mock.storage.ts`, `src/lib/storage/nextcloud.storage.ts`.
- **Photo capture:** Canvas `drawImage` (cross-platform, including iOS Safari). Camera stream stays alive between captures; re-acquired on `visibilitychange`.
- **Upload:** REST API preferred over WebDAV (WebDAV was slow). Chunked upload with retry.
- **Auth:** Nextcloud as primary auth provider. `AuthTokenExpiredError` triggers re-auth flow.
- **Responsive:** T-shirt sizes only — small (smartphone ~375px+), medium (tablet ~768px+). Desktop is out of scope.
- **Error classes:** `QuotaExceededError`, `NetworkTimeoutError`, `AuthTokenExpiredError`, `ServerError` in `src/lib/storage/errors.ts`. NextCloud storage adds `ConflictError`, `PermissionDeniedError`, `RequestEntityTooLargeError`.

## Gotchas

- **Next.js version:** 16.3.1 may have breaking changes from your training data. Check `node_modules/next/dist/docs/` if something behaves unexpectedly.
- **Tailwind v4:** No `tailwind.config.ts`. Tailwind is configured via CSS (`app/globals.css`) using `@import "tailwindcss"`. Don't look for a config file that doesn't exist.
- **No lint/prettier:** No ESLint or Prettier is configured. If you add them, document the config in package.json scripts.
- **No CI:** No GitHub Actions or pre-commit hooks exist yet.
- **Worktree isolation:** Each worktree is a full independent checkout. Dependencies must be installed per-worktree (`pnpm install`).
- **`AGENTS.md` in worktrees:** Auto-generated by `next dev` — do not edit it. The real `AGENTS.md` is this one at the repo root.
