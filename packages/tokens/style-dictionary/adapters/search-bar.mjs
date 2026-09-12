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
  const scrimOpacity = Number(get('scrim.containerOpacity')) * 100;

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
    '.search-view--docked-gap {',
    line('--_search-view-gap', get('component.searchView.containedDockedBarResultsGap')),
    line('--_search-view-bar-radius', radius(get, get('component.searchView.containedDockedBarShape'))),
    line('--_search-view-results-radius', radius(get, get('component.searchView.containedDockedResultsShape'))),
    line('--_search-view-header-height', get('component.searchView.dockedHeaderContainerHeight')),
    line('--_search-view-scrim-color', `color-mix(in srgb, ${cssValue(get('scrim.containerColor'))} ${scrimOpacity}%, transparent)`),
    '}',
    '',
    '.search-view__docked-gap-scrim {',
    line('--_search-view-scrim-color', `color-mix(in srgb, ${cssValue(get('scrim.containerColor'))} ${scrimOpacity}%, transparent)`),
    '}',
    '',
    '.search-view--fullscreen {',
    line('--_search-view-radius', radius(get, get('component.searchView.fullScreenContainerShape'))),
    line('--_search-view-header-height', get('component.searchView.fullScreenHeaderContainerHeight')),
    '}',
    '',
    '.search-view--fullscreen-contained {',
    line('--_search-view-radius', radius(get, get('component.searchView.fullScreenContainerShape'))),
    line('--_search-view-header-height', get('component.searchView.fullScreenHeaderContainerHeight')),
    line('--_search-view-contained-background-color', get('component.searchView.containedBackgroundColor')),
    line('--_search-view-contained-bar-height', get('component.searchView.containedFullScreenBarContainerHeight')),
    line('--_search-view-contained-bar-color', get('component.searchBar.containerColor')),
    line('--_search-view-contained-bar-radius', radius(get, get('component.searchBar.containerShape'))),
    '}',
    '',
    '.app-bar-with-search {',
    line('--_app-bar-with-search-container-color', get('component.appBar.base.containerColor')),
    line('--_app-bar-with-search-search-container-color', get('component.appBar.base.searchContainerColor')),
    line('--_app-bar-with-search-navigation-icon-color', get('component.appBar.base.leadingIconColor')),
    line('--_app-bar-with-search-action-icon-color', get('component.appBar.base.trailingIconColor')),
    line('--_app-bar-with-search-navigation-space', get('component.appBar.base.leadingSpace')),
    line('--_app-bar-with-search-action-space', get('component.appBar.base.trailingSpace')),
    line('--_app-bar-with-search-search-leading-space', get('component.appBar.base.searchLeadingSpace')),
    line('--_app-bar-with-search-search-trailing-space', get('component.appBar.base.searchTrailingSpace')),
    line('--_app-bar-with-search-height', get('component.appBar.variant.small.containerHeight')),
    line('--_app-bar-with-search-search-height', get('component.appBar.variant.small.searchContainerHeight')),
    line('--_app-bar-with-search-motion-duration', get('motion.spring.defaultEffects.duration')),
    line('--_app-bar-with-search-motion-easing', get('motion.spring.defaultEffects.easing')),
    '}',
    '',
    '.app-bar-with-search[data-scrolled] {',
    line('--_app-bar-with-search-container-color', get('component.appBar.base.onScrollContainerColor')),
    line('--_app-bar-with-search-search-container-color', get('component.appBar.base.searchOnScrollContainerColor')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('search-bar', createSearchBarCss);
