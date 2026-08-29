import {
  DragToResizeValue,
  type DragToResizeState,
} from '../../adaptive/dragToResizeState';

export interface DragToResizeHandleAriaStrings {
  expandedState: string;
  collapsedState: string;
  partiallyExpandedState: string;
  expandAction: string;
  collapseAction: string;
  partiallyExpandAction: string;
  describe(stateDescription: string, actionDescription: string): string;
}

/** Pinned English defaults from AndroidX adaptive-layout strings.xml. */
export const defaultDragToResizeHandleAriaStrings: DragToResizeHandleAriaStrings =
  Object.freeze({
    expandedState: 'expanded',
    collapsedState: 'collapsed',
    partiallyExpandedState: 'partially expanded',
    expandAction: 'expand',
    collapseAction: 'collapse',
    partiallyExpandAction: 'partially expand',
    describe: (stateDescription: string, actionDescription: string) =>
      `${stateDescription}. ${actionDescription}`,
  });

function stateDescription(
  value: DragToResizeValue,
  strings: DragToResizeHandleAriaStrings,
) {
  if (value === DragToResizeValue.Expanded) return strings.expandedState;
  if (value === DragToResizeValue.Collapsed) return strings.collapsedState;
  return strings.partiallyExpandedState;
}

function actionDescription(
  value: DragToResizeValue,
  strings: DragToResizeHandleAriaStrings,
) {
  if (value === DragToResizeValue.Expanded) return strings.expandAction;
  if (value === DragToResizeValue.Collapsed) return strings.collapseAction;
  return strings.partiallyExpandAction;
}

export function getDragToResizeHandleAriaState(
  state: DragToResizeState,
  overrides: Partial<DragToResizeHandleAriaStrings> = {},
) {
  const strings: DragToResizeHandleAriaStrings = {
    ...defaultDragToResizeHandleAriaStrings,
    ...overrides,
  };
  const current = stateDescription(state.value, strings);
  const next = actionDescription(state.nextValue, strings);
  return {
    stateDescription: current,
    actionDescription: next,
    description: strings.describe(current, next),
  };
}
