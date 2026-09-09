import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry as baseRegistry,
  openRequiredDimensions,
} from './navigation-chrome-conformance-registry.mjs';

export { CONFORMANCE_DIMENSIONS, openRequiredDimensions };

const requiredEvidence = (...evidence) => ({ status: 'required', evidence });
const notApplicable = (reason) => ({ status: 'not-applicable', reason });

const INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const SHARED_BROWSER_EVIDENCE =
  'apps/storybook/visual/interaction-utilities-conformance.visual.spec.ts';
const SSR_EVIDENCE = 'packages/ui/src/interaction-layout-utilities.ssr.test.tsx';

const CAROUSEL_VISUAL = 'apps/storybook/visual/carousel.visual.spec.ts';
const PULL_TO_REFRESH_VISUAL =
  'apps/storybook/visual/pull-to-refresh.visual.spec.ts';
const SWIPE_TO_DISMISS_VISUAL =
  'apps/storybook/visual/swipe-to-dismiss-box.visual.spec.ts';
const SCROLL_FIELD_VISUAL = 'apps/storybook/visual/scroll-field.visual.spec.ts';
const DRAG_HANDLE_VISUAL = 'apps/storybook/visual/drag-handle.visual.spec.ts';
const NON_INTERACTIVE_SCROLLBAR_VISUAL =
  'apps/storybook/visual/non-interactive-scrollbar.visual.spec.ts';

const CAROUSEL_DEFAULTS =
  'packages/ui/src/components/Carousel/Carousel.defaults.test.ts';
const CAROUSEL_CSS_EVIDENCE = 'packages/tokens/scripts/carousel-css.test.mjs';
const PULL_TO_REFRESH_DEFAULTS =
  'packages/ui/src/components/PullToRefresh/PullToRefresh.defaults.test.ts';
const SWIPE_TO_DISMISS_LOGIC =
  'packages/ui/src/components/SwipeToDismissBox/SwipeToDismissBox.logic.test.ts';
const DRAG_HANDLE_DEFAULTS =
  'packages/ui/src/components/DragHandle/DragHandle.defaults.test.ts';
const DRAG_HANDLE_CSS_EVIDENCE =
  'packages/tokens/scripts/drag-handle-css.test.mjs';
const NON_INTERACTIVE_SCROLLBAR_DEFAULTS =
  'packages/ui/src/components/NonInteractiveScrollbar/NonInteractiveScrollbar.defaults.test.ts';

