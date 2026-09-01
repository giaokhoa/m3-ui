import {
  cssValue,
  defineCssAdapter,
  tokenReader,
  withOpacity,
} from '../adapter-helpers.mjs';

export function createSegmentedButtonCss(context) {
  const get = tokenReader(context, 'SegmentedButton CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const root = 'component.outlinedSegmentedButton';
  const typographyRole = get(`${root}.labelTextFont`);

  return [
    '.segmented-button-row,',
    '.segmented-button {',
    line('--_segmented-button-height', get(`${root}.containerHeight`)),
    '}',
    '',
    '.segmented-button {',
    line('--_segmented-button-min-width', get('component.button.baseline.minWidth')),
    line('--_segmented-button-radius', get(`shape.${get(`${root}.shape`)}`)),
    line('--_segmented-button-outline-width', get(`${root}.outlineWidth`)),
    line('--_segmented-button-outline-color', get(`${root}.outlineColor`)),
    line(
      '--_segmented-button-disabled-outline-color',
      withOpacity(get(`${root}.disabledOutlineColor`), get(`${root}.disabledOutlineOpacity`)),
    ),
    line('--_segmented-button-selected-container-color', get(`${root}.selectedContainerColor`)),
    line('--_segmented-button-selected-label-color', get(`${root}.selectedLabelTextColor`)),
    line('--_segmented-button-selected-hover-label-color', get(`${root}.selectedHoverLabelTextColor`)),
    line('--_segmented-button-selected-focus-label-color', get(`${root}.selectedFocusLabelTextColor`)),
    line('--_segmented-button-selected-pressed-label-color', get(`${root}.selectedPressedLabelTextColor`)),
    line('--_segmented-button-selected-icon-color', get(`${root}.selectedIconColor`)),
    line('--_segmented-button-selected-hover-icon-color', get(`${root}.selectedHoverIconColor`)),
    line('--_segmented-button-selected-focus-icon-color', get(`${root}.selectedFocusIconColor`)),
    line('--_segmented-button-selected-pressed-icon-color', get(`${root}.selectedPressedIconColor`)),
    line('--_segmented-button-unselected-label-color', get(`${root}.unselectedLabelTextColor`)),
    line('--_segmented-button-unselected-hover-label-color', get(`${root}.unselectedHoverLabelTextColor`)),
    line('--_segmented-button-unselected-focus-label-color', get(`${root}.unselectedFocusLabelTextColor`)),
    line('--_segmented-button-unselected-pressed-label-color', get(`${root}.unselectedPressedLabelTextColor`)),
    line('--_segmented-button-unselected-icon-color', get(`${root}.unselectedIconColor`)),
    line('--_segmented-button-unselected-hover-icon-color', get(`${root}.unselectedHoverIconColor`)),
    line('--_segmented-button-unselected-focus-icon-color', get(`${root}.unselectedFocusIconColor`)),
    line('--_segmented-button-unselected-pressed-icon-color', get(`${root}.unselectedPressedIconColor`)),
    line(
      '--_segmented-button-disabled-label-color',
      withOpacity(get(`${root}.disabledLabelTextColor`), get(`${root}.disabledLabelTextOpacity`)),
    ),
    line(
      '--_segmented-button-disabled-icon-color',
      withOpacity(get(`${root}.disabledIconColor`), get(`${root}.disabledIconOpacity`)),
    ),
    line('--_segmented-button-icon-size', get(`${root}.iconSize`)),
    line('--_segmented-button-content-motion-duration', get('motion.spring.fastSpatial.duration')),
    line('--_segmented-button-content-motion-easing', get('motion.spring.fastSpatial.easing')),
    line('--_segmented-button-icon-motion-duration', get('motion.spring.defaultEffects.duration')),
    line('--_segmented-button-icon-motion-easing', get('motion.spring.defaultEffects.easing')),
    line('--_segmented-button-font-family', `var(--font-family-${get(`typography.${typographyRole}.fontFamily`)})`),
    line('--_segmented-button-font-size', get(`typography.${typographyRole}.fontSize`)),
    line('--_segmented-button-line-height', get(`typography.${typographyRole}.lineHeight`)),
    line('--_segmented-button-font-weight', get(`typography.${typographyRole}.fontWeight`)),
    line('--_segmented-button-letter-spacing', get(`typography.${typographyRole}.letterSpacing`)),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('segmented-button', createSegmentedButtonCss);
