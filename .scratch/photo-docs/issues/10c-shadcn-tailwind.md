# 10c — ShadCN/Tailwind setup

**What to build:** Configure Tailwind CSS v4 and install ShadCN UI with the new-york style preset so subsequent feature tickets have a component library ready to use.

**Blocked by:** 10a — Next.js app scaffolding

**Status:** ready-for-agent

- [ ] Tailwind CSS v4 configured via PostCSS plugin (`@tailwindcss/postcss`)
- [ ] `app/globals.css` updated with `@import "tailwindcss"` (v4 style — no `tailwind.config.ts`)
- [ ] ShadCN UI initialized with new-york style, slate base color, CSS variables
- [ ] `components/ui/` populated with base components (button, card, dialog, progress)
- [ ] `lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)
- [ ] `pnpm run dev` still works with styling applied
