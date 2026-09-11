import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function typographyLines(get, prefix, role) {
  const familyRole = get(`typography.${role}.fontFamily`);
  return [
    `  --_${prefix}-font-family: var(--font-family-${cssValue(familyRole)});`,
    `  --_${prefix}-font-size: ${cssValue(get(`typography.${role}.fontSize`))};`,
    `  --_${prefix}-line-height: ${cssValue(get(`typography.${role}.lineHeight`))};`,
    `  --_${prefix}-font-weight: ${cssValue(get(`typography.${role}.fontWeight`))};`,
    `  --_${prefix}-letter-spacing: ${cssValue(get(`typography.${role}.letterSpacing`))};`,
  ];
}

export function createTopAppBarCss(context) {
  const get = tokenReader(context, 'TopAppBar CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const smallTitle = get('component.appBar.variant.small.titleTypography');
  const smallSubtitle = get('component.appBar.variant.small.subtitleTypography');
  const css = [
    '.top-app-bar {',
    line('--_top-app-bar-container-color', get('component.appBar.base.containerColor')),
    line('--_top-app-bar-title-color', get('component.appBar.base.titleColor')),
    line('--_top-app-bar-subtitle-color', get('component.appBar.base.subtitleColor')),
    line('--_top-app-bar-navigation-icon-color', get('component.appBar.base.leadingIconColor')),
    line('--_top-app-bar-action-icon-color', get('component.appBar.base.trailingIconColor')),
    line('--_top-app-bar-collapsed-height', get('component.appBar.variant.small.containerHeight')),
    line('--_top-app-bar-leading-space', get('component.appBar.base.leadingSpace')),
    line('--_top-app-bar-trailing-space', get('component.appBar.base.trailingSpace')),
    line('--_top-app-bar-motion-duration', get('motion.spring.defaultEffects.duration')),
    line('--_top-app-bar-motion-easing', get('motion.spring.defaultEffects.easing')),
    ...typographyLines(get, 'top-app-bar-collapsed-title', smallTitle),
    ...typographyLines(get, 'top-app-bar-collapsed-subtitle', smallSubtitle),
    '}',
    '',
    '.top-app-bar[data-scrolled] {',
    line('--_top-app-bar-container-color', get('component.appBar.base.onScrollContainerColor')),
    '}',
  ];

  const titleVariants = {
    small: 'component.appBar.variant.small.titleTypography',
    'center-aligned': 'component.appBar.variant.small.titleTypography',
    medium: 'component.appBar.variant.medium.titleTypography',
    'medium-flexible': 'component.appBar.variant.mediumFlexible.titleTypography',
    large: 'component.appBar.variant.large.titleTypography',
    'large-flexible': 'component.appBar.variant.largeFlexible.titleTypography',
  };
  for (const [variant, path] of Object.entries(titleVariants)) {
    css.push('', `.top-app-bar[data-variant='${variant}'] {`, ...typographyLines(get, 'top-app-bar-expanded-title', get(path)), '}');
  }
  css.push(
    '',
    ".top-app-bar[data-variant='medium-flexible'] {",
    ...typographyLines(get, 'top-app-bar-expanded-subtitle', get('component.appBar.variant.mediumFlexible.subtitleTypography')),
    '}',
    '',
    ".top-app-bar[data-variant='large-flexible'] {",
    ...typographyLines(get, 'top-app-bar-expanded-subtitle', get('component.appBar.variant.largeFlexible.subtitleTypography')),
    '}',
    '',
  );
  return css.join('\n');
}

export default defineCssAdapter('top-app-bar', createTopAppBarCss);
