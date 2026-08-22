export type MaterialInteraction = 'focus' | 'hover' | 'press';
export type MaterialStateLayerInteraction = 'focus' | 'hover';

/**
 * Mirrors Compose's active Interaction ordering without cloning InteractionSource.
 * RAC/native events remain the source of truth; this helper only tracks which
 * concurrently-active Material interaction started most recently.
 */
export function startInteraction(
  active: readonly MaterialInteraction[],
  interaction: MaterialInteraction,
): MaterialInteraction[] {
  return [...active.filter((item) => item !== interaction), interaction];
}

export function endInteraction(
  active: readonly MaterialInteraction[],
  interaction: MaterialInteraction,
): MaterialInteraction[] {
  return active.filter((item) => item !== interaction);
}

export function latestInteraction(
  active: readonly MaterialInteraction[],
): MaterialInteraction | null {
  return active.at(-1) ?? null;
}

export function latestStateLayerInteraction(
  active: readonly MaterialInteraction[],
  isFocusVisible: boolean,
): MaterialStateLayerInteraction | null {
  for (let index = active.length - 1; index >= 0; index -= 1) {
    const interaction = active[index];
    if (interaction === 'hover') return 'hover';
    if (interaction === 'focus' && isFocusVisible) return 'focus';
  }
  return null;
}
