export type FabSize = 'small' | 'baseline' | 'medium' | 'large';

export type ExtendedFabSize = 'baseline' | 'small' | 'medium' | 'large';

export type FabElevation = 'default' | 'lowered';

/**
 * `*Container` variants preserve the generated Compose container-role families.
 * `surface` / `primary` / `secondary` / `tertiary` preserve the pinned Material
 * Web public FAB variant vocabulary, where the solid variants use base color roles.
 */
export type FabVariant =
  | 'primaryContainer'
  | 'secondaryContainer'
  | 'tertiaryContainer'
  | 'surface'
  | 'primary'
  | 'secondary'
  | 'tertiary';
