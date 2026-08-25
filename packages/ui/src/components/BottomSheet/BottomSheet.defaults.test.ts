import * as token from '@m3/tokens';
import { describe, expect, it } from 'vitest';
import {
  bottomSheetRuntime,
  bottomSheetTokens,
  getBottomSheetStyle,
} from './BottomSheet.defaults';

describe('BottomSheet defaults', () => {
  it('projects the canonical Material 3 bottom sheet token family', () => {
    expect(bottomSheetTokens).toEqual({
      containerColor: token.ComponentSheetBottomDockedContainerColor,
      containerShape: token.ComponentSheetBottomDockedContainerShape,
      dragHandleColor: token.ComponentSheetBottomDockedDragHandleColor,
      dragHandleHeight: token.ComponentSheetBottomDockedDragHandleHeight,
      dragHandleWidth: token.ComponentSheetBottomDockedDragHandleWidth,
      minimizedContainerShape:
        token.ComponentSheetBottomDockedMinimizedContainerShape,
      modalContainerElevation:
        token.ComponentSheetBottomDockedModalContainerElevation,
      standardContainerElevation:
        token.ComponentSheetBottomDockedStandardContainerElevation,
      focusIndicatorColor: token.ComponentSheetBottomFocusIndicatorColor,
    });
  });

  it('keeps AndroidX geometry, gesture thresholds and motion beside the renderer', () => {
    expect(bottomSheetRuntime).toEqual({
      maximumWidth: 640,
      dragHandleVerticalPadding: 22,
      positionalThreshold: 56,
      velocityThreshold: 125,
      boundaryDampeningZone: 125,
      motion: {
        show: {
          duration: token.MotionSpringDefaultSpatialDuration,
          easing: token.MotionSpringDefaultSpatialEasing,
        },
        settle: {
          duration: token.MotionSpringDefaultSpatialDuration,
          easing: token.MotionSpringDefaultSpatialEasing,
        },
        hide: {
          duration: token.MotionSpringFastEffectsDuration,
          easing: token.MotionSpringFastEffectsEasing,
        },
      },
    });
  });

  it('emits canonical surface, handle and top-only shape variables', () => {
    expect(getBottomSheetStyle()).toMatchObject({
      '--_bottom-sheet-container-color':
        token.ComponentSheetBottomDockedContainerColor,
      '--_bottom-sheet-content-color': token.ColorRoleOnSurface,
      '--_bottom-sheet-radius-top-start':
        token.ShapeCornerExtraLargeTopTopStart,
      '--_bottom-sheet-radius-top-end':
        token.ShapeCornerExtraLargeTopTopEnd,
      '--_bottom-sheet-radius-bottom-end':
        token.ShapeCornerExtraLargeTopBottomEnd,
      '--_bottom-sheet-radius-bottom-start':
        token.ShapeCornerExtraLargeTopBottomStart,
      '--_bottom-sheet-drag-handle-color':
        token.ComponentSheetBottomDockedDragHandleColor,
      '--_bottom-sheet-drag-handle-width':
        token.ComponentSheetBottomDockedDragHandleWidth,
      '--_bottom-sheet-drag-handle-height':
        token.ComponentSheetBottomDockedDragHandleHeight,
      '--_bottom-sheet-drag-handle-padding-block': '22px',
      '--_bottom-sheet-focus-indicator-color':
        token.ComponentSheetBottomFocusIndicatorColor,
      '--_bottom-sheet-max-width': '640px',
    });
  });

  it('keeps public visual overrides local', () => {
    expect(
      getBottomSheetStyle({
        containerColor: 'rebeccapurple',
        contentColor: 'white',
        dragHandleColor: 'gold',
        focusIndicatorColor: 'cyan',
        maxWidth: 720,
      }),
    ).toMatchObject({
      '--_bottom-sheet-container-color': 'rebeccapurple',
      '--_bottom-sheet-content-color': 'white',
      '--_bottom-sheet-drag-handle-color': 'gold',
      '--_bottom-sheet-focus-indicator-color': 'cyan',
      '--_bottom-sheet-max-width': '720px',
    });
  });
});
