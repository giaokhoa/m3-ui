import type { ComponentDocMetadata } from './componentDocs';

export const smallPrimitiveDocs = {
  surface: {
    family: 'Surface',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/Surface.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: ['Surface passive/clickable/selectable/toggleable overloads'],
    implementation:
      'Implements passive and interactive Material surfaces with explicit shape, border, content color, accumulated tonal elevation, shadow elevation, disabled state, and selectable/toggleable semantic roles.',
    webAdaptation:
      'The web primitive renders a div and only becomes keyboard-focusable when an interaction contract is supplied. Enter/Space activation and aria-checked/selected/pressed state follow the requested semantic role, while nested native controls keep their own activation instead of bubbling into the parent Surface.',
  },
  scrim: {
    family: 'Scrim',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/Scrim.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: ['Scrim', 'ScrimDefaults'],
    implementation:
      'Implements the token-backed Material scrim color and alpha contract in passive and dismissible forms. The primitive only renders the obscuring layer and optional dismissal action.',
    webAdaptation:
      'A passive scrim is aria-hidden. Supplying onDismiss renders a native button with an accessible name, but the scrim still does not own a portal, focus trap, Escape handling, modal state, or stacking policy; those belong to the surrounding overlay composition.',
  },
  'vertical-drag-handle': {
    family: 'Vertical drag handle',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/DragHandleShapes',
    contractLabel: 'Compose Material3 contract',
    composeMapping: ['VerticalDragHandle', 'DragHandleShapes'],
    implementation:
      'Implements the Material vertical drag-handle visual, press/ripple feedback, and controlled dragged-state shape treatment through isDragged.',
    webAdaptation:
      'The primitive deliberately does not invent resize state or a drag recognizer. The owner supplies separator semantics, keyboard resizing, pointer movement, aria-valuemin/max/now, and the controlled isDragged state that matches its actual resize lifecycle.',
  },
  'non-interactive-scrollbar': {
    family: 'Non-interactive scrollbar',
    referenceUrl:
      'https://developer.android.com/reference/kotlin/androidx/compose/material3/nonInteractiveScrollbar.composable',
    contractLabel: 'Compose Material3 contract',
    composeMapping: ['Modifier.nonInteractiveScrollbar', 'NonInteractiveScrollbarDefaults'],
    implementation:
      'Implements vertical and horizontal visual scroll-position indicators with overflow detection, minimum/maximum thumb geometry, optional fading, ResizeObserver/mutation updates, custom metrics adapters, and RTL-aware horizontal offsets.',
    webAdaptation:
      'The rendered scrollbar is aria-hidden and pointer-events:none by design. Native or application scroll containers remain the interaction owner; the overlay only observes scroll metrics and never becomes an alternate scrolling control.',
  },
} as const satisfies Record<string, ComponentDocMetadata>;

export type SmallPrimitiveDocId = keyof typeof smallPrimitiveDocs;