const interactionUtilityFamilyDimensions = {
  carousel: {
    api: requiredEvidence(INVENTORY_EVIDENCE, CAROUSEL_DEFAULTS, CAROUSEL_VISUAL),
    materialStatesVariants: requiredEvidence(CAROUSEL_DEFAULTS, CAROUSEL_VISUAL),
    tokensVisuals: requiredEvidence(
      CAROUSEL_CSS_EVIDENCE,
      CAROUSEL_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    behavior: requiredEvidence(CAROUSEL_DEFAULTS, CAROUSEL_VISUAL),
    accessibility: requiredEvidence(CAROUSEL_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(CAROUSEL_VISUAL),
    motion: requiredEvidence(CAROUSEL_VISUAL),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(CAROUSEL_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'pull-to-refresh': {
    api: requiredEvidence(
      INVENTORY_EVIDENCE,
      PULL_TO_REFRESH_DEFAULTS,
      PULL_TO_REFRESH_VISUAL,
    ),
    materialStatesVariants: requiredEvidence(
      PULL_TO_REFRESH_DEFAULTS,
      PULL_TO_REFRESH_VISUAL,
    ),
    tokensVisuals: requiredEvidence(
      PULL_TO_REFRESH_DEFAULTS,
      PULL_TO_REFRESH_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    behavior: requiredEvidence(PULL_TO_REFRESH_VISUAL),
    accessibility: requiredEvidence(PULL_TO_REFRESH_VISUAL, SSR_EVIDENCE),
    rtlLocalization: notApplicable(
      'PullToRefresh owns a vertical top-edge gesture and centered indicator with no inline-direction-dependent behavior. Its existing RTL browser case remains an invariance regression rather than a separate RTL layout contract.',
    ),
    motion: requiredEvidence(PULL_TO_REFRESH_VISUAL),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(PULL_TO_REFRESH_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'swipe-to-dismiss-box': {
    api: requiredEvidence(
      INVENTORY_EVIDENCE,
      SWIPE_TO_DISMISS_LOGIC,
      SWIPE_TO_DISMISS_VISUAL,
    ),
    materialStatesVariants: requiredEvidence(
      SWIPE_TO_DISMISS_LOGIC,
      SWIPE_TO_DISMISS_VISUAL,
    ),
    tokensVisuals: requiredEvidence(SWIPE_TO_DISMISS_LOGIC, SWIPE_TO_DISMISS_VISUAL),
    behavior: requiredEvidence(SWIPE_TO_DISMISS_LOGIC, SWIPE_TO_DISMISS_VISUAL),
    accessibility: requiredEvidence(SWIPE_TO_DISMISS_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(SWIPE_TO_DISMISS_VISUAL),
    motion: requiredEvidence(SWIPE_TO_DISMISS_VISUAL),
    theme: notApplicable(
      'SwipeToDismissBox owns gesture geometry, logical direction and transform settling but no family semantic color paint. Background and foreground colors belong to caller-provided content, so dynamic Material theme paint is not a component-owned contract.',
    ),
    browser: requiredEvidence(SWIPE_TO_DISMISS_VISUAL),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'scroll-field': {
    api: requiredEvidence(INVENTORY_EVIDENCE, SCROLL_FIELD_VISUAL),
    materialStatesVariants: requiredEvidence(SCROLL_FIELD_VISUAL),
    tokensVisuals: requiredEvidence(SCROLL_FIELD_VISUAL, SHARED_BROWSER_EVIDENCE),
    behavior: requiredEvidence(SCROLL_FIELD_VISUAL),
    accessibility: requiredEvidence(SCROLL_FIELD_VISUAL, SSR_EVIDENCE),
    rtlLocalization: notApplicable(
      'ScrollField is a vertical spinbutton-style value selector. Its selection, wheel, pointer and ArrowUp/ArrowDown behavior does not change with inline writing direction.',
    ),
    motion: requiredEvidence(SCROLL_FIELD_VISUAL),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(SCROLL_FIELD_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'drag-handle': {
    api: requiredEvidence(INVENTORY_EVIDENCE, DRAG_HANDLE_DEFAULTS, DRAG_HANDLE_VISUAL),
    materialStatesVariants: requiredEvidence(DRAG_HANDLE_DEFAULTS, DRAG_HANDLE_VISUAL),
    tokensVisuals: requiredEvidence(
      DRAG_HANDLE_CSS_EVIDENCE,
      DRAG_HANDLE_DEFAULTS,
      DRAG_HANDLE_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    behavior: requiredEvidence(DRAG_HANDLE_VISUAL),
    accessibility: requiredEvidence(DRAG_HANDLE_VISUAL, SSR_EVIDENCE),
    rtlLocalization: notApplicable(
      'VerticalDragHandle owns vertical separator presentation and pointer feedback only. Inline-direction-dependent pane resizing and value changes belong to the surrounding resize owner.',
    ),
    motion: notApplicable(
      'VerticalDragHandle switches its own Material default/pressed/dragged geometry immediately. Hover/focus/press wave timing belongs to the shared Ripple primitive rather than this family.',
    ),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(DRAG_HANDLE_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'non-interactive-scrollbar': {
    api: requiredEvidence(
      INVENTORY_EVIDENCE,
      NON_INTERACTIVE_SCROLLBAR_DEFAULTS,
      NON_INTERACTIVE_SCROLLBAR_VISUAL,
    ),
    materialStatesVariants: requiredEvidence(
      NON_INTERACTIVE_SCROLLBAR_DEFAULTS,
      NON_INTERACTIVE_SCROLLBAR_VISUAL,
    ),
    tokensVisuals: requiredEvidence(
      NON_INTERACTIVE_SCROLLBAR_DEFAULTS,
      NON_INTERACTIVE_SCROLLBAR_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    behavior: requiredEvidence(NON_INTERACTIVE_SCROLLBAR_VISUAL),
    accessibility: requiredEvidence(NON_INTERACTIVE_SCROLLBAR_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(NON_INTERACTIVE_SCROLLBAR_VISUAL),
    motion: requiredEvidence(NON_INTERACTIVE_SCROLLBAR_VISUAL),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(
      NON_INTERACTIVE_SCROLLBAR_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
};

const lane9Ids = new Set(Object.keys(interactionUtilityFamilyDimensions));
const families = baseRegistry.families.map((family) =>
  lane9Ids.has(family.id)
    ? { ...family, dimensions: interactionUtilityFamilyDimensions[family.id] }
    : family,
);

export const materialConformanceRegistry = {
  ...baseRegistry,
  families,
};
