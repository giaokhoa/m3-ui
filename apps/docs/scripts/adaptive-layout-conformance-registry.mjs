import {
  CONFORMANCE_DIMENSIONS,
  materialConformanceRegistry as baseRegistry,
  openRequiredDimensions,
} from './interaction-utilities-conformance-registry.mjs';

export { CONFORMANCE_DIMENSIONS, openRequiredDimensions };

const requiredEvidence = (...evidence) => ({ status: 'required', evidence });
const notApplicable = (reason) => ({ status: 'not-applicable', reason });
const adapted = (reason, ...evidence) => ({ status: 'adapted', reason, evidence });

const INVENTORY_EVIDENCE = 'apps/docs/scripts/material-conformance.mjs';
const SSR_EVIDENCE = 'packages/ui/src/adaptive-layout.ssr.test.tsx';
const SHARED_BROWSER_EVIDENCE =
  'apps/storybook/visual/adaptive-layout-conformance.visual.spec.ts';

const SCAFFOLD_VISUAL = 'apps/storybook/visual/scaffold.visual.spec.ts';
const SCAFFOLD_DEFAULTS =
  'packages/ui/src/layout/components/Scaffold/Scaffold.defaults.test.ts';
const SCAFFOLD_INSETS =
  'packages/ui/src/layout/components/Scaffold/Scaffold.insetsParity.test.tsx';
const SCAFFOLD_SLOTS =
  'packages/ui/src/layout/components/Scaffold/Scaffold.slotPresenceParity.test.tsx';

const THREE_PANE_VISUAL =
  'apps/storybook/visual/list-detail-pane-scaffold.visual.spec.ts';
const DRAG_RESIZE_SEMANTICS_VISUAL =
  'apps/storybook/visual/drag-to-resize-pane-semantics.visual.spec.ts';
const THREE_PANE_LAYOUT =
  'packages/ui/src/layout/components/ThreePaneScaffold/ThreePaneScaffold.layout.test.ts';

const NAVIGATION_SUITE_TEST =
  'packages/ui/src/layout/components/NavigationSuiteScaffold/NavigationSuiteScaffold.test.tsx';

const WINDOW_SIZE_CLASS_TEST =
  'packages/ui/src/layout/adaptive/windowSizeClass.test.ts';
const NAVIGATOR_TEST =
  'packages/ui/src/layout/adaptive/threePaneScaffoldNavigator.test.ts';
const DRAG_TO_RESIZE_TEST =
  'packages/ui/src/layout/adaptive/dragToResizeState.test.ts';

