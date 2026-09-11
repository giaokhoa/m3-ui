import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

function radius(get, shape) {
  if (shape === 'none') return '0';
  return cssValue(get(`shape.${shape}`));
}

function typographyLines(get, role) {
  const familyRole = get(`typography.${role}.fontFamily`);
  return [
    `  --_search-font-family: var(--font-family-${cssValue(familyRole)});`,
    `  --_search-font-size: ${cssValue(get(`typography.${role}.fontSize`))};`,
    `  --_search-line-height: ${cssValue(get(`typography.${role}.lineHeight`))};`,
    `  --_search-font-weight: ${cssValue(get(`typography.${role}.fontWeight`))};`,
    `  --_search-letter-spacing: ${cssValue(get(`typography.${role}.letterSpacing`))};`,
  ];
}

export function createSearchBarCss(context) {
  const get = tokenReader(context, 'SearchBar CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const barTypography = get('component.searchBar.inputTextFont');
  const viewTypography = get('component.searchView.headerInputTextFont');
  return [
    '.search-bar {',
    line('--_search-container-color', get('component.searchBar.containerColor')),
    line('--_search-container-height', get('component.searchBar.containerHeight')),
    line('--_search-container-radius', radius(get, get('component.searchBar.containerShape'))),
    line('--_search-input-color', get('component.searchBar.inputTextColor')),
    line('--_search-supporting-color', get('component.searchBar.supportingTextColor')),
    line('--_search-leading-icon-color', get('component.searchBar.leadingIconColor')),
    line('--_search-trailing-icon-color', get('component.searchBar.trailingIconColor')),
    ...typographyLines(get, barTypography),
    '}',
    '',
    '.search-view {',
    line('--_search-view-container-color', get('component.searchView.containerColor')),
    line('--_search-input-color', get('component.searchView.headerInputTextColor')),
    line('--_search-supporting-color', get('component.searchView.headerSupportingTextColor')),
    line('--_search-leading-icon-color', get('component.searchView.headerLeadingIconColor')),
    line('--_search-trailing-icon-color', get('component.searchView.headerTrailingIconColor')),
    line('--_search-expand-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_search-expand-easing', get('motion.spring.defaultSpatial.easing')),
    ...typographyLines(get, viewTypography),
    '}',
    '',
    '.search-view--docked {',
    line('--_search-view-radius', radius(get, get('component.searchView.dockedContainerShape'))),
    line('--_search-view-header-height', get('component.searchView.dockedHeaderContainerHeight')),
    '}',
    '',
    '.search-view--fullscreen {',
    line('--_search-view-radius', radius(get, get('component.searchView.fullScreenContainerShape'))),
    line('--_search-view-header-height', get('component.searchView.fullScreenHeaderContainerHeight')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('search-bar', createSearchBarCss);
