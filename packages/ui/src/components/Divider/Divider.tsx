import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes } from 'react';
import {
  getDividerStyle,
  type DividerThickness,
} from './Divider.defaults';
import './divider.css';

export interface DividerProps
  extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'aria-orientation' | 'color' | 'role'
  > {
  /** Divider color. Defaults to the Material 3 outline-variant role. */
  color?: CSSProperties['color'];
  /** Divider thickness. Numbers are interpreted as CSS pixels. */
  thickness?: DividerThickness;
}

type DividerOrientation = 'horizontal' | 'vertical';

function DividerRoot({
  orientation,
  className,
  style,
  color,
  thickness,
  ...props
}: DividerProps & { orientation: DividerOrientation }) {
  return (
    <div
      {...props}
      role="separator"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={clsx('divider',
        `divider--${orientation}`,
        className,)}
      style={{
        ...getDividerStyle({ color, thickness }),
        ...style,
      }}
    />
  );
}

export function HorizontalDivider(props: DividerProps) {
  return <DividerRoot {...props} orientation="horizontal" />;
}

export function VerticalDivider(props: DividerProps) {
  return <DividerRoot {...props} orientation="vertical" />;
}
