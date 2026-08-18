# 10d — E2E testing setup

**What to build:** Configure Playwright with Serenity/JS (screenplay pattern) for end-to-end testing. Add a sample smoke test to verify the setup works against the running dev server.

**Blocked by:** 10a — Next.js app scaffolding

**Status:** ready-for-agent

- [ ] Playwright installed and configured (`playwright.config.ts`)
- [ ] Serenity/JS packages installed (`@serenity-js/core`, `@serenity-js/playwright`, `@serenity-js/web`, `@serenity-js/assertions`)
- [ ] `tests/e2e/` directory created
- [ ] Sample smoke test navigates to the app and asserts page title
- [ ] `npx playwright test` runs and passes (dev server starts automatically)
