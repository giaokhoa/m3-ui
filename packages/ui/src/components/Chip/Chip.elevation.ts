import * as token from '@m3-ui/tokens';
import type { ElevationLevels } from '../../internal/elevation';
import type { ChipVariant } from './Chip.tokens';

const selectableDisabledElevation = token.ComponentChipSelectableBaseDisabledElevation;

export const chipElevationLevels = {
  assist: {
    default: token.ComponentChipVariantAssistDefaultElevation,
    hovered: token.ComponentChipVariantAssistHoveredElevation,
    focused: token.ComponentChipVariantAssistFocusedElevation,
    pressed: token.ComponentChipVariantAssistPressedElevation,
    disabled: token.ComponentChipVariantAssistDisabledElevation,
  },
  elevatedAssist: {
    default: token.ComponentChipVariantElevatedAssistDefaultElevation,
    hovered: token.ComponentChipVariantElevatedAssistHoveredElevation,
    focused: token.ComponentChipVariantElevatedAssistFocusedElevation,
    pressed: token.ComponentChipVariantElevatedAssistPressedElevation,
    disabled: token.ComponentChipVariantElevatedAssistDisabledElevation,
  },
  filter: {
    default: token.ComponentChipVariantFilterDefaultElevation,
    hovered: token.ComponentChipVariantFilterHoveredElevation,
    focused: token.ComponentChipVariantFilterFocusedElevation,
    pressed: token.ComponentChipVariantFilterPressedElevation,
    disabled: selectableDisabledElevation,
  },
  elevatedFilter: {
    default: token.ComponentChipVariantElevatedFilterDefaultElevation,
    hovered: token.ComponentChipVariantElevatedFilterHoveredElevation,
    focused: token.ComponentChipVariantElevatedFilterFocusedElevation,
    pressed: token.ComponentChipVariantElevatedFilterPressedElevation,
    disabled: selectableDisabledElevation,
  },
  input: {
    default: token.ComponentChipVariantInputDefaultElevation,
    hovered: token.ComponentChipVariantInputHoveredElevation,
    focused: token.ComponentChipVariantInputFocusedElevation,
    pressed: token.ComponentChipVariantInputPressedElevation,
    disabled: selectableDisabledElevation,
  },
  suggestion: {
    default: token.ComponentChipVariantSuggestionDefaultElevation,
    hovered: token.ComponentChipVariantSuggestionHoveredElevation,
    focused: token.ComponentChipVariantSuggestionFocusedElevation,
    pressed: token.ComponentChipVariantSuggestionPressedElevation,
    disabled: token.ComponentChipVariantSuggestionDisabledElevation,
  },
  elevatedSuggestion: {
    default: token.ComponentChipVariantElevatedSuggestionDefaultElevation,
    hovered: token.ComponentChipVariantElevatedSuggestionHoveredElevation,
    focused: token.ComponentChipVariantElevatedSuggestionFocusedElevation,
    pressed: token.ComponentChipVariantElevatedSuggestionPressedElevation,
    disabled: token.ComponentChipVariantElevatedSuggestionDisabledElevation,
  },
} as const satisfies Record<ChipVariant, ElevationLevels>;
