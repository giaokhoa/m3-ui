import { checkboxTokens } from '@m3/tokens/checkbox';
import { describe, expect, it } from 'vitest';
import { checkboxBaseStyle } from './Checkbox.defaults';

describe('Checkbox parity', () => {
  it('matches the corrected current Material 3 geometry', () => {
    expect(checkboxTokens).toMatchObject({
      containerSize: 18,
      containerRadius: 2,
      stateLayerSize: 40,
      minimumInteractiveSize: 48,
      strokeWidth: 2,
    });

    expect(checkboxTokens.checkPath).toEqual({
      leftX: 0.25,
      leftY: 0.5,
      crossX: 0.4,
      crossY: 0.65,
      rightX: 0.75,
      rightY: 0.3,
    });
  });

  it('matches current Material 3 color roles and disabled opacity', () => {
    expect(checkboxTokens).toMatchObject({
      selectedContainerColor: 'primary',
      selectedIconColor: 'onPrimary',
      unselectedOutlineColor: 'onSurfaceVariant',
      selectedDisabledContainerColor: 'onSurface',
      selectedDisabledContainerOpacity: 0.38,
      selectedDisabledIconColor: 'surface',
      unselectedDisabledOutlineColor: 'onSurface',
      unselectedDisabledOutlineOpacity: 0.38,
    });
  });

  it('maps current AndroidX standard springs and unchecked snap delay', () => {
    expect(checkboxTokens.motion.defaultEffects.durationMs).toBe(166);
    expect(checkboxTokens.motion.fastEffects.durationMs).toBe(108);
    expect(checkboxTokens.motion.defaultSpatial.durationMs).toBe(194);
    expect(checkboxTokens.motion.snapDelayMs).toBe(100);
  });

  it('maps roles through ThemeProvider variables without fixed colors', () => {
    expect(checkboxBaseStyle).toMatchObject({
      '--_checkbox-container-size': '18px',
      '--_checkbox-state-layer-size': '40px',
      '--_checkbox-interactive-size': '48px',
      '--_checkbox-selected-container': 'var(--primary)',
      '--_checkbox-selected-icon': 'var(--on-primary)',
      '--_checkbox-unselected-outline': 'var(--on-surface-variant)',
    });
    expect(JSON.stringify(checkboxBaseStyle)).not.toMatch(/#[0-9a-f]{3,8}/i);
  });
});
