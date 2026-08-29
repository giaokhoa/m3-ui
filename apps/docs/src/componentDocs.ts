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
  | 'fab'
  | 'search-bar'
  | 'progress-indicator'
  | 'loading-indicator'
  | 'snackbar'
  | 'tooltip'
  | 'tabs'
  | 'segmented-button'
  | 'split-button'
  | 'button-group'
  | 'list-item'
  | 'menu'
  | 'badge'
  | 'divider';

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
  'search-bar': {
    family: 'Search',
    materialUrl: 'https://m3.material.io/components/search/overview',
    composeMapping: ['SearchBar', 'ExpandedDockedSearchBar', 'ExpandedFullScreenSearchBar'],
    implementation:
      'Implements a collapsed Material search field plus docked and full-screen expanded search surfaces driven by a shared explicit search-bar state object. The input supports leading/trailing content, clearing, native search submission, and controlled or uncontrolled text values.',
    webAdaptation:
      'SearchBarInput renders a native search form and search input. React Aria owns the full-screen modal/dialog focus and dismissal behavior, while the docked surface owns browser outside-pointer and Escape dismissal. Search-result retrieval is deliberately outside the component and can be supplied by Fumadocs or any application search backend.',
  },
  'progress-indicator': {
    family: 'Progress indicators',
    materialUrl: 'https://m3.material.io/components/progress-indicators/overview',
    composeMapping: ['LinearProgressIndicator', 'CircularProgressIndicator', 'LinearWavyProgressIndicator', 'CircularWavyProgressIndicator'],
    implementation:
      'Implements standard linear/circular progress plus M3 Expressive wavy linear/circular variants, determinate and indeterminate states, canonical stop/track geometry, reduced-motion behavior, and the current Compose-derived wavy amplitude and wavelength lifecycle.',
    webAdaptation:
      'React Aria ProgressBar owns progressbar semantics and value ranges; indicators require an accessible name because the visual has no label. Standard `bufferValue` and indeterminate `fourColor` remain audited Material Web renderer adaptations and are intentionally not inherited by the wavy Compose-aligned APIs.',
  },
  'loading-indicator': {
    family: 'Loading indicator',
    materialUrl: 'https://m3.material.io/components/loading-indicator/overview',
    composeMapping: ['LoadingIndicator', 'ContainedLoadingIndicator'],
    implementation:
      'Implements the expressive morphing loading indicator and contained variant with the canonical Material shape sequence, Compose-derived motion timing, 0..1 determinate morphing, indeterminate shape cycling, and reduced-motion freezing.',
    webAdaptation:
      'React Aria ProgressBar owns progress semantics. Omitting `value` selects indeterminate mode and supplying a value selects determinate mode; the SVG renderer is aria-hidden and consumers must provide an accessible name. The Material Shapes port remains an internal renderer mechanism rather than a new public shape contract.',
  },
  snackbar: {
    family: 'Snackbar',
    materialUrl: 'https://m3.material.io/components/snackbar/overview',
    composeMapping: ['Snackbar surface'],
    implementation:
      'Implements the Material snackbar surface, message, optional action, optional dismiss action, long-action-on-new-line composition, canonical colors/shape/elevation, and shared Material button interaction engines for actions.',
    webAdaptation:
      'The message is exposed as a polite atomic live status region. Queueing, replacement, timeout, and host policy are intentionally not implemented by this surface; applications own that state layer. SnackbarAction and SnackbarDismissAction reuse the accessible React Aria button and icon-button engines.',
  },
  tooltip: {
    family: 'Tooltips',
    materialUrl: 'https://m3.material.io/components/tooltips/overview',
    composeMapping: ['PlainTooltip', 'RichTooltip', 'TooltipBox/tooltip state behavior'],
    implementation:
      'Implements plain and rich Material tooltip surfaces with canonical visual roles, placement spacing, portal inheritance, hover/focus invocation, persistent rich-tooltip behavior, actions, and theme-aware visual propagation.',
    webAdaptation:
      'Plain tooltips use the React Aria tooltip pattern and accessible description wiring. Rich tooltips can contain actions, so they intentionally use non-modal dialog semantics with aria-haspopup/expanded/controls relationships instead of misusing the non-interactive ARIA tooltip role.',
  },
  tabs: {
    family: 'Tabs',
    materialUrl: 'https://m3.material.io/components/tabs/overview',
    composeMapping: ['PrimaryTabRow', 'SecondaryTabRow', 'PrimaryScrollableTabRow', 'SecondaryScrollableTabRow', 'Tab', 'LeadingIconTab'],
    implementation:
      'Implements primary and secondary Material tab-list surfaces in fixed and scrollable modes, with labels, icons, disabled states, leading-icon mapping, canonical indicator geometry, divider composition, and reduced-motion-aware selected-item scrolling.',
    webAdaptation:
      'React Aria Tabs, TabList, and Tab own tab semantics, roving keyboard focus, disabled state, and automatic keyboard activation. This component intentionally stops at the tab list; applications connect the selected key to their own route or panel content instead of receiving hidden tab panels from the visual primitive.',
  },
  'segmented-button': {
    family: 'Segmented buttons',
    materialUrl: 'https://m3.material.io/components/segmented-buttons/overview',
    composeMapping: ['SingleChoiceSegmentedButtonRow', 'MultiChoiceSegmentedButtonRow', 'SegmentedButton'],
    implementation:
      'Implements the Material outlined segmented-button geometry, selected/unselected color and state layers, default selected check mark, optional inactive/selected icon slots, and separate single-choice and multi-choice row primitives.',
    webAdaptation:
      'Single-choice rows use React Aria RadioGroup/Radio semantics while multi-choice segments use independent React Aria Checkbox semantics inside a grouped container. The separate APIs preserve the accessibility model instead of collapsing radio and multi-toggle state into one generic selection contract.',
  },
  'split-button': {
    family: 'Split buttons',
    materialUrl: 'https://m3.material.io/components/split-button/overview',
    composeMapping: ['SplitButton visual/action contract'],
    implementation:
      'Implements filled, tonal, elevated, and outlined split buttons across the public Material button size family, with audited leading/trailing shape geometry, press morphing, independent disabled states, and trailing expanded or checked state exposure.',
    webAdaptation:
      'Both halves reuse the React Aria-backed Material button engine. The trailing button can expose aria-expanded for an externally composed disclosure or aria-pressed for a true toggle, but SplitButton deliberately does not create or own a menu/popover; applications own that secondary surface and focus lifecycle.',
  },
  'button-group': {
    family: 'Button groups',
    materialUrl: 'https://m3.material.io/components/button-groups/overview',
    composeMapping: ['ButtonGroup', 'ConnectedButtonGroup'],
    implementation:
      'Implements standard action groups with AndroidX-style pressed-width redistribution and a tokenized local overflow menu, plus connected single/multiple selection groups across the audited extra-small through extra-large size family.',
    webAdaptation:
      'Standard groups contain independent React Aria-backed actions and use ResizeObserver to move a suffix into a component-local menu when the row cannot fit; that is local overflow, not adaptive window layout. Connected single selection uses React Aria RadioGroup/Radio semantics, while connected multiple selection uses ToggleButton semantics.',
  },
  'list-item': {
    family: 'Lists',
    materialUrl: 'https://m3.material.io/components/lists/overview',
    composeMapping: ['ListItem'],
    implementation:
      'Implements one-, two-, and three-line Material list rows with leading, overline, headline, supporting, and trailing slots plus passive, action, selected, disabled, dragged, hover, focus, and pressed presentation.',
    webAdaptation:
      'Passive rows remain div content; action rows use React Aria Button semantics. Single-selection rows expose radio semantics and an optional roving-focus ListItemSelectionGroup, while multiple-selection rows expose checkbox semantics. Dragged state is presentation-only and does not implement browser drag-and-drop by itself.',
  },
  menu: {
    family: 'Menus',
    materialUrl: 'https://m3.material.io/components/menus/overview',
    composeMapping: ['DropdownMenu', 'DropdownMenuItem', 'ExposedDropdownMenu-style read-only selection'],
    implementation:
      'Implements anchored Material menus, menu items, labeled or segmented sections, viewport-aware popover spacing, supporting/leading/trailing slots, and a read-only exposed menu anchored to the existing Material TextField renderer.',
    webAdaptation:
      'React Aria owns menu/menuitem semantics, roving focus, Arrow/Home/End movement, typeahead, Escape, outside dismissal, overlay positioning, and focus restoration. ExposedMenu deliberately remains a read-only menu with aria-haspopup/expanded rather than pretending to be an editable combobox or autocomplete.',
  },
  badge: {
    family: 'Badges',
    materialUrl: 'https://m3.material.io/components/badges/overview',
    composeMapping: ['Badge', 'BadgedBox'],
    implementation:
      'Implements Material dot and content badge geometry plus logical top-end BadgedBox positioning, with canonical error/on-error defaults and explicit container/content color overrides.',
    webAdaptation:
      'Badge and BadgedBox do not guess the semantic meaning of a dot or count and do not rewrite the anchor accessible name. Applications decide whether the visual badge is aria-hidden and include meaningful status wording on the anchor, or label a standalone badge directly when it conveys independent information.',
  },
  divider: {
    family: 'Dividers',
    materialUrl: 'https://m3.material.io/components/divider/overview',
    composeMapping: ['HorizontalDivider', 'VerticalDivider'],
    implementation:
      'Implements horizontal and vertical Material dividers with canonical outline-variant color and audited thickness defaults, while allowing deliberate CSS color and thickness overrides.',
    webAdaptation:
      'Both variants render a real separator role with explicit aria-orientation. Custom color/thickness values are web composition overrides rather than new canonical tokens, and semantic dividers should not be inserted merely to create spacing where no meaningful boundary exists.',
  },
} as const satisfies Record<ComponentDocId, ComponentDocMetadata>;
