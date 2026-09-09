import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry as baseRegistry,
  openRequiredDimensions,
} from './material-conformance-registry.mjs';

export { CONFORMANCE_DIMENSIONS, openRequiredDimensions };

const requiredEvidence = (...evidence) => ({ status: 'required', evidence });
const notApplicable = (reason) => ({ status: 'not-applicable', reason });

const INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const SHARED_BROWSER_EVIDENCE =
  'apps/storybook/visual/navigation-chrome-conformance.visual.spec.ts';
const SSR_EVIDENCE = 'packages/ui/src/navigation-chrome.ssr.test.tsx';
const NAVIGATION_CSS_EVIDENCE = 'packages/tokens/scripts/navigation-css.test.mjs';
const NAVIGATION_BASELINE_AUDIT =
  'packages/tokens/scripts/audit-material-web-navigation-baseline.mjs';
const NAVIGATION_EXPRESSIVE_AUDIT =
  'packages/tokens/scripts/audit-material-web-navigation-expressive.mjs';
const APP_BAR_AUDIT = 'packages/tokens/scripts/audit-material-web-app-bar.mjs';
const TOOLBAR_AUDIT = 'packages/tokens/scripts/audit-material-web-toolbar.mjs';
const APP_BAR_CSS_EVIDENCE =
  'packages/tokens/scripts/app-bars-search-toolbar-css.test.mjs';

const NAVIGATION_BAR_VISUAL = 'apps/storybook/visual/navigation-bar.visual.spec.ts';
const SHORT_NAVIGATION_BAR_VISUAL =
  'apps/storybook/visual/short-navigation-bar.visual.spec.ts';
const NAVIGATION_RAIL_VISUAL = 'apps/storybook/visual/navigation-rail.visual.spec.ts';
const WIDE_NAVIGATION_RAIL_VISUAL =
  'apps/storybook/visual/wide-navigation-rail.visual.spec.ts';
const MODAL_WIDE_NAVIGATION_RAIL_VISUAL =
  'apps/storybook/visual/modal-wide-navigation-rail.visual.spec.ts';
const NAVIGATION_DRAWER_VISUAL =
  'apps/storybook/visual/navigation-drawer.visual.spec.ts';
const TABS_VISUAL = 'apps/storybook/visual/tabs.visual.spec.ts';
const TOP_APP_BAR_VISUAL = 'apps/storybook/visual/top-app-bar.visual.spec.ts';
const BOTTOM_APP_BAR_VISUAL =
  'apps/storybook/visual/bottom-app-bar.visual.spec.ts';
const FLOATING_TOOLBAR_VISUAL =
  'apps/storybook/visual/floating-toolbar.visual.spec.ts';
const APP_BAR_ROW_VISUAL = 'apps/storybook/visual/app-bar-row.visual.spec.ts';
const APP_BAR_COLUMN_VISUAL =
  'apps/storybook/visual/app-bar-column.visual.spec.ts';

