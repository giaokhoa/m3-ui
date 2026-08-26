import * as token from '@m3/tokens';
import type { CSSProperties } from 'react';
import {
  getElevationBoxShadow,
  type ElevationLevel,
} from '../../internal/elevation';
import { pxNumber } from '../../internal/tokenValues';

export type ListItemStyle = CSSProperties &
  Record<`--${string}`, string | number>;

export interface ListItemInteractionState {
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
  isDisabled?: boolean;
  isSelected?: boolean;
  isDragged?: boolean;
}

type ListItemShape = 'none' | 'extraSmall' | 'medium' | 'large';

const shapeRadius: Record<ListItemShape, string> = {
  none: token.ShapeNone,
  extraSmall: token.ShapeExtraSmall,
  medium: token.ShapeMedium,
  large: token.ShapeLarge,
};

export const listItemTokens = {
  height: {
    oneLine: pxNumber(token.ComponentListBaseItemOneLineContainerHeight),
    twoLine: pxNumber(token.ComponentListBaseItemTwoLineContainerHeight),
    threeLine: pxNumber(token.ComponentListBaseItemThreeLineContainerHeight),
  },
  padding: {
    inlineStart: pxNumber(token.ComponentListBaseItemLeadingSpace),
    inlineEnd: pxNumber(token.ComponentListBaseItemTrailingSpace),
    blockStart: pxNumber(token.ComponentListBaseItemTopSpace),
    blockEnd: pxNumber(token.ComponentListBaseItemBottomSpace),
  },
  container: {
    color: token.ComponentListBaseItemContainerColor,
    elevation: token.ComponentListBaseItemContainerElevation as ElevationLevel,
    shape: token.ComponentListBaseItemContainerShape as ListItemShape,
  },
  focusIndicator: {
    thickness: token.ComponentListBaseFocusIndicatorThickness,
    outlineOffset: token.ComponentListBaseFocusIndicatorOutlineOffset,
  },
  selected: {
    containerColor: token.ComponentListBaseItemSelectedContainerColor,
    shape: token.ComponentListBaseItemSelectedContainerShape as ListItemShape,
    labelColor: token.ComponentListBaseItemSelectedLabelTextColor,
    leadingColor: token.ComponentListBaseItemSelectedLeadingIconColor,
    trailingColor: token.ComponentListBaseItemSelectedTrailingIconColor,
    overlineColor: token.ComponentListBaseItemSelectedOverlineColor,
    supportingColor: token.ComponentListBaseItemSelectedSupportingTextColor,
  },
  disabled: {
    labelColor: token.ComponentListBaseItemDisabledLabelTextColor,
    labelOpacity: token.ComponentListBaseItemDisabledLabelTextOpacity,
    leadingColor: token.ComponentListBaseItemDisabledLeadingIconColor,
    leadingOpacity: token.ComponentListBaseItemDisabledLeadingIconOpacity,
    trailingColor: token.ComponentListBaseItemDisabledTrailingIconColor,
    trailingOpacity: token.ComponentListBaseItemDisabledTrailingIconOpacity,
    overlineColor: token.ComponentListBaseItemDisabledOverlineColor,
    overlineOpacity: token.ComponentListBaseItemDisabledOverlineOpacity,
    supportingColor: token.ComponentListBaseItemDisabledSupportingTextColor,
    supportingOpacity: token.ComponentListBaseItemDisabledSupportingTextOpacity,
  },
  selectedDisabled: {
    containerColor: token.ComponentListBaseItemSelectedDisabledContainerColor,
    containerOpacity: token.ComponentListBaseItemSelectedDisabledContainerOpacity,
    labelColor: token.ComponentListBaseItemSelectedDisabledLabelTextColor,
    labelOpacity: token.ComponentListBaseItemSelectedDisabledLabelTextOpacity,
    leadingColor: token.ComponentListBaseItemSelectedDisabledLeadingIconColor,
    leadingOpacity: token.ComponentListBaseItemSelectedDisabledLeadingIconOpacity,
    trailingColor: token.ComponentListBaseItemSelectedDisabledTrailingIconColor,
    trailingOpacity: token.ComponentListBaseItemSelectedDisabledTrailingIconOpacity,
    overlineColor: token.ComponentListBaseItemSelectedDisabledOverlineColor,
    overlineOpacity: token.ComponentListBaseItemSelectedDisabledOverlineOpacity,
    supportingColor: token.ComponentListBaseItemSelectedDisabledSupportingTextColor,
    supportingOpacity: token.ComponentListBaseItemSelectedDisabledSupportingTextOpacity,
  },
  interactionShape: {
    hover: token.ComponentListBaseItemHoveredContainerExpressiveShape as ListItemShape,
    focus: token.ComponentListBaseItemFocusedContainerExpressiveShape as ListItemShape,
    pressed: token.ComponentListBaseItemPressedContainerExpressiveShape as ListItemShape,
    dragged: token.ComponentListBaseItemDraggedContainerExpressiveShape as ListItemShape,
  },
  dragged: {
    elevation: token.ComponentListBaseItemDraggedContainerElevation as ElevationLevel,
    labelColor: token.ComponentListBaseItemDraggedLabelTextColor,
    leadingColor: token.ComponentListBaseItemDraggedLeadingIconIconColor,
    trailingColor: token.ComponentListBaseItemDraggedTrailingIconIconColor,
  },
  selectedInteraction: {
    hoverLabelColor: token.ComponentListBaseItemSelectedHoverLabelTextColor,
    hoverLeadingColor: token.ComponentListBaseItemSelectedHoverLeadingIconColor,
    hoverTrailingColor: token.ComponentListBaseItemSelectedHoverTrailingIconColor,
    focusLabelColor: token.ComponentListBaseItemSelectedFocusLabelTextColor,
    focusLeadingColor: token.ComponentListBaseItemSelectedFocusLeadingIconColor,
    focusTrailingColor: token.ComponentListBaseItemSelectedFocusTrailingIconColor,
    pressedLabelColor: token.ComponentListBaseItemSelectedPressedLabelTextColor,
    pressedLeadingColor: token.ComponentListBaseItemSelectedPressedLeadingIconColor,
    pressedTrailingColor: token.ComponentListBaseItemSelectedPressedTrailingIconColor,
    draggedLabelColor: token.ComponentListBaseItemSelectedDraggedLabelTextColor,
    draggedLeadingColor: token.ComponentListBaseItemSelectedDraggedLeadingIconColor,
    draggedTrailingColor: token.ComponentListBaseItemSelectedDraggedTrailingIconColor,
  },
  typography: {
    headline: {
      family: token.TypographyBodyLargeFontFamily,
      size: token.TypographyBodyLargeFontSize,
      lineHeight: token.TypographyBodyLargeLineHeight,
      weight: token.TypographyBodyLargeFontWeight,
      tracking: token.TypographyBodyLargeLetterSpacing,
    },
    supporting: {
      family: token.TypographyBodyMediumFontFamily,
      size: token.TypographyBodyMediumFontSize,
      lineHeight: token.TypographyBodyMediumLineHeight,
      weight: token.TypographyBodyMediumFontWeight,
      tracking: token.TypographyBodyMediumLetterSpacing,
    },
    meta: {
      family: token.TypographyLabelSmallFontFamily,
      size: token.TypographyLabelSmallFontSize,
      lineHeight: token.TypographyLabelSmallLineHeight,
      weight: token.TypographyLabelSmallFontWeight,
      tracking: token.TypographyLabelSmallLetterSpacing,
    },
  },
  ripple: {
    hoverOpacity: token.StateLayerOpacityHover,
    focusOpacity: token.StateLayerOpacityFocus,
    pressedOpacity: token.StateLayerOpacityPressed,
  },
  motion: {
    duration: token.MotionSpringFastSpatialDuration,
    easing: token.MotionSpringFastSpatialEasing,
  },
} as const;

