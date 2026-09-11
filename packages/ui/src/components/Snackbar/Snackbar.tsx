import { ComponentSnackbarContainerElevation } from '@m3-ui/tokens';
import '@m3-ui/tokens/snackbar.css';
import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Elevation, type ElevationLevel } from '../../internal/elevation';
import { TextButton, type ButtonProps } from '../Button';
import { IconButton, type IconButtonProps } from '../IconButton';
import { getSnackbarStyle, type SnackbarStyleOptions } from './Snackbar.defaults';
import './snackbar.css';

export interface SnackbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style'>,
    SnackbarStyleOptions {
  children: ReactNode;
  action?: ReactNode;
  dismissAction?: ReactNode;
  actionOnNewLine?: boolean;
  style?: CSSProperties;
}

export type SnackbarActionProps = ButtonProps;
export interface SnackbarDismissActionProps extends Omit<IconButtonProps, 'size'> {
  'aria-label': string;
}

export function Snackbar({
  children,
  action,
  dismissAction,
  actionOnNewLine = false,
  containerColor,
  contentColor,
  actionColor,
  iconColor,
  shadowColor,
  shape,
  maxWidth,
  className,
  style,
  ...props
}: SnackbarProps) {
  const hasNewLineAction = Boolean(actionOnNewLine && action);
  return (
    <div
      {...props}
      className={clsx('snackbar', className)}
      data-action-on-new-line={hasNewLineAction || undefined}
      data-has-action={action ? true : undefined}
      data-has-dismiss={dismissAction ? true : undefined}
      style={{
        ...getSnackbarStyle({ containerColor, contentColor, actionColor, iconColor, shape, maxWidth }),
        ...style,
      }}
    >
      <Elevation
        level={ComponentSnackbarContainerElevation as ElevationLevel}
        shadowColor={shadowColor}
      />
      <div className="snackbar__message" role="status" aria-live="polite" aria-atomic="true">
        {children}
      </div>
      {action || dismissAction ? (
        <div className="snackbar__actions">
          {action ? <div className="snackbar__action">{action}</div> : null}
          {dismissAction ? <div className="snackbar__dismiss">{dismissAction}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Generated Snackbar CSS owns Material action state/color/typography mapping. */
export function SnackbarAction(props: SnackbarActionProps) {
  return <TextButton {...props} />;
}

/** Generated Snackbar CSS owns Material dismiss icon state/color mapping. */
export function SnackbarDismissAction(props: SnackbarDismissActionProps) {
  return <IconButton {...props} size="small" />;
}
