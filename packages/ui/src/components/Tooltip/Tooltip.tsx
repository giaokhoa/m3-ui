import clsx from 'clsx';
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Popover as AriaPopover,
  Tooltip as AriaTooltip,
  TooltipTrigger as AriaTooltipTrigger,
  type PopoverProps as AriaPopoverProps,
  type TooltipProps as AriaTooltipProps,
} from 'react-aria-components';
import { Elevation } from '../../internal/elevation';
import { useThemePortalContainer } from '../../theme/ThemePortalContext';
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
    PlainTooltipStyleOptions {}

export type TooltipTriggerProps = ComponentProps<typeof AriaTooltipTrigger>;

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function firstFocusableWithin(element: HTMLElement | null) {
  return element?.querySelector<HTMLElement>(focusableSelector) ?? null;
}

interface RichTooltipContextValue {
  dialogId: string;
  dialogRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  isPersistent: boolean;
  setOpen: (isOpen: boolean) => void;
  triggerRef: RefObject<HTMLSpanElement | null>;
}

const RichTooltipContext = createContext<RichTooltipContextValue | null>(null);

export interface RichTooltipTriggerProps {
  children: ReactNode;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Matches Compose tooltip state guidance: actionable rich tooltips should be
   * persistent and dismiss through an action, Escape or outside interaction.
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
  containerColor,
  contentColor,
  shape,
  maxWidth,
  offset = plainTooltipRuntime.spacingBetweenTooltipAndAnchor,
  className,
  style,
  UNSTABLE_portalContainer,
  ...props
}: PlainTooltipProps) {
  const themePortalContainer = useThemePortalContainer();

  return (
    <AriaTooltip
      {...props}
      offset={offset}
      UNSTABLE_portalContainer={
        UNSTABLE_portalContainer ?? themePortalContainer ?? undefined
      }
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
    />
  );
}

function focusIsWithin(
  triggerRef: RefObject<HTMLSpanElement | null>,
  dialogRef: RefObject<HTMLElement | null>,
) {
  const activeElement = document.activeElement;
  return Boolean(
    activeElement &&
      (triggerRef.current?.contains(activeElement) ||
        dialogRef.current?.contains(activeElement)),
  );
}

/**
 * Rich tooltips are interactive overlays, so they cannot use the ARIA tooltip
 * pattern. This trigger keeps Compose mouse-hover/keyboard-focus invocation,
 * exposes dialog relationships on the real anchor, and keeps persistent
 * hover/focus travel explicit while RAC owns portal placement and Escape.
 */
export function RichTooltipTrigger({
  children,
  isOpen: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  isPersistent = true,
  className,
  style,
}: RichTooltipTriggerProps) {
  const items = Children.toArray(children);
  if (items.length !== 2) {
    throw new Error('RichTooltipTrigger expects exactly one trigger and one RichTooltip child.');
  }

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const triggerRef = useRef<HTMLSpanElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const dialogId = useId();
  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange],
  );

  const context = useMemo<RichTooltipContextValue>(
    () => ({
      dialogId,
      dialogRef,
      isOpen,
      isPersistent,
      setOpen,
      triggerRef,
    }),
    [dialogId, isOpen, isPersistent, setOpen],
  );

  const [trigger, tooltip] = items;
  const enhancedTrigger = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<Record<string, unknown>>, {
        'aria-controls': dialogId,
        'aria-expanded': isOpen,
        'aria-haspopup': 'dialog',
      })
    : trigger;

  return (
    <RichTooltipContext.Provider value={context}>
      <span
        ref={triggerRef}
        className={clsx('rich-tooltip-trigger', className)}
        style={style}
        onBlurCapture={() => {
          window.requestAnimationFrame(() => {
            if (!focusIsWithin(triggerRef, dialogRef)) setOpen(false);
          });
        }}
        onFocusCapture={(event) => {
          const target = event.target as HTMLElement;
          if (!target.matches(':focus-visible')) return;

          setOpen(true);
        }}
        onKeyDownCapture={(event) => {
          if (event.key !== 'Tab' || event.shiftKey || !isOpen) return;

          const firstFocusable = firstFocusableWithin(dialogRef.current);
          if (!firstFocusable) return;

          event.preventDefault();
          firstFocusable.focus();
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') {
            setOpen(true);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'mouse' || isPersistent) return;
          window.requestAnimationFrame(() => {
            if (!dialogRef.current?.matches(':hover')) setOpen(false);
          });
        }}
      >
        {enhancedTrigger}
      </span>
      {tooltip}
    </RichTooltipContext.Provider>
  );
}

export function RichTooltip({
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
  offset = richTooltipRuntime.spacingBetweenTooltipAndAnchor,
  shouldCloseOnInteractOutside,
  className,
  style,
  UNSTABLE_portalContainer,
  ...props
}: RichTooltipProps) {
  const context = useContext(RichTooltipContext);
  const themePortalContainer = useThemePortalContainer();
  if (!context) {
    throw new Error('RichTooltip must be rendered inside RichTooltipTrigger.');
  }

  const titleId = useId();
  const textId = useId();
  const close = useCallback(() => context.setOpen(false), [context.setOpen]);
  const labelledBy = dialogLabel ? undefined : title ? titleId : textId;

  useEffect(() => {
    if (!context.isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        context.triggerRef.current?.contains(target) ||
        context.dialogRef.current?.contains(target)
      ) {
        return;
      }
      if (
        shouldCloseOnInteractOutside &&
        !shouldCloseOnInteractOutside(target)
      ) {
        return;
      }

      context.setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [
    context.dialogRef,
    context.isOpen,
    context.setOpen,
    context.triggerRef,
    shouldCloseOnInteractOutside,
  ]);

  return (
    <AriaPopover
      {...props}
      isNonModal
      isOpen={context.isOpen}
      onOpenChange={context.setOpen}
      triggerRef={context.triggerRef}
      placement={placement}
      offset={offset}
      shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
      UNSTABLE_portalContainer={
        UNSTABLE_portalContainer ?? themePortalContainer ?? undefined
      }
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
      <Elevation
        level={richTooltipTokens.containerElevation}
        shadowColor={shadowColor ?? richTooltipTokens.containerShadowColor}
      />
      {/*
       * RAC Dialog intentionally auto-focuses itself and enables focus containment.
       * Rich tooltips must remain non-modal and keep keyboard focus on their anchor
       * when opened, so the dialog semantics live directly on this DOM section.
       */}
      <section
        ref={context.dialogRef}
        id={context.dialogId}
        role="dialog"
        tabIndex={-1}
        aria-label={dialogLabel}
        aria-labelledby={labelledBy}
        aria-describedby={title ? textId : undefined}
        className="rich-tooltip__dialog"
      >
        <div
          className="rich-tooltip__content"
          onBlurCapture={() => {
            window.requestAnimationFrame(() => {
              if (!focusIsWithin(context.triggerRef, context.dialogRef)) close();
            });
          }}
          onFocusCapture={() => context.setOpen(true)}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') context.setOpen(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== 'mouse' || context.isPersistent) return;
            window.requestAnimationFrame(() => {
              if (!context.triggerRef.current?.matches(':hover')) close();
            });
          }}
        >
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
      </section>
    </AriaPopover>
  );
}
