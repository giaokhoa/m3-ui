/**
 * Browser analogue of AndroidX PaneScaffoldRole.
 *
 * AndroidX defines this as a marker interface. JavaScript has no nominal
 * interface implementation boundary, so custom object/string role values are
 * accepted without inventing a registration or branding requirement.
 */
export type PaneScaffoldRole = string | object;
