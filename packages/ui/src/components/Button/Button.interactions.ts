export type ButtonInteraction = 'focus' | 'hover' | 'press';
export type ButtonStateLayerInteraction = 'focus' | 'hover';

export function startButtonInteraction(
  active: readonly ButtonInteraction[],
  interaction: ButtonInteraction,
): ButtonInteraction[] {
  return [...active.filter((item) => item !== interaction), interaction];
}

export function endButtonInteraction(
  active: readonly ButtonInteraction[],
  interaction: ButtonInteraction,
): ButtonInteraction[] {
  return active.filter((item) => item !== interaction);
}

export function latestButtonInteraction(
  active: readonly ButtonInteraction[],
): ButtonInteraction | null {
  return active.at(-1) ?? null;
}

export function latestButtonStateLayerInteraction(
  active: readonly ButtonInteraction[],
  isFocusVisible: boolean,
): ButtonStateLayerInteraction | null {
  for (let index = active.length - 1; index >= 0; index -= 1) {
    const interaction = active[index];
    if (interaction === 'hover') {
      return 'hover';
    }
    if (interaction === 'focus' && isFocusVisible) {
      return 'focus';
    }
  }

  return null;
}
