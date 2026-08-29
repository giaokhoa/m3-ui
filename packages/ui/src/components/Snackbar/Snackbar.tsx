import clsx from 'clsx';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { Elevation } from '../../internal/elevation';
import {
  TextButton,
  type ButtonProps,
} from '../Button';
import {
  IconButton,
  type IconButtonProps,
} from '../IconButton';
import {
  getSnackbarActionStyle,
  getSnackbarDismissActionStyle,
  getSnackbarStyle,
  snackbarTokens,
  type SnackbarStyleOptions,
} from './Snackbar.defaults';
import './snackbar.css';

export interface SnackbarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'style'>,
    SnackbarStyleOptions {
  children: ReactNode;
  action?: ReactNode;
  dismissAction?: ReactNode;
  /** Places the primary action below the message, matching the Compose long-action layout. */
  actionOnNewLine?: boolean;
  style?: CSSProperties;
}

export type SnackbarActionProps = ButtonProps;

export interface SnackbarDismissActionProps
  extends Omit<IconButtonProps, 'size'> {
  'aria-label': string;
}

/**
 * Visual/semantic Material 3 snackbar primitive. Queueing and timeout policy
 * deliberately belong to a host/state layer rather than this surface.
 */
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
        ...getSnackbarStyle({
          containerColor,
          contentColor,
          actionColor,
          iconColor,
          shape,
          maxWidth,
        }),
        ...style,
      }}
    >
      <Elevation
        className="snackbar__elevation"
        level={snackbarTokens.containerElevation}
        shadowColor={shadowColor ?? snackbarTokens.containerShadowColor}
      />
      <div
        className="snackbar__message"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {children}
      </div>
      {action || dismissAction ? (
        <div className="snackbar__actions">
          {action ? <div className="snackbar__action">{action}</div> : null}
          {dismissAction ? (
            <div className="snackbar__dismiss">{dismissAction}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Uses the existing RAC TextButton interaction/ripple engine with Snackbar colors. */
export function SnackbarAction({ style, ...props }: SnackbarActionProps) {
  return (
    <TextButton
      {...props}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getSnackbarActionStyle({
            isFocusVisible: renderProps.isFocusVisible,
            isHovered: renderProps.isHovered,
            isPressed: renderProps.isPressed,
          }),
          ...(userStyle as CSSProperties | undefined),
        };
      }}
    />
  );
}

/** Uses the existing RAC IconButton engine and locks the Snackbar 24px icon size. */
export function SnackbarDismissAction({
  style,
  ...props
}: SnackbarDismissActionProps) {
  return (
    <IconButton
      {...props}
      size="small"
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getSnackbarDismissActionStyle({
            isFocusVisible: renderProps.isFocusVisible,
            isHovered: renderProps.isHovered,
            isPressed: renderProps.isPressed,
          }),
          ...(userStyle as CSSProperties | undefined),
        };
      }}
    />
  );
}
