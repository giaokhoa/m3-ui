import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

const toggleSizes = ['baseline', 'medium', 'large'];

export function createFabMenuCss(context) {
  const get = tokenReader(context, 'FabMenu CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const shape = (path) => get(`shape.${get(path)}`);
  const halfPx = (path) => {
    const value = String(get(path));
    const match = /^(\d+(?:\.\d+)?)px$/.exec(value);
    if (!match) throw new TypeError(`FabMenu CSS: expected px dimension for ${path}, got ${value}`);
    return `${Number(match[1]) / 2}px`;
  };
  const role = get('component.fabMenu.listItem.labelTypography');
  const rules = [
    '.fab-menu {',
    line('--_fab-menu-horizontal-padding', get('component.fabMenu.web.horizontalPadding')),
    line('--_fab-menu-trigger-bottom-padding', get('component.fabMenu.web.triggerBottomPadding')),
    line('--_fab-menu-close-between-space', get('component.fabMenu.closeButton.betweenSpace')),
    line('--_fab-menu-item-between-space', get('component.fabMenu.listItem.betweenSpace')),
    line('--_fab-menu-item-height', get('component.fabMenu.listItem.containerHeight')),
    line('--_fab-menu-item-min-width', get('component.fabMenu.listItem.containerHeight')),
    line('--_fab-menu-item-icon-size', get('component.fabMenu.listItem.iconSize')),
    line('--_fab-menu-item-icon-label-space', get('component.fabMenu.listItem.iconLabelSpace')),
    line('--_fab-menu-item-leading-space', get('component.fabMenu.listItem.leadingSpace')),
    line('--_fab-menu-item-trailing-space', get('component.fabMenu.listItem.trailingSpace')),
    line('--_fab-menu-item-shape', shape('component.fabMenu.listItem.containerShape')),
    line('--_fab-menu-item-container-color', get('component.fabMenu.listItem.role.primaryContainer.containerColor')),
    line('--_fab-menu-item-content-color', get('component.fabMenu.listItem.role.primaryContainer.contentColor')),
    line('--_fab-menu-item-spatial-duration', get('motion.spring.fastSpatial.duration')),
    line('--_fab-menu-item-spatial-easing', get('motion.spring.fastSpatial.easing')),
    line('--_fab-menu-item-effects-duration', get('motion.spring.fastEffects.duration')),
    line('--_fab-menu-item-effects-easing', get('motion.spring.fastEffects.easing')),
    line('--_fab-menu-label-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_fab-menu-label-font-size', get(`typography.${role}.fontSize`)),
    line('--_fab-menu-label-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_fab-menu-label-line-height', get(`typography.${role}.lineHeight`)),
    line('--_fab-menu-label-letter-spacing', get(`typography.${role}.letterSpacing`)),
    line('--_fab-toggle-spatial-duration', get('motion.spring.fastSpatial.duration')),
    line('--_fab-toggle-spatial-easing', get('motion.spring.fastSpatial.easing')),
    line('--_fab-toggle-effects-duration', get('motion.spring.fastEffects.duration')),
    line('--_fab-toggle-effects-easing', get('motion.spring.fastEffects.easing')),
    '}',
    '',
  ];

  for (const size of toggleSizes) {
    const base = `component.fab.size.${size}`;
    rules.push(
      `.fab.fab-menu-toggle[data-toggle-size='${size}'][data-size] {`,
      line('--_fab-target-size', get(`${base}.containerHeight`)),
      '}',
      '',
      `.fab.fab-menu-toggle[data-toggle-size='${size}']:not([data-checked]) {`,
      line('--_fab-container-width', get(`${base}.containerWidth`)),
      line('--_fab-container-height', get(`${base}.containerHeight`)),
      line('--_fab-container-radius', shape(`${base}.containerShape`)),
      line('--_fab-container-color', get('component.fabMenu.listItem.role.primaryContainer.containerColor')),
      line('--_fab-content-color', get('component.fabMenu.listItem.role.primaryContainer.contentColor')),
      line('--_fab-state-layer-color', get('component.fabMenu.listItem.role.primaryContainer.contentColor')),
      line('--_fab-icon-size', get(`${base}.iconSize`)),
      '}',
      '',
    );
  }

  // Keep a finite radius for the 56px close-button morph. The canonical
  // `shape.full` remains appropriate for static pills, but 9999px produces a
  // different interpolation path when border-radius itself is animated.
  rules.push(
    '.fab.fab-menu-toggle[data-toggle-size][data-checked] {',
    line('--_fab-container-width', get('component.fabMenu.closeButton.containerWidth')),
    line('--_fab-container-height', get('component.fabMenu.closeButton.containerHeight')),
    line('--_fab-container-radius', halfPx('component.fabMenu.closeButton.containerHeight')),
    line('--_fab-container-color', get('component.fabMenu.closeButton.role.primary.containerColor')),
    line('--_fab-content-color', get('component.fabMenu.closeButton.role.primary.contentColor')),
    line('--_fab-state-layer-color', get('component.fabMenu.closeButton.role.primary.contentColor')),
    line('--_fab-icon-size', get('component.fabMenu.closeButton.iconSize')),
    '}',
    '',
  );

  return rules.join('\n');
}

export default defineCssAdapter('fab-menu', createFabMenuCss);
