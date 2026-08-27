import {
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useRef,
} from 'react';
import { Elevation, type ElevationLevel } from '../../internal/elevation';
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
  onKeyDown,
  onKeyUp,
  ...props
}: SurfaceProps) {
  const parentAbsoluteElevation = useAbsoluteTonalElevation();
  const absoluteElevation =
    parentAbsoluteElevation + elevationLevelToPx(tonalElevation);
  const interactive = interaction !== undefined;
  const keyPressed = useRef<string | null>(null);
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
  const resolvedClassName = className ? `surface ${className}` : 'surface';

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
    if (keyPressed.current === event.key) keyPressed.current = null;
    onKeyUp?.(event);
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
        onClick={(event) => {
          if (
            interactive &&
            !isDisabled &&
            !isNestedInteractive(event.target, event.currentTarget)
          ) {
            activate(interaction);
          }
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        style={resolvedStyle}
        tabIndex={tabIndex ?? (interactive && !isDisabled ? 0 : undefined)}
      >
        <Elevation
          className="surface__elevation"
          level={shadowElevation}
          shadowColor="var(--shadow)"
        />
        <div className="surface__content">{children}</div>
      </div>
    </AbsoluteTonalElevationProvider>
  );
}
