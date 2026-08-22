import { rippleTokens } from '@m3/tokens/ripple';
import { stateLayerOpacity } from '@m3/tokens/state';
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
  /** CSS radius that maps the component's Compose focusRingShape. */
  focusRingRadius?: CSSProperties['borderRadius'];
}

export function Ripple({
  controller,
  stateInteraction,
  isHovered = false,
  isFocusVisible = false,
  focusRingRadius,
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
  const focusRing = rippleTokens.focusRing;

  const tokenStyle: RippleStyle = {
    '--_ripple-radius-duration': `${rippleTokens.radiusDurationMs}ms`,
    '--_ripple-hover-duration': `${rippleTokens.hoverTransitionDurationMs}ms`,
    '--_ripple-focus-in-duration': `${rippleTokens.focusInTransitionDurationMs}ms`,
    '--_ripple-fade-in-duration': `${rippleTokens.fadeInDurationMs}ms`,
    '--_ripple-fade-out-duration': `${rippleTokens.fadeOutDurationMs}ms`,
    '--_ripple-radius-easing': rippleTokens.radiusEasing,
    '--_ripple-center-easing': rippleTokens.centerEasing,
    '--_ripple-opacity-easing': rippleTokens.opacityEasing,
    '--_ripple-hover-opacity': stateLayerOpacity.hover,
    '--_ripple-focus-opacity': stateLayerOpacity.focus,
    '--_ripple-pressed-opacity': stateLayerOpacity.pressed,
    '--_ripple-focus-ring-outer-inset': `${focusRing.outerStrokeInset}px`,
    '--_ripple-focus-ring-outer-width': `${focusRing.outerStrokeWidth}px`,
    '--_ripple-focus-ring-inner-inset': `${focusRing.innerStrokeInset}px`,
    '--_ripple-focus-ring-inner-width': `${focusRing.innerStrokeWidth}px`,
    '--_ripple-focus-ring-outer-color': `var(--${focusRing.outerStrokeColorRole})`,
    '--_ripple-focus-ring-inner-color': `var(--${focusRing.innerStrokeColorRole.replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`,
    )})`,
    '--_ripple-focus-ring-in-duration': `${focusRing.focusIn.durationMs}ms`,
    '--_ripple-focus-ring-in-easing': focusRing.focusIn.easing,
    '--_ripple-focus-ring-out-duration': `${focusRing.focusOut.durationMs}ms`,
    '--_ripple-focus-ring-out-easing': focusRing.focusOut.easing,
    ...style,
  };

  return (
    <span
      {...props}
      ref={controller.containerRef}
      aria-hidden="true"
      className={className ? `m3-ripple ${className}` : 'm3-ripple'}
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
      <span className="m3-ripple__state-layer" />
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
            className="m3-ripple__wave"
            data-releasing={wave.isReleasing || undefined}
            style={waveStyle}
          />
        );
      })}
      {rippleFocus === 'inset-ring' ? (
        <span
          className="m3-ripple__focus-ring"
          style={
            focusRingRadius === undefined
              ? undefined
              : { borderRadius: focusRingRadius }
          }
        />
      ) : null}
    </span>
  );
}
