import clsx from 'clsx';
import { type CSSProperties, type HTMLAttributes, type ReactNode, useRef } from 'react';
import { useFocusRing } from 'react-aria/useFocusRing';
import { useHover } from 'react-aria/useHover';
import { usePress } from 'react-aria/usePress';
import { mergeProps } from 'react-aria';
import { Elevation, type ElevationLevel } from '../../internal/elevation';
import { suppressNestedInteractivePresses } from '../../internal/nestedInteractivePress';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  AbsoluteTonalElevationProvider,
  useAbsoluteTonalElevation,
} from './Surface.context';
import {
  elevationLevelToPx,
  getSurfaceBackground,
  getSurfaceContentColor,
} from './Surface.defaults';
import './surface.css';

export type SurfaceInteraction =
  | { kind: 'clickable'; onPress: () => void }
  | {
      kind: 'selectable';
      selected: boolean;
      onSelect: () => void;
      role?: 'radio' | 'option';
    }
  | {
      kind: 'toggleable';
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      role?: 'checkbox' | 'switch' | 'button';
    };

export interface SurfaceBorder {
  color: CSSProperties['borderColor'];
  width?: CSSProperties['borderWidth'];
  style?: CSSProperties['borderStyle'];
}

export interface SurfaceProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'color' | 'onClick' | 'role'
  > {
  children?: ReactNode;
  color?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  border?: SurfaceBorder;
  tonalElevation?: ElevationLevel;
  shadowElevation?: ElevationLevel;
  interaction?: SurfaceInteraction;
  isDisabled?: boolean;
}

function activate(interaction: SurfaceInteraction | undefined): void {
  if (!interaction) return;
  if (interaction.kind === 'clickable') interaction.onPress();
  if (interaction.kind === 'selectable') interaction.onSelect();
  if (interaction.kind === 'toggleable') {
    interaction.onCheckedChange(!interaction.checked);
  }
}

function interactionSemantics(interaction: SurfaceInteraction | undefined) {
  if (!interaction) return {};
  if (interaction.kind === 'clickable') return { role: 'button' as const };
  if (interaction.kind === 'selectable') {
    const role = interaction.role ?? 'radio';
    return role === 'option'
      ? { role, 'aria-selected': interaction.selected }
      : { role, 'aria-checked': interaction.selected };
  }
  const role = interaction.role ?? 'checkbox';
  return role === 'button'
    ? { role, 'aria-pressed': interaction.checked }
    : { role, 'aria-checked': interaction.checked };
}

export function Surface({
  children,
  className,
  style,
  color,
  contentColor,
  shape = 0,
  border,
  tonalElevation = 'level0',
  shadowElevation = 'level0',
  interaction,
  isDisabled = false,
  tabIndex,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onPointerUp,
  ...props
}: SurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const parentAbsoluteElevation = useAbsoluteTonalElevation();
  const absoluteElevation =
    parentAbsoluteElevation + elevationLevelToPx(tonalElevation);
  const interactive = interaction !== undefined;
  const disabled = interactive && isDisabled;
  const ripple = useRipple();
  const ripplePressProps = ripple.getPressProps();
  const { pressProps } = usePress({
    ref: rootRef,
    isDisabled: !interactive || disabled,
    allowTextSelectionOnPress: true,
    onPress: () => activate(interaction),
    ...ripplePressProps,
  });
  const { hoverProps, isHovered } = useHover({
    isDisabled: !interactive || disabled,
  });
  const { focusProps, isFocusVisible } = useFocusRing();
  const callerEventProps = {
    onBlur,
    onFocus,
    onKeyDown,
    onKeyUp,
    onPointerCancel,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerUp,
  };
  const interactionProps = interactive
    ? mergeProps(
        suppressNestedInteractivePresses(pressProps),
        hoverProps,
        focusProps,
        callerEventProps,
      )
    : callerEventProps;

  const resolvedStyle: CSSProperties = {
    borderRadius: shape,
    background: getSurfaceBackground(color, absoluteElevation),
    color: getSurfaceContentColor(color, contentColor),
    borderColor: border?.color,
    borderWidth: border?.width ?? (border ? 1 : undefined),
    borderStyle: border?.style ?? (border ? 'solid' : undefined),
    ...style,
  };
  const semantics = interactionSemantics(interaction);
  const resolvedClassName = clsx('surface', className);

  return (
    <AbsoluteTonalElevationProvider value={absoluteElevation}>
      <div
        {...props}
        {...semantics}
        {...interactionProps}
        ref={rootRef}
        aria-disabled={disabled ? true : undefined}
        className={resolvedClassName}
        data-disabled={disabled ? '' : undefined}
        data-interactive={interactive ? '' : undefined}
        style={resolvedStyle}
        tabIndex={tabIndex ?? (interactive && !disabled ? 0 : undefined)}
      >
        <Elevation level={shadowElevation} />
        {interactive ? (
          <Ripple
            controller={ripple}
            focusRingRadius={shape}
            state={{
              isFocusVisible: !disabled && isFocusVisible,
              isHovered,
            }}
          />
        ) : null}
        <div className="surface__content">{children}</div>
      </div>
    </AbsoluteTonalElevationProvider>
  );
}
