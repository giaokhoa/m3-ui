import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createBadgeCss(context) {
  const get = tokenReader(context, 'Badge CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const typography = (role) => [
    line('--_badge-font-family', `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line('--_badge-font-size', get(`typography.${role}.fontSize`)),
    line('--_badge-line-height', get(`typography.${role}.lineHeight`)),
    line('--_badge-font-weight', get(`typography.${role}.fontWeight`)),
    line('--_badge-letter-spacing', get(`typography.${role}.letterSpacing`)),
  ];
  const contentTypography = get('component.badge.large.labelTypography');

  return [
    '.badge--dot {',
    line('--_badge-container-color', get('component.badge.small.color')),
    line('--_badge-content-color', 'transparent'),
    line('--_badge-size', get('component.badge.small.size')),
    line('--_badge-radius', get(`shape.${get('component.badge.small.shape')}`)),
    '}',
    '',
    '.badge--content {',
    line('--_badge-container-color', get('component.badge.large.color')),
    line('--_badge-content-color', get('component.badge.large.labelTextColor')),
    line('--_badge-size', get('component.badge.large.size')),
    line('--_badge-radius', get(`shape.${get('component.badge.large.shape')}`)),
    ...typography(contentTypography),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('badge', createBadgeCss);