const adaptiveLayoutFamilyDimensions = {
  'layout-scaffold': {
    api: requiredEvidence(
      INVENTORY_EVIDENCE,
      SCAFFOLD_DEFAULTS,
      SCAFFOLD_INSETS,
      SCAFFOLD_SLOTS,
      SCAFFOLD_VISUAL,
    ),
    materialStatesVariants: requiredEvidence(SCAFFOLD_SLOTS, SCAFFOLD_VISUAL),
    tokensVisuals: requiredEvidence(SCAFFOLD_DEFAULTS, SCAFFOLD_VISUAL),
    behavior: requiredEvidence(SCAFFOLD_INSETS, SCAFFOLD_SLOTS, SCAFFOLD_VISUAL),
    accessibility: notApplicable(
      'Scaffold is a screen-composition/layout primitive and intentionally creates no component-owned landmark, focus, selection, or activation semantics. Callers own semantics of bars, body, snackbar and FAB content, while arbitrary HTML attributes remain pass-through API.',
    ),
    rtlLocalization: requiredEvidence(SCAFFOLD_VISUAL),
    motion: notApplicable(
      'Scaffold owns no Material transition. ResizeObserver projects live bar heights into CSS custom properties, which is measurement rather than animation.',
    ),
    theme: requiredEvidence(SCAFFOLD_DEFAULTS),
    browser: requiredEvidence(SCAFFOLD_VISUAL),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'layout-three-pane-scaffold': {
    api: requiredEvidence(INVENTORY_EVIDENCE, THREE_PANE_LAYOUT, THREE_PANE_VISUAL),
    materialStatesVariants: requiredEvidence(THREE_PANE_LAYOUT, THREE_PANE_VISUAL),
    tokensVisuals: requiredEvidence(THREE_PANE_LAYOUT, THREE_PANE_VISUAL),
    behavior: requiredEvidence(
      THREE_PANE_LAYOUT,
      THREE_PANE_VISUAL,
      DRAG_RESIZE_SEMANTICS_VISUAL,
    ),
    accessibility: requiredEvidence(THREE_PANE_VISUAL, DRAG_RESIZE_SEMANTICS_VISUAL),
    rtlLocalization: requiredEvidence(THREE_PANE_LAYOUT, SHARED_BROWSER_EVIDENCE),
    motion: requiredEvidence(THREE_PANE_VISUAL),
    theme: requiredEvidence(THREE_PANE_VISUAL),
    browser: requiredEvidence(
      THREE_PANE_VISUAL,
      DRAG_RESIZE_SEMANTICS_VISUAL,
      SHARED_BROWSER_EVIDENCE,
    ),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'layout-list-detail-pane-scaffold': {
    api: requiredEvidence(INVENTORY_EVIDENCE, NAVIGATOR_TEST, SSR_EVIDENCE),
    materialStatesVariants: requiredEvidence(NAVIGATOR_TEST, THREE_PANE_VISUAL),
    tokensVisuals: notApplicable(
      'ListDetailPaneScaffold adds canonical List -> Detail -> Extra role mapping but no independent visual tokens or paint. ThreePaneScaffold owns pane geometry/paint and adaptive-core owns canonical layout decisions.',
    ),
    behavior: requiredEvidence(NAVIGATOR_TEST, THREE_PANE_VISUAL, SSR_EVIDENCE),
    accessibility: notApplicable(
      'The wrapper does not add a second accessibility model. ThreePaneScaffold owns named pane regions, inertness, pane-expansion and resize semantics for the mapped roles.',
    ),
    rtlLocalization: requiredEvidence(THREE_PANE_LAYOUT),
    motion: notApplicable(
      'ListDetailPaneScaffold selects canonical pane roles and delegates all transition selection/rendering to adaptive-core and ThreePaneScaffold.',
    ),
    theme: notApplicable(
      'The wrapper owns no semantic color paint; pane/content theming is inherited from ThreePaneScaffold and caller content.',
    ),
    browser: requiredEvidence(THREE_PANE_VISUAL),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'layout-supporting-pane-scaffold': {
    api: requiredEvidence(INVENTORY_EVIDENCE, NAVIGATOR_TEST, SSR_EVIDENCE),
    materialStatesVariants: requiredEvidence(NAVIGATOR_TEST, SHARED_BROWSER_EVIDENCE),
    tokensVisuals: notApplicable(
      'SupportingPaneScaffold adds canonical Main -> Supporting -> Extra role mapping but no independent visual tokens or paint. ThreePaneScaffold owns renderer geometry/paint.',
    ),
    behavior: requiredEvidence(NAVIGATOR_TEST, SHARED_BROWSER_EVIDENCE, SSR_EVIDENCE),
    accessibility: notApplicable(
      'The wrapper adds no independent semantics; ThreePaneScaffold owns pane landmarks, focus/inertness and resize accessibility for its mapped roles.',
    ),
    rtlLocalization: requiredEvidence(THREE_PANE_LAYOUT, SHARED_BROWSER_EVIDENCE),
    motion: notApplicable(
      'SupportingPaneScaffold delegates pane-motion decisions and rendering to adaptive-core and ThreePaneScaffold.',
    ),
    theme: notApplicable(
      'The wrapper owns no semantic color paint; it inherits renderer and caller content theming.',
    ),
    browser: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'layout-navigation-suite-scaffold': {
    api: requiredEvidence(INVENTORY_EVIDENCE, NAVIGATION_SUITE_TEST, SSR_EVIDENCE),
    materialStatesVariants: requiredEvidence(NAVIGATION_SUITE_TEST, SHARED_BROWSER_EVIDENCE),
    tokensVisuals: notApplicable(
      'NavigationSuiteScaffold owns adaptive family selection/composition, while NavigationBar, ShortNavigationBar, NavigationRail, WideNavigationRail and NavigationDrawer families own their Material component tokens and paint in Lane 8.',
    ),
    behavior: requiredEvidence(NAVIGATION_SUITE_TEST, SHARED_BROWSER_EVIDENCE),
    accessibility: requiredEvidence(NAVIGATION_SUITE_TEST, SHARED_BROWSER_EVIDENCE),
    rtlLocalization: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    motion: adapted(
      'AndroidX exposes animated/suspending visibility state, while the current browser contract deliberately keeps show/hide/toggle/snap synchronous: targetValue equals currentValue and isAnimating is false. Do not fabricate coroutine or animation mechanics.',
      NAVIGATION_SUITE_TEST,
    ),
    theme: notApplicable(
      'The scaffold orchestration layer has only explicit container/content color overrides. Material navigation paint belongs to the delegated Lane 8 navigation families and inherits ThemeProvider there.',
    ),
    browser: requiredEvidence(NAVIGATION_SUITE_TEST, SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
  'layout-adaptive-core': {
    api: requiredEvidence(
      INVENTORY_EVIDENCE,
      WINDOW_SIZE_CLASS_TEST,
      NAVIGATOR_TEST,
      DRAG_TO_RESIZE_TEST,
    ),
    materialStatesVariants: requiredEvidence(
      WINDOW_SIZE_CLASS_TEST,
      NAVIGATOR_TEST,
      DRAG_TO_RESIZE_TEST,
    ),
    tokensVisuals: requiredEvidence(WINDOW_SIZE_CLASS_TEST),
    behavior: requiredEvidence(WINDOW_SIZE_CLASS_TEST, NAVIGATOR_TEST, DRAG_TO_RESIZE_TEST),
    accessibility: notApplicable(
      'Adaptive core owns pure window/pane/state/navigation/motion calculations and observation hooks, not DOM accessibility nodes. ThreePaneScaffold owns the browser pane/resize semantics that project those states.',
    ),
    rtlLocalization: notApplicable(
      'Inline-direction placement and localized accessibility strings are renderer responsibilities. Adaptive-core destination history, window classes, directives and state machines are direction- and locale-independent.',
    ),
    motion: requiredEvidence(NAVIGATOR_TEST, DRAG_TO_RESIZE_TEST),
    theme: notApplicable(
      'Adaptive core owns no paint or concrete Material colors. ThemeProvider and layout/component renderers own color resolution.',
    ),
    browser: requiredEvidence(SHARED_BROWSER_EVIDENCE),
    ssr: requiredEvidence(SSR_EVIDENCE),
  },
};

const lane10Ids = new Set(Object.keys(adaptiveLayoutFamilyDimensions));
const families = baseRegistry.families.map((family) =>
  lane10Ids.has(family.id)
    ? { ...family, dimensions: adaptiveLayoutFamilyDimensions[family.id] }
    : family,
);

export const materialConformanceRegistry = {
  ...baseRegistry,
  families,
};
