import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function typography(get, prefix, role) {
  return [
    `  --_${prefix}-font-family: var(--font-family-${get(`typography.${role}.fontFamily`)});`,
    `  --_${prefix}-font-size: ${cssValue(get(`typography.${role}.fontSize`))};`,
    `  --_${prefix}-line-height: ${cssValue(get(`typography.${role}.lineHeight`))};`,
    `  --_${prefix}-font-weight: ${cssValue(get(`typography.${role}.fontWeight`))};`,
    `  --_${prefix}-letter-spacing: ${cssValue(get(`typography.${role}.letterSpacing`))};`,
  ];
}

export function createSnackbarCss(context) {
  const get = tokenReader(context, 'Snackbar CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const actionRole = get('component.snackbar.action.labelTypography');
  const textRole = get('component.snackbar.supportingText.typography');

  return [
    '.snackbar {',
    line('--_snackbar-container-color', get('component.snackbar.container.color')),
    line('--_snackbar-content-color', get('component.snackbar.supportingText.color')),
    line('--_snackbar-action-color', get('component.snackbar.action.labelTextColor')),
    line('--_snackbar-action-focus-color', get('component.snackbar.action.focusLabelTextColor')),
    line('--_snackbar-action-hover-color', get('component.snackbar.action.hoverLabelTextColor')),
    line('--_snackbar-action-pressed-color', get('component.snackbar.action.pressedLabelTextColor')),
    line('--_snackbar-action-focus-state-layer-color', get('component.snackbar.action.focusStateLayerColor')),
    line('--_snackbar-action-hover-state-layer-color', get('component.snackbar.action.hoverStateLayerColor')),
    line('--_snackbar-action-pressed-state-layer-color', get('component.snackbar.action.pressedStateLayerColor')),
    line('--_snackbar-action-focus-state-layer-opacity', get('component.snackbar.action.focusStateLayerOpacity')),
    line('--_snackbar-action-hover-state-layer-opacity', get('component.snackbar.action.hoverStateLayerOpacity')),
    line('--_snackbar-action-pressed-state-layer-opacity', get('component.snackbar.action.pressedStateLayerOpacity')),
    line('--_snackbar-icon-color', get('component.snackbar.icon.color')),
    line('--_snackbar-icon-focus-color', get('component.snackbar.icon.focusColor')),
    line('--_snackbar-icon-hover-color', get('component.snackbar.icon.hoverColor')),
    line('--_snackbar-icon-pressed-color', get('component.snackbar.icon.pressedColor')),
    line('--_snackbar-icon-focus-state-layer-color', get('component.snackbar.icon.focusStateLayerColor')),
    line('--_snackbar-icon-hover-state-layer-color', get('component.snackbar.icon.hoverStateLayerColor')),
    line('--_snackbar-icon-pressed-state-layer-color', get('component.snackbar.icon.pressedStateLayerColor')),
    line('--_snackbar-icon-focus-state-layer-opacity', get('component.snackbar.icon.focusStateLayerOpacity')),
    line('--_snackbar-icon-hover-state-layer-opacity', get('component.snackbar.icon.hoverStateLayerOpacity')),
    line('--_snackbar-icon-pressed-state-layer-opacity', get('component.snackbar.icon.pressedStateLayerOpacity')),
    line('--_snackbar-icon-size', get('component.snackbar.icon.size')),
    line('--_snackbar-radius', get(`shape.${get('component.snackbar.container.shape')}`)),
    line('--_snackbar-single-line-height', get('component.snackbar.container.singleLineHeight')),
    line('--_snackbar-two-lines-height', get('component.snackbar.container.twoLinesHeight')),
    line('--_snackbar-max-width', '600px'),
    line('--_snackbar-horizontal-spacing', '16px'),
    line('--_snackbar-button-side-spacing', '8px'),
    line('--_snackbar-text-end-extra-spacing', '8px'),
    line('--_snackbar-vertical-padding', '14px'),
    line('--_snackbar-action-bottom-padding', '4px'),
    ...typography(get, 'snackbar-text', textRole),
    ...typography(get, 'snackbar-action', actionRole),
    '}',
    '',
    '.snackbar__action > .button {',
    line('--_button-content-color', 'var(--_snackbar-action-color)'),
    line('--_button-font-family', 'var(--_snackbar-action-font-family)'),
    line('--_button-font-size', 'var(--_snackbar-action-font-size)'),
    line('--_button-line-height', 'var(--_snackbar-action-line-height)'),
    line('--_button-font-weight', 'var(--_snackbar-action-font-weight)'),
    line('--_button-letter-spacing', 'var(--_snackbar-action-letter-spacing)'),
    line('--ripple-color', 'var(--_snackbar-action-color)'),
    line('--_ripple-hover-opacity', 'var(--_snackbar-action-hover-state-layer-opacity)'),
    line('--_ripple-focus-opacity', 'var(--_snackbar-action-focus-state-layer-opacity)'),
    line('--_ripple-pressed-opacity', 'var(--_snackbar-action-pressed-state-layer-opacity)'),
    '}',
    '.snackbar__action > .button[data-hovered] { --_button-content-color: var(--_snackbar-action-hover-color); --ripple-color: var(--_snackbar-action-hover-state-layer-color); }',
    '.snackbar__action > .button[data-focus-visible] { --_button-content-color: var(--_snackbar-action-focus-color); --ripple-color: var(--_snackbar-action-focus-state-layer-color); }',
    '.snackbar__action > .button[data-pressed] { --_button-content-color: var(--_snackbar-action-pressed-color); --ripple-color: var(--_snackbar-action-pressed-state-layer-color); }',
    '',
    '.snackbar__dismiss > .icon-button {',
    line('--_icon-button-content-color', 'var(--_snackbar-icon-color)'),
    line('--_icon-button-icon-size', 'var(--_snackbar-icon-size)'),
    line('--ripple-color', 'var(--_snackbar-icon-color)'),
    line('--_ripple-hover-opacity', 'var(--_snackbar-icon-hover-state-layer-opacity)'),
    line('--_ripple-focus-opacity', 'var(--_snackbar-icon-focus-state-layer-opacity)'),
    line('--_ripple-pressed-opacity', 'var(--_snackbar-icon-pressed-state-layer-opacity)'),
    '}',
    '.snackbar__dismiss > .icon-button[data-hovered] { --_icon-button-content-color: var(--_snackbar-icon-hover-color); --ripple-color: var(--_snackbar-icon-hover-state-layer-color); }',
    '.snackbar__dismiss > .icon-button[data-focus-visible] { --_icon-button-content-color: var(--_snackbar-icon-focus-color); --ripple-color: var(--_snackbar-icon-focus-state-layer-color); }',
    '.snackbar__dismiss > .icon-button[data-pressed] { --_icon-button-content-color: var(--_snackbar-icon-pressed-color); --ripple-color: var(--_snackbar-icon-pressed-state-layer-color); }',
    '',
  ].join('\n');
}

export default defineCssAdapter('snackbar', createSnackbarCss);
