export const CONFORMANCE_DIMENSIONS = [
  'api',
  'materialStatesVariants',
  'tokensVisuals',
  'behavior',
  'accessibility',
  'rtlLocalization',
  'motion',
  'theme',
  'browser',
  'ssr',
];

export function openRequiredDimensions(gapIssue = 296) {
  return Object.fromEntries(
    CONFORMANCE_DIMENSIONS.map((dimension) => [
      dimension,
      { status: 'required', gapIssue },
    ]),
  );
}

const component = (id, sourcePrefixes, provenanceId = id) => ({
  id,
  kind: 'component',
  sourcePrefixes,
  provenance: { kind: 'component-docs', id: provenanceId },
  dimensions: openRequiredDimensions(),
});

const directComponent = (id, sourcePrefixes, { family, materialUrl, evidence }) => ({
  id,
  kind: 'component',
  sourcePrefixes,
  provenance: {
    kind: 'direct',
    family,
    materialUrl,
    evidence,
  },
  dimensions: openRequiredDimensions(),
});

const layout = (id, sourcePrefixes, family) => ({
  id,
  kind: 'layout',
  sourcePrefixes,
  provenance: {
    kind: 'direct',
    family,
    contractLabel:
      'Jetpack Compose Material 3 adaptive layout/scaffold semantics as pinned and documented by the layout subsystem.',
    evidence: ['packages/ui/src/layout/README.md'],
  },
  dimensions: openRequiredDimensions(),
});

/**
 * Conformance ownership is declared by source module, never by a copied list of
 * exported symbol names. `material-conformance.mjs` resolves the actual public
 * symbols from the TypeScript package entrypoints and expands this registry.
 */
