import clsx from 'clsx';
import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import '@m3-ui/tokens/badge.css';
import { getBadgeStyle, getBadgedBoxStyle } from './Badge.defaults';
import './badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge container color. Defaults to the Material 3 error role. */
  containerColor?: CSSProperties['color'];
  /** Content color for a badge with content. Defaults to on-error. */
  contentColor?: CSSProperties['color'];
}

export interface BadgedBoxProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge displayed at the logical top-end of the anchor. */
  badge: ReactNode;
}

export function Badge({
  children,
  className,
  style,
  containerColor,
  contentColor,
  ...props
}: BadgeProps) {
  const hasContent = children !== undefined && children !== null;

  return (
    <span
      {...props}
      data-variant={hasContent ? 'content' : 'dot'}
      className={clsx(
        'badge',
        hasContent ? 'badge--content' : 'badge--dot',
        className,
      )}
      style={{
        ...getBadgeStyle(hasContent, { containerColor, contentColor }),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function BadgedBox({
  badge,
  children,
  className,
  style,
  ...props
}: BadgedBoxProps) {
  return (
    <span
      {...props}
      className={clsx('badged-box', className)}
      style={{ ...getBadgedBoxStyle(), ...style }}
    >
      <span className="badged-box__anchor">{children}</span>
      <span className="badged-box__badge">{badge}</span>
    </span>
  );
}
