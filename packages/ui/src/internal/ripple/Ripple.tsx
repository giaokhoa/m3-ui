import '@m3-ui/tokens/ripple.css';
import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import type { RippleController } from './useRipple';
import './ripple.css';

type RippleStyle = CSSProperties & Record<`--${string}`, string | number>;
export type RippleStateInteraction = 'focus' | 'hover';

export interface RippleInteractionState {
  readonly isHovered?: boolean;
  readonly isFocusVisible?: boolean;
}

export interface RippleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  controller: RippleController;
  /** Normalized current state from the RAC/native interaction host. */
  state?: RippleInteractionState;
  /** @deprecated Migrate callers to `state`. */
  stateInteraction?: RippleStateInteraction | null;
  /** @deprecated Migrate callers to `state`. */
  isHovered?: boolean;
  /** @deprecated Migrate callers to `state`. */
  isFocusVisible?: boolean;
  /** CSS length that maps the component's Compose focusRingShape corner radius. */
  focusRingRadius?: string | number;
  /**
   * Inset from the Ripple host to the Compose indication coordinator bounds.
   * This is distinct from the state-layer radius and minimum touch target.
   */
  focusRingInset?: CSSProperties['inset'];
}

function cssLength(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function Ripple({
  controller,
  state,
  stateInteraction,
  isHovered = false,
  isFocusVisible = false,
  focusRingRadius,
  focusRingInset,
  className,
  style,
  ...props
}: RippleProps) {
  const { rippleFocus } = useTheme();
  const currentIsHovered = state?.isHovered ?? isHovered;
  const currentIsFocusVisible = state?.isFocusVisible ?? isFocusVisible;
  const resolvedStateInteraction =
    stateInteraction === undefined
      ? currentIsFocusVisible
        ? 'focus'
        : currentIsHovered
          ? 'hover'
          : null
      : stateInteraction;
  const hasFocus = currentIsFocusVisible || resolvedStateInteraction === 'focus';

  const runtimeStyle: RippleStyle = {
    ...(focusRingRadius === undefined
      ? {}
      : { '--_ripple-focus-ring-radius': cssLength(focusRingRadius) }),
    ...style,
  };

  const focusRingStyle: CSSProperties | undefined =
    focusRingInset === undefined ? undefined : { inset: focusRingInset };

  return (
    <span
      {...props}
      ref={controller.containerRef}
      aria-hidden="true"
      className={clsx('ripple', className)}
      data-focus-ring-radius={focusRingRadius === undefined ? undefined : true}
      data-focus-visible={
        rippleFocus === 'opacity' && resolvedStateInteraction === 'focus'
          ? true
          : undefined
      }
      data-hovered={resolvedStateInteraction === 'hover' || undefined}
      data-inset-focus-visible={
        rippleFocus === 'inset-ring' && hasFocus ? true : undefined
      }
      style={runtimeStyle}
    >
      <span className="ripple__state-layer" />
      {controller.waves.map((wave) => {
        const waveStyle: RippleStyle = {
          '--_ripple-x': `${wave.x}px`,
          '--_ripple-y': `${wave.y}px`,
          '--_ripple-target-x': `${wave.targetX}px`,
          '--_ripple-target-y': `${wave.targetY}px`,
          '--_ripple-diameter': `${wave.diameter}px`,
          '--_ripple-start-scale': wave.startScale,
        };

        return (
          <span
            key={wave.id}
            className="ripple__wave"
            data-releasing={wave.isReleasing || undefined}
            style={waveStyle}
          />
        );
      })}
      {rippleFocus === 'inset-ring' ? (
        <span className="ripple__focus-ring" style={focusRingStyle} />
      ) : null}
    </span>
  );
}
