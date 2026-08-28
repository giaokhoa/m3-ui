import type {
  PaneExpansionAnchor,
  PaneExpansionState,
} from '../../adaptive/paneExpansionState';

export interface PaneExpansionHandleAriaStrings {
  proportionAnchor(percent: number): string;
  startOffsetAnchor(offset: number): string;
  endOffsetAnchor(offset: number): string;
  currentSplit(anchorDescription: string): string;
  changeSplit(anchorDescription: string): string;
}

/**
 * Pinned English defaults from AndroidX adaptive-layout strings.xml.
 * Applications can override any formatter through ThreePaneScaffold.
 */
export const defaultPaneExpansionHandleAriaStrings: PaneExpansionHandleAriaStrings =
  Object.freeze({
    proportionAnchor: (percent: number) => `${percent} percent`,
    startOffsetAnchor: (offset: number) => `${offset} DPs from start`,
    endOffsetAnchor: (offset: number) => `${offset} DPs from end`,
    currentSplit: (anchorDescription: string) => `Current pane split, ${anchorDescription}`,
    changeSplit: (anchorDescription: string) => `Change pane split to ${anchorDescription}`,
  });

export function describePaneExpansionAnchor(
  anchor: PaneExpansionAnchor,
  strings: PaneExpansionHandleAriaStrings = defaultPaneExpansionHandleAriaStrings,
): string {
  if (anchor.type === 'proportion') {
    return strings.proportionAnchor(Math.trunc(anchor.proportion * 100));
  }
  const offset = Math.trunc(anchor.offset);
  return anchor.direction === 'start'
    ? strings.startOffsetAnchor(offset)
    : strings.endOffsetAnchor(offset);
}

export function getPaneExpansionHandleAriaState(
  state: PaneExpansionState,
  overrides: Partial<PaneExpansionHandleAriaStrings> = {},
) {
  const strings: PaneExpansionHandleAriaStrings = {
    ...defaultPaneExpansionHandleAriaStrings,
    ...overrides,
  };
  const currentAnchor = state.currentAnchor;
  const nextAnchor = state.nextAnchor;

  return {
    valueText:
      currentAnchor === null
        ? undefined
        : strings.currentSplit(describePaneExpansionAnchor(currentAnchor, strings)),
    description:
      nextAnchor === null
        ? undefined
        : strings.changeSplit(describePaneExpansionAnchor(nextAnchor, strings)),
    nextAnchor,
  };
}
