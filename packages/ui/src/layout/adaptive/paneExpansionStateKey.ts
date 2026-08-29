import {
  getPaneAdaptedValue,
  ThreePaneScaffoldRole,
  type ThreePaneScaffoldValue,
} from './threePaneScaffold';

export type PaneExpansionStateKey =
  | { readonly type: 'default' }
  | {
      readonly type: 'two-pane';
      readonly firstExpandedPane: ThreePaneScaffoldRole;
      readonly secondExpandedPane: ThreePaneScaffoldRole;
    };

const defaultPaneExpansionStateKey = Object.freeze({ type: 'default' } as const);

export const PaneExpansionStateKey = Object.freeze({
  /** Share one pane-expansion state regardless of the current scaffold pane pair. */
  Default: defaultPaneExpansionStateKey,
});

export interface PaneExpansionStateKeyProvider {
  readonly paneExpansionStateKey: PaneExpansionStateKey;
}

const rolesByPriority = [
  ThreePaneScaffoldRole.Primary,
  ThreePaneScaffoldRole.Secondary,
  ThreePaneScaffoldRole.Tertiary,
] as const;

/**
 * Browser equivalent of ThreePaneScaffoldValue.paneExpansionStateKey.
 * Exactly two expanded panes get their own ordered pair key; all other layouts
 * use PaneExpansionStateKey.Default.
 */
export function getPaneExpansionStateKey(
  value: ThreePaneScaffoldValue,
): PaneExpansionStateKey {
  const expandedRoles = rolesByPriority.filter(
    (role) => getPaneAdaptedValue(value, role).type === 'expanded',
  );
  if (expandedRoles.length !== 2) return PaneExpansionStateKey.Default;
  return Object.freeze({
    type: 'two-pane',
    firstExpandedPane: expandedRoles[0]!,
    secondExpandedPane: expandedRoles[1]!,
  });
}

export function paneExpansionStateKeyEquals(
  a: PaneExpansionStateKey,
  b: PaneExpansionStateKey,
): boolean {
  if (a === b) return true;
  if (a.type !== b.type) return false;
  if (a.type === 'default' || b.type === 'default') return true;
  return (
    a.firstExpandedPane === b.firstExpandedPane &&
    a.secondExpandedPane === b.secondExpandedPane
  );
}
