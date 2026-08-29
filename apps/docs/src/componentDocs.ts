export type ComponentDocId = 'button' | 'text-field' | 'dialog';

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
} as const satisfies Record<ComponentDocId, ComponentDocMetadata>;
