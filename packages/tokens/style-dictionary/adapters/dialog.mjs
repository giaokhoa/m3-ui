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

export function createDialogCss(context) {
  const get = tokenReader(context, 'Dialog CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const actionRole = get('component.dialog.actionLabelTextFont');
  const headlineRole = get('component.dialog.headlineFont');
  const supportingRole = get('component.dialog.supportingTextFont');

  return [
    '.dialog-overlay {',
    line('--_scrim-container-color', get('scrim.containerColor')),
    line('--_scrim-container-opacity', get('scrim.containerOpacity')),
    line('--_scrim-alpha', 1),
    line('--_dialog-min-width', '280px'),
    line('--_dialog-max-width', '560px'),
    line('--_dialog-viewport-margin', '24px'),
    '}',
    '',
    '.dialog-surface {',
    line('--_dialog-container-color', get('component.dialog.containerColor')),
    line('--_dialog-headline-color', get('component.dialog.headlineColor')),
    line('--_dialog-supporting-text-color', get('component.dialog.supportingTextColor')),
    line('--_dialog-icon-color', get('component.dialog.iconColor')),
    line('--_dialog-action-color', get('component.dialog.actionLabelTextColor')),
    line('--_dialog-action-focus-color', get('component.dialog.actionFocusLabelTextColor')),
    line('--_dialog-action-hover-color', get('component.dialog.actionHoverLabelTextColor')),
    line('--_dialog-action-pressed-color', get('component.dialog.actionPressedLabelTextColor')),
    line('--_dialog-icon-size', get('component.dialog.iconSize')),
    line('--_dialog-radius', get(`shape.${get('component.dialog.containerShape')}`)),
    line('--_dialog-content-padding', '24px'),
    line('--_dialog-icon-bottom-spacing', '16px'),
    line('--_dialog-title-bottom-spacing', '16px'),
    line('--_dialog-supporting-text-bottom-spacing', '24px'),
    line('--_dialog-action-spacing', '8px'),
    ...typography(get, 'dialog-headline', headlineRole),
    ...typography(get, 'dialog-supporting-text', supportingRole),
    ...typography(get, 'dialog-action', actionRole),
    '}',
    '',
    '.dialog__actions .button {',
    line('--_button-content-color', 'var(--_dialog-action-color)'),
    line('--_button-font-family', 'var(--_dialog-action-font-family)'),
    line('--_button-font-size', 'var(--_dialog-action-font-size)'),
    line('--_button-line-height', 'var(--_dialog-action-line-height)'),
    line('--_button-font-weight', 'var(--_dialog-action-font-weight)'),
    line('--_button-letter-spacing', 'var(--_dialog-action-letter-spacing)'),
    line('--ripple-color', 'var(--_dialog-action-color)'),
    '}',
    '.dialog__actions .button[data-hovered] { --_button-content-color: var(--_dialog-action-hover-color); --ripple-color: var(--_dialog-action-hover-color); }',
    '.dialog__actions .button[data-focus-visible] { --_button-content-color: var(--_dialog-action-focus-color); --ripple-color: var(--_dialog-action-focus-color); }',
    '.dialog__actions .button[data-pressed] { --_button-content-color: var(--_dialog-action-pressed-color); --ripple-color: var(--_dialog-action-pressed-color); }',
    '',
  ].join('\n');
}

export default defineCssAdapter('dialog', createDialogCss);
