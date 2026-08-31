/** Object-form browser analogue of an AndroidX PaneScaffoldRole implementation. */
export interface PaneScaffoldRoleObject {
  /** Optional Kotlin-style value equality for custom role implementations. */
  equals?(other: PaneScaffoldRole): boolean;
}

/**
 * Browser analogue of AndroidX PaneScaffoldRole.
 *
 * AndroidX defines this as a marker interface. JavaScript has no nominal
 * interface implementation boundary, so custom object/string role values are
 * accepted without inventing a registration or branding requirement.
 */
export type PaneScaffoldRole = string | PaneScaffoldRoleObject;

/** Mirrors Kotlin `PaneScaffoldRole == other` while defaulting to JS identity. */
export function paneScaffoldRolesEqual(a: PaneScaffoldRole, b: PaneScaffoldRole): boolean {
  if (a === b) return true;
  if (typeof a === 'string' || typeof b === 'string') return false;
  return a.equals?.(b) === true;
}
