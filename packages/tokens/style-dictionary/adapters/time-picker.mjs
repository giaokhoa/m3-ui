import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createTimePickerCss(context) {
  const get = tokenReader(context, 'TimePicker CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const typography = (prefix, role) => [
    line(`--_tp-${prefix}-font-family`, `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line(`--_tp-${prefix}-font-size`, get(`typography.${role}.fontSize`)),
    line(`--_tp-${prefix}-line-height`, get(`typography.${role}.lineHeight`)),
    line(`--_tp-${prefix}-font-weight`, get(`typography.${role}.fontWeight`)),
    line(`--_tp-${prefix}-letter-spacing`, get(`typography.${role}.letterSpacing`)),
  ];
  const shape = (role) => get(`shape.${role}`);
  const picker = 'component.timePicker';
  const input = 'component.timeInput';

  const dialTypography = get(`${picker}.clockDialLabelTextFont`);
  const selectorTypography = get(`${picker}.timeSelectorLabelTextFont`);
  const periodTypography = get(`${picker}.periodSelectorLabelTextFont`);
  const inputTypography = get(`${input}.timeFieldLabelTextFont`);

  return [
    '.time-picker,',
    '.time-input {',
    line('--_tp-dial-size', get(`${picker}.clockDialContainerSize`)),
    line('--_tp-dial-color', get(`${picker}.clockDialColor`)),
    line('--_tp-dial-label-color', get(`${picker}.clockDialUnselectedLabelTextColor`)),
    line('--_tp-dial-selected-label-color', get(`${picker}.clockDialSelectedLabelTextColor`)),
    ...typography('dial-label', dialTypography),
    line('--_tp-selector-color', get(`${picker}.clockDialSelectorHandleContainerColor`)),
    line('--_tp-selector-size', get(`${picker}.clockDialSelectorHandleContainerSize`)),
    line('--_tp-selector-track-width', get(`${picker}.clockDialSelectorTrackContainerWidth`)),
    line('--_tp-selector-center-size', get(`${picker}.clockDialSelectorCenterContainerSize`)),
    line('--_tp-time-selector-width', get(`${picker}.timeSelectorContainerWidth`)),
    line('--_tp-time-selector-24-width', get(`${picker}.timeSelector24HVerticalContainerWidth`)),
    line('--_tp-time-selector-height', get(`${picker}.timeSelectorContainerHeight`)),
    line('--_tp-time-selector-selected', get(`${picker}.timeSelectorSelectedContainerColor`)),
    line('--_tp-time-selector-selected-text', get(`${picker}.timeSelectorSelectedLabelTextColor`)),
    line('--_tp-time-selector', get(`${picker}.timeSelectorUnselectedContainerColor`)),
    line('--_tp-time-selector-text', get(`${picker}.timeSelectorUnselectedLabelTextColor`)),
    ...typography('time-selector', selectorTypography),
    line('--_tp-period-v-width', get(`${picker}.periodSelectorVerticalContainerWidth`)),
    line('--_tp-period-v-height', get(`${picker}.periodSelectorVerticalContainerHeight`)),
    line('--_tp-period-h-width', get(`${picker}.periodSelectorHorizontalContainerWidth`)),
    line('--_tp-period-h-height', get(`${picker}.periodSelectorHorizontalContainerHeight`)),
    line('--_tp-period-outline', get(`${picker}.periodSelectorOutlineColor`)),
    line('--_tp-period-selected', get(`${picker}.periodSelectorSelectedContainerColor`)),
    line('--_tp-period-selected-text', get(`${picker}.periodSelectorSelectedLabelTextColor`)),
    line('--_tp-period-text', get(`${picker}.periodSelectorUnselectedLabelTextColor`)),
    ...typography('period', periodTypography),
    line('--_tp-input-width', get(`${input}.timeFieldContainerWidth`)),
    line('--_tp-input-height', get(`${input}.timeFieldContainerHeight`)),
    line('--_tp-input-period-width', get(`${input}.periodSelectorContainerWidth`)),
    line('--_tp-input-period-height', get(`${input}.periodSelectorContainerHeight`)),
    line('--_tp-input-color', get(`${input}.timeFieldContainerColor`)),
    line('--_tp-input-focus-color', get(`${input}.timeFieldFocusContainerColor`)),
    line('--_tp-input-text', get(`${input}.timeFieldLabelTextColor`)),
    line('--_tp-input-focus-text', get(`${input}.timeFieldFocusLabelTextColor`)),
    line('--_tp-input-focus-outline', get(`${input}.timeFieldFocusOutlineColor`)),
    line('--_tp-input-focus-outline-width', get(`${input}.timeFieldFocusOutlineWidth`)),
    ...typography('input', inputTypography),
    line('--_tp-separator', get(`${input}.timeFieldSeparatorColor`)),
    line('--_tp-standard-field-shape', shape('small')),
    line('--_tp-standard-period-shape', shape('small')),
    line('--_tp-vibrant-field-shape', shape('large')),
    line('--_tp-vibrant-period-shape', shape('full')),
    line('--_tp-spatial-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_tp-spatial-easing', get('motion.spring.defaultSpatial.easing')),
    line('--_tp-effects-duration', get('motion.spring.defaultEffects.duration')),
    line('--_tp-effects-easing', get('motion.spring.defaultEffects.easing')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('time-picker', createTimePickerCss);
