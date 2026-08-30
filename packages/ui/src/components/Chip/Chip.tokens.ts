import * as token from '@m3-ui/tokens';
import type { ElevationLevel } from '../../internal/elevation';
import { pxNumber } from '../../internal/tokenValues';

type TypefaceRole = 'plain' | 'brand';

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
  readonly defaultElevation: ElevationLevel;
  readonly hoveredElevation: ElevationLevel;
  readonly focusedElevation: ElevationLevel;
  readonly pressedElevation: ElevationLevel;
  readonly disabledElevation: ElevationLevel;
  readonly draggedElevation: ElevationLevel;
  readonly labelTypography: ChipTypographyTokens;
}

export type ChipVariant = 'assist' | 'elevatedAssist' | 'filter' | 'elevatedFilter' | 'input' | 'suggestion' | 'elevatedSuggestion';

const labelTypography = {
  fontFamily: token.ComponentChipTypographyFontFamily as TypefaceRole,
  fontSize: pxNumber(token.ComponentChipTypographyFontSize),
  lineHeight: pxNumber(token.ComponentChipTypographyLineHeight),
  fontWeight: token.ComponentChipTypographyFontWeight,
  letterSpacing: pxNumber(token.ComponentChipTypographyLetterSpacing),
} as const;

const commonAction = {
  height: pxNumber(token.ComponentChipActionBaseHeight),
  minimumInteractiveSize: pxNumber(token.ComponentChipActionBaseMinimumInteractiveSize),
  containerRadius: pxNumber(token.ComponentChipActionBaseContainerRadius),
  contentPaddingInline: pxNumber(token.ComponentChipActionBaseContentPaddingInline),
  iconSpacing: pxNumber(token.ComponentChipActionBaseIconSpacing),
  iconSize: pxNumber(token.ComponentChipActionBaseIconSize),
  draggedElevation: token.ComponentChipActionBaseDraggedElevation as ElevationLevel,
  labelTypography,
} as const;

function action(prefix: 'Assist' | 'ElevatedAssist' | 'Suggestion' | 'ElevatedSuggestion'): ActionChipVariantTokens {
  const values = {
    Assist: [token.ComponentChipVariantAssistDefaultElevation, token.ComponentChipVariantAssistHoveredElevation, token.ComponentChipVariantAssistFocusedElevation, token.ComponentChipVariantAssistPressedElevation, token.ComponentChipVariantAssistDisabledElevation],
    ElevatedAssist: [token.ComponentChipVariantElevatedAssistDefaultElevation, token.ComponentChipVariantElevatedAssistHoveredElevation, token.ComponentChipVariantElevatedAssistFocusedElevation, token.ComponentChipVariantElevatedAssistPressedElevation, token.ComponentChipVariantElevatedAssistDisabledElevation],
    Suggestion: [token.ComponentChipVariantSuggestionDefaultElevation, token.ComponentChipVariantSuggestionHoveredElevation, token.ComponentChipVariantSuggestionFocusedElevation, token.ComponentChipVariantSuggestionPressedElevation, token.ComponentChipVariantSuggestionDisabledElevation],
    ElevatedSuggestion: [token.ComponentChipVariantElevatedSuggestionDefaultElevation, token.ComponentChipVariantElevatedSuggestionHoveredElevation, token.ComponentChipVariantElevatedSuggestionFocusedElevation, token.ComponentChipVariantElevatedSuggestionPressedElevation, token.ComponentChipVariantElevatedSuggestionDisabledElevation],
  }[prefix];
  return { ...commonAction, defaultElevation: values[0] as ElevationLevel, hoveredElevation: values[1] as ElevationLevel, focusedElevation: values[2] as ElevationLevel, pressedElevation: values[3] as ElevationLevel, disabledElevation: values[4] as ElevationLevel };
}

export const assistChipTokens = action('Assist');
export const elevatedAssistChipTokens = action('ElevatedAssist');
export const suggestionChipTokens = action('Suggestion');
export const elevatedSuggestionChipTokens = action('ElevatedSuggestion');

