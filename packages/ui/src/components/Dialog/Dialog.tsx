import type {
  ComponentProps,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Text as AriaText,
} from 'react-aria-components';
import { useThemePortalContainer } from '../../theme/ThemePortalContext';
import { TextButton, type ButtonProps } from '../Button';
import {
  getDialogActionStyle,
  getDialogOverlayStyle,
  getDialogStyle,
  type DialogOverlayStyleOptions,
  type DialogStyleOptions,
} from './Dialog.defaults';
import './dialog.css';

export type DialogTriggerProps = ComponentProps<typeof AriaDialogTrigger>;
type AriaDialogOverlayProps = ComponentProps<typeof AriaModalOverlay>;
type AriaDialogProps = ComponentProps<typeof AriaDialog>;

export type DialogOverlayProps = Omit<
  AriaDialogOverlayProps,
  'children'
> &
  DialogOverlayStyleOptions & {
    children: ReactNode;
  };

export type DialogProps = Omit<AriaDialogProps, 'style'> &
  DialogStyleOptions & {
    style?: CSSProperties;
  };

export type DialogTitleProps = Omit<
  ComponentProps<typeof AriaHeading>,
  'slot'
>;
export type DialogDescriptionProps = Omit<
  ComponentProps<typeof AriaText>,
  'slot'
>;
export type DialogIconProps = HTMLAttributes<HTMLDivElement>;
export type DialogActionsProps = HTMLAttributes<HTMLDivElement>;
export type DialogActionProps = ButtonProps;
export type DialogCloseActionProps = Omit<ButtonProps, 'slot'>;

/** RAC owns trigger state and focus restoration. */
export function DialogTrigger(props: DialogTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}

/**
 * RAC owns the portal, modal focus scope, Escape handling and outside-dismiss.
 * The Material scrim is painted by a pointer-transparent pseudo element so the
 * React Aria underlay remains the only interactive backdrop.
 */
export function DialogOverlay({
  children,
  isDismissable = true,
  scrimColor,
  scrimOpacity,
  scrimAlpha,
  minWidth,
  maxWidth,
  className,
  style,
  UNSTABLE_portalContainer,
  ...props
}: DialogOverlayProps) {
  const themePortalContainer = useThemePortalContainer();

  return (
    <AriaModalOverlay
      {...props}
      isDismissable={isDismissable}
      UNSTABLE_portalContainer={
        UNSTABLE_portalContainer ?? themePortalContainer ?? undefined
      }
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return ['dialog-overlay', userClassName].filter(Boolean).join(' ');
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getDialogOverlayStyle({
            scrimColor,
            scrimOpacity,
            scrimAlpha,
            minWidth,
            maxWidth,
          }),
          ...(userStyle as CSSProperties | undefined),
        };
      }}
    >
      <AriaModal className="dialog-modal">{children}</AriaModal>
    </AriaModalOverlay>
  );
}

/** Material surface layered on top of RAC Dialog semantics. */
export function Dialog({
  containerColor,
  headlineColor,
  supportingTextColor,
  iconColor,
  actionColor,
  shape,
  shadowColor,
  className,
  style,
  ...props
}: DialogProps) {
  return (
    <AriaDialog
      {...props}
      className={['dialog', className].filter(Boolean).join(' ')}
      style={{
        ...getDialogStyle({
          containerColor,
          headlineColor,
          supportingTextColor,
          iconColor,
          actionColor,
          shape,
          shadowColor,
        }),
        ...style,
      }}
    />
  );
}

export function DialogIcon({ className, ...props }: DialogIconProps) {
  return (
    <div
      {...props}
      className={['dialog__icon', className].filter(Boolean).join(' ')}
    />
  );
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <AriaHeading
      {...props}
      slot="title"
      className={['dialog__title', className].filter(Boolean).join(' ')}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return (
    <AriaText
      {...props}
      slot="description"
      className={['dialog__description', className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

export function DialogActions({ className, ...props }: DialogActionsProps) {
  return (
    <div
      {...props}
      className={['dialog__actions', className].filter(Boolean).join(' ')}
    />
  );
}

/** Reuses the RAC TextButton/ripple engine with Dialog action token roles. */
export function DialogAction({ style, ...props }: DialogActionProps) {
  return (
    <TextButton
      {...props}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getDialogActionStyle({
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

/** RAC's `close` slot closes the overlay without duplicating modal state. */
export function DialogCloseAction(props: DialogCloseActionProps) {
  return <DialogAction {...props} slot="close" />;
}
