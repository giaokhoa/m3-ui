# React Aria test-utils pilot

Issue: #431  
Status: evaluated, not adopted

## Decision

Do not add `@react-aria/test-utils` to `@m3-ui/ui` yet.

The current package is still `1.0.0-rc.1`. Its supported testers are useful for semantic DOM/unit tests, but the RAC migrations in this repository already place interaction coverage in Playwright browser specs that exercise the same roles, names, keyboard/pointer flows, focus movement, and dismissal behavior in a real browser. Adding a second DOM-emulation harness would duplicate those contracts without improving coverage enough to justify an RC dependency.

This is intentionally a pilot rejection, not a permanent ban. Re-evaluate when the package is stable or when a package-level interaction test has a concrete gap that Playwright does not cover efficiently.

## Upstream evidence

- React Aria testing guide: https://react-aria.adobe.com/testing
- ComboBox tester: https://react-aria.adobe.com/ComboBox/testing
- Menu tester: https://react-aria.adobe.com/Menu/testing
- RadioGroup tester: https://react-aria.adobe.com/RadioGroup/testing
- Modal/Dialog tester: https://react-aria.adobe.com/Modal/testing
- Popover/Dialog tester: https://react-aria.adobe.com/Popover/testing
- React Aria v1.21.0 release: https://react-aria.adobe.com/releases/v1-21-0

The current guide marks `@react-aria/test-utils` as RC, requires React 18+, and states that it uses `@testing-library/dom@10` and `@testing-library/user-event@14`. The package currently supports ComboBox, Menu, RadioGroup, and Dialog testers among other ARIA patterns.

## Repository evaluation

| Migrated pattern | What the RAC tester adds | Existing repository evidence | Pilot result |
| --- | --- | --- | --- |
| ComboBox / ListBox | Open/close, semantic combobox/listbox/option queries, selection helpers | `apps/storybook/visual/exposed-dropdown-menu.visual.spec.ts` covers semantic roles/names, editable and read-only flows, keyboard selection, controlled dismissal, disabled state, touch, virtual click, form participation, focus, and viewport behavior | Do not duplicate. Browser coverage is broader and includes pointer/touch/layout behavior the tester does not replace. |
| Menu | Open/close, option queries/selection, submenu helpers | `apps/storybook/visual/menu.visual.spec.ts` and `apps/storybook/visual/button-group.visual.spec.ts` cover focus entry, arrow navigation, disabled items, activation, Escape, focus restoration, outside dismissal, submenus, and RTL placement | Do not duplicate. The tester would mostly restate already-semantic Playwright flows. |
| RadioGroup | Query radios/selection and trigger a radio | `apps/storybook/visual/list-item.visual.spec.ts` covers role/name selection, roving focus, arrow-key selection, disabled-item skipping, segmented reuse, and RTL navigation | Do not duplicate. Current browser tests assert the RAC behavior that matters to the public component. |
| Modal/Dialog | Open/close and semantic dialog query via `overlayType: 'modal'` | `apps/storybook/visual/dialog.visual.spec.ts` covers modal visibility, focus containment, Escape dismissal, close-slot dismissal, and trigger focus restoration | Do not duplicate. Current browser coverage is stronger for focus lifecycle. |
| Popover / PreviewTrigger | Dialog tester can address a Popover via `overlayType: 'popover'` | `apps/storybook/visual/tooltip.visual.spec.ts` covers rich-tooltip dialog relationships, keyboard focus, Tab into actions, Escape restoration, persistent outside dismissal, pointer travel, and touch long press | Do not adopt for this path. There is no PreviewTrigger-specific tester, and its most important behavior here is browser input-modality/hover/long-press behavior. |
| SearchField / search overlays | No SearchField tester is listed in the current supported-pattern set | `apps/storybook/visual/search-bar.visual.spec.ts` covers native search semantics, clear/focus, docked and fullscreen Escape/outside dismissal, focus transfer/trap, and restoration | Concrete gap: current test-utils do not offer a SearchField tester. Keep the browser tests. |

## Why a direct dependency is not justified

The existing `@m3-ui/ui` Vitest configuration is Node/SSR-oriented and has no dedicated DOM test environment or React Testing Library render harness. The official test-utils examples assume an `HTMLElement` root and Testing Library style DOM interaction, while the repository's migrated interaction contracts already run through Playwright `Page`/`Locator` APIs against Storybook in Chromium.

Adopting the RC package now would therefore require a new DOM-test layer and supporting dependencies/configuration before it could replace any existing helper. That would increase test infrastructure and duplicate browser contracts rather than simplify them.

The package also cannot replace Material visual/token coverage. Geometry, paint, generated-token, and motion assertions remain intentionally outside the RAC semantic test boundary.

## Revisit criteria

Adopt `@react-aria/test-utils` narrowly when at least one of these becomes true:

1. the package reaches a stable release and keeps a compatible supported-pattern API;
2. a new RAC-backed component needs fast package-level semantic interaction coverage that is not already covered in browser tests;
3. a tester removes a bespoke interaction helper while preserving or improving user-level semantics;
4. the repository establishes a shared DOM test environment for another justified reason.

When revisiting, keep the wrapper boundary local to test support, prefer roles/names over DOM/class selectors, and do not migrate visual/token assertions into RAC interaction tests.