const navigationChromeFamilyDimensions = {
  'navigation-bar': {
    api: requiredEvidence(
      INVENTORY_EVIDENCE,
      NAVIGATION_BAR_VISUAL,
      SHORT_NAVIGATION_BAR_VISUAL,
    ),
    materialStatesVariants: requiredEvidence(
      NAVIGATION_BAR_VISUAL,
      SHORT_NAVIGATION_BAR_VISUAL,
    ),
    tokensVisuals: requiredEvidence(
      NAVIGATION_BASELINE_AUDIT,
      NAVIGATION_EXPRESSIVE_AUDIT,
      NAVIGATION_CSS_EVIDENCE,
      NAVIGATION_BAR_VISUAL,
      SHORT_NAVIGATION_BAR_VISUAL,
    ),
    behavior: requiredEvidence(
      NAVIGATION_BAR_VISUAL,
      SHORT_NAVIGATION_BAR_VISUAL,
    ),
    accessibility: requiredEvidence(
      NAVIGATION_BAR_VISUAL,
      SHORT_NAVIGATION_BAR_VISUAL,
      SSR_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(SHORT_NAVIGATION_BAR_VISUAL),
    motion: notApplicable(
      'NavigationBar and ShortNavigationBar own no family-level transition or animation contract. Their hover/press/focus state-layer wave timing belongs to the shared Ripple primitive and remains tested at that shared boundary.',
    ),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(
      NAVIGATION_BAR_VISUAL,
      SHORT_NAVIGATION_BAR_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'navigation-rail': {
    api: requiredEvidence(
      INVENTORY_EVIDENCE,
      NAVIGATION_RAIL_VISUAL,
      WIDE_NAVIGATION_RAIL_VISUAL,
      MODAL_WIDE_NAVIGATION_RAIL_VISUAL,
    ),
    materialStatesVariants: requiredEvidence(
      NAVIGATION_RAIL_VISUAL,
      WIDE_NAVIGATION_RAIL_VISUAL,
      MODAL_WIDE_NAVIGATION_RAIL_VISUAL,
    ),
    tokensVisuals: requiredEvidence(
      NAVIGATION_BASELINE_AUDIT,
      NAVIGATION_EXPRESSIVE_AUDIT,
      NAVIGATION_CSS_EVIDENCE,
      NAVIGATION_RAIL_VISUAL,
      WIDE_NAVIGATION_RAIL_VISUAL,
      MODAL_WIDE_NAVIGATION_RAIL_VISUAL,
    ),
    behavior: requiredEvidence(
      NAVIGATION_RAIL_VISUAL,
      WIDE_NAVIGATION_RAIL_VISUAL,
      MODAL_WIDE_NAVIGATION_RAIL_VISUAL,
    ),
    accessibility: requiredEvidence(
      NAVIGATION_RAIL_VISUAL,
      MODAL_WIDE_NAVIGATION_RAIL_VISUAL,
      SSR_EVIDENCE,
    ),
    rtlLocalization: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    motion: requiredEvidence(
      WIDE_NAVIGATION_RAIL_VISUAL,
      MODAL_WIDE_NAVIGATION_RAIL_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(
      NAVIGATION_RAIL_VISUAL,
      WIDE_NAVIGATION_RAIL_VISUAL,
      MODAL_WIDE_NAVIGATION_RAIL_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'navigation-drawer': {
    api: requiredEvidence(INVENTORY_EVIDENCE, NAVIGATION_DRAWER_VISUAL),
    materialStatesVariants: requiredEvidence(NAVIGATION_DRAWER_VISUAL),
    tokensVisuals: requiredEvidence(
      NAVIGATION_BASELINE_AUDIT,
      NAVIGATION_CSS_EVIDENCE,
      NAVIGATION_DRAWER_VISUAL,
    ),
    behavior: requiredEvidence(NAVIGATION_DRAWER_VISUAL),
    accessibility: requiredEvidence(NAVIGATION_DRAWER_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(NAVIGATION_DRAWER_VISUAL),
    motion: requiredEvidence(NAVIGATION_DRAWER_VISUAL, SHARED_BROWSER_EVIDENCE),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(NAVIGATION_DRAWER_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  tabs: {
    api: requiredEvidence(INVENTORY_EVIDENCE, TABS_VISUAL),
    materialStatesVariants: requiredEvidence(TABS_VISUAL),
    tokensVisuals: requiredEvidence(
      NAVIGATION_BASELINE_AUDIT,
      NAVIGATION_CSS_EVIDENCE,
      TABS_VISUAL,
    ),
    behavior: requiredEvidence(TABS_VISUAL),
    accessibility: requiredEvidence(TABS_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(TABS_VISUAL),
    motion: requiredEvidence(TABS_VISUAL),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(TABS_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'top-app-bar': {
    api: requiredEvidence(INVENTORY_EVIDENCE, TOP_APP_BAR_VISUAL),
    materialStatesVariants: requiredEvidence(TOP_APP_BAR_VISUAL),
    tokensVisuals: requiredEvidence(
      APP_BAR_AUDIT,
      APP_BAR_CSS_EVIDENCE,
      TOP_APP_BAR_VISUAL,
    ),
    behavior: requiredEvidence(TOP_APP_BAR_VISUAL),
    accessibility: requiredEvidence(TOP_APP_BAR_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(TOP_APP_BAR_VISUAL),
    motion: requiredEvidence(TOP_APP_BAR_VISUAL),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(TOP_APP_BAR_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'bottom-app-bar': {
    api: requiredEvidence(INVENTORY_EVIDENCE, BOTTOM_APP_BAR_VISUAL),
    materialStatesVariants: requiredEvidence(BOTTOM_APP_BAR_VISUAL),
    tokensVisuals: requiredEvidence(
      APP_BAR_AUDIT,
      APP_BAR_CSS_EVIDENCE,
      BOTTOM_APP_BAR_VISUAL,
    ),
    behavior: requiredEvidence(BOTTOM_APP_BAR_VISUAL),
    accessibility: requiredEvidence(BOTTOM_APP_BAR_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(BOTTOM_APP_BAR_VISUAL),
    motion: requiredEvidence(BOTTOM_APP_BAR_VISUAL),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(BOTTOM_APP_BAR_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'floating-toolbar': {
    api: requiredEvidence(INVENTORY_EVIDENCE, FLOATING_TOOLBAR_VISUAL),
    materialStatesVariants: requiredEvidence(FLOATING_TOOLBAR_VISUAL),
    tokensVisuals: requiredEvidence(
      TOOLBAR_AUDIT,
      APP_BAR_CSS_EVIDENCE,
      FLOATING_TOOLBAR_VISUAL,
    ),
    behavior: requiredEvidence(FLOATING_TOOLBAR_VISUAL),
    accessibility: requiredEvidence(FLOATING_TOOLBAR_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(FLOATING_TOOLBAR_VISUAL),
    motion: requiredEvidence(FLOATING_TOOLBAR_VISUAL),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(FLOATING_TOOLBAR_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'app-bar-row': {
    api: requiredEvidence(INVENTORY_EVIDENCE, APP_BAR_ROW_VISUAL),
    materialStatesVariants: requiredEvidence(APP_BAR_ROW_VISUAL),
    tokensVisuals: requiredEvidence(APP_BAR_ROW_VISUAL),
    behavior: requiredEvidence(APP_BAR_ROW_VISUAL),
    accessibility: requiredEvidence(APP_BAR_ROW_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(APP_BAR_ROW_VISUAL),
    motion: notApplicable(
      'AppBarRow owns immediate ResizeObserver-driven suffix overflow layout but no component transition or animation contract. Overflow Menu motion remains owned by the Menu family.',
    ),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(APP_BAR_ROW_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'app-bar-column': {
    api: requiredEvidence(INVENTORY_EVIDENCE, APP_BAR_COLUMN_VISUAL),
    materialStatesVariants: requiredEvidence(APP_BAR_COLUMN_VISUAL),
    tokensVisuals: requiredEvidence(APP_BAR_COLUMN_VISUAL),
    behavior: requiredEvidence(APP_BAR_COLUMN_VISUAL),
    accessibility: requiredEvidence(APP_BAR_COLUMN_VISUAL, SSR_EVIDENCE),
    rtlLocalization: requiredEvidence(APP_BAR_COLUMN_VISUAL),
    motion: notApplicable(
      'AppBarColumn owns immediate ResizeObserver-driven suffix overflow layout but no component transition or animation contract. Overflow Menu motion remains owned by the Menu family.',
    ),
    theme: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    browser: requiredEvidence(APP_BAR_COLUMN_VISUAL, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
};

const lane8Ids = new Set(Object.keys(navigationChromeFamilyDimensions));
const families = baseRegistry.families.map((family) =>
  lane8Ids.has(family.id)
    ? { ...family, dimensions: navigationChromeFamilyDimensions[family.id] }
    : family,
);

export const materialConformanceRegistry = {
  ...baseRegistry,
  families,
};
