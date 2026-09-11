import type { ComponentDocMetadata } from './componentDocs';

export const appBarToolbarDocs = {
  'top-app-bar': {
    family: 'Top app bars',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/TopAppBar.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: [
      'TopAppBar',
      'CenterAlignedTopAppBar',
      'MediumTopAppBar',
      'LargeTopAppBar',
      'MediumFlexibleTopAppBar',
      'LargeFlexibleTopAppBar',
      'TopAppBarScrollBehavior',
    ],
    implementation:
      'Implements small, center-aligned, medium, medium-flexible, large, and large-flexible top app bar variants with title/navigation/action slots, flexible subtitles, token-backed collapsed/expanded geometry, scrolled container treatment, and explicit scroll-state helpers.',
    webAdaptation:
      'The component renders a semantic header and receives scroll fractions/state as data rather than installing a page scroll listener. Icon controls remain independently accessible Material buttons, while centered-title measurement observes only the app bar and its own slots.',
  },
  'bottom-app-bar': {
    family: 'Bottom app bars',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/BottomAppBar.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: [
      'BottomAppBar',
      'FlexibleBottomAppBar',
      'BottomAppBarState',
      'BottomAppBarScrollBehavior',
    ],
    implementation:
      'Implements regular and flexible Material bottom app bars with action content, optional FAB composition, configurable flexible arrangement, token-backed elevation/color, and explicit exit-always collapsed state.',
    webAdaptation:
      'The bar does not infer viewport class or attach scrolling behavior to the document. Applications feed collapsed state from their own scrolling composition. Actions and FABs preserve their own React Aria-backed semantics rather than making the whole bar interactive.',
  },
  'floating-toolbar': {
    family: 'Floating toolbars',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/HorizontalFloatingToolbar.composable',
    contractLabel: 'Compose Material3 Expressive contract',
    composeMapping: [
      'HorizontalFloatingToolbar',
      'VerticalFloatingToolbar',
      'FloatingToolbarState',
      'FloatingToolbarExitDirection',
      'FloatingToolbarDefaults',
    ],
    implementation:
      'Implements horizontal and vertical floating toolbars, standard/vibrant variants, expanded/collapsed conditional content, optional adjacent FAB placement, token-backed elevation/shape, and offset-based exit translation.',
    webAdaptation:
      'The root exposes toolbar semantics and orientation. Expanded state and scroll offset are explicit application-owned inputs; the component does not subscribe to page scroll or choose a navigation mode. Logical start/end exit translation respects RTL.',
  },
} as const satisfies Record<string, ComponentDocMetadata>;

export type AppBarToolbarDocId = keyof typeof appBarToolbarDocs;
