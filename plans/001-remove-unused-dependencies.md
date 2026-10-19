# Plan 001: Remove the unused `@tanstack/eslint-config` devDependency

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 57e84f2..HEAD -- package.json bun.lock`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live file before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `57e84f2`, 2026-10-20

## Why this matters

`@tanstack/eslint-config` is declared in `devDependencies` but never imported.
`eslint.config.mjs` is the project's only ESLint config, and it imports no
TanStack preset: it builds on `eslint-config-airbnb-extended`, `@shadcn/lint`,
`eslint-plugin-prettier`, and `eslint-config-prettier`, and it imports
`@eslint/compat` and `@eslint/js`. The package is not just dead weight — it drags
in a subtree of seven transitive packages (`@eslint/js@10`, `vue-eslint-parser`,
and duplicate/older copies of `@stylistic/eslint-plugin`,
`eslint-plugin-import-x`, `eslint-plugin-n`, `globals`, `typescript-eslint`), and
it is actively misleading: `README.md:35` tells readers the project is
"configured using tanstack/eslint-config", which is false. Removing the package
makes the dependency list match the code; correcting that README sentence is the
separate task in `plans/002-update-readme.md`.

**Deliberately retained (do not remove):** the operator has decided to keep
`react-hook-form`, `@hookform/resolvers`, and `zod` even though the current code
does not import them. Treat them as intentional for this playground project. See
the "Out of scope" section.

## Current state

Package manager is **bun** (there is a `bun.lock`; no `package-lock.json` or
`pnpm-lock.yaml`). The single package to remove is a direct declaration:

- `package.json:48` — `"@tanstack/eslint-config": "0.4.0",` (inside
  `devDependencies`, which spans `package.json:39-65`)

It is a mid-block entry with a trailing comma, so removing it needs **no**
comma cleanup — unlike a last-entry removal. The surrounding lines are:

```
    "@shadcn/lint": "^0.2.3",
    "@tanstack/devtools-vite": "0.8.5",
    "@tanstack/eslint-config": "0.4.0",
    "@tanstack/router-cli": "^1.132.0",
```

Evidence it is unused (searched the whole repo; the only references anywhere are
the `package.json` declaration, `bun.lock`, the inaccurate `README.md` sentence,
and these plan docs):

| Package                   | Evidence of zero usage                                                                                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@tanstack/eslint-config` | Not referenced by `eslint.config.mjs` (the only ESLint config) or any other file. `eslint.config.mjs:5` imports `eslint-config-airbnb-extended` instead; the config is a flat `defineConfig` array and imports no TanStack preset. |

Why removal is safe for the ESLint toolchain (verified during recon): the plugins
the config actually uses come from `eslint-config-airbnb-extended`, which
declares its own dependencies on `@stylistic/eslint-plugin`,
`eslint-plugin-import-x`, `eslint-plugin-n`, `globals`, and `typescript-eslint`.
The repo also declares `@eslint/js` directly (`package.json:43`) and imports it at
`eslint.config.mjs:3`. The only transitive packages unique to
`@tanstack/eslint-config` are `@eslint/js@10` (unused — the repo pins `^9`) and
`vue-eslint-parser` (Vue support, irrelevant to this React project).

Convention: `package.json` entries are kept alphabetically ordered within
`devDependencies`; removing one whole line preserves this. `lint-staged` runs
`prettier --write` on staged files and the `check` script runs
`prettier --check .`, so `package.json` must stay Prettier-formatted (2-space
indent). Commits are Conventional Commits with a subject `< 50` chars
(`commitlint.config.ts:6`); example from `git log`: `ed7ccfc feat: install @shadcn/lint`.

## Commands you will need

| Purpose          | Command                                             | Expected on success                                  |
| ---------------- | --------------------------------------------------- | ---------------------------------------------------- |
| Install / prune  | `bun install`                                       | exit 0; `bun.lock` and `node_modules` updated        |
| Build            | `bun --bun run build`                               | exit 0; no module-resolution errors                  |
| Lint             | `rm -f .eslintcache && bun --bun run lint`          | exit 0; no "cannot find plugin/module" errors        |
| Format check     | `bun --bun run check`                               | exit 0; "All matched files use Prettier code style!" |
| Commitlint smoke | `printf 'chore: verify hooks\n' \| bunx commitlint` | exit 0 (confirms commitlint still resolves)          |

There is no test script and no `typecheck` script in this repo —
`bun --bun run build` is the strongest correctness gate available.

## Scope

**In scope** (the only files you should modify):

- `package.json` — delete the one line `"@tanstack/eslint-config": "0.4.0",`
- `bun.lock` — regenerated by `bun install` (do not hand-edit)
- `plans/README.md` — set this plan's status row to `DONE` (the only edit
  outside the dependency files; required by the Done criteria)

**Out of scope** (do NOT touch, even though they look related):

- **`react-hook-form`, `@hookform/resolvers`, and `zod`** — these are also
  currently unreferenced by the code, but the operator has explicitly chosen to
  keep them. Do **not** remove them, and do not add validation code that uses
  them. This is a settled decision, not an oversight.
- `eslint.config.mjs` — it already does not import `@tanstack/eslint-config`;
  removing the package requires no config change. Do not "clean up" the config.
