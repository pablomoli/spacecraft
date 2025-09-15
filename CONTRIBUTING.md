# Contributing Workflow

This document defines how we work on issues and pull requests, with exact commands
and when to use them. It complements AGENTS.md (agent-specific guidance).

## Roles & Approvals
- Maintainer runs tests after commits and performs all pushes.
- Assistant never pushes; it may suggest commands but does not execute `git push`.

## Branching Strategy
- Base branch: `main`
- Feature branches: `feature/<short-slug>` (e.g., `feature/extract-map-css`)

Commands:
- Update local and create a feature branch:
  - `git checkout main && git pull --ff-only`
  - `git checkout -b feature/<short-slug>`

## Sync Before New Work
- Always sync your base branch before starting or merging new work to avoid divergence.

Commands:
- Update local `main` to the latest remote state:
  - `git fetch origin`
  - `git switch main`
  - `git pull --ff-only`
- Start your branch from up-to-date `master`:
  - `git switch -c feature/<short-slug>`

## Rebasing Feature Branches
- If `main` moved while you were working, rebase your feature onto the latest `origin/main` before pushing or opening a PR.

Commands:
- Rebase your feature branch on latest `main`:
  - `git fetch origin`
  - `git rebase origin/main`
  - Resolve any conflicts, then continue: `git rebase --continue`
  - Push the branch (force-with-lease if already pushed):
    - first push: `git push -u origin feature/<short-slug>`
    - subsequent after rebase: `git push --force-with-lease`

## Recommended Git Config Defaults
- Make pulls rebase by default, and only fast-forward when possible; auto-stash during rebase.

Commands (run once):
- `git config --global pull.rebase true`
- `git config --global pull.ff only`
- `git config --global rebase.autostash true`

## Working on an Issue
- Reference the GitHub issue number in the branch name and PR title/body.
- Keep changes focused and scoped to a single issue.

Commands:
- Stage and commit focused changes:
  - `git add -p` (or explicit paths)
  - `git commit -m "<Imperative summary> (refs #<issue>)"`

## Testing (maintainer)
- Run app locally and sanity-check critical flows.
- No formal test suite yet; prefer targeted tests under `tests/` (pytest) when behavior changes.

Commands:
- Dev server: `flask --app app run --reload`
- Health check: `curl http://localhost:5000/api/health`

## Push & Pull Request
- Maintainer pushes branches and opens PRs.
- Contributors: do not push. You may commit locally and open PRs using GitHub CLI (`gh`).

Commands:
- Push branch (first time):
  - `git push -u origin feature/<short-slug>`
- Create PR against `main` (using GitHub CLI):
  - `gh pr create -t "<Title> (closes #<issue>)" -b "<Body>" -H feature/<short-slug> -B main -l refactor -l css --draft`
- Open PR in browser:
  - `gh pr view --web`
- Check PR status:
  - `gh pr status`

## Merging & Issue Closure
- Merge via Web UI (preferred) or gh. Close related issues on merge.

Commands:
- Merge with gh (optional):
  - `gh pr merge <PR#> --squash --delete-branch`
- Close issue with context:
  - `gh issue close <issue#> -r completed -c "Closed via PR #<PR#>."`

## Branch Cleanup
- After merging, delete local and remote feature branches.

Commands:
- Local: `git branch -d feature/<short-slug>`
- Remote: `git push origin --delete feature/<short-slug>`

## Quick Reference
- Start work:
  - `git checkout main && git pull --ff-only && git checkout -b feature/<slug>`
- Commit:
  - `git add -p && git commit -m "<Message> (refs #<issue>)"`
- Push (maintainer):
  - `git push -u origin feature/<slug>`
- PR (contributor):
  - `gh pr create -t "<Title> (closes #<issue>)" -b "<Body>" -H feature/<slug> -B main --draft`

## Detailed Workflow
- See `CONTRIBUTING_WORKFLOW.md` for a step‑by‑step process, gh CLI cookbook, and a review checklist.

## Production CSS Build (Tailwind + DaisyUI)
- We compile CSS locally instead of using the Tailwind CDN in production.

Setup (once):
- `npm install` (installs tailwindcss, daisyui, postcss, autoprefixer)

Dev (watch):
- `npm run dev` (writes to `static/dist/app.css`)

Build (prod):
- `npm run build` (minified, no sourcemaps)

Notes:
- `templates/base.html` now references `static/dist/app.css`.
- Theme and DaisyUI config live in `tailwind.config.cjs`.

- Sync + Rebase:
  - `git fetch origin && git switch main && git pull --ff-only`
  - `git switch feature/<slug> && git rebase origin/main`
- Merge & close:
  - `gh pr merge <PR#> --squash --delete-branch`
  - `gh issue close <issue#> -r completed -c "Closed via PR #<PR#>."`
- Cleanup:
  - `git branch -d feature/<slug>`
  - `git push origin --delete feature/<slug>`

Notes:
- Keep PRs small and focused; include screenshots/GIFs for UI changes.
- Do not commit secrets or `.env`. See AGENTS.md for security and environment details.
