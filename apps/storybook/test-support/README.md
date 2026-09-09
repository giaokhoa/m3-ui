# Browser test support

Shared Playwright mechanics for the Storybook visual suite and the production docs browser suite live here. These helpers deliberately stop at browser/test plumbing; Material assertions remain visible in the individual family specs.

## `openStory()`

Use `openStory(page, storyId)` instead of repeating iframe navigation/readiness logic. It waits for the document, visible Storybook root, and fonts by default, but does not wait for global `networkidle`. Pass `{ waitForFonts: false }` only when the test does not depend on text metrics, geometry, or screenshots.

## Runtime guard

`installBrowserRuntimeGuard()` records unexpected console errors, hydration warnings, page errors, and caller-selected required-resource failures. Network policy belongs to the caller: the docs wrapper, for example, marks same-origin `/_next/` resources as required. Allowed console errors are one-shot and must stay narrow; broad warning/error allowlists are not a conformance mechanism.

## Browser mechanics

`setDocumentDirection()`, `horizontalDocumentOverflow()`, and `expectNoHorizontalDocumentOverflow()` provide reusable browser mechanics. They do not decide what a component should do in RTL or what geometry Material requires; the family test must state those expectations directly.

Do not move component variants, token values, accessibility roles, state precedence, or Material geometry expectations into generic helpers merely to reduce test lines.
