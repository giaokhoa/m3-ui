import '@m3-ui/tokens/split-button.css';
import clsx from 'clsx';
import type { ComponentType, CSSProperties, HTMLAttributes, ReactNode } from 'react';
import {
  Button,
  ElevatedButton,
  FilledTonalButton,
  OutlinedButton,
  type ButtonProps,
  type ButtonShapes,
} from '../Button';
import type { SplitButtonSize, SplitButtonVariant } from './SplitButton.types';
import './split-button.css';

export interface SplitButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  leading: ReactNode;
  trailing: ReactNode;
  variant?: SplitButtonVariant;
  size?: SplitButtonSize;
  onLeadingPress?: ButtonProps['onPress'];
  onTrailingPress?: ButtonProps['onPress'];
  isLeadingDisabled?: boolean;
  isTrailingDisabled?: boolean;
  trailingChecked?: boolean;
  onTrailingCheckedChange?: (checked: boolean) => void;
  trailingExpanded?: boolean;
  leadingAriaLabel?: string;
  trailingAriaLabel?: string;
}

type SplitButtonButton = ComponentType<ButtonProps>;
type SplitButtonButtonStyle = CSSProperties & Record<`--${string}`, string | number>;

const leadingButtonShapes: ButtonShapes = {
  shape: 'var(--_split-button-leading-radius)',
  pressedShape: 'var(--_split-button-leading-pressed-radius)',
};

const trailingButtonShapes: ButtonShapes = {
  shape: 'var(--_split-button-trailing-radius)',
  pressedShape: 'var(--_split-button-trailing-pressed-radius)',
};

const leadingButtonStyle: SplitButtonButtonStyle = {
  '--_button-container-radius': 'var(--_split-button-leading-active-radius)',
};

const trailingButtonStyle: SplitButtonButtonStyle = {
  '--_button-container-radius': 'var(--_split-button-trailing-active-radius)',
};

function buttonForVariant(variant: SplitButtonVariant): SplitButtonButton {
  switch (variant) {
    case 'tonal':
      return FilledTonalButton;
    case 'elevated':
      return ElevatedButton;
    case 'outlined':
      return OutlinedButton;
    default:
      return Button;
  }
}

export function SplitButton({
  leading,
  trailing,
  variant = 'filled',
  size = 'small',
  onLeadingPress,
  onTrailingPress,
  isLeadingDisabled = false,
  isTrailingDisabled = false,
  trailingChecked,
  onTrailingCheckedChange,
  trailingExpanded,
  leadingAriaLabel,
  trailingAriaLabel,
  className,
  style,
  ...props
}: SplitButtonProps) {
  const VariantButton = buttonForVariant(variant);
  const trailingIsCheckable = trailingChecked !== undefined;

  const handleTrailingPress: ButtonProps['onPress'] = (event) => {
    if (trailingIsCheckable) {
      onTrailingCheckedChange?.(!trailingChecked);
    }
    onTrailingPress?.(event);
  };

  return (
    <div
      {...props}
      className={clsx('split-button', className)}
      data-size={size}
      data-variant={variant}
      style={style}
    >
      <div className="split-button__layout">
        <VariantButton
          aria-label={leadingAriaLabel}
          className="split-button__button split-button__leading"
          isDisabled={isLeadingDisabled}
          onPress={onLeadingPress}
          shapes={leadingButtonShapes}
          size={size}
          style={leadingButtonStyle}
        >
          <span className="split-button__slot split-button__leading-slot">{leading}</span>
        </VariantButton>
        <VariantButton
          aria-expanded={trailingExpanded}
          aria-label={trailingAriaLabel}
          aria-pressed={trailingIsCheckable ? trailingChecked : undefined}
          className="split-button__button split-button__trailing"
          isDisabled={isTrailingDisabled}
          onPress={handleTrailingPress}
          shapes={trailingButtonShapes}
          size={size}
          style={trailingButtonStyle}
        >
          <span className="split-button__slot split-button__trailing-slot">{trailing}</span>
        </VariantButton>
      </div>
    </div>
  );
}
