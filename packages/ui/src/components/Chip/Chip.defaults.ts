import {
  chipShapeTokens,
  chipVariantTokens,
  type ActionChipVariantTokens,
  type ChipColorRole,
  type ChipContainerColor,
  type ChipVariant,
  type SelectableChipVariantTokens,
} from '@m3/tokens/chip';
import { elevationMotionTokens, type ElevationLevel } from '@m3/tokens/elevation';
import type { CSSProperties } from 'react';
import type { ChipInteraction } from './Chip.interactions';

export type ChipStyle = CSSProperties & Record<`--${string}`, string | number>;
export type ChipShapeValue = string | number;

export interface ChipShapes {
  readonly shape?: ChipShapeValue;
  readonly selectedShape?: ChipShapeValue;
  readonly pressedShape?: ChipShapeValue;
}

export interface ChipInteractionState {
  readonly isDisabled: boolean;
  readonly isSelected?: boolean;
  readonly interaction: ChipInteraction | null;
  readonly previousInteraction?: ChipInteraction | null;
}

export interface ChipStyleOptions {
  readonly shape?: ChipShapeValue;
  readonly shapes?: ChipShapes;
  readonly hasLeadingIcon?: boolean;
  readonly hasTrailingIcon?: boolean;
  readonly hasAvatar?: boolean;
}

const fastSpatialShapeTransition =
  'border-radius 137ms linear(0, 0.0969 10%, 0.2872 20%, 0.4827 30%, 0.6472 40%, 0.7719 50%, 0.8598 60%, 0.9183 70%, 0.9552 80%, 0.9774 90%, 1)';

function roleVariable(role: ChipContainerColor): string {
  if (role === 'transparent') return 'transparent';
  const name = role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  return `var(--${name})`;
}

function typefaceVariable(role: string): string {
  return `var(--font-family-${role})`;
}

function withOpacity(color: ChipContainerColor, opacity: number): string {
  if (color === 'transparent' || opacity <= 0) return 'transparent';
  if (opacity >= 1) return roleVariable(color);
  return `color-mix(in srgb, ${roleVariable(color)} ${opacity * 100}%, transparent)`;
}

function normalizeShape(value: ChipShapeValue): string | number {
  return typeof value === 'number' ? `${value}px` : value;
}

function actionTokens(variant: ChipVariant): ActionChipVariantTokens | null {
  switch (variant) {
    case 'assist':
    case 'elevatedAssist':
    case 'suggestion':
    case 'elevatedSuggestion':
      return chipVariantTokens[variant];
    default:
      return null;
  }
}

function selectableTokens(variant: ChipVariant): SelectableChipVariantTokens | null {
  switch (variant) {
    case 'filter':
    case 'elevatedFilter':
    case 'input':
      return chipVariantTokens[variant];
    default:
      return null;
  }
}

function resolveActionColors(
  tokens: ActionChipVariantTokens,
  isDisabled: boolean,
) {
  if (isDisabled) {
    return {
      container: withOpacity(tokens.disabledContainerColor, tokens.disabledContainerOpacity),
      label: withOpacity(tokens.disabledLabelColor, tokens.disabledLabelOpacity),
      leading: withOpacity(tokens.disabledIconColor, tokens.disabledIconOpacity),
      trailing: withOpacity(tokens.disabledIconColor, tokens.disabledIconOpacity),
      outline: withOpacity(tokens.disabledOutlineColor, tokens.disabledOutlineOpacity),
      outlineWidth: tokens.outlineWidth,
    };
  }

  return {
    container: roleVariable(tokens.containerColor),
    label: roleVariable(tokens.labelColor),
    leading: roleVariable(tokens.leadingIconColor),
    trailing: roleVariable(tokens.trailingIconColor),
    outline: roleVariable(tokens.outlineColor),
    outlineWidth: tokens.outlineWidth,
  };
}

function resolveSelectableColors(
  tokens: SelectableChipVariantTokens,
  isDisabled: boolean,
  isSelected: boolean,
  isExpressive: boolean,
) {
  if (isDisabled) {
    return {
      container: withOpacity(
        isSelected
          ? tokens.disabledSelectedContainerColor
          : tokens.disabledUnselectedContainerColor,
        tokens.disabledContainerOpacity,
      ),
      label: withOpacity(tokens.disabledContentColor, tokens.disabledContentOpacity),
      leading: withOpacity(tokens.disabledContentColor, tokens.disabledContentOpacity),
      trailing: withOpacity(tokens.disabledContentColor, tokens.disabledContentOpacity),
      outline: withOpacity(
        isSelected
          ? tokens.disabledSelectedOutlineColor
          : tokens.disabledUnselectedOutlineColor,
        tokens.disabledOutlineOpacity,
      ),
      outlineWidth: isSelected
        ? tokens.selectedOutlineWidth
        : tokens.unselectedOutlineWidth,
    };
  }

  return {
    container: roleVariable(
      isSelected ? tokens.selectedContainerColor : tokens.unselectedContainerColor,
    ),
    label: roleVariable(
      isSelected ? tokens.selectedLabelColor : tokens.unselectedLabelColor,
    ),
    leading: roleVariable(
      isSelected
        ? tokens.selectedLeadingIconColor
        : isExpressive
          ? tokens.expressiveUnselectedLeadingIconColor
          : tokens.unselectedLeadingIconColor,
    ),
    trailing: roleVariable(
      isSelected ? tokens.selectedTrailingIconColor : tokens.unselectedTrailingIconColor,
    ),
    outline: roleVariable(
      isSelected ? tokens.selectedOutlineColor : tokens.unselectedOutlineColor,
    ),
    outlineWidth: isSelected
      ? tokens.selectedOutlineWidth
      : tokens.unselectedOutlineWidth,
  };
}

