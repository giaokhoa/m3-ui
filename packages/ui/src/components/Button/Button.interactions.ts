export type ButtonInteraction = 'focus' | 'hover' | 'press';

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
