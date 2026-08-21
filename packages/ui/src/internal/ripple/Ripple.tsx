import { rippleTokens } from '@m3/tokens/ripple';
import { stateLayerOpacity } from '@m3/tokens/state';
import type { CSSProperties, HTMLAttributes } from 'react';
import type { RippleController } from './useRipple';
import './ripple.css';

type RippleStyle = CSSProperties & Record<`--${string}`, string | number>;

export interface RippleProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  controller: RippleController;
  isHovered?: boolean;
  isFocusVisible?: boolean;
}

export function Ripple({
  controller,
  isHovered = false,
  isFocusVisible = false,
  className,
  style,
  ...props
}: RippleProps) {
  const tokenStyle: RippleStyle = {
    '--_ripple-grow-duration': `${rippleTokens.growDurationMs}ms`,
    '--_ripple-fade-in-duration': `${rippleTokens.fadeInDurationMs}ms`,
    '--_ripple-fade-out-duration': `${rippleTokens.fadeOutDurationMs}ms`,
    '--_ripple-easing': rippleTokens.easing,
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
      data-focus-visible={isFocusVisible || undefined}
      data-hovered={isHovered || undefined}
      style={tokenStyle}
    >
      <span className="m3-ripple__state-layer" />
      {controller.waves.map((wave) => {
        const waveStyle: RippleStyle = {
          '--_ripple-x': `${wave.x}px`,
          '--_ripple-y': `${wave.y}px`,
          '--_ripple-diameter': `${wave.diameter}px`,
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
