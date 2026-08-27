import * as token from '@m3-ui/tokens';
import type { CSSProperties, HTMLAttributes } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import type { RippleController } from './useRipple';
import './ripple.css';

type RippleStyle = CSSProperties & Record<`--${string}`, string | number>;
export type RippleStateInteraction = 'focus' | 'hover';

export interface RippleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  controller: RippleController;
  stateInteraction?: RippleStateInteraction | null;
  isHovered?: boolean;
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
  const resolvedStateInteraction =
    stateInteraction === undefined
      ? isFocusVisible
        ? 'focus'
        : isHovered
          ? 'hover'
          : null
      : stateInteraction;
  const hasFocus = isFocusVisible || resolvedStateInteraction === 'focus';

  const tokenStyle: RippleStyle = {
    '--_ripple-radius-duration': token.RippleRadiusDuration,
    '--_ripple-hover-duration': token.RippleHoverTransitionDuration,
    '--_ripple-focus-in-duration': token.RippleFocusInTransitionDuration,
    '--_ripple-fade-in-duration': token.RippleFadeInDuration,
    '--_ripple-fade-out-duration': token.RippleFadeOutDuration,
    '--_ripple-radius-easing': token.RippleRadiusEasing,
    '--_ripple-center-easing': token.RippleCenterEasing,
    '--_ripple-opacity-easing': token.RippleOpacityEasing,
    '--_ripple-hover-opacity': token.StateLayerOpacityHover,
    '--_ripple-focus-opacity': token.StateLayerOpacityFocus,
    '--_ripple-pressed-opacity': token.StateLayerOpacityPressed,
    '--_ripple-focus-ring-outer-inset': token.RippleFocusRingOuterStrokeInset,
    '--_ripple-focus-ring-outer-width': token.RippleFocusRingOuterStrokeWidth,
    '--_ripple-focus-ring-inner-inset': token.RippleFocusRingInnerStrokeInset,
    '--_ripple-focus-ring-inner-width': token.RippleFocusRingInnerStrokeWidth,
    '--_ripple-focus-ring-outer-color': token.RippleFocusRingOuterStrokeColor,
    '--_ripple-focus-ring-inner-color': token.RippleFocusRingInnerStrokeColor,
    '--_ripple-focus-ring-in-duration': token.RippleFocusRingFocusInDuration,
    '--_ripple-focus-ring-in-easing': token.RippleFocusRingFocusInEasing,
    '--_ripple-focus-ring-out-duration': token.RippleFocusRingFocusOutDuration,
    '--_ripple-focus-ring-out-easing': token.RippleFocusRingFocusOutEasing,
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
      className={className ? `ripple ${className}` : 'ripple'}
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
      style={tokenStyle}
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
