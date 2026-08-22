import type { ElevationLevel } from './elevation.js';
import type { TypefaceRole } from './typography.js';

export type ChipColorRole =
  | 'onSecondaryContainer'
  | 'onSurface'
  | 'onSurfaceVariant'
  | 'outlineVariant'
  | 'primary'
  | 'secondaryContainer'
  | 'surfaceContainerLow';

export type ChipContainerColor = ChipColorRole | 'transparent';

export interface ChipTypographyTokens {
  readonly fontFamily: TypefaceRole;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: number;
  readonly letterSpacing: number;
}

export interface ActionChipVariantTokens {
  readonly height: number;
  readonly minimumInteractiveSize: number;
  readonly containerRadius: number;
  readonly contentPaddingInline: number;
  readonly iconSpacing: number;
  readonly iconSize: number;
  readonly containerColor: ChipContainerColor;
  readonly labelColor: ChipColorRole;
  readonly leadingIconColor: ChipColorRole;
  readonly trailingIconColor: ChipColorRole;
  readonly disabledContainerColor: ChipContainerColor;
  readonly disabledContainerOpacity: number;
  readonly disabledLabelColor: ChipColorRole;
  readonly disabledLabelOpacity: number;
  readonly disabledIconColor: ChipColorRole;
  readonly disabledIconOpacity: number;
  readonly outlineColor: ChipColorRole | 'transparent';
  readonly outlineWidth: number;
  readonly disabledOutlineColor: ChipColorRole | 'transparent';
  readonly disabledOutlineOpacity: number;
  readonly defaultElevation: ElevationLevel;
  readonly hoveredElevation: ElevationLevel;
  readonly focusedElevation: ElevationLevel;
  readonly pressedElevation: ElevationLevel;
  readonly disabledElevation: ElevationLevel;
  readonly draggedElevation: ElevationLevel;
  readonly labelTypography: ChipTypographyTokens;
}

export interface SelectableChipVariantTokens {
  readonly height: number;
  readonly minimumInteractiveSize: number;
  readonly containerRadius: number;
  readonly contentPaddingInline: number;
  readonly iconSpacing: number;
  readonly compactIconSpacing: number;
  readonly leadingIconSize: number;
  readonly trailingIconSize: number;
  readonly avatarSize: number;
  readonly avatarRadius: number;
  readonly disabledAvatarOpacity: number;
  readonly unselectedContainerColor: ChipContainerColor;
  readonly selectedContainerColor: ChipContainerColor;
  readonly disabledUnselectedContainerColor: ChipContainerColor;
  readonly disabledSelectedContainerColor: ChipContainerColor;
  readonly disabledContainerOpacity: number;
  readonly unselectedLabelColor: ChipColorRole;
  readonly selectedLabelColor: ChipColorRole;
  readonly unselectedLeadingIconColor: ChipColorRole;
  readonly expressiveUnselectedLeadingIconColor: ChipColorRole;
  readonly selectedLeadingIconColor: ChipColorRole;
  readonly unselectedTrailingIconColor: ChipColorRole;
  readonly selectedTrailingIconColor: ChipColorRole;
  readonly disabledContentColor: ChipColorRole;
  readonly disabledContentOpacity: number;
  readonly unselectedOutlineColor: ChipColorRole | 'transparent';
  readonly selectedOutlineColor: ChipColorRole | 'transparent';
  readonly disabledUnselectedOutlineColor: ChipColorRole | 'transparent';
  readonly disabledSelectedOutlineColor: ChipColorRole | 'transparent';
  readonly unselectedOutlineWidth: number;
  readonly selectedOutlineWidth: number;
  readonly disabledOutlineOpacity: number;
  readonly defaultElevation: ElevationLevel;
  readonly hoveredElevation: ElevationLevel;
  readonly focusedElevation: ElevationLevel;
  readonly pressedElevation: ElevationLevel;
  readonly disabledElevation: ElevationLevel;
  readonly draggedElevation: ElevationLevel;
  readonly labelTypography: ChipTypographyTokens;
}

export type ChipVariant =
  | 'assist'
  | 'elevatedAssist'
  | 'filter'
  | 'elevatedFilter'
  | 'input'
  | 'suggestion'
  | 'elevatedSuggestion';

