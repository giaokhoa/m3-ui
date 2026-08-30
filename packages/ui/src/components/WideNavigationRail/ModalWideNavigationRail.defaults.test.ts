import * as token from '@m3-ui/tokens';
import { describe, expect, it } from 'vitest';
import {
  calculateModalWideNavigationRailFraction,
  getModalWideNavigationRailStyle,
  modalWideNavigationRailRuntime,
  modalWideNavigationRailTokens,
  shouldDismissModalWideNavigationRail,
} from './ModalWideNavigationRail.defaults';

describe('ModalWideNavigationRail defaults', () => {
  it('projects the canonical expanded modal surface and shared scrim tokens', () => {
    expect(modalWideNavigationRailTokens).toEqual({
      modalContainerColor:
        token.ComponentNavigationRailExpandedModalContainerColor,
      modalContainerElevation:
        token.ComponentNavigationRailExpandedModalContainerElevation,
      modalContainerShape:
        token.ComponentNavigationRailExpandedModalContainerShape,
      scrimColor: token.ScrimContainerColor,
      scrimOpacity: token.ScrimContainerOpacity,
    });
  });

  it('renders the modal rail at Level2 and the large container shape', () => {
    const style = getModalWideNavigationRailStyle();
    expect(style).toMatchObject({
      '--_modal-wide-navigation-rail-container-color':
        token.ComponentNavigationRailExpandedModalContainerColor,
      '--_modal-wide-navigation-rail-content-color': token.ColorRoleOnSurface,
      '--_modal-wide-navigation-rail-radius': token.ShapeCornerLarge,
    });
    expect(modalWideNavigationRailTokens.modalContainerElevation).toBe('level2');
  });

  it('keeps AndroidX modal motion partitions beside the renderer', () => {
    expect(modalWideNavigationRailRuntime).toMatchObject({
      positionalThreshold: 0.5,
      activationThreshold: 0.3,
      motion: {
        expandWidth: {
          duration: token.MotionSpringFastSpatialDuration,
          easing: token.MotionSpringFastSpatialEasing,
        },
        slide: {
          duration: token.MotionSpringDefaultSpatialDuration,
          easing: token.MotionSpringDefaultSpatialEasing,
        },
        effects: {
          duration: token.MotionSpringDefaultEffectsDuration,
          easing: token.MotionSpringDefaultEffectsEasing,
        },
      },
    });
  });

  it('resolves standalone drag progress and the 50 percent settle threshold', () => {
    expect(calculateModalWideNavigationRailFraction(0, 320)).toBe(1);
    expect(calculateModalWideNavigationRailFraction(-80, 320)).toBe(0.75);
    expect(calculateModalWideNavigationRailFraction(-320, 320)).toBe(0);
    expect(shouldDismissModalWideNavigationRail(-159, 320)).toBe(false);
    expect(shouldDismissModalWideNavigationRail(-160, 320)).toBe(true);
  });

  it('supports local modal surface overrides without touching canonical tokens', () => {
    expect(
      getModalWideNavigationRailStyle({
        modalContainerColor: 'tomato',
        modalContentColor: 'white',
        modalShape: '12px',
      }),
    ).toMatchObject({
      '--_modal-wide-navigation-rail-container-color': 'tomato',
      '--_modal-wide-navigation-rail-content-color': 'white',
      '--_modal-wide-navigation-rail-radius': '12px',
    });
  });
});