export const materialConformanceRegistry = {
  schemaVersion: 1,
  parentIssue: 296,
  rootEntrypoint: 'packages/ui/src/index.ts',
  layoutEntrypoint: 'packages/ui/src/layout/index.ts',
  nonComponents: [
    {
      id: 'theme-runtime',
      sourcePrefixes: ['packages/ui/src/theme/'],
      reason:
        'ThemeProvider, theme helpers, and theme types are public infrastructure rather than Material component or adaptive-layout families. ThemeProvider remains the runtime owner for system-resolved colors.',
    },
  ],
  families: [
    component('app-bar-column', ['packages/ui/src/components/AppBarColumn/']),
    component('app-bar-row', ['packages/ui/src/components/AppBarRow/']),
    component('badge', ['packages/ui/src/components/Badge/']),
    component('bottom-app-bar', ['packages/ui/src/components/BottomAppBar/']),
    component('bottom-sheet', [
      'packages/ui/src/components/BottomSheet/',
      'packages/ui/src/components/BottomSheetScaffold/',
    ]),
    component('button', ['packages/ui/src/components/Button/']),
    component('button-group', ['packages/ui/src/components/ButtonGroup/']),
    component('card', ['packages/ui/src/components/Card/']),
    component('carousel', ['packages/ui/src/components/Carousel/']),
    component('checkbox', ['packages/ui/src/components/Checkbox/']),
    component('chip', ['packages/ui/src/components/Chip/']),
    component('date-picker', ['packages/ui/src/components/DatePicker/']),
    component('dialog', ['packages/ui/src/components/Dialog/']),
    component('divider', ['packages/ui/src/components/Divider/']),
    component(
      'drag-handle',
      ['packages/ui/src/components/DragHandle/'],
      'vertical-drag-handle',
    ),
    component('menu', [
      'packages/ui/src/components/Menu/',
      'packages/ui/src/components/ExposedDropdownMenu/',
    ]),
    component('fab', ['packages/ui/src/components/Fab/']),
    component('fab-menu', ['packages/ui/src/components/FabMenu/']),
    component('floating-toolbar', ['packages/ui/src/components/FloatingToolbar/']),
    component('icon-button', ['packages/ui/src/components/IconButton/']),
    component('list-item', ['packages/ui/src/components/ListItem/']),
    component('loading-indicator', ['packages/ui/src/components/LoadingIndicator/']),
    directComponent(
      'navigation-bar',
      [
        'packages/ui/src/components/NavigationBar/',
        'packages/ui/src/components/ShortNavigationBar/',
      ],
      {
        family: 'Navigation bars',
        materialUrl: 'https://m3.material.io/components/navigation-bar/overview',
        evidence: ['apps/docs/content/docs/components/navigation-bar.mdx'],
      },
    ),
    directComponent(
      'navigation-drawer',
      ['packages/ui/src/components/NavigationDrawer/'],
      {
        family: 'Navigation drawers',
        materialUrl: 'https://m3.material.io/components/navigation-drawer/overview',
        evidence: ['apps/docs/content/docs/components/navigation-drawer.mdx'],
      },
    ),
    directComponent(
      'navigation-rail',
      [
        'packages/ui/src/components/NavigationRail/',
        'packages/ui/src/components/WideNavigationRail/',
      ],
      {
        family: 'Navigation rails',
        materialUrl: 'https://m3.material.io/components/navigation-rail/overview',
        evidence: ['apps/docs/content/docs/components/navigation-rail.mdx'],
      },
    ),
    component('non-interactive-scrollbar', [
      'packages/ui/src/components/NonInteractiveScrollbar/',
    ]),
    component('progress-indicator', ['packages/ui/src/components/ProgressIndicator/']),
    component('pull-to-refresh', ['packages/ui/src/components/PullToRefresh/']),
    component('radio-button', ['packages/ui/src/components/RadioButton/']),
    component('scrim', ['packages/ui/src/components/Scrim/']),
    component('scroll-field', ['packages/ui/src/components/ScrollField/']),
    component('search-bar', ['packages/ui/src/components/SearchBar/']),
    component('segmented-button', ['packages/ui/src/components/SegmentedButton/']),
    component('slider', ['packages/ui/src/components/Slider/']),
    component('snackbar', ['packages/ui/src/components/Snackbar/']),
    component('split-button', ['packages/ui/src/components/SplitButton/']),
    component('surface', ['packages/ui/src/components/Surface/']),
    component('swipe-to-dismiss-box', ['packages/ui/src/components/SwipeToDismissBox/']),
    component('switch', ['packages/ui/src/components/Switch/']),
    component('tabs', ['packages/ui/src/components/Tabs/']),
    component('text-field', ['packages/ui/src/components/TextField/']),
    component('time-picker', ['packages/ui/src/components/TimePicker/']),
    component('toggle-button', ['packages/ui/src/components/ToggleButton/']),
    component('tooltip', ['packages/ui/src/components/Tooltip/']),
    component('top-app-bar', ['packages/ui/src/components/TopAppBar/']),

    layout(
      'layout-scaffold',
      ['packages/ui/src/layout/components/Scaffold/'],
      'Scaffold',
    ),
    layout(
      'layout-three-pane-scaffold',
      ['packages/ui/src/layout/components/ThreePaneScaffold/'],
      'Three-pane scaffold',
    ),
    layout(
      'layout-list-detail-pane-scaffold',
      ['packages/ui/src/layout/components/ListDetailPaneScaffold/'],
      'List-detail pane scaffold',
    ),
    layout(
      'layout-supporting-pane-scaffold',
      ['packages/ui/src/layout/components/SupportingPaneScaffold/'],
      'Supporting-pane scaffold',
    ),
    layout(
      'layout-navigation-suite-scaffold',
      ['packages/ui/src/layout/components/NavigationSuiteScaffold/'],
      'Navigation-suite scaffold',
    ),
    layout(
      'layout-adaptive-core',
      ['packages/ui/src/layout/adaptive/'],
      'Adaptive window, posture, pane, navigation, and motion contracts',
    ),
  ],
};