const labelLarge = {
  fontFamily: 'plain',
  fontSize: 14,
  lineHeight: 20,
  fontWeight: 500,
  letterSpacing: 0.1,
} as const satisfies ChipTypographyTokens;

const commonAction = {
  height: 32,
  minimumInteractiveSize: 48,
  containerRadius: 8,
  contentPaddingInline: 8,
  iconSpacing: 8,
  iconSize: 18,
  disabledLabelColor: 'onSurface',
  disabledLabelOpacity: 0.38,
  disabledIconColor: 'onSurface',
  disabledIconOpacity: 0.38,
  draggedElevation: 'level4',
  labelTypography: labelLarge,
} as const;

/** AndroidX AssistChipTokens + AssistChipDefaults runtime defaults. */
export const assistChipTokens = {
  ...commonAction,
  containerColor: 'transparent',
  labelColor: 'onSurface',
  leadingIconColor: 'primary',
  trailingIconColor: 'primary',
  disabledContainerColor: 'transparent',
  disabledContainerOpacity: 0,
  outlineColor: 'outlineVariant',
  outlineWidth: 1,
  disabledOutlineColor: 'onSurface',
  disabledOutlineOpacity: 0.12,
  defaultElevation: 'level0',
  hoveredElevation: 'level0',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
  disabledElevation: 'level0',
} as const satisfies ActionChipVariantTokens;

/** AndroidX elevated AssistChip runtime defaults. */
export const elevatedAssistChipTokens = {
  ...commonAction,
  containerColor: 'surfaceContainerLow',
  labelColor: 'onSurface',
  leadingIconColor: 'primary',
  trailingIconColor: 'primary',
  disabledContainerColor: 'onSurface',
  disabledContainerOpacity: 0.12,
  outlineColor: 'transparent',
  outlineWidth: 0,
  disabledOutlineColor: 'transparent',
  disabledOutlineOpacity: 0,
  defaultElevation: 'level1',
  hoveredElevation: 'level2',
  focusedElevation: 'level1',
  pressedElevation: 'level1',
  disabledElevation: 'level0',
} as const satisfies ActionChipVariantTokens;

/** AndroidX SuggestionChipTokens + SuggestionChipDefaults runtime defaults. */
export const suggestionChipTokens = {
  ...commonAction,
  containerColor: 'transparent',
  labelColor: 'onSurfaceVariant',
  leadingIconColor: 'primary',
  trailingIconColor: 'onSurfaceVariant',
  disabledContainerColor: 'transparent',
  disabledContainerOpacity: 0,
  outlineColor: 'outlineVariant',
  outlineWidth: 1,
  disabledOutlineColor: 'onSurface',
  disabledOutlineOpacity: 0.12,
  defaultElevation: 'level0',
  hoveredElevation: 'level0',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
  disabledElevation: 'level0',
} as const satisfies ActionChipVariantTokens;

/** AndroidX elevated SuggestionChip runtime defaults. */
export const elevatedSuggestionChipTokens = {
  ...commonAction,
  containerColor: 'surfaceContainerLow',
  labelColor: 'onSurfaceVariant',
  leadingIconColor: 'primary',
  trailingIconColor: 'onSurfaceVariant',
  disabledContainerColor: 'onSurface',
  disabledContainerOpacity: 0.12,
  outlineColor: 'transparent',
  outlineWidth: 0,
  disabledOutlineColor: 'transparent',
  disabledOutlineOpacity: 0,
  defaultElevation: 'level1',
  hoveredElevation: 'level2',
  focusedElevation: 'level1',
  pressedElevation: 'level1',
  disabledElevation: 'level0',
} as const satisfies ActionChipVariantTokens;

