import { rippleTokens } from '@m3/tokens/ripple';
import { stateLayerOpacity } from '@m3/tokens/state';
import type { CSSProperties, HTMLAttributes } from 'react';
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
}

export function Ripple({
  controller,
  stateInteraction,
  isHovered = false,
  isFocusVisible = false,
  className,
  style,
  ...props
}: RippleProps) {
  const resolvedStateInteraction =
    stateInteraction === undefined
      ? isFocusVisible
        ? 'focus'
        : isHovered
          ? 'hover'
          : null
      : stateInteraction;

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
    ...style,
  };

  return (
    <span
      {...props}
      ref={controller.containerRef}
      aria-hidden="true"
      className={className ? `m3-ripple ${className}` : 'm3-ripple'}
      data-focus-visible={resolvedStateInteraction === 'focus' || undefined}
      data-hovered={resolvedStateInteraction === 'hover' || undefined}
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
    </span>
  );
}
