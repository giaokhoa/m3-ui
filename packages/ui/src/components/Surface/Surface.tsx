import clsx from 'clsx';
import {
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useRef,
  useState,
} from 'react';
import { Elevation, type ElevationLevel } from '../../internal/elevation';
import {
  Ripple,
  useRipple,
  type RipplePointerType,
  type RipplePressEvent,
} from '../../internal/ripple';
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

const nestedInteractiveSelector =
  'a[href],button,input,select,textarea,summary,[contenteditable="true"],[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"],[role="option"]';

function isNestedInteractive(target: EventTarget | null, root: HTMLElement): boolean {
  if (!(target instanceof Element)) return false;
  const interactive = target.closest(nestedInteractiveSelector);
  return interactive !== null && interactive !== root && root.contains(interactive);
}

function ripplePointerType(pointerType: string): RipplePointerType {
  if (pointerType === 'pen' || pointerType === 'touch') return pointerType;
  return 'mouse';
}

function toRipplePressEvent(
  event: ReactPointerEvent<HTMLDivElement>,
  target: Element,
): RipplePressEvent {
  const bounds = target.getBoundingClientRect();
  return {
    pointerType: ripplePointerType(event.pointerType),
    target,
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
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
  const parentAbsoluteElevation = useAbsoluteTonalElevation();
  const absoluteElevation =
    parentAbsoluteElevation + elevationLevelToPx(tonalElevation);
  const interactive = interaction !== undefined;
  const ripple = useRipple();
  const keyPressed = useRef<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      interactive &&
      !isDisabled &&
      event.target === event.currentTarget &&
      !event.repeat &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      if (event.key === ' ') event.preventDefault();
      keyPressed.current = event.key;
      ripple.onPressStart({
        pointerType: 'keyboard',
        target: ripple.containerRef.current ?? event.currentTarget,
        x: 0,
        y: 0,
      });
      if (event.key === 'Enter') activate(interaction);
    }
    onKeyDown?.(event);
  };

  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      interactive &&
      !isDisabled &&
      keyPressed.current === event.key &&
      event.key === ' '
    ) {
      event.preventDefault();
      activate(interaction);
    }
    if (keyPressed.current === event.key) {
      keyPressed.current = null;
      ripple.onPressEnd();
    }
    onKeyUp?.(event);
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsFocusVisible(event.currentTarget.matches(':focus-visible'));
    }
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsFocusVisible(false);
      keyPressed.current = null;
      ripple.onPressEnd();
    }
    onBlur?.(event);
  };

  return (
    <AbsoluteTonalElevationProvider value={absoluteElevation}>
      <div
        {...props}
        {...semantics}
        aria-disabled={interactive && isDisabled ? true : undefined}
        className={resolvedClassName}
        data-disabled={interactive && isDisabled ? '' : undefined}
        data-interactive={interactive ? '' : undefined}
        onBlur={handleBlur}
        onClick={(event) => {
          if (
            interactive &&
            !isDisabled &&
            !isNestedInteractive(event.target, event.currentTarget)
          ) {
            activate(interaction);
          }
        }}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerCancel={(event) => {
          ripple.onPressEnd();
          onPointerCancel?.(event);
        }}
        onPointerDown={(event) => {
          if (
            interactive &&
            !isDisabled &&
            event.isPrimary &&
            event.button === 0 &&
            !isNestedInteractive(event.target, event.currentTarget)
          ) {
            const target = ripple.containerRef.current ?? event.currentTarget;
            ripple.onPressStart(toRipplePressEvent(event, target));
          }
          onPointerDown?.(event);
        }}
        onPointerEnter={(event) => {
          if (interactive && !isDisabled) setIsHovered(true);
          onPointerEnter?.(event);
        }}
        onPointerLeave={(event) => {
          setIsHovered(false);
          ripple.onPressEnd();
          onPointerLeave?.(event);
        }}
        onPointerUp={(event) => {
          ripple.onPressEnd();
          onPointerUp?.(event);
        }}
        style={resolvedStyle}
        tabIndex={tabIndex ?? (interactive && !isDisabled ? 0 : undefined)}
      >
        <Elevation level={shadowElevation} />
        {interactive ? (
          <Ripple
            controller={ripple}
            focusRingRadius={shape}
            state={{
              isFocusVisible: !isDisabled && isFocusVisible,
              isHovered: !isDisabled && isHovered,
            }}
          />
        ) : null}
        <div className="surface__content">{children}</div>
      </div>
    </AbsoluteTonalElevationProvider>
  );
}
