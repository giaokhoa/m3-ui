import { cssValue, defineCssAdapter, tokenReader } from '../adapter-helpers.mjs';

export function createBottomSheetCss(context) {
  const get = tokenReader(context, 'BottomSheet CSS');
  const line = (name, value) => `  ${name}: ${cssValue(value)};`;

  return [
    '.bottom-sheet {',
    line('--_bottom-sheet-container-color', get('component.sheetBottom.dockedContainerColor')),
    line('--_bottom-sheet-content-color', get('color.role.onSurface')),
    line('--_bottom-sheet-radius-top-start', get('shape.corner.extraLargeTop.topStart')),
    line('--_bottom-sheet-radius-top-end', get('shape.corner.extraLargeTop.topEnd')),
    line('--_bottom-sheet-radius-bottom-end', get('shape.corner.extraLargeTop.bottomEnd')),
    line('--_bottom-sheet-radius-bottom-start', get('shape.corner.extraLargeTop.bottomStart')),
    line('--_bottom-sheet-drag-handle-color', get('component.sheetBottom.dockedDragHandleColor')),
    line('--_bottom-sheet-drag-handle-width', get('component.sheetBottom.dockedDragHandleWidth')),
    line('--_bottom-sheet-drag-handle-height', get('component.sheetBottom.dockedDragHandleHeight')),
    line('--_bottom-sheet-drag-handle-padding-block', '22px'),
    line('--_bottom-sheet-focus-indicator-color', get('component.sheetBottom.focusIndicatorColor')),
    line('--_bottom-sheet-focus-indicator-width', get('ripple.focusRing.outerStrokeWidth')),
    line('--_bottom-sheet-max-width', '640px'),
    line('--_bottom-sheet-show-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_bottom-sheet-show-easing', get('motion.spring.defaultSpatial.easing')),
    line('--_bottom-sheet-settle-duration', get('motion.spring.defaultSpatial.duration')),
    line('--_bottom-sheet-settle-easing', get('motion.spring.defaultSpatial.easing')),
    line('--_bottom-sheet-hide-duration', get('motion.spring.fastEffects.duration')),
    line('--_bottom-sheet-hide-easing', get('motion.spring.fastEffects.easing')),
    '}',
    '',
    '.modal-bottom-sheet-overlay {',
    line('--_scrim-container-color', get('scrim.containerColor')),
    line('--_scrim-container-opacity', get('scrim.containerOpacity')),
    line('--_scrim-alpha', 1),
    line('--_modal-bottom-sheet-scrim-duration', get('motion.spring.defaultEffects.duration')),
    line('--_modal-bottom-sheet-scrim-easing', get('motion.spring.defaultEffects.easing')),
    '}',
    '',
  ].join('\n');
}

export default defineCssAdapter('bottom-sheet', createBottomSheetCss);
