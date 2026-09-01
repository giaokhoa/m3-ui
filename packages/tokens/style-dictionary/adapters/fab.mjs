import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

const sizes = ['small', 'baseline', 'medium', 'large'];
const extendedSizes = [
  ['baseline', 'component.fab.extended.baseline'],
  ['small', 'component.fab.extended.size.small'],
  ['medium', 'component.fab.extended.size.medium'],
  ['large', 'component.fab.extended.size.large'],
];
const variants = [
  ['primaryContainer', 'component.fab.container.primary'],
  ['secondaryContainer', 'component.fab.container.secondary'],
  ['tertiaryContainer', 'component.fab.container.tertiary'],
  ['surface', 'component.fab.surface'],
  ['primary', 'component.fab.variant.primary'],
  ['secondary', 'component.fab.variant.secondary'],
  ['tertiary', 'component.fab.variant.tertiary'],
];
const extendedVariants = [
  ['primaryContainer', 'component.fab.extended.container.primary'],
  ['secondaryContainer', 'component.fab.extended.container.secondary'],
  ['tertiaryContainer', 'component.fab.extended.container.tertiary'],
  ['surface', 'component.fab.extended.surface'],
  ['primary', 'component.fab.extended.variant.primary'],
  ['secondary', 'component.fab.extended.variant.secondary'],
  ['tertiary', 'component.fab.extended.variant.tertiary'],
];