export function resolveChipElevation(
  variant: ChipVariant,
  { isDisabled, interaction }: ChipInteractionState,
): ElevationLevel {
  const tokens = chipVariantTokens[variant];
  if (isDisabled) return tokens.disabledElevation;

  switch (interaction) {
    case 'press':
      return tokens.pressedElevation;
    case 'hover':
      return tokens.hoveredElevation;
    case 'focus':
      return tokens.focusedElevation;
    default:
      return tokens.defaultElevation;
  }
}

export function getChipElevationMotion({
  isDisabled,
  interaction,
  previousInteraction = null,
}: ChipInteractionState) {
  if (isDisabled) return { durationMs: 0, easing: 'linear' } as const;
  if (interaction !== null) return elevationMotionTokens.incoming;
  if (previousInteraction === null) return { durationMs: 0, easing: 'linear' } as const;
  return previousInteraction === 'hover'
    ? elevationMotionTokens.hoveredOutgoing
    : elevationMotionTokens.outgoing;
}

function resolveRadius(
  state: ChipInteractionState,
  options: ChipStyleOptions,
  defaultRadius: number,
): string | number {
  if (options.shapes) {
    if (state.interaction === 'press') {
      return normalizeShape(options.shapes.pressedShape ?? chipShapeTokens.pressedRadius);
    }
    if (state.isSelected) {
      return normalizeShape(options.shapes.selectedShape ?? chipShapeTokens.selectedRadius);
    }
    return normalizeShape(options.shapes.shape ?? chipShapeTokens.unselectedRadius);
  }
  if (options.shape !== undefined) return normalizeShape(options.shape);
  return `${defaultRadius}px`;
}

function resolveSpacing(
  variant: ChipVariant,
  options: ChipStyleOptions,
  normal: number,
  compact: number,
) {
  if (
    !options.shapes ||
    (variant !== 'filter' && variant !== 'elevatedFilter' && variant !== 'input')
  ) {
    return { leading: normal, trailing: normal };
  }

  const hasLeading = options.hasLeadingIcon || options.hasAvatar;
  const hasTrailing = options.hasTrailingIcon;
  if (hasLeading && hasTrailing) return { leading: compact, trailing: compact };
  if (hasLeading) return { leading: compact, trailing: normal };
  if (hasTrailing) return { leading: normal, trailing: compact };
  return { leading: normal, trailing: normal };
}

function resolvePadding(
  variant: ChipVariant,
  options: ChipStyleOptions,
  standard: number,
) {
  if (variant !== 'input') return { start: standard, end: standard };
  const start = options.hasAvatar || !options.hasLeadingIcon ? 4 : 8;
  const end = options.hasTrailingIcon ? 8 : 4;
  return { start, end };
}

export function getChipRootStyle(variant: ChipVariant): ChipStyle {
  return {
    '--_chip-hit-size': `${chipVariantTokens[variant].minimumInteractiveSize}px`,
  };
}

export function getChipStyle(
  variant: ChipVariant,
  state: ChipInteractionState,
  options: ChipStyleOptions = {},
): ChipStyle {
  const action = actionTokens(variant);
  const selectable = selectableTokens(variant);
  const tokens = action ?? selectable!;
  const colors = action
    ? resolveActionColors(action, state.isDisabled)
    : resolveSelectableColors(
        selectable!,
        state.isDisabled,
        state.isSelected ?? false,
        options.shapes !== undefined,
      );
  const spacing = resolveSpacing(
    variant,
    options,
    tokens.iconSpacing,
    selectable?.compactIconSpacing ?? tokens.iconSpacing,
  );
  const padding = resolvePadding(variant, options, tokens.contentPaddingInline);
  const typography = tokens.labelTypography;

  return {
    '--_chip-height': `${tokens.height}px`,
    '--_chip-container-radius': resolveRadius(state, options, tokens.containerRadius),
    '--_chip-padding-inline-start': `${padding.start}px`,
    '--_chip-padding-inline-end': `${padding.end}px`,
    '--_chip-leading-gap': `${spacing.leading}px`,
    '--_chip-trailing-gap': `${spacing.trailing}px`,
    '--_chip-leading-icon-size': `${selectable?.leadingIconSize ?? action!.iconSize}px`,
    '--_chip-trailing-icon-size': `${selectable?.trailingIconSize ?? action!.iconSize}px`,
    '--_chip-avatar-size': `${selectable?.avatarSize ?? 0}px`,
    '--_chip-avatar-radius': `${selectable?.avatarRadius ?? 0}px`,
    '--_chip-avatar-opacity': state.isDisabled
      ? (selectable?.disabledAvatarOpacity ?? 1)
      : 1,
    '--_chip-container-color': colors.container,
    '--_chip-label-color': colors.label,
    '--_chip-leading-icon-color': colors.leading,
    '--_chip-trailing-icon-color': colors.trailing,
    '--_chip-outline-color': colors.outline,
    '--_chip-outline-width': `${colors.outlineWidth}px`,
    '--_chip-font-family': typefaceVariable(typography.fontFamily),
    '--_chip-font-size': `${typography.fontSize}px`,
    '--_chip-line-height': `${typography.lineHeight}px`,
    '--_chip-font-weight': typography.fontWeight,
    '--_chip-letter-spacing': `${typography.letterSpacing}px`,
    '--_chip-shape-transition': options.shapes ? fastSpatialShapeTransition : 'none',
  };
}

export function colorRoleVariable(role: ChipColorRole): string {
  return roleVariable(role);
}
