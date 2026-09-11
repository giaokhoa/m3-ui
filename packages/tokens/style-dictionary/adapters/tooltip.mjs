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

export function createTooltipCss(context) {
  const get = tokenReader(context, 'Tooltip CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const plainRole = get('component.tooltip.plain.supportingTextTypography');
  const titleRole = get('component.tooltip.rich.subheadTypography');
  const textRole = get('component.tooltip.rich.supportingTextTypography');
  const actionRole = get('component.tooltip.rich.actionLabelTextTypography');

  return [
    '.plain-tooltip {',
    line('--_plain-tooltip-container-color', get('component.tooltip.plain.containerColor')),
    line('--_plain-tooltip-content-color', get('component.tooltip.plain.supportingTextColor')),
    line('--_plain-tooltip-radius', get(`shape.${get('component.tooltip.plain.containerShape')}`)),
    line('--_plain-tooltip-min-width', '40px'),
    line('--_plain-tooltip-min-height', '24px'),
    line('--_plain-tooltip-max-width', '200px'),
    line('--_plain-tooltip-padding-inline', '8px'),
    line('--_plain-tooltip-padding-block', '4px'),
    line('--_plain-tooltip-hidden-scale', 0.8),
    line('--_plain-tooltip-scale-duration', get('motion.spring.fastSpatial.duration')),
    line('--_plain-tooltip-scale-easing', get('motion.spring.fastSpatial.easing')),
    line('--_plain-tooltip-opacity-duration', get('motion.spring.fastEffects.duration')),
    line('--_plain-tooltip-opacity-easing', get('motion.spring.fastEffects.easing')),
    ...typography(get, 'plain-tooltip', plainRole),
    '}',
    '',
    '.rich-tooltip {',
    line('--_rich-tooltip-container-color', get('component.tooltip.rich.containerColor')),
    line('--_rich-tooltip-content-color', get('component.tooltip.rich.supportingTextColor')),
    line('--_rich-tooltip-title-color', get('component.tooltip.rich.subheadColor')),
    line('--_rich-tooltip-action-color', get('component.tooltip.rich.actionLabelTextColor')),
    line('--_rich-tooltip-action-focus-label-color', get('component.tooltip.rich.actionFocusLabelTextColor')),
    line('--_rich-tooltip-action-hover-label-color', get('component.tooltip.rich.actionHoverLabelTextColor')),
    line('--_rich-tooltip-action-pressed-label-color', get('component.tooltip.rich.actionPressedLabelTextColor')),
    line('--_rich-tooltip-action-focus-state-layer-color', get('component.tooltip.rich.actionFocusStateLayerColor')),
    line('--_rich-tooltip-action-hover-state-layer-color', get('component.tooltip.rich.actionHoverStateLayerColor')),
    line('--_rich-tooltip-action-pressed-state-layer-color', get('component.tooltip.rich.actionPressedStateLayerColor')),
    line('--_rich-tooltip-action-focus-state-layer-opacity', get('component.tooltip.rich.actionFocusStateLayerOpacity')),
    line('--_rich-tooltip-action-hover-state-layer-opacity', get('component.tooltip.rich.actionHoverStateLayerOpacity')),
    line('--_rich-tooltip-action-pressed-state-layer-opacity', get('component.tooltip.rich.actionPressedStateLayerOpacity')),
    line('--_rich-tooltip-radius', get(`shape.${get('component.tooltip.rich.containerShape')}`)),
    line('--_rich-tooltip-min-width', '40px'),
    line('--_rich-tooltip-min-height', '24px'),
    line('--_rich-tooltip-max-width', '320px'),
    line('--_rich-tooltip-padding-inline', '16px'),
    line('--_rich-tooltip-title-padding-block-start', '12px'),
    line('--_rich-tooltip-text-padding-block-start', '8px'),
    line('--_rich-tooltip-text-bottom-padding', '16px'),
    line('--_rich-tooltip-action-min-height', '36px'),
    line('--_rich-tooltip-action-bottom-padding', '8px'),
    line('--_rich-tooltip-text-only-padding-block', '4px'),
    line('--_rich-tooltip-hidden-scale', 0.8),
    line('--_rich-tooltip-scale-duration', get('motion.spring.fastSpatial.duration')),
    line('--_rich-tooltip-scale-easing', get('motion.spring.fastSpatial.easing')),
    line('--_rich-tooltip-opacity-duration', get('motion.spring.fastEffects.duration')),
    line('--_rich-tooltip-opacity-easing', get('motion.spring.fastEffects.easing')),
    ...typography(get, 'rich-tooltip-title', titleRole),
    ...typography(get, 'rich-tooltip-text', textRole),
    ...typography(get, 'rich-tooltip-action', actionRole),
    '}',
    '',
    '.rich-tooltip__action .button {',
    line('--_button-content-color', 'var(--_rich-tooltip-action-color)'),
    line('--_button-font-family', 'var(--_rich-tooltip-action-font-family)'),
    line('--_button-font-size', 'var(--_rich-tooltip-action-font-size)'),
    line('--_button-line-height', 'var(--_rich-tooltip-action-line-height)'),
    line('--_button-font-weight', 'var(--_rich-tooltip-action-font-weight)'),
    line('--_button-letter-spacing', 'var(--_rich-tooltip-action-letter-spacing)'),
    line('--ripple-color', 'var(--_rich-tooltip-action-color)'),
    line('--_ripple-hover-opacity', 'var(--_rich-tooltip-action-hover-state-layer-opacity)'),
    line('--_ripple-focus-opacity', 'var(--_rich-tooltip-action-focus-state-layer-opacity)'),
    line('--_ripple-pressed-opacity', 'var(--_rich-tooltip-action-pressed-state-layer-opacity)'),
    '}',
    '.rich-tooltip__action .button[data-hovered] { --_button-content-color: var(--_rich-tooltip-action-hover-label-color); --ripple-color: var(--_rich-tooltip-action-hover-state-layer-color); }',
    '.rich-tooltip__action .button[data-focus-visible] { --_button-content-color: var(--_rich-tooltip-action-focus-label-color); --ripple-color: var(--_rich-tooltip-action-focus-state-layer-color); }',
    '.rich-tooltip__action .button[data-pressed] { --_button-content-color: var(--_rich-tooltip-action-pressed-label-color); --ripple-color: var(--_rich-tooltip-action-pressed-state-layer-color); }',
    '',
  ].join('\n');
}

export default defineCssAdapter('tooltip', createTooltipCss);