function resolveShape(state: ListItemInteractionState): string {
  if (state.isSelected) return shapeRadius[listItemTokens.selected.shape];
  if (state.isDragged) return shapeRadius[listItemTokens.interactionShape.dragged];
  if (state.isPressed) return shapeRadius[listItemTokens.interactionShape.pressed];
  if (state.isFocusVisible) return shapeRadius[listItemTokens.interactionShape.focus];
  if (state.isHovered) return shapeRadius[listItemTokens.interactionShape.hover];
  return shapeRadius[listItemTokens.container.shape];
}

function resolveContentColors(state: ListItemInteractionState) {
  if (state.isDisabled) {
    const source = state.isSelected
      ? listItemTokens.selectedDisabled
      : listItemTokens.disabled;
    return {
      label: source.labelColor,
      labelOpacity: source.labelOpacity,
      leading: source.leadingColor,
      leadingOpacity: source.leadingOpacity,
      trailing: source.trailingColor,
      trailingOpacity: source.trailingOpacity,
      overline: source.overlineColor,
      overlineOpacity: source.overlineOpacity,
      supporting: source.supportingColor,
      supportingOpacity: source.supportingOpacity,
    };
  }

  if (state.isSelected) {
    const interaction = listItemTokens.selectedInteraction;
    const label = state.isDragged
      ? interaction.draggedLabelColor
      : state.isPressed
        ? interaction.pressedLabelColor
        : state.isFocusVisible
          ? interaction.focusLabelColor
          : state.isHovered
            ? interaction.hoverLabelColor
            : listItemTokens.selected.labelColor;
    const leading = state.isDragged
      ? interaction.draggedLeadingColor
      : state.isPressed
        ? interaction.pressedLeadingColor
        : state.isFocusVisible
          ? interaction.focusLeadingColor
          : state.isHovered
            ? interaction.hoverLeadingColor
            : listItemTokens.selected.leadingColor;
    const trailing = state.isDragged
      ? interaction.draggedTrailingColor
      : state.isPressed
        ? interaction.pressedTrailingColor
        : state.isFocusVisible
          ? interaction.focusTrailingColor
          : state.isHovered
            ? interaction.hoverTrailingColor
            : listItemTokens.selected.trailingColor;
    return {
      label,
      labelOpacity: 1,
      leading,
      leadingOpacity: 1,
      trailing,
      trailingOpacity: 1,
      overline: listItemTokens.selected.overlineColor,
      overlineOpacity: 1,
      supporting: listItemTokens.selected.supportingColor,
      supportingOpacity: 1,
    };
  }

  return {
    label: state.isDragged
      ? listItemTokens.dragged.labelColor
      : token.ComponentListBaseItemLabelTextColor,
    labelOpacity: 1,
    leading: state.isDragged
      ? listItemTokens.dragged.leadingColor
      : token.ComponentListBaseItemLeadingIconColor,
    leadingOpacity: 1,
    trailing: state.isDragged
      ? listItemTokens.dragged.trailingColor
      : token.ComponentListBaseItemTrailingIconColor,
    trailingOpacity: 1,
    overline: token.ComponentListBaseItemOverlineColor,
    overlineOpacity: 1,
    supporting: token.ComponentListBaseItemSupportingTextColor,
    supportingOpacity: 1,
  };
}

