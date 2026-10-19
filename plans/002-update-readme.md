# Plan 002: Correct the README's linting, deploy, and Tailwind sections

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 57e84f2..HEAD -- README.md`
> If `README.md` changed since this plan was written, compare the "Current
> state" excerpts against the live file before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001-remove-unused-dependencies.md (the ESLint wording must describe the post-removal state; run 001 first, or at minimum confirm 001's `package.json` diff landed)
- **Category**: docs
- **Planned at**: commit `57e84f2`, 2026-10-20

## Why this matters

`README.md` is still the default TanStack Start template text. Three factual
statements no longer match the repository, and the script list omits half the
available scripts. Two of the inaccuracies are load-bearing: the README points
readers at an ESLint preset the project does not use (and which Plan 001
removes), and it tells deployers to copy values from a `.env.example` file that
does not exist. A stale "how to remove Tailwind" step instructs readers to
delete a directory that isn't present. These cost a new contributor real time
and erode trust in the rest of the document. Correcting them is cheap and
low-risk.

## Current state

Only `README.md` is in scope. The inaccurate passages, as they exist today.

> **Line-number note:** every `README.md:NN` reference in this plan points at
> the file _before_ Step 1 runs. Step 1 grows the intro from one line to three,
> shifting every later line down by 2 (e.g. line 35 becomes line 37). Match by
> **content**, not by line number, once Step 1 is done.

`README.md:1` — template placeholder intro:

```
Welcome to your new TanStack Start app!
```

`README.md:24-31` — the Tailwind-removal section, whose first step names a
directory that does not exist (`src/routes/` contains only `__root.tsx`,
`index.tsx`, and the generated `routeTree.gen.ts`):

```
### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Remove `@tailwindcss/vite` and `tailwindcss` from `package.json`
```

`README.md:33-41` — the lint section, which claims a preset the project does
not use and lists only 3 of the available scripts:

````
## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
bun --bun run lint
bun --bun run format
bun --bun run check
```
````

`README.md:43-49` — the deploy section, step 4 of which references a missing file:

```
1. Push this repo to GitHub, GitLab, or Bitbucket
2. In Vercel, choose **Add New > Project** and import the repo
3. Keep the detected TanStack Start framework settings
4. Add production values from `.env.example` under **Settings > Environment Variables**
5. Deploy
```

Ground truth the corrections must reflect (all verified during recon):

- `package.json` scripts: `build`, `check`, `dev`, `format`, `generate-routes`,
  `lint`, `lint:fix`, `prepare`, `preview`. (`prepare` runs `husky` and is not
  user-facing.)
- `eslint.config.mjs` is the only ESLint config; it is a self-contained flat
  config that imports `@eslint/js`, `@eslint/compat`, `@shadcn/lint`,
  `eslint-config-airbnb-extended`, `eslint-config-prettier`, and
  `eslint-plugin-prettier`. It does **not** import `@tanstack/eslint-config`.
- Package name is `coss-ui-playground` (`package.json:2`), and
  `components.json:23` registers a COSS UI registry `@coss`
  (`https://coss.com/ui/r/{name}.json`).
- The only environment variable read by the app is `VITE_SITE_URL` in
  `src/lib/seo.ts:10`, with a fallback default of
  `https://coss-ui-playground.vercel.app`. There is no `.env.example` (and no
  `.env`) in the repository; `.gitignore` ignores `.env`.
- `vercel.json` exists and sets `"framework": "tanstack-start"`, matching the
  deploy section's steps 2–3, which are correct and stay as-is.

Convention: prose lines in this repo are not force-wrapped (`printWidth: 100`,
no `proseWrap` override in `.prettierrc.json`), and `bun --bun run check` runs
`prettier --check .`, so the edited Markdown must remain Prettier-clean. Do not
hand-reflow unrelated paragraphs.

## Commands you will need

| Purpose      | Command                | Expected on success                                     |
| ------------ | ---------------------- | ------------------------------------------------------- |
| Format check | `bun --bun run check`  | exit 0; "All matched files use Prettier code style!"    |
| Format write | `bun --bun run format` | exit 0 (only if Prettier reports a diff in `README.md`) |

There is no test suite and no doc build in this repo. The Prettier check plus
the `grep` assertions below are the complete verification surface.

## Scope

**In scope** (the only file you should modify):

- `README.md`

**Out of scope** (do NOT touch, even though they look related):

- Any source, config, or lockfile change. In particular do **not** touch
  `package.json`, `eslint.config.mjs`, `vite.config.ts`, or `.env.example`
  (creating that file is a separate decision — see Maintenance notes).
- The remaining README sections (Routing, Server Functions, API Routes, Data
  Fetching, Learn More, the `VITE_`/secrets paragraph at lines 54–55). They are
  accurate enough and are not part of this plan.
- Do not "modernize" or rewrite the document's structure/tone — make only the
  four edits below.

