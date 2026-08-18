# 23 — Add ESLint and Prettier

**What to build:** Configure ESLint with a sensible Next.js/React/TypeScript preset and Prettier for consistent formatting. Add `lint` and `format` scripts to `package.json` so the pre-merge gate can include linting.

**Blocked by:** None

**Status:** ready-for-agent

- [ ] ESLint installed and configured with Next.js + TypeScript + React rules
- [ ] Prettier installed and configured (`.prettierrc` or equivalent)
- [ ] `pnpm run lint` script added to `package.json`
- [ ] `pnpm run format` script added to `package.json`
- [ ] `pnpm run lint` passes on the full codebase with no errors
- [ ] AGENTS.md updated: add `pnpm run lint` to commands, update pre-merge gates to include lint
