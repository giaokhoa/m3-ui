import type { ReactNode } from 'react';
import {
  Button as AriaButton,
  Checkbox as AriaCheckbox,
  type ButtonProps as AriaButtonProps,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';
import '@m3-ui/tokens/chip.css';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getChipStyle,
  type ChipShapeValue,
  type ChipShapes,
} from './Chip.defaults';
import { chipElevationLevels } from './Chip.elevation';
import type { ChipVariant } from './Chip.tokens';
import './chip.css';

interface VisualSlots {
  readonly leadingIcon?: ReactNode;
  readonly trailingIcon?: ReactNode;
  readonly avatar?: ReactNode;
}

export interface ActionChipProps extends Omit<AriaButtonProps, 'children'>, VisualSlots {
  children?: AriaButtonProps['children'];
  shape?: ChipShapeValue;
}

export interface SuggestionChipProps
  extends Omit<ActionChipProps, 'leadingIcon' | 'trailingIcon'> {
  icon?: ReactNode;
}

export interface SelectableChipProps
  extends Omit<AriaCheckboxProps, 'children'>, VisualSlots {
  children?: AriaCheckboxProps['children'];
  shape?: ChipShapeValue;
  shapes?: ChipShapes;
}

export interface InputChipProps extends SelectableChipProps {}

interface ActionChipImplProps extends ActionChipProps {
  variant: 'assist' | 'elevatedAssist' | 'suggestion' | 'elevatedSuggestion';
}

interface SelectableChipImplProps extends SelectableChipProps {
  variant: 'filter' | 'elevatedFilter' | 'input';
}

function variantClassName(variant: ChipVariant): string {
  return `chip--${variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

function resolveButtonChildren(
  children: AriaButtonProps['children'],
  renderProps: Parameters<Exclude<AriaButtonProps['children'], ReactNode>>[0],
) {
  return typeof children === 'function' ? children(renderProps) : children;
}

function resolveCheckboxChildren(
  children: AriaCheckboxProps['children'],
  renderProps: Parameters<Exclude<AriaCheckboxProps['children'], ReactNode>>[0],
) {
  return typeof children === 'function' ? children(renderProps) : children;
}

function ChipVisual({
  variant,
  label,
  slots,
  controller,
  isDisabled,
  isSelected,
  isPressed,
  isHovered,
  isFocused,
  isFocusVisible,
  shape,
  shapes,
}: {
  variant: ChipVariant;
  label: ReactNode;
  slots: VisualSlots;
  controller: ReturnType<typeof useRipple>;
  isDisabled: boolean;
  isSelected: boolean;
  isPressed: boolean;
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  shape?: ChipShapeValue;
  shapes?: ChipShapes;
}) {
  const style = getChipStyle(
    variant,
    { isDisabled, isSelected, isPressed },
    {
      shape,
      shapes,
      hasLeadingIcon: slots.leadingIcon != null,
      hasTrailingIcon: slots.trailingIcon != null,
      hasAvatar: slots.avatar != null,
    },
  );

  return (
    <span
      className="chip__visual"
      data-selected={isSelected || undefined}
      data-expressive-shapes={shapes ? true : undefined}
      style={style}
    >
      <Elevation
        levels={chipElevationLevels[variant]}
        state={{ isDisabled, isPressed, isHovered, isFocused }}
      />
      <span className="chip__surface">
        <Ripple
          controller={controller}
          focusRingRadius="var(--_chip-container-radius)"
          state={{ isHovered, isFocusVisible }}
        />
        <span className="chip__content">
          {slots.avatar != null ? (
            <span aria-hidden="true" className="chip__avatar">
              {slots.avatar}
            </span>
          ) : slots.leadingIcon != null ? (
            <span aria-hidden="true" className="chip__leading-icon">
              {slots.leadingIcon}
            </span>
          ) : null}
          <span className="chip__label">{label}</span>
          {slots.trailingIcon != null ? (
            <span aria-hidden="true" className="chip__trailing-icon">
              {slots.trailingIcon}
            </span>
          ) : null}
        </span>
      </span>
    </span>
  );
}

function ActionChipImpl({
  variant,
  children,
  className,
  style,
  leadingIcon,
  trailingIcon,
  shape,
  onPressEnd,
  onPressStart,
  ...props
}: ActionChipImplProps) {
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });
  const baseClassName = `chip ${variantClassName(variant)}`;

  return (
    <AriaButton
      {...props}
      {...ripplePressProps}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      data-has-leading={leadingIcon != null || undefined}
      data-has-trailing={trailingIcon != null || undefined}
      data-variant={variant}
      style={style}
    >
      {(renderProps) => (
        <ChipVisual
          variant={variant}
          label={resolveButtonChildren(children, renderProps)}
          slots={{ leadingIcon, trailingIcon }}
          controller={ripple}
          isDisabled={renderProps.isDisabled}
          isSelected={false}
          isPressed={renderProps.isPressed}
          isHovered={renderProps.isHovered}
          isFocused={renderProps.isFocused}
          isFocusVisible={renderProps.isFocusVisible}
          shape={shape}
        />
      )}
    </AriaButton>
  );
}

function SelectableChipImpl({
  variant,
  children,
  className,
  style,
  leadingIcon,
  trailingIcon,
  avatar,
  shape,
  shapes,
  onPressEnd,
  onPressStart,
  ...props
}: SelectableChipImplProps) {
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });
  const baseClassName = `chip ${variantClassName(variant)}`;

  return (
    <AriaCheckbox
      {...props}
      {...ripplePressProps}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      data-expressive-shapes={shapes ? true : undefined}
      data-has-avatar={avatar != null || undefined}
      data-has-leading={leadingIcon != null || undefined}
      data-has-trailing={trailingIcon != null || undefined}
      data-variant={variant}
      style={style}
    >
      {(renderProps) => (
        <ChipVisual
          variant={variant}
          label={resolveCheckboxChildren(children, renderProps)}
          slots={{ avatar, leadingIcon, trailingIcon }}
          controller={ripple}
          isDisabled={renderProps.isDisabled}
          isSelected={renderProps.isSelected}
          isPressed={renderProps.isPressed}
          isHovered={renderProps.isHovered}
          isFocused={renderProps.isFocused}
          isFocusVisible={renderProps.isFocusVisible}
          shape={shape}
          shapes={shapes}
        />
      )}
    </AriaCheckbox>
  );
}

export function AssistChip(props: ActionChipProps) {
  return <ActionChipImpl {...props} variant="assist" />;
}

export function ElevatedAssistChip(props: ActionChipProps) {
  return <ActionChipImpl {...props} variant="elevatedAssist" />;
}

export function SuggestionChip({ icon, ...props }: SuggestionChipProps) {
  return <ActionChipImpl {...props} leadingIcon={icon} variant="suggestion" />;
}

export function ElevatedSuggestionChip({ icon, ...props }: SuggestionChipProps) {
  return <ActionChipImpl {...props} leadingIcon={icon} variant="elevatedSuggestion" />;
}

export function FilterChip(props: SelectableChipProps) {
  return <SelectableChipImpl {...props} variant="filter" />;
}

export function ElevatedFilterChip(props: SelectableChipProps) {
  return <SelectableChipImpl {...props} variant="elevatedFilter" />;
}

export function InputChip(props: InputChipProps) {
  return <SelectableChipImpl {...props} variant="input" />;
}

export type { ChipShapeValue, ChipShapes } from './Chip.defaults';
