export type CardInteraction = 'focus' | 'hover' | 'press';

export function startCardInteraction(
  interactions: readonly CardInteraction[],
  interaction: CardInteraction,
): CardInteraction[] {
  return [...interactions.filter((item) => item !== interaction), interaction];
}

export function endCardInteraction(
  interactions: readonly CardInteraction[],
  interaction: CardInteraction,
): CardInteraction[] {
  return interactions.filter((item) => item !== interaction);
}

export function latestCardInteraction(
  interactions: readonly CardInteraction[],
): CardInteraction | null {
  return interactions.at(-1) ?? null;
}

export function latestCardStateLayerInteraction(
  interactions: readonly CardInteraction[],
  isFocusVisible: boolean,
): 'focus' | 'hover' | null {
  for (let index = interactions.length - 1; index >= 0; index -= 1) {
    const interaction = interactions[index];
    if (interaction === 'hover') return 'hover';
    if (interaction === 'focus' && isFocusVisible) return 'focus';
  }
  return null;
}