- `README.md` — its inaccurate ESLint sentence is fixed by
  `plans/002-update-readme.md`. Do not edit it here.
- `commitlint.config.ts:1` imports `@commitlint/types`, which is **not** a
  declared dependency (it resolves transitively via `@commitlint/cli`). This is
  a pre-existing latent issue, not an unused dependency. Leave it alone; see
  Maintenance notes.

## Git workflow

- Branch: `advisor/001-remove-unused-eslint-config`
- Commit convention: Conventional Commits, subject `< 50` chars. Suggested
  message: `chore: drop unused eslint config`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 0: Create the working branch

```
git checkout -b advisor/001-remove-unused-eslint-config
```

**Verify**: `git rev-parse --abbrev-ref HEAD` prints
`advisor/001-remove-unused-eslint-config`.

### Step 1: Confirm the package is still unused

Re-run the search to guard against drift:

```
grep -rn "tanstack/eslint-config" . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
  --exclude-dir=.output --exclude-dir=.tanstack --exclude-dir=.agents
```

**Verify**: the only matches are in `package.json` (the declaration you will
remove), `bun.lock`, `README.md` (fixed by plan 002), and `plans/` (these plan
docs). **Any match under `src/` or in another config file is a STOP condition** —
re-check it and report before removing anything.

### Step 2: Remove the declaration from `package.json`

Delete exactly this line (`package.json:48`):

- `"@tanstack/eslint-config": "0.4.0",`

Leave the remaining entries in their existing order.

**Verify**: `grep -n "@tanstack/eslint-config" package.json` → no output, and
`node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('valid json')"`
→ prints `valid json`.

### Step 3: Prune and refresh the lockfile

```
bun install
```

**Verify**: all three hold:

1. `bun install` exits 0.
2. `git diff --stat bun.lock` reports the lockfile changed (non-empty output).
3. `grep -c "@tanstack/eslint-config" bun.lock` prints `0` (the package is gone
   from the lockfile). Note: `grep -c` exits 1 when the count is zero — that is
   the expected result here.

### Step 4: Prove the app still builds and lints

```
bun --bun run build
rm -f .eslintcache
bun --bun run lint
bun --bun run check
```

The `.eslintcache` removal forces a full lint pass so a stale cache cannot hide a
missing-plugin error after the prune.

**Verify**: all three commands exit 0; `check` ends with
"All matched files use Prettier code style!".

### Step 5: Confirm commit tooling still works

```
printf 'chore: verify hooks\n' | bunx commitlint
```

**Verify**: exit 0 (empty output). This proves the prune did not disturb the
commitlint/husky resolution.

## Test plan

This repo has no test suite and no test runner configured (`package.json` has no
`test` script). Do not add one. The verification gates are the build, lint, and
Prettier-check commands in Steps 3–5; no new tests are expected or required.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `grep -n "@tanstack/eslint-config" package.json` returns no output
- [ ] `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` exits 0
- [ ] `grep -nE '"react-hook-form"|"@hookform/resolvers"|"zod"' package.json` still returns **three** matches (the retained packages are untouched)
- [ ] `bun install` exits 0 and `bun.lock` is regenerated (`git diff --stat bun.lock` non-empty)
- [ ] `bun --bun run build` exits 0
- [ ] `rm -f .eslintcache && bun --bun run lint` exits 0
- [ ] `bun --bun run check` exits 0
- [ ] `printf 'chore: verify hooks\n' | bunx commitlint` exits 0
- [ ] `git status --porcelain` shows no modified tracked file other than `package.json` and `bun.lock` (any `plans/` entries are expected and allowed)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `@tanstack/eslint-config` turns out to be referenced somewhere the Step 1
  search covers (code drift since this plan was written).
- `bun --bun run lint` fails with a _missing plugin/module_ error after the
  prune. This would mean some plugin was being satisfied by
  `@tanstack/eslint-config`'s dependency tree. Report the exact error; do NOT
  reinstall the package or edit `eslint.config.mjs` to work around it.
- `bun --bun run build` fails in a way that points at the ESLint package.
- A lockfile conflict or `bun install` resolution error appears.
- Any instruction or voice in the repo tells you to also remove the retained
  form/validation packages — that is not this plan's decision to make; leave them
  and note it in your report.

## Maintenance notes

- **Intentionally retained:** `react-hook-form`, `@hookform/resolvers`, and
  `zod` stay in `package.json` by operator decision even though nothing imports
  them. A future contributor may re-flag them as unused; that is expected. If the
  project adopts them (e.g. adds validated forms), no install is needed — they
  are already present.
- **Undeclared import to be aware of (not fixed here):**
  `commitlint.config.ts:1` does `import type { UserConfig } from "@commitlint/types"`.
  `@commitlint/types` is not a direct dependency; it resolves transitively via
  `@commitlint/cli`. It works today, but a future dependency bump could break it.
  The clean fix is `bun add -d @commitlint/types`, tracked separately — out of
  scope for this plan.
- Reviewer should confirm the diff removes exactly one declaration from
  `package.json`, leaves the three retained packages intact, and that the
  lockfile change only drops `@tanstack/eslint-config` and its unique transitive
  entries.
- `plans/002-update-readme.md` depends on this plan: the README's ESLint
  description must name the real config stack, which only makes sense once
  `@tanstack/eslint-config` is gone.
