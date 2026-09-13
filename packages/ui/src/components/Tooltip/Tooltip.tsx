import clsx from 'clsx';
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEventHandler,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useInteractOutside } from 'react-aria/useInteractOutside';
import {
  OverlayArrow as AriaOverlayArrow,
  OverlayTriggerStateContext,
  Popover as AriaPopover,
  PreviewTrigger as AriaPreviewTrigger,
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type PopoverProps as AriaPopoverProps,
  type PreviewTriggerProps as AriaPreviewTriggerProps,
  type TooltipProps as AriaTooltipProps,
} from 'react-aria-components';
import { Elevation } from '../../internal/elevation';
import {
  getPlainTooltipStyle,
  getRichTooltipStyle,
  plainTooltipRuntime,
  richTooltipRuntime,
  richTooltipTokens,
  type PlainTooltipStyleOptions,
  type RichTooltipStyleOptions,
} from './Tooltip.defaults';
import './tooltip.css';

export interface PlainTooltipProps
  extends AriaTooltipProps,
    PlainTooltipStyleOptions {
  /** Render the default Material 3 caret using React Aria OverlayArrow. */
  caret?: boolean;
}

export type TooltipTriggerProps = ComponentProps<typeof AriaTooltipTrigger>;

type TooltipPlacement = NonNullable<AriaTooltipProps['placement']>;

function resolvedTooltipPlacement(
  placement: TooltipPlacement,
  dir: string | undefined,
): TooltipPlacement {
  // RAC resolves logical placement from I18nProvider/useLocale. Only map an
  // explicit per-component dir override, which RAC positioning does not read.
  if (dir === 'rtl' && placement === 'start') return 'right';
  if (dir === 'rtl' && placement === 'end') return 'left';
  if (dir === 'ltr' && placement === 'start') return 'left';
  if (dir === 'ltr' && placement === 'end') return 'right';
  return placement;
}

function TooltipCaret() {
  return <AriaOverlayArrow className="tooltip-caret" aria-hidden="true" />;
}

interface RichTooltipPersistenceContextValue {
  allowDismiss: () => void;
}

const RichTooltipPersistenceContext =
  createContext<RichTooltipPersistenceContextValue | null>(null);

export interface RichTooltipTriggerProps
  extends Pick<AriaPreviewTriggerProps, 'closeDelay' | 'delay' | 'isDisabled'> {
  children: ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Matches Compose TooltipState: persistent rich tooltips only dismiss via
   * explicit action, Escape, or outside interaction.
   */
  isPersistent?: boolean;
  className?: string;
  style?: CSSProperties;
}

type RichPopoverProps = Omit<
  AriaPopoverProps,
  | 'aria-label'
  | 'aria-labelledby'
  | 'children'
  | 'defaultOpen'
  | 'isNonModal'
  | 'isOpen'
  | 'onOpenChange'
  | 'triggerRef'
>;

export interface RichTooltipProps
  extends RichPopoverProps,
    RichTooltipStyleOptions {
  /** Render the default Material 3 caret using React Aria OverlayArrow. */
  caret?: boolean;
  title?: ReactNode;
  action?: ReactNode | ((close: () => void) => ReactNode);
  children: ReactNode;
  /** Accessible dialog name override when visible title/text is not sufficient. */
  dialogLabel?: string;
}

/**
 * React Aria owns hover/focus timing, accessible description wiring, portal
 * placement, collision handling and web input behavior. Material owns the
 * visual surface and the Compose-derived spacing/motion defaults.
 */
export function TooltipTrigger(props: TooltipTriggerProps) {
  return <AriaTooltipTrigger {...props} />;
}

export function PlainTooltip({
  caret = false,
  children,
  containerColor,
  contentColor,
  shape,
  maxWidth,
  placement = 'top',
  dir,
  offset = plainTooltipRuntime.spacingBetweenTooltipAndAnchor,
  className,
  style,
  UNSTABLE_portalContainer,
  ...props
}: PlainTooltipProps) {

  return (
    <AriaTooltip
      {...props}
      data-caret={caret || undefined}
      dir={dir}
      placement={resolvedTooltipPlacement(placement, dir)}
      offset={offset}
      UNSTABLE_portalContainer={UNSTABLE_portalContainer}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return clsx('plain-tooltip', userClassName);
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
    >
      {(renderProps) => (
        <>
          {caret ? <TooltipCaret /> : null}
          {typeof children === 'function' ? children(renderProps) : children}
        </>
      )}
    </AriaTooltip>
  );
}

interface PersistentPreviewTriggerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  isOpen?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  delay?: number;
  closeDelay?: number;
  isDisabled?: boolean;
}