const commonSelectable = {
  height: pxNumber(token.ComponentChipSelectableBaseHeight),
  minimumInteractiveSize: pxNumber(token.ComponentChipSelectableBaseMinimumInteractiveSize),
  containerRadius: pxNumber(token.ComponentChipSelectableBaseContainerRadius),
  contentPaddingInline: pxNumber(token.ComponentChipSelectableBaseContentPaddingInline),
  iconSpacing: pxNumber(token.ComponentChipSelectableBaseIconSpacing),
  compactIconSpacing: pxNumber(token.ComponentChipSelectableBaseCompactIconSpacing),
  leadingIconSize: pxNumber(token.ComponentChipSelectableBaseLeadingIconSize),
  trailingIconSize: pxNumber(token.ComponentChipSelectableBaseTrailingIconSize),
  avatarSize: pxNumber(token.ComponentChipSelectableBaseAvatarSize),
  avatarRadius: pxNumber(token.ComponentChipSelectableBaseAvatarRadius),
  disabledAvatarOpacity: token.ComponentChipSelectableBaseDisabledAvatarOpacity,
  disabledElevation: token.ComponentChipSelectableBaseDisabledElevation as ElevationLevel,
  draggedElevation: token.ComponentChipSelectableBaseDraggedElevation as ElevationLevel,
  labelTypography,
} as const;

function selectable(kind: 'Filter' | 'ElevatedFilter' | 'Input'): SelectableChipVariantTokens {
  const filter = kind === 'Filter';
  const elevated = kind === 'ElevatedFilter';
  const get = <T>(filterValue: T, elevatedValue: T, inputValue: T) => filter ? filterValue : elevated ? elevatedValue : inputValue;
  return {
    ...commonSelectable,
    avatarSize: kind === 'Input' ? pxNumber(token.ComponentChipVariantInputAvatarSize) : commonSelectable.avatarSize,
    disabledAvatarOpacity: kind === 'Input' ? token.ComponentChipVariantInputDisabledAvatarOpacity : commonSelectable.disabledAvatarOpacity,
    defaultElevation: get(token.ComponentChipVariantFilterDefaultElevation, token.ComponentChipVariantElevatedFilterDefaultElevation, token.ComponentChipVariantInputDefaultElevation) as ElevationLevel,
    hoveredElevation: get(token.ComponentChipVariantFilterHoveredElevation, token.ComponentChipVariantElevatedFilterHoveredElevation, token.ComponentChipVariantInputHoveredElevation) as ElevationLevel,
    focusedElevation: get(token.ComponentChipVariantFilterFocusedElevation, token.ComponentChipVariantElevatedFilterFocusedElevation, token.ComponentChipVariantInputFocusedElevation) as ElevationLevel,
    pressedElevation: get(token.ComponentChipVariantFilterPressedElevation, token.ComponentChipVariantElevatedFilterPressedElevation, token.ComponentChipVariantInputPressedElevation) as ElevationLevel,
  };
}

export const filterChipTokens = selectable('Filter');
export const elevatedFilterChipTokens = selectable('ElevatedFilter');
export const inputChipTokens = selectable('Input');
export const chipVariantTokens = { assist: assistChipTokens, elevatedAssist: elevatedAssistChipTokens, filter: filterChipTokens, elevatedFilter: elevatedFilterChipTokens, input: inputChipTokens, suggestion: suggestionChipTokens, elevatedSuggestion: elevatedSuggestionChipTokens } as const;
export const chipShapeTokens = { unselectedRadius: pxNumber(token.ComponentChipShapeUnselectedRadius), selectedRadius: pxNumber(token.ComponentChipShapeSelectedRadius), pressedRadius: pxNumber(token.ComponentChipShapePressedRadius) } as const;
export const chipInputPaddingTokens = { compact: pxNumber(token.ComponentChipInputPaddingCompact), withIcon: pxNumber(token.ComponentChipInputPaddingWithIcon) } as const;
export const chipShapeTransition = `border-radius ${token.MotionSpringFastSpatialDuration} ${token.MotionSpringFastSpatialEasing}`;
