import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import {
  Checkbox as AriaCheckbox,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type CheckboxProps as AriaCheckboxProps,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  segmentedButtonRowStyle,
  segmentedButtonStyle,
  type SegmentedButtonStyle,
} from './SegmentedButton.defaults';
import './segmented-button.css';

interface SegmentVisualProps {
  readonly label: ReactNode;
  readonly icon?: ReactNode;
  readonly selectedIcon?: ReactNode;
  readonly isSelected: boolean;
  readonly isDisabled: boolean;
  readonly isHovered: boolean;
  readonly isFocusVisible: boolean;
  readonly ripple: ReturnType<typeof useRipple>;
}

export interface SingleChoiceSegmentedButtonRowProps
  extends Omit<AriaRadioGroupProps, 'children' | 'orientation'> {
  children: ReactNode;
}

export interface MultiChoiceSegmentedButtonRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
}

interface SegmentSlots {
  /** Optional icon shown while the segment is not selected. */
  icon?: ReactNode;
  /** Optional icon shown while selected. Defaults to the Material check mark. */
  selectedIcon?: ReactNode;
}

export interface SingleChoiceSegmentedButtonProps
  extends Omit<AriaRadioProps, 'children'>,
    SegmentSlots {
  children: ReactNode;
}

export interface MultiChoiceSegmentedButtonProps
  extends Omit<AriaCheckboxProps, 'children'>,
    SegmentSlots {
  children: ReactNode;
}

function joinClassNames(...values: Array<string | null | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="segmented-button__check-icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  );
}

function SegmentVisual({
  label,
  icon,
  selectedIcon,
  isSelected,
  isDisabled,
  isHovered,
  isFocusVisible,
  ripple,
}: SegmentVisualProps) {
  const hasInactiveIcon = icon != null;
  return (
    <span
      className="segmented-button__surface"
      data-disabled={isDisabled || undefined}
      data-selected={isSelected || undefined}
    >
      <Ripple
        controller={ripple}
        focusRingRadius="inherit"
        isFocusVisible={isFocusVisible}
        isHovered={isHovered}
      />
      <span
        className="segmented-button__content"
        data-displace={!hasInactiveIcon || undefined}
      >
        <span className="segmented-button__icon-slot" aria-hidden="true">
          {hasInactiveIcon ? (
            <span className="segmented-button__icon segmented-button__icon--inactive">
              {icon}
            </span>
          ) : null}
          <span className="segmented-button__icon segmented-button__icon--active">
            {selectedIcon ?? <CheckIcon />}
          </span>
        </span>
        <span className="segmented-button__label">{label}</span>
      </span>
    </span>
  );
}

export function SingleChoiceSegmentedButtonRow({
  children,
  className,
  style,
  ...props
}: SingleChoiceSegmentedButtonRowProps) {
  return (
    <AriaRadioGroup
      {...props}
      orientation="horizontal"
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames('segmented-button-row', 'segmented-button-row--single', userClassName);
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...segmentedButtonRowStyle, ...userStyle };
      }}
    >
      {children}
    </AriaRadioGroup>
  );
}

export function MultiChoiceSegmentedButtonRow({
  children,
  className,
  style,
  ...props
}: MultiChoiceSegmentedButtonRowProps) {
  return (
    <div
      {...props}
      role="group"
      className={joinClassNames('segmented-button-row', 'segmented-button-row--multi', className)}
      style={{ ...(segmentedButtonRowStyle as CSSProperties), ...style }}
    >
      {children}
    </div>
  );
}

export function SingleChoiceSegmentedButton({
  children,
  icon,
  selectedIcon,
  className,
  style,
  onPressStart,
  onPressEnd,
  ...props
}: SingleChoiceSegmentedButtonProps) {
  const ripple = useRipple();
  const handlePressStart: AriaRadioProps['onPressStart'] = (event) => {
    ripple.onPressStart(event);
    onPressStart?.(event);
  };
  const handlePressEnd: AriaRadioProps['onPressEnd'] = (event) => {
    ripple.onPressEnd();
    onPressEnd?.(event);
  };

  return (
    <AriaRadio
      {...props}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames('segmented-button', userClassName);
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...segmentedButtonStyle, ...userStyle } as SegmentedButtonStyle;
      }}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => (
        <SegmentVisual
          icon={icon}
          isDisabled={renderProps.isDisabled}
          isFocusVisible={renderProps.isFocusVisible}
          isHovered={renderProps.isHovered}
          isSelected={renderProps.isSelected}
          label={children}
          ripple={ripple}
          selectedIcon={selectedIcon}
        />
      )}
    </AriaRadio>
  );
}

export function MultiChoiceSegmentedButton({
  children,
  icon,
  selectedIcon,
  className,
  style,
  onPressStart,
  onPressEnd,
  ...props
}: MultiChoiceSegmentedButtonProps) {
  const ripple = useRipple();
  const handlePressStart: AriaCheckboxProps['onPressStart'] = (event) => {
    ripple.onPressStart(event);
    onPressStart?.(event);
  };
  const handlePressEnd: AriaCheckboxProps['onPressEnd'] = (event) => {
    ripple.onPressEnd();
    onPressEnd?.(event);
  };

  return (
    <AriaCheckbox
      {...props}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames('segmented-button', userClassName);
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...segmentedButtonStyle, ...userStyle } as SegmentedButtonStyle;
      }}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => (
        <SegmentVisual
          icon={icon}
          isDisabled={renderProps.isDisabled}
          isFocusVisible={renderProps.isFocusVisible}
          isHovered={renderProps.isHovered}
          isSelected={renderProps.isSelected}
          label={children}
          ripple={ripple}
          selectedIcon={selectedIcon}
        />
      )}
    </AriaCheckbox>
  );
}
