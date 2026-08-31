/** Object-form browser analogue of an AndroidX PaneScaffoldRole implementation. */
export type PaneScaffoldRoleObject = object;

/**
 * Browser analogue of AndroidX PaneScaffoldRole.
 *
 * AndroidX defines this as a marker interface. JavaScript has no nominal
 * interface implementation boundary, so custom object/string role values are
 * accepted without inventing a registration, branding, or required shape.
 */
export type PaneScaffoldRole = string | PaneScaffoldRoleObject;

interface PaneScaffoldRoleWithEquality {
  equals?(other: PaneScaffoldRole): boolean;
}

/** Mirrors Kotlin `PaneScaffoldRole == other` while defaulting to JS identity. */
export function paneScaffoldRolesEqual(a: PaneScaffoldRole, b: PaneScaffoldRole): boolean {
  if (a === b) return true;
  if (typeof a === 'string' || typeof b === 'string') return false;
  const equals = (a as PaneScaffoldRoleWithEquality).equals;
  return typeof equals === 'function' && equals.call(a, b) === true;
}