export function createFabCss(context) {
  const get = tokenReader(context, 'FAB CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shape = (path) => get(`shape.${get(path)}`);
  const typography = (role) => [
    line('--_fab-label-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_fab-label-font-size', get(`typography.${role}.fontSize`)),
    line('--_fab-label-line-height', get(`typography.${role}.lineHeight`)),
    line('--_fab-label-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_fab-label-letter-spacing', get(`typography.${role}.letterSpacing`)),
  ];
  const rules = [];

  for (const size of sizes) {
    const base = `component.fab.size.${size}`;
    const target = size === 'small'
      ? get('component.fab.minimumInteractiveSize')
      : get(`${base}.containerHeight`);
    rules.push(
      `.fab:not(.fab--extended)[data-size='${size}'] {`,
      line('--_fab-target-size', target),
      line('--_fab-container-width', get(`${base}.containerWidth`)),
      line('--_fab-container-height', get(`${base}.containerHeight`)),
      line('--_fab-container-radius', shape(`${base}.containerShape`)),
      line('--_fab-icon-size', get(`${base}.iconSize`)),
      '}',
      '',
    );
  }

  for (const [variant, base] of variants) {
    rules.push(
      `.fab:not(.fab--extended)[data-variant='${variant}'] {`,
      line('--_fab-container-color', get(`${base}.containerColor`)),
      line('--_fab-content-color', get(`${base}.iconColor`)),
      line('--_fab-state-layer-color', get(`${base}.iconColor`)),
      '}',
      '',
    );
  }
  rules.push(
    ".fab:not(.fab--extended)[data-variant='surface'][data-elevation='lowered'] {",
    line('--_fab-container-color', get('component.fab.surface.loweredContainerColor')),
    '}',
    '',
    '.fab--branded:not(.fab--extended) {',
    line('--_fab-target-size', get('component.fab.branded.containerHeight')),
    line('--_fab-container-width', get('component.fab.branded.containerWidth')),
    line('--_fab-container-height', get('component.fab.branded.containerHeight')),
    line('--_fab-container-radius', shape('component.fab.branded.containerShape')),
    line('--_fab-container-color', get('component.fab.branded.containerColor')),
    line('--_fab-content-color', 'inherit'),
    line('--_fab-state-layer-color', get('component.fab.branded.pressedStateLayerColor')),
    line('--_fab-icon-size', get('component.fab.branded.iconSize')),
    '}',
    '',
    ".fab--branded:not(.fab--extended)[data-elevation='lowered'] {",
    line('--_fab-container-color', get('component.fab.branded.loweredContainerColor')),
    '}',
    '',
  );

  for (const [size, base] of extendedSizes) {
    const role = get(`${base}.labelTextTypography`);
    const expandedMinWidth = size === 'baseline'
      ? get('component.fab.extended.baseline.expandedMinWidth')
      : get(`${base}.containerHeight`);
    const textStart = size === 'baseline'
      ? get('component.fab.extended.baseline.textOnlyLeadingSpace')
      : get(`${base}.leadingSpace`);
    const textEnd = size === 'baseline'
      ? get('component.fab.extended.baseline.textOnlyTrailingSpace')
      : get(`${base}.trailingSpace`);
    rules.push(
      `.fab--extended[data-size='${size}'] {`,
      line('--_fab-target-size', get(`${base}.containerHeight`)),
      line('--_fab-container-width', get(`${base}.containerHeight`)),
      line('--_fab-container-height', get(`${base}.containerHeight`)),
      line('--_fab-container-radius', shape(`${base}.containerShape`)),
      line('--_fab-icon-size', get(`${base}.iconSize`)),
      line('--_fab-leading-space', get(`${base}.leadingSpace`)),
      line('--_fab-trailing-space', get(`${base}.trailingSpace`)),
      line('--_fab-icon-label-space', get(`${base}.iconLabelSpace`)),
      line('--_fab-expanded-min-width', expandedMinWidth),
      line('--_fab-text-only-leading-space', textStart),
      line('--_fab-text-only-trailing-space', textEnd),
      ...typography(role),
      '}',
      '',
    );
  }

  for (const [variant, base] of extendedVariants) {
    rules.push(
      `.fab--extended[data-variant='${variant}'] {`,
      line('--_fab-container-color', get(`${base}.containerColor`)),
      line('--_fab-content-color', get(`${base}.iconColor`)),
      line('--_fab-state-layer-color', get(`${base}.iconColor`)),
      line('--_fab-label-color', get(`${base}.labelTextColor`)),
      '}',
      '',
    );
  }
  rules.push(
    ".fab--extended[data-variant='surface'][data-elevation='lowered'] {",
    line('--_fab-container-color', get('component.fab.extended.surface.loweredContainerColor')),
    '}',
    '',
    '.fab--branded-extended {',
    line('--_fab-target-size', get('component.fab.extended.branded.containerHeight')),
    line('--_fab-container-width', get('component.fab.extended.branded.containerHeight')),
    line('--_fab-container-height', get('component.fab.extended.branded.containerHeight')),
    line('--_fab-container-radius', shape('component.fab.extended.branded.containerShape')),
    line('--_fab-container-color', get('component.fab.extended.branded.containerColor')),
    line('--_fab-content-color', 'inherit'),
    line('--_fab-state-layer-color', get('component.fab.extended.branded.pressedStateLayerColor')),
    line('--_fab-icon-size', get('component.fab.extended.branded.iconSize')),
    line('--_fab-label-color', get('component.fab.extended.branded.labelTextColor')),
    line('--_fab-focus-label-color', get('component.fab.extended.branded.focusLabelTextColor')),
    line('--_fab-hover-label-color', get('component.fab.extended.branded.hoverLabelTextColor')),
    line('--_fab-pressed-label-color', get('component.fab.extended.branded.pressedLabelTextColor')),
    ...typography(get('component.fab.extended.branded.labelTextTypography')),
    '}',
    '',
    ".fab--branded-extended[data-elevation='lowered'] {",
    line('--_fab-container-color', get('component.fab.extended.branded.loweredContainerColor')),
    '}',
    '',
    '.fab--extended {',
    line('--_fab-expand-size-duration', get('motion.spring.standard.fastSpatial.duration')),
    line('--_fab-expand-size-easing', get('motion.spring.standard.fastSpatial.easing')),
    line('--_fab-expand-opacity-duration', get('motion.spring.standard.fastEffects.duration')),
    line('--_fab-expand-opacity-easing', get('motion.spring.standard.fastEffects.easing')),
    '}',
    '',
  );

  return rules.join('\n');
}

export default defineCssAdapter('fab', createFabCss);
