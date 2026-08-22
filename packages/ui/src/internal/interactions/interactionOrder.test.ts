import { describe, expect, it } from 'vitest';
import {
  endInteraction,
  latestInteraction,
  latestStateLayerInteraction,
  startInteraction,
  type MaterialInteraction,
} from './interactionOrder';

function sequence(
  steps: readonly [MaterialInteraction, 'end' | 'start'][],
): MaterialInteraction[] {
  return steps.reduce<MaterialInteraction[]>((active, [interaction, action]) => {
    return action === 'start'
      ? startInteraction(active, interaction)
      : endInteraction(active, interaction);
  }, []);
}

describe('Material interaction ordering', () => {
  it('uses the latest-started active interaction', () => {
    const active = sequence([
      ['hover', 'start'],
      ['focus', 'start'],
      ['press', 'start'],
    ]);
    expect(latestInteraction(active)).toBe('press');
    expect(latestStateLayerInteraction(active, true)).toBe('focus');
  });

  it('falls back to the previous active interaction on end', () => {
    const active = sequence([
      ['focus', 'start'],
      ['hover', 'start'],
      ['hover', 'end'],
    ]);
    expect(latestInteraction(active)).toBe('focus');
  });

  it('moves a restarted interaction to the end', () => {
    const active = sequence([
      ['hover', 'start'],
      ['focus', 'start'],
      ['hover', 'start'],
    ]);
    expect(active).toEqual(['focus', 'hover']);
  });

  it('suppresses pointer-only focus from the state layer', () => {
    const active = sequence([['focus', 'start']]);
    expect(latestStateLayerInteraction(active, false)).toBeNull();
  });
});
