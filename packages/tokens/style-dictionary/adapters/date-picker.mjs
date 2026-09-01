import {
  cssValue,
  defineCssAdapter,
  tokenReader,
} from '../adapter-helpers.mjs';

export function createDatePickerCss(context) {
  const get = tokenReader(context, 'DatePicker CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;
  const typography = (prefix, role) => [
    line(`--_${prefix}-font-family`, `var(--font-family-${get(`typography.${role}.fontFamily`)})`),
    line(`--_${prefix}-font-size`, get(`typography.${role}.fontSize`)),
    line(`--_${prefix}-line-height`, get(`typography.${role}.lineHeight`)),
    line(`--_${prefix}-font-weight`, get(`typography.${role}.fontWeight`)),
    line(`--_${prefix}-letter-spacing`, get(`typography.${role}.letterSpacing`)),
  ];
  const shape = (role) => get(`shape.${role}`);

  const modal = 'component.datePickerModal';
  const input = 'component.dateInputModal';
  const docked = 'component.datePickerDocked';

  return [
    '.date-picker {',
    // Pinned Compose renderer mechanics. They are immutable CSS defaults, not runtime state.
    line('--_date-picker-cell-size', '48px'),
    line('--_date-picker-horizontal-padding', '12px'),
    line('--_date-picker-month-year-height', '56px'),
    line('--_date-picker-mode-parallax', '48px'),
    line('--_date-picker-state-layer-size', get(`${modal}.dateContainerWidth`)),
    line('--_date-picker-input-radius', shape('extraSmall')),
    line('--_date-picker-selected-color', get(`${modal}.dateSelectedContainerColor`)),
    line('--_date-picker-selected-label-color', get(`${modal}.dateSelectedLabelTextColor`)),
    line('--_date-picker-today-color', get(`${modal}.dateTodayContainerOutlineColor`)),
    line('--_date-picker-today-outline-width', get(`${modal}.dateTodayContainerOutlineWidth`)),
    line('--_date-picker-range-color', get(`${modal}.rangeSelectionActiveIndicatorContainerColor`)),
    line('--_date-picker-range-label-color', get(`${modal}.selectionDateInRangeLabelTextColor`)),
    line('--_date-picker-divider-color', get('component.divider.color')),
    line('--_date-picker-divider-thickness', get('component.divider.thickness')),
    line('--_date-picker-spatial-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_date-picker-spatial-easing', get('motion.spring.defaultSpatial.easing')),
    line('--_date-picker-effects-in-duration', get('motion.spring.defaultEffects.duration')),
    line('--_date-picker-effects-in-easing', get('motion.spring.defaultEffects.easing')),
    line('--_date-picker-effects-out-duration', get('motion.spring.fastEffects.duration')),
    line('--_date-picker-effects-out-easing', get('motion.spring.fastEffects.easing')),
    ...typography('date-picker-label', get(`${modal}.headerSupportingTextFont`)),
    ...typography('date-picker-headline', get(`${modal}.headerHeadlineFont`)),
    ...typography('date-picker-range-headline', get(`${modal}.rangeSelectionHeaderHeadlineFont`)),
    ...typography('date-picker-docked-headline', 'titleMedium'),
    ...typography('date-picker-month', get(`${modal}.rangeSelectionMonthSubheadFont`)),
    ...typography('date-picker-body', get(`${modal}.dateLabelTextFont`)),
    ...typography('date-picker-supporting', 'bodySmall'),
    '}',
    '',
    ".date-picker[data-variant='modal'] {",
    line('--_date-picker-width', get(`${modal}.containerWidth`)),
    line('--_date-picker-height', get(`${modal}.containerHeight`)),
    line('--_date-picker-header-height', get(`${modal}.headerContainerHeight`)),
    line('--_date-picker-container-color', get(`${modal}.containerColor`)),
    line('--_date-picker-container-radius', shape(get(`${modal}.containerShape`))),
    '}',
    '',
    ".date-picker[data-variant='modal'].date-picker--range {",
    line('--_date-picker-header-height', get(`${modal}.rangeSelectionHeaderContainerHeight`)),
    '}',
    '',
    ".date-picker[data-variant='modal'][data-display-mode='input'] {",
    line('--_date-picker-width', get(`${input}.containerWidth`)),
    line('--_date-picker-height', get(`${input}.containerHeight`)),
    line('--_date-picker-header-height', get(`${input}.headerContainerHeight`)),
    line('--_date-picker-container-color', get(`${input}.webContainerColor`)),
    '}',
    '',
    ".date-picker[data-variant='docked'] {",
    line('--_date-picker-width', get(`${docked}.containerWidth`)),
    line('--_date-picker-height', get(`${docked}.containerHeight`)),
    line('--_date-picker-header-height', get(`${docked}.headerHeight`)),
    line('--_date-picker-state-layer-size', get(`${docked}.dateStateLayerWidth`)),
    line('--_date-picker-container-color', get(`${docked}.containerColor`)),
    line('--_date-picker-container-radius', shape(get(`${docked}.containerShape`))),
    line('--_date-picker-selected-color', get(`${docked}.dateSelectedContainerColor`)),
    line('--_date-picker-selected-label-color', get(`${docked}.dateSelectedLabelTextColor`)),
    line('--_date-picker-today-color', get(`${docked}.dateTodayContainerOutlineColor`)),
    line('--_date-picker-today-outline-width', get(`${docked}.dateTodayContainerOutlineWidth`)),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('date-picker', createDatePickerCss);