## Git workflow

- Branch: `advisor/002-update-readme`
- Commit convention: Conventional Commits, subject `< 50` chars
  (`commitlint.config.ts:6-7`). Suggested message: `docs: fix stale readme notes`.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Give the document a real title

Replace `README.md:1` (`Welcome to your new TanStack Start app!`) with:

```
# coss-ui-playground

A TanStack Start app using [COSS UI](https://coss.com/ui) components.
```

(Leave the blank line before `# Getting Started` in place.)

**Verify**: `head -1 README.md` → `# coss-ui-playground`.

### Step 2: Fix the Tailwind-removal steps

Delete the first list item (`1. Remove the demo pages in \`src/routes/demo/\``)
and renumber the remaining three steps so the section reads:

```
### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Replace the Tailwind import in `src/styles.css` with your own styles
2. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
3. Remove `@tailwindcss/vite` and `tailwindcss` from `package.json`
```

**Verify**: `grep -n "src/routes/demo" README.md` → no output.

### Step 3: Correct the ESLint description and complete the script list

Replace the paragraph at `README.md:35` so it names the real configuration, and
expand the code block to list every user-facing script. The section should read:

````
## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. ESLint is configured in `eslint.config.mjs` with `eslint-config-airbnb-extended`, `@shadcn/lint`, and `eslint-plugin-prettier`. Prettier is configured in `.prettierrc.json`. The following scripts are available:

```bash
bun --bun run lint       # eslint --cache
bun --bun run lint:fix   # eslint --fix
bun --bun run format     # prettier --write .
bun --bun run check      # prettier --check .
bun --bun run generate-routes  # regenerate src/routeTree.gen.ts
bun --bun run preview    # preview the production build locally
```
````

Do not fabricate links for the ESLint packages — plain inline code is correct.

**Verify**: `grep -n "tanstack/eslint-config" README.md` → no output, and
`grep -c "bun --bun run" README.md` → `8` (two in Getting Started/Building, six
in the scripts block).

### Step 4: Fix the deploy section's environment-variable step

Replace `README.md:48` (`4. Add production values from \`.env.example\` under
**Settings > Environment Variables**`) with:

```
4. Optionally set `VITE_SITE_URL` under **Settings > Environment Variables** (used for canonical/SEO metadata; defaults to `https://coss-ui-playground.vercel.app`)
```

Leave steps 1–3 and 5, and the paragraph following the list (lines 51–52), as-is.

**Verify**: `grep -n "env.example" README.md` → no output.

### Step 5: Confirm formatting

```
bun --bun run check
```

If Prettier reports `README.md` as not formatted, run
`bun --bun run format` once, then re-run `bun --bun run check`.

**Verify**: `bun --bun run check` exits 0 with "All matched files use Prettier code style!".

## Test plan

No test suite exists and none is needed for a documentation change. Verification
is the Prettier check (Step 5) plus the four `grep` assertions in Steps 1–4.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `head -1 README.md` prints `# coss-ui-playground`
- [ ] `grep -n "src/routes/demo" README.md` → no output
- [ ] `grep -n "tanstack/eslint-config" README.md` → no output
- [ ] `grep -n "env.example" README.md` → no output
- [ ] `grep -n "eslint-config-airbnb-extended" README.md` → one match
- [ ] `grep -c "bun --bun run" README.md` → `8`
- [ ] `bun --bun run check` exits 0
- [ ] `git status` shows `README.md` as the only modified file
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts under "Current state" do not match the live `README.md` (the file
  drifted since this plan was written).
- Plan 001 has not landed and `@tanstack/eslint-config` is still a declared
  dependency — the Step 3 wording assumes Plan 001 removed it. Report this
  rather than rewording around it.
- A `grep` verification in Steps 1–4 returns an unexpected result (e.g. the
  strings appear elsewhere in the file), which would change the edit.
- Prettier reformats unrelated parts of `README.md` when you run `format` — that
  means the file was already non-Prettier-clean; report the diff instead of
  committing unrelated churn.

## Maintenance notes

- **`.env.example`:** this plan corrects the README rather than adding the file.
  If the maintainer prefers having a template, create `.env.example` containing
  a single commented line such as `# VITE_SITE_URL=https://example.com` as a
  separate change, and re-point step 4 of the deploy section at it. Do not
  create it as part of this plan (it is scope, not a correction).
- The `VITE_`/secrets paragraph at `README.md:54-55` was left untouched: it is
  generic guidance, not a false claim, but note the project currently ships no
  secrets at all. If secret env vars are ever introduced, this paragraph becomes
  load-bearing and should be expanded.
- Reviewer should confirm the diff is limited to the four edits above and that
  no code, config, lockfile, or unrelated prose changed.
- The README is still template-derived (Routing / Server Functions / API Routes
  / Data Fetching sections are generic examples). Making it project-specific is
  a larger, separate documentation effort — not part of this plan.
