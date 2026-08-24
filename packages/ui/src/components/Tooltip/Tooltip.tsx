import type { ComponentProps, CSSProperties } from 'react';
import {
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type TooltipProps as AriaTooltipProps,
} from 'react-aria-components';
import {
  getPlainTooltipStyle,
  plainTooltipRuntime,
  type PlainTooltipStyleOptions,
} from './Tooltip.defaults';
import './tooltip.css';

export interface PlainTooltipProps
  extends AriaTooltipProps,
    PlainTooltipStyleOptions {}

export type TooltipTriggerProps = ComponentProps<typeof AriaTooltipTrigger>;

/**
 * React Aria owns hover/focus timing, accessible description wiring, portal
 * placement, collision handling and web input behavior. Material owns the
 * visual surface and the Compose-derived spacing/motion defaults.
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
  return <AriaTooltipTrigger {...props} />;
}

export function PlainTooltip({
  containerColor,
  contentColor,
  shape,
  maxWidth,
  offset = plainTooltipRuntime.spacingBetweenTooltipAndAnchor,
  className,
  style,
  ...props
}: PlainTooltipProps) {
  return (
    <AriaTooltip
      {...props}
      offset={offset}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return ['plain-tooltip', userClassName].filter(Boolean).join(' ');
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getPlainTooltipStyle({
            containerColor,
            contentColor,
            shape,
            maxWidth,
          }),
          ...(userStyle as CSSProperties | undefined),
        };
      }}
    />
  );
}
