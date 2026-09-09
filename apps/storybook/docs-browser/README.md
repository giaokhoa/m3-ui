# Docs browser regression

This Playwright project exercises the real `apps/docs` Next.js product shell in Chromium. It is separate from the Storybook visual-regression project but reuses the workspace's pinned Playwright runtime.

## Run locally

Install the workspace and Chromium once:

```bash
pnpm install
pnpm --filter @m3-ui/storybook exec playwright install --only-shell chromium
```

Run the production-like docs browser suite:

```bash
pnpm --filter @m3-ui/storybook test:docs-browser
```

The command builds `@m3-ui/docs`, starts the production Next.js server on port `4173`, and runs `playwright.docs.config.ts` against it. When iterating locally, an already-running server on that port may be reused by Playwright after the build completes.

## What the suite owns

The docs browser project guards application-shell behavior that HTTP smoke tests and Node/source assertions cannot prove:

- unexpected browser console errors, React hydration warnings, page errors, and failed same-origin Next.js chunks;
- compact, medium, expanded, large, and extra-large docs navigation composition;
- compact/medium two-level drawer drill-in and expanded contextual navigation on demand;
- persistent desktop rail/drawer/article geometry at 1440px and 1920px;
- extra-large page TOC placement and horizontal overflow;
- the SSR-owned theme portal, theme preference changes, portaled search, focus restoration, and search routing;
- representative public routes, skip navigation, short-height rail action reachability, and framework 404 behavior.

Representative viewport dimensions in the tests are fixtures chosen to land inside the public Material window classes. They are not a second breakpoint source; canonical thresholds remain owned by `@m3-ui/ui/layout`.

Prefer accessible roles, names, `aria-current`, and observable geometry over private React structure. Docs-owned composition classes are used only where semantic locators cannot express pane adjacency or article anchoring.

## Failure artifacts

Playwright writes docs failures under:

```text
apps/storybook/docs-test-results/
apps/storybook/docs-playwright-report/
```

CI uploads these directories when the docs browser job fails. The project retains traces and failure screenshots so hydration, navigation, focus, and geometry regressions can be inspected from the failing run.
