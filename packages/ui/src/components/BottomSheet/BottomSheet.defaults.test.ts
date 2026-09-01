import { describe, expect, it } from 'vitest';
import {
  bottomSheetRuntime,
  getBottomSheetElevationLevel,
  getBottomSheetStyle,
  getModalBottomSheetOverlayStyle,
} from './BottomSheet.defaults';

describe('BottomSheet runtime boundary', () => {
  it('keeps gesture mechanics in TS and visual defaults in generated CSS', () => {
    expect(getBottomSheetStyle()).toEqual({});
    expect(bottomSheetRuntime.positionalThreshold).toBe(56);
    expect(bottomSheetRuntime.velocityThreshold).toBe(125);
    expect(getBottomSheetElevationLevel('modal')).toBe('level1');
  });

  it('projects only caller overrides and animated scrim alpha', () => {
    expect(getBottomSheetStyle({ maxWidth: 480, dragHandleColor: 'gold' })).toEqual({
      '--_bottom-sheet-drag-handle-color': 'gold',
      '--_bottom-sheet-max-width': '480px',
    });
    expect(getModalBottomSheetOverlayStyle({ scrimAlpha: 0.25 })).toEqual({
      '--_scrim-alpha': 0.25,
    });
  });
});
