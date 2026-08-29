export type ComponentDocId =
  | 'button'
  | 'text-field'
  | 'dialog'
  | 'checkbox'
  | 'radio-button'
  | 'switch'
  | 'slider';

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
} as const satisfies Record<ComponentDocId, ComponentDocMetadata>;
