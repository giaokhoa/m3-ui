import { describe, expect, it } from 'vitest';
import {
  endButtonInteraction,
  latestButtonInteraction,
  startButtonInteraction,
  type ButtonInteraction,
} from './Button.interactions';

function sequence(
  steps: readonly [ButtonInteraction, 'end' | 'start'][],
): ButtonInteraction[] {
  return steps.reduce<ButtonInteraction[]>((active, [interaction, action]) => {
    return action === 'start'
      ? startButtonInteraction(active, interaction)
      : endButtonInteraction(active, interaction);
  }, []);
}

describe('Button interaction ordering', () => {
  it('lets focus win when it starts after hover', () => {
    const active = sequence([
      ['hover', 'start'],
      ['focus', 'start'],
    ]);
    expect(latestButtonInteraction(active)).toBe('focus');
  });

  it('lets hover win when it starts after focus', () => {
    const active = sequence([
      ['focus', 'start'],
      ['hover', 'start'],
    ]);
    expect(latestButtonInteraction(active)).toBe('hover');
  });

  it('returns to hover after a press is released', () => {
    const active = sequence([
      ['hover', 'start'],
      ['press', 'start'],
      ['press', 'end'],
    ]);
    expect(latestButtonInteraction(active)).toBe('hover');
  });

  it('returns to focus when a later hover ends', () => {
    const active = sequence([
      ['focus', 'start'],
      ['hover', 'start'],
      ['hover', 'end'],
    ]);
    expect(latestButtonInteraction(active)).toBe('focus');
  });

  it('moves a restarted interaction to the end', () => {
    const active = sequence([
      ['hover', 'start'],
      ['focus', 'start'],
      ['hover', 'start'],
    ]);
    expect(active).toEqual(['focus', 'hover']);
  });
});
