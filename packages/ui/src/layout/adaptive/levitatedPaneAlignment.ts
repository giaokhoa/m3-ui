export interface LevitatedPaneSize {
  width: number;
  height: number;
}

export interface LevitatedPaneOffset {
  x: number;
  y: number;
}

/**
 * Browser analogue of Compose Alignment for levitated panes.
 *
 * AndroidX accepts any Alignment implementation, not only the built-in nine
 * presets. Custom web alignments receive the raw pane/scaffold sizes and layout
 * direction and return the scaffold-local offset used for placement.
 *
 * Compose equality dispatches to the Alignment implementation's equals method.
 * JavaScript objects use identity by default, so custom alignments may provide
 * an optional equality hook when they represent value-like alignment objects.
 */
export interface LevitatedPaneCustomAlignment {
  align(
    paneSize: Readonly<LevitatedPaneSize>,
    scaffoldSize: Readonly<LevitatedPaneSize>,
    direction: 'ltr' | 'rtl',
  ): LevitatedPaneOffset;
  equals?(other: LevitatedPaneCustomAlignment): boolean;
}

/** Mirrors `Alignment.equals` while retaining normal JS identity semantics by default. */
export function customLevitatedPaneAlignmentsEqual(
  a: LevitatedPaneCustomAlignment,
  b: LevitatedPaneCustomAlignment,
): boolean {
  if (a === b) return true;
  return a.equals?.(b) === true;
}