function PersistentPreviewTrigger({
  children,
  className,
  style,
  isOpen: controlledOpen,
  defaultOpen,
  onOpenChange,
  delay,
  closeDelay,
  isDisabled,
}: PersistentPreviewTriggerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const allowDismissRef = useRef(false);

  const allowDismiss = useCallback(() => {
    allowDismissRef.current = true;
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !allowDismissRef.current) return;
      allowDismissRef.current = false;

      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const persistenceContext = useMemo(
    () => ({ allowDismiss }),
    [allowDismiss],
  );

  const handleKeyDownCapture: KeyboardEventHandler<HTMLSpanElement> = (event) => {
    if (event.key === 'Escape') allowDismiss();
  };

  return (
    <RichTooltipPersistenceContext.Provider value={persistenceContext}>
      <span
        className={clsx('rich-tooltip-trigger', className)}
        style={style}
        onKeyDownCapture={handleKeyDownCapture}
      >
        <AriaPreviewTrigger
          isOpen={isOpen}
          onOpenChange={handleOpenChange}
          delay={delay}
          closeDelay={closeDelay}
          isDisabled={isDisabled}
        >
          {children}
        </AriaPreviewTrigger>
      </span>
    </RichTooltipPersistenceContext.Provider>
  );
}

/**
 * Rich tooltips delegate hover, focus, safe-area, Tab, long-press/touch,
 * Escape and focus restoration to RAC PreviewTrigger. The persistent adapter
 * only filters automatic hover/focus close requests because PreviewTrigger
 * does not expose Compose's explicit-dismiss persistence mode.
 */
export function RichTooltipTrigger({
  children,
  isOpen,
  defaultOpen = false,
  onOpenChange,
  isPersistent = true,
  className,
  style,
  delay,
  closeDelay,
  isDisabled,
}: RichTooltipTriggerProps) {
  if (isPersistent) {
    return (
      <PersistentPreviewTrigger
        isOpen={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        className={className}
        style={style}
        delay={delay}
        closeDelay={closeDelay}
        isDisabled={isDisabled}
      >
        {children}
      </PersistentPreviewTrigger>
    );
  }

  return (
    <span className={clsx('rich-tooltip-trigger', className)} style={style}>
      <AriaPreviewTrigger
        isOpen={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        delay={delay}
        closeDelay={closeDelay}
        isDisabled={isDisabled}
      >
        {children}
      </AriaPreviewTrigger>
    </span>
  );
}

export function RichTooltip({
  caret = false,
  title,
  action,
  children,
  dialogLabel,
  containerColor,
  contentColor,
  titleColor,
  actionColor,
  shadowColor,
  shape,
  maxWidth,
  placement = 'top',
  dir,
  offset = richTooltipRuntime.spacingBetweenTooltipAndAnchor,
  shouldCloseOnInteractOutside,
  render,
  className,
  style,
  UNSTABLE_portalContainer,
  ...props
}: RichTooltipProps) {
  const persistence = useContext(RichTooltipPersistenceContext);
  const overlayState = useContext(OverlayTriggerStateContext);
  const popoverRef = useRef<HTMLDivElement>(null);

  if (!overlayState) {
    throw new Error('RichTooltip must be rendered inside RichTooltipTrigger.');
  }

  const titleId = useId();
  const textId = useId();

  const close = useCallback(() => {
    persistence?.allowDismiss();
    overlayState.close();
  }, [overlayState, persistence]);

  useInteractOutside({
    ref: popoverRef,
    isDisabled: !persistence,
    onInteractOutside: (event) => {
      const target = event.target as Element | null;
      if (!target || shouldCloseOnInteractOutside?.(target) === false) return;

      // PreviewTrigger intentionally renders a non-modal Popover, for which
      // usePopover disables outside dismissal. Material persistent rich
      // tooltips still dismiss outside, so use React Aria's interaction hook
      // rather than recreating document-level pointer handling here.
      persistence?.allowDismiss();
      overlayState.close();
    },
  });

  const labelledBy = dialogLabel ? undefined : title ? titleId : textId;

  return (
    <AriaPopover
      {...props}
      dir={dir}
      placement={resolvedTooltipPlacement(placement, dir)}
      offset={offset}
      ref={popoverRef}
      render={(domProps, renderProps) => {
        const popoverProps = {
          ...domProps,
          onKeyDownCapture: (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Escape') persistence?.allowDismiss();
            domProps.onKeyDownCapture?.(event);
          },
        };
        return render ? render(popoverProps, renderProps) : <div {...popoverProps} />;
      }}
      UNSTABLE_portalContainer={UNSTABLE_portalContainer}
      aria-label={dialogLabel}
      aria-labelledby={labelledBy}
      aria-describedby={title ? textId : undefined}
      data-caret={caret || undefined}
      data-has-action={action ? true : undefined}
      data-has-title={title ? true : undefined}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return clsx('rich-tooltip', userClassName);
      }}
      style={(renderProps) => {
        const userStyle =
          typeof style === 'function' ? style(renderProps) : style;
        return {
          ...getRichTooltipStyle({
            containerColor,
            contentColor,
            titleColor,
            actionColor,
            shape,
            maxWidth,
          }),
          ...(userStyle as CSSProperties | undefined),
        };
      }}
    >
      {caret ? <TooltipCaret /> : null}
      <Elevation
        level={richTooltipTokens.containerElevation}
        shadowColor={shadowColor ?? richTooltipTokens.containerShadowColor}
      />
      <div className="rich-tooltip__content">
        {title ? (
          <div id={titleId} className="rich-tooltip__title">
            {title}
          </div>
        ) : null}
        <div id={textId} className="rich-tooltip__text">
          {children}
        </div>
        {action ? (
          <div className="rich-tooltip__action">
            {typeof action === 'function' ? action(close) : action}
          </div>
        ) : null}
      </div>
    </AriaPopover>
  );
}