const commonSelectable = {
  height: 32,
  minimumInteractiveSize: 48,
  containerRadius: 8,
  contentPaddingInline: 8,
  iconSpacing: 8,
  compactIconSpacing: 4,
  leadingIconSize: 18,
  trailingIconSize: 18,
  avatarSize: 0,
  avatarRadius: 9999,
  disabledAvatarOpacity: 1,
  disabledUnselectedContainerColor: 'transparent',
  disabledSelectedContainerColor: 'onSurface',
  disabledContainerOpacity: 0.12,
  disabledContentColor: 'onSurface',
  disabledContentOpacity: 0.38,
  unselectedOutlineColor: 'outlineVariant',
  selectedOutlineColor: 'transparent',
  disabledUnselectedOutlineColor: 'onSurface',
  disabledSelectedOutlineColor: 'transparent',
  unselectedOutlineWidth: 1,
  selectedOutlineWidth: 0,
  disabledOutlineOpacity: 0.12,
  disabledElevation: 'level0',
  draggedElevation: 'level4',
  labelTypography: labelLarge,
} as const;

/** AndroidX flat FilterChip runtime defaults. */
export const filterChipTokens = {
  ...commonSelectable,
  unselectedContainerColor: 'transparent',
  selectedContainerColor: 'secondaryContainer',
  unselectedLabelColor: 'onSurfaceVariant',
  selectedLabelColor: 'onSecondaryContainer',
  unselectedLeadingIconColor: 'primary',
  expressiveUnselectedLeadingIconColor: 'onSurfaceVariant',
  selectedLeadingIconColor: 'onSecondaryContainer',
  unselectedTrailingIconColor: 'onSurfaceVariant',
  selectedTrailingIconColor: 'onSecondaryContainer',
  defaultElevation: 'level0',
  // FilterChipDefaults intentionally uses the selected hover token for both states.
  hoveredElevation: 'level1',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
} as const satisfies SelectableChipVariantTokens;

/** AndroidX elevated FilterChip runtime defaults. */
export const elevatedFilterChipTokens = {
  ...commonSelectable,
  unselectedContainerColor: 'surfaceContainerLow',
  selectedContainerColor: 'secondaryContainer',
  disabledUnselectedContainerColor: 'onSurface',
  unselectedLabelColor: 'onSurfaceVariant',
  selectedLabelColor: 'onSecondaryContainer',
  unselectedLeadingIconColor: 'primary',
  expressiveUnselectedLeadingIconColor: 'onSurfaceVariant',
  selectedLeadingIconColor: 'onSecondaryContainer',
  unselectedTrailingIconColor: 'onSurfaceVariant',
  selectedTrailingIconColor: 'onSecondaryContainer',
  unselectedOutlineColor: 'transparent',
  disabledUnselectedOutlineColor: 'transparent',
  unselectedOutlineWidth: 0,
  defaultElevation: 'level1',
  hoveredElevation: 'level2',
  focusedElevation: 'level1',
  pressedElevation: 'level1',
} as const satisfies SelectableChipVariantTokens;

/** AndroidX InputChipTokens + InputChipDefaults runtime defaults. */
export const inputChipTokens = {
  ...commonSelectable,
  avatarSize: 24,
  disabledAvatarOpacity: 0.38,
  unselectedContainerColor: 'transparent',
  selectedContainerColor: 'secondaryContainer',
  unselectedLabelColor: 'onSurfaceVariant',
  selectedLabelColor: 'onSecondaryContainer',
  unselectedLeadingIconColor: 'onSurfaceVariant',
  expressiveUnselectedLeadingIconColor: 'onSurfaceVariant',
  selectedLeadingIconColor: 'primary',
  unselectedTrailingIconColor: 'onSurfaceVariant',
  selectedTrailingIconColor: 'onSecondaryContainer',
  defaultElevation: 'level0',
  hoveredElevation: 'level0',
  focusedElevation: 'level0',
  pressedElevation: 'level0',
} as const satisfies SelectableChipVariantTokens;

export const chipVariantTokens = {
  assist: assistChipTokens,
  elevatedAssist: elevatedAssistChipTokens,
  filter: filterChipTokens,
  elevatedFilter: elevatedFilterChipTokens,
  input: inputChipTokens,
  suggestion: suggestionChipTokens,
  elevatedSuggestion: elevatedSuggestionChipTokens,
} as const;

/** Expressive ChipShapes defaults from the pinned ChipsTokens table. */
export const chipShapeTokens = {
  unselectedRadius: 12,
  selectedRadius: 9999,
  pressedRadius: 8,
} as const;