export function getListItemStyle(
  lineCount: 1 | 2 | 3,
  state: ListItemInteractionState = {},
): ListItemStyle {
  const colors = resolveContentColors(state);
  const minHeight =
    lineCount === 1
      ? listItemTokens.height.oneLine
      : lineCount === 2
        ? listItemTokens.height.twoLine
        : listItemTokens.height.threeLine;
  const selectedDisabled = Boolean(state.isSelected && state.isDisabled);
  const containerColor = state.isSelected
    ? selectedDisabled
      ? listItemTokens.selectedDisabled.containerColor
      : listItemTokens.selected.containerColor
    : listItemTokens.container.color;
  const containerOpacity = selectedDisabled
    ? listItemTokens.selectedDisabled.containerOpacity
    : 1;
  const elevation = state.isDragged
    ? listItemTokens.dragged.elevation
    : listItemTokens.container.elevation;

  return {
    '--_list-item-min-height': `${minHeight}px`,
    '--_list-item-padding-inline-start': `${listItemTokens.padding.inlineStart}px`,
    '--_list-item-padding-inline-end': `${listItemTokens.padding.inlineEnd}px`,
    '--_list-item-padding-block-start': `${listItemTokens.padding.blockStart}px`,
    '--_list-item-padding-block-end': `${listItemTokens.padding.blockEnd}px`,
    '--_list-item-container-color': containerColor,
    '--_list-item-container-opacity': containerOpacity,
    '--_list-item-shape': resolveShape(state),
    '--_list-item-box-shadow': getElevationBoxShadow(elevation),
    '--_list-item-focus-indicator-thickness': listItemTokens.focusIndicator.thickness,
    '--_list-item-focus-indicator-outline-offset':
      listItemTokens.focusIndicator.outlineOffset,
    '--_list-item-label-color': colors.label,
    '--_list-item-label-opacity': colors.labelOpacity,
    '--_list-item-leading-color': colors.leading,
    '--_list-item-leading-opacity': colors.leadingOpacity,
    '--_list-item-trailing-color': colors.trailing,
    '--_list-item-trailing-opacity': colors.trailingOpacity,
    '--_list-item-overline-color': colors.overline,
    '--_list-item-overline-opacity': colors.overlineOpacity,
    '--_list-item-supporting-color': colors.supporting,
    '--_list-item-supporting-opacity': colors.supportingOpacity,
    '--_list-item-headline-font-family': listItemTokens.typography.headline.family,
    '--_list-item-headline-font-size': listItemTokens.typography.headline.size,
    '--_list-item-headline-line-height': listItemTokens.typography.headline.lineHeight,
    '--_list-item-headline-font-weight': listItemTokens.typography.headline.weight,
    '--_list-item-headline-letter-spacing': listItemTokens.typography.headline.tracking,
    '--_list-item-supporting-font-family': listItemTokens.typography.supporting.family,
    '--_list-item-supporting-font-size': listItemTokens.typography.supporting.size,
    '--_list-item-supporting-line-height': listItemTokens.typography.supporting.lineHeight,
    '--_list-item-supporting-font-weight': listItemTokens.typography.supporting.weight,
    '--_list-item-supporting-letter-spacing': listItemTokens.typography.supporting.tracking,
    '--_list-item-meta-font-family': listItemTokens.typography.meta.family,
    '--_list-item-meta-font-size': listItemTokens.typography.meta.size,
    '--_list-item-meta-line-height': listItemTokens.typography.meta.lineHeight,
    '--_list-item-meta-font-weight': listItemTokens.typography.meta.weight,
    '--_list-item-meta-letter-spacing': listItemTokens.typography.meta.tracking,
    '--_list-item-shape-duration': listItemTokens.motion.duration,
    '--_list-item-shape-easing': listItemTokens.motion.easing,
    '--_ripple-color': colors.label,
    '--_ripple-hover-opacity': listItemTokens.ripple.hoverOpacity,
    '--_ripple-focus-opacity': listItemTokens.ripple.focusOpacity,
    '--_ripple-pressed-opacity': listItemTokens.ripple.pressedOpacity,
  };
}
