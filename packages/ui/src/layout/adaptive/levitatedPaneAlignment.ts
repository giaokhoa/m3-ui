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
 */
export interface LevitatedPaneCustomAlignment {
  align(
    paneSize: Readonly<LevitatedPaneSize>,
    scaffoldSize: Readonly<LevitatedPaneSize>,
    direction: 'ltr' | 'rtl',
  ): LevitatedPaneOffset;
}
