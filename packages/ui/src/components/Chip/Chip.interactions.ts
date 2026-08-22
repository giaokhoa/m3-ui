import type { RippleStateInteraction } from '../../internal/ripple';

export type ChipInteraction = 'focus' | 'hover' | 'press';

export function startChipInteraction(
  active: readonly ChipInteraction[],
  interaction: ChipInteraction,
): ChipInteraction[] {
  return [...active.filter((item) => item !== interaction), interaction];
}

export function endChipInteraction(
  active: readonly ChipInteraction[],
  interaction: ChipInteraction,
): ChipInteraction[] {
  return active.filter((item) => item !== interaction);
}

export function latestChipInteraction(
  active: readonly ChipInteraction[],
): ChipInteraction | null {
  return active.at(-1) ?? null;
}

export function latestChipStateLayerInteraction(
  active: readonly ChipInteraction[],
  isFocusVisible: boolean,
): RippleStateInteraction | null {
  for (let index = active.length - 1; index >= 0; index -= 1) {
    const interaction = active[index];
    if (interaction === 'hover') return 'hover';
    if (interaction === 'focus' && isFocusVisible) return 'focus';
  }
  return null;
}
