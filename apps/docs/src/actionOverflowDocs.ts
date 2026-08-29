import type { ComponentDocMetadata } from './componentDocs';

export const actionOverflowDocs = {
  'toggle-button': {
    family: 'Toggle buttons',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/ToggleButton.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: [
      'ToggleButton',
      'ElevatedToggleButton',
      'FilledTonalToggleButton',
      'OutlinedToggleButton',
    ],
    implementation:
      'Implements filled, elevated, filled-tonal, and outlined controlled toggle buttons with selected/unselected Material state, optional start icon, disabled treatment, expressive size buckets, token-backed shape/elevation/color transitions, and reduced-motion support.',
    webAdaptation:
      'React Aria ToggleButton owns native button interaction and exposes the controlled selected state with aria-pressed. This intentionally differs from Compose checkbox-role semantics while preserving the browser-native pressable-toggle model, keyboard activation, focus behavior, and disabled state.',
  },
  'fab-menu': {
    family: 'Floating action button menus',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/FloatingActionButtonMenu.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: [
      'FloatingActionButtonMenu',
      'FloatingActionButtonMenuItem',
      'ToggleFloatingActionButton',
    ],
    implementation:
      'Implements controlled FAB-menu expansion, logical start/end alignment, staggered action reveal, bounded overflow content, disabled action items, keyboard focus transfer/restoration, and a baseline/medium/large toggle FAB that morphs to close geometry.',
    webAdaptation:
      'The action collection is a labeled role=group of ordinary button actions rather than an ARIA menu. The trigger keeps aria-expanded/aria-controls, expanded state remains application-owned, and reduced motion removes stagger/morph timing without changing focus or controlled state semantics.',
  },
  'app-bar-row': {
    family: 'App bar action rows',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/AppBarRow.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: ['AppBarRow', 'AppBarRowScope'],
    implementation:
      'Lays out action, toggle, and custom app-bar items on the inline axis, observes the local container and item widths, preserves maxItemCount, and moves only the suffix that no longer fits into a Material overflow menu.',
    webAdaptation:
      'Overflow is resolved from this component own measured available width, not from viewport classes or responsive navigation policy. Built-in actions retain button/toggle semantics and React Aria Menu owns overflow positioning, keyboard interaction, and focus restoration.',
  },
  'app-bar-column': {
    family: 'App bar action columns',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/AppBarColumn.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: ['AppBarColumn', 'AppBarColumnScope'],
    implementation:
      'Lays out the same action/toggle/custom item model on the block axis, observes local item heights and available container height, honors maxItemCount, and moves the non-fitting suffix into an overflow menu.',
    webAdaptation:
      'The column responds only to its own measured height. It does not choose a navigation rail, drawer, pane arrangement, or adaptive window class; overflow interaction is delegated to the same React Aria-backed menu behavior as AppBarRow.',
  },
} as const satisfies Record<string, ComponentDocMetadata>;

export type ActionOverflowDocId = keyof typeof actionOverflowDocs;
