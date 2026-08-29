export type ComponentDocId =
  | 'button'
  | 'text-field'
  | 'dialog'
  | 'checkbox'
  | 'radio-button'
  | 'switch'
  | 'slider'
  | 'card'
  | 'chip'
  | 'icon-button'
  | 'fab';

export interface ComponentDocMetadata {
  family: string;
  materialUrl: string;
  composeMapping: readonly string[];
  implementation: string;
  webAdaptation: string;
}

export const componentDocs = {
  button: {
    family: 'Buttons',
    materialUrl: 'https://m3.material.io/components/buttons/overview',
    composeMapping: [
      'Button',
      'ElevatedButton',
      'FilledTonalButton',
      'OutlinedButton',
      'TextButton',
    ],
    implementation:
      'Implemented with canonical Material tokens, all five Material button variants, expressive size helpers, icon slots, disabled treatment, ripple/state layers, and optional pressed-shape morphing.',
    webAdaptation:
      'React Aria owns browser button semantics and pointer, keyboard, focus, and hover interaction state. Material tokens remain authoritative for geometry, typography, color, elevation, shape, and state-layer presentation.',
  },
  'text-field': {
    family: 'Text fields',
    materialUrl: 'https://m3.material.io/components/text-fields/overview',
    composeMapping: ['TextField', 'OutlinedTextField'],
    implementation:
      'Implemented as filled and outlined Material text fields with labels, supporting and error text, leading and trailing icons, prefix and suffix content, and single-line or multiline controls.',
    webAdaptation:
      'React Aria owns field, label, description, validation, native input, and textarea semantics. The browser control model is preserved instead of recreating Compose text-input internals.',
  },
  dialog: {
    family: 'Dialogs',
    materialUrl: 'https://m3.material.io/components/dialogs/overview',
    composeMapping: ['Material dialog surface, headline, supporting text, icon, and actions'],
    implementation:
      'Implemented as Material dialog primitives for scrim, container surface, title, description, icon, and actions, with theme-aware portal placement.',
    webAdaptation:
      'React Aria owns modal focus scope, focus restoration, Escape handling, outside dismissal, portal behavior, and accessible dialog relationships. Material styling is layered on those native web interaction semantics.',
  },
  checkbox: {
    family: 'Checkboxes',
    materialUrl: 'https://m3.material.io/components/checkbox/overview',
    composeMapping: ['Checkbox'],
    implementation:
      'Implements unchecked, checked, indeterminate, disabled, hover, focus, and pressed presentation using canonical control tokens and the shared Material ripple engine.',
    webAdaptation:
      'React Aria owns checkbox semantics, selection state, keyboard interaction, focus visibility, and labeling. The Material box, mark, minimum interactive target, and state layer are rendered around those web semantics.',
  },
  'radio-button': {
    family: 'Radio buttons',
    materialUrl: 'https://m3.material.io/components/radio-button/overview',
    composeMapping: ['RadioButton', 'RadioGroup'],
    implementation:
      'Implements Material radio-button selection visuals plus a group primitive with label, description, validation error, and vertical or horizontal arrangement.',
    webAdaptation:
      'React Aria owns radio-group selection, keyboard navigation, labeling, descriptions, validation, and focus semantics. Material tokens and ripple presentation are layered onto that browser interaction model.',
  },
  switch: {
    family: 'Switches',
    materialUrl: 'https://m3.material.io/components/switch/overview',
    composeMapping: ['Switch'],
    implementation:
      'Implements Material selected and unselected track/thumb states, optional thumb content, disabled treatment, hover and focus state layers, and both supported ripple focus treatments.',
    webAdaptation:
      'React Aria owns switch semantics, selection state, keyboard and pointer interaction, focus visibility, and labeling. Optional thumb content maps Compose icon-sized thumb content into React content without changing the control semantics.',
  },
  slider: {
    family: 'Sliders',
    materialUrl: 'https://m3.material.io/components/sliders/overview',
    composeMapping: ['Slider', 'RangeSlider'],
    implementation:
      'Implements single-value and range Material sliders, the audited size family, active/inactive track segments, stop indicator, accessible per-thumb labels, orientation, and stepped values.',
    webAdaptation:
      'React Aria owns slider and thumb semantics, keyboard input, pointer dragging, value state, orientation, and accessible labels. `showTicks` and `showValueIndicator` are intentional Material Web adaptations layered onto the audited Material geometry.',
  },
  card: {
    family: 'Cards',
    materialUrl: 'https://m3.material.io/components/cards/overview',
    composeMapping: ['Card', 'ElevatedCard', 'OutlinedCard'],
    implementation:
      'Implements filled, elevated, and outlined Material card surfaces with canonical color, border, shape, elevation, motion, disabled, hover, focus, pressed, and ripple presentation.',
    webAdaptation:
      'Static cards remain semantic div containers. Supplying `onPress` enables pointer and keyboard activation and focusability, but the component does not infer an ARIA role; consumers must supply the semantic role that matches the card action when the whole card is interactive.',
  },
  chip: {
    family: 'Chips',
    materialUrl: 'https://m3.material.io/components/chips/overview',
    composeMapping: ['AssistChip', 'SuggestionChip', 'FilterChip', 'InputChip'],
    implementation:
      'Implements assist, suggestion, filter, and input chip families, including elevated assist/suggestion/filter forms, visual slots, selected/disabled states, elevation motion, ripple layers, and optional expressive selected-shape morphing for selectable chips.',
    webAdaptation:
      'Assist and suggestion chips use React Aria button semantics; filter and input chips use checkbox-style selectable semantics. Visual icons and avatars are presentation slots while React Aria remains the interaction, focus, disabled, and selection-state owner.',
  },
  'icon-button': {
    family: 'Icon buttons',
    materialUrl: 'https://m3.material.io/components/icon-buttons/overview',
    composeMapping: ['IconButton', 'IconToggleButton'],
    implementation:
      'Implements standard, filled, filled-tonal, and outlined action and toggle icon buttons with the audited extra-small through extra-large size family, narrow/default/wide widths, round/square shapes, state layers, and expressive shape helpers.',
    webAdaptation:
      'React Aria Button and ToggleButton own action/toggle semantics, disabled state, keyboard/pointer behavior, selection, hover, and focus visibility. The icon is visually hidden from accessibility so every icon-only control needs an accessible name on the button itself.',
  },
  fab: {
    family: 'FAB',
    materialUrl: 'https://m3.material.io/components/floating-action-button/overview',
    composeMapping: ['FloatingActionButton', 'ExtendedFloatingActionButton'],
    implementation:
      'Implements small, baseline, medium, and large FAB families, matching extended FAB sizes, container-role variants, default/lowered elevation, interactive elevation motion, extended collapse behavior, and the pinned branded/material-web variants present in the audited source surface.',
    webAdaptation:
      'React Aria Button owns action semantics and interaction state. Icon-only FAB content is presentation-only and therefore requires an accessible name; collapsed extended FABs derive one from string label content when possible. Branded and solid/surface variant vocabulary is preserved as an audited Material Web compatibility surface rather than presented as a Compose-only API.',
  },
} as const satisfies Record<ComponentDocId, ComponentDocMetadata>;
