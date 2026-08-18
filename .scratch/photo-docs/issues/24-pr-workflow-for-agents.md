# 24 — PR workflow for agentic development

**What to build:** Document and optionally automate the PR workflow so agents can create well-structured pull requests. Includes PR templates, branch naming conventions, and how the agent should summarize changes for human review.

**Blocked by:** None

**Status:** open

- [ ] PR template in `.github/PULL_REQUEST_TEMPLATE.md` with sections: Summary, Ticket, Changes, Testing, Gates passed
- [ ] Document agent PR workflow in AGENTS.md or a dedicated doc: agent pushes branch, creates PR via `gh`, human reviews and merges
- [ ] Investigate whether `gh pr create` can be used programmatically from the agent (it can — confirm auth works)
- [ ] Explore GitHub branch protection rules: require tests + typecheck to pass before merge (deferred until CI exists)
