import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getBrandedExtendedFabStyle,
  getBrandedFabStyle,
  getExtendedFabStyle,
  getFabStyle,
} from './Fab.defaults';
import {
  endFabInteraction,
  getFabElevationMotion,
  getFabInteractionElevationLevel,
  latestFabInteraction,
  latestFabStateLayerInteraction,
  startFabInteraction,
  type FabInteraction,
} from './Fab.interactions';
import type {
  ExtendedFabSize,
  FabElevation,
  FabSize,
  FabVariant,
} from './Fab.types';
import './fab.css';

export interface FloatingActionButtonProps
  extends Omit<AriaButtonProps, 'children' | 'isDisabled'> {
  children: ReactNode;
  /**
   * Material FAB color family. Container-role variants preserve Compose token
   * families; surface/solid variants preserve the pinned Material Web API.
   */
  variant?: FabVariant;
  containerColor?: CSSProperties['backgroundColor'];
  contentColor?: CSSProperties['color'];
  shape?: CSSProperties['borderRadius'];
  elevation?: FabElevation;
}

export interface BrandedFloatingActionButtonProps
  extends Omit<FloatingActionButtonProps, 'variant' | 'contentColor'> {
  /** Material Web branded FAB label. Supplying it renders the current extended branded form. */
  label?: ReactNode;
}

export interface ExtendedFloatingActionButtonProps
  extends Omit<FloatingActionButtonProps, 'children'> {
  children: ReactNode;
  /** Optional icon. Without one this mirrors Compose's text-only Extended FAB overload. */
  icon?: ReactNode;
  /** Only applies when an icon is present; text-only Extended FABs remain expanded. */
  expanded?: boolean;
}

interface FabImplProps extends FloatingActionButtonProps {
  size: FabSize;
  branded?: boolean;
}

interface ExtendedFabImplProps extends ExtendedFloatingActionButtonProps {
  size: ExtendedFabSize;
  branded?: boolean;
}

type FabInteractionCallbacks = Pick<
  AriaButtonProps,
  'onBlur' | 'onFocus' | 'onHoverEnd' | 'onHoverStart' | 'onPressEnd' | 'onPressStart'
>;

function useFabInteractions({
  onBlur,
  onFocus,
  onHoverEnd,
  onHoverStart,
  onPressEnd,
  onPressStart,
}: FabInteractionCallbacks) {
  const ripple = useRipple();
  const [activeInteractions, setActiveInteractions] = useState<FabInteraction[]>([]);
  const startInteraction = (interaction: FabInteraction) => {
    setActiveInteractions((active) => startFabInteraction(active, interaction));
  };
  const endInteraction = (interaction: FabInteraction) => {
    setActiveInteractions((active) => endFabInteraction(active, interaction));
  };
  const handlePressStart: AriaButtonProps['onPressStart'] = (event) => {
    startInteraction('press');
    ripple.onPressStart(event);
    onPressStart?.(event);
  };
  const handlePressEnd: AriaButtonProps['onPressEnd'] = (event) => {
    endInteraction('press');
    ripple.onPressEnd();
    onPressEnd?.(event);
  };
  const handleHoverStart: AriaButtonProps['onHoverStart'] = (event) => {
    startInteraction('hover');
    onHoverStart?.(event);
  };
  const handleHoverEnd: AriaButtonProps['onHoverEnd'] = (event) => {
    endInteraction('hover');
    onHoverEnd?.(event);
  };
  const handleFocus: AriaButtonProps['onFocus'] = (event) => {
    startInteraction('focus');
    onFocus?.(event);
  };
  const handleBlur: AriaButtonProps['onBlur'] = (event) => {
    endInteraction('focus');
    onBlur?.(event);
  };
  const interaction = latestFabInteraction(activeInteractions);
  const previousInteractionRef = useRef<FabInteraction | null>(null);
  const previousInteraction = previousInteractionRef.current;
  useEffect(() => {
    previousInteractionRef.current = interaction;
  }, [interaction]);

  return {
    activeInteractions,
    interaction,
    previousInteraction,
    ripple,
    handleBlur,
    handleFocus,
    handleHoverEnd,
    handleHoverStart,
    handlePressEnd,
    handlePressStart,
  };
}

function FabImpl({
  size,
  branded = false,
  children,
  className,
  style,
  variant = 'primaryContainer',
  containerColor,
  contentColor,
  shape,
  elevation = 'default',
  onBlur,
  onFocus,
  onHoverEnd,
  onHoverStart,
  onPressStart,
  onPressEnd,
  ...props
}: FabImplProps) {
  const interactions = useFabInteractions({
    onBlur,
    onFocus,
    onHoverEnd,
    onHoverStart,
    onPressStart,
    onPressEnd,
  });

  return (
    <AriaButton
      {...props}
      data-elevation={elevation}
      data-interaction={interactions.interaction ?? undefined}
      data-size={size}
      data-variant={branded ? 'branded' : variant}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        const baseClassName = branded ? 'fab fab--branded' : 'fab';
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        const tokenStyle = branded
          ? getBrandedFabStyle({ elevation, containerColor, shape })
          : getFabStyle(size, {
              variant,
              elevation,
              containerColor,
              contentColor,
              shape,
            });
        return {
          ...tokenStyle,
          ...userStyle,
        };
      }}
      onBlur={interactions.handleBlur}
      onFocus={interactions.handleFocus}
      onHoverEnd={interactions.handleHoverEnd}
      onHoverStart={interactions.handleHoverStart}
      onPressEnd={interactions.handlePressEnd}
      onPressStart={interactions.handlePressStart}
    >
      {(renderProps) => {
        const level = getFabInteractionElevationLevel(
          elevation,
          interactions.interaction,
        );
        const motion = getFabElevationMotion(
          interactions.interaction,
          interactions.previousInteraction,
        );

        return (
          <span className="fab__visual">
            <Elevation
              level={level}
              style={{
                transitionDuration: motion ? `${motion.durationMs}ms` : undefined,
                transitionProperty: motion ? 'box-shadow' : undefined,
                transitionTimingFunction: motion?.easing,
              }}
            />
            <span className="fab__surface">
              <Ripple
                controller={interactions.ripple}
                focusRingRadius="var(--_fab-container-radius)"
                isFocusVisible={renderProps.isFocusVisible}
                stateInteraction={latestFabStateLayerInteraction(
                  interactions.activeInteractions,
                  renderProps.isFocusVisible,
                )}
              />
              <span aria-hidden="true" className="fab__icon">{children}</span>
            </span>
          </span>
        );
      }}
    </AriaButton>
  );
}

function ExtendedFabImpl({
  size,
  branded = false,
  children,
  icon,
  expanded = true,
  className,
  style,
  variant = 'primaryContainer',
  containerColor,
  contentColor,
  shape,
  elevation = 'default',
  onBlur,
  onFocus,
  onHoverEnd,
  onHoverStart,
  onPressStart,
  onPressEnd,
  'aria-label': ariaLabel,
  ...props
}: ExtendedFabImplProps) {
  const hasIcon = icon !== undefined && icon !== null;
  const resolvedExpanded = hasIcon ? expanded : true;
  const collapsedLabel =
    hasIcon && !resolvedExpanded && typeof children === 'string' ? children : undefined;
  const interactions = useFabInteractions({
    onBlur,
    onFocus,
    onHoverEnd,
    onHoverStart,
    onPressStart,
    onPressEnd,
  });

  return (
    <AriaButton
      {...props}
      aria-label={ariaLabel ?? collapsedLabel}
      data-elevation={elevation}
      data-expanded={resolvedExpanded || undefined}
      data-extended="true"
      data-has-icon={hasIcon || undefined}
      data-interaction={interactions.interaction ?? undefined}
      data-size={size}
      data-variant={branded ? 'branded' : variant}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        const baseClassName = branded
          ? 'fab fab--extended fab--branded-extended'
          : 'fab fab--extended';
        return userClassName ? `${baseClassName} ${userClassName}` : baseClassName;
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        const tokenStyle = branded
          ? getBrandedExtendedFabStyle({ elevation, containerColor, shape })
          : getExtendedFabStyle(size, {
              variant,
              elevation,
              containerColor,
              contentColor,
              shape,
            });
        return {
          ...tokenStyle,
          ...userStyle,
        };
      }}
      onBlur={interactions.handleBlur}
      onFocus={interactions.handleFocus}
      onHoverEnd={interactions.handleHoverEnd}
      onHoverStart={interactions.handleHoverStart}
      onPressEnd={interactions.handlePressEnd}
      onPressStart={interactions.handlePressStart}
    >
      {(renderProps) => {
        const level = getFabInteractionElevationLevel(
          elevation,
          interactions.interaction,
        );
        const motion = getFabElevationMotion(
          interactions.interaction,
          interactions.previousInteraction,
        );

        return (
          <span className="fab__visual">
            <Elevation
              level={level}
              style={{
                transitionDuration: motion ? `${motion.durationMs}ms` : undefined,
                transitionProperty: motion ? 'box-shadow' : undefined,
                transitionTimingFunction: motion?.easing,
              }}
            />
            <span className="fab__surface">
              <Ripple
                controller={interactions.ripple}
                focusRingRadius="var(--_fab-container-radius)"
                isFocusVisible={renderProps.isFocusVisible}
                stateInteraction={latestFabStateLayerInteraction(
                  interactions.activeInteractions,
                  renderProps.isFocusVisible,
                )}
              />
              <span className="fab__content">
                {hasIcon ? (
                  <span aria-hidden="true" className="fab__icon">{icon}</span>
                ) : null}
                <span
                  aria-hidden={hasIcon && !resolvedExpanded ? true : undefined}
                  className="fab__label"
                >
                  {children}
                </span>
              </span>
            </span>
          </span>
        );
      }}
    </AriaButton>
  );
}

export function FloatingActionButton(props: FloatingActionButtonProps) {
  return <FabImpl {...props} size="baseline" />;
}

export function SmallFloatingActionButton(props: FloatingActionButtonProps) {
  return <FabImpl {...props} size="small" />;
}

export function MediumFloatingActionButton(props: FloatingActionButtonProps) {
  return <FabImpl {...props} size="medium" />;
}

export function LargeFloatingActionButton(props: FloatingActionButtonProps) {
  return <FabImpl {...props} size="large" />;
}

export function BrandedFloatingActionButton({
  label,
  children,
  ...props
}: BrandedFloatingActionButtonProps) {
  return label === undefined ? (
    <FabImpl {...props} branded size="baseline">{children}</FabImpl>
  ) : (
    <ExtendedFabImpl {...props} branded icon={children} size="baseline">
      {label}
    </ExtendedFabImpl>
  );
}

export function ExtendedFloatingActionButton(props: ExtendedFloatingActionButtonProps) {
  return <ExtendedFabImpl {...props} size="baseline" />;
}

export function SmallExtendedFloatingActionButton(props: ExtendedFloatingActionButtonProps) {
  return <ExtendedFabImpl {...props} size="small" />;
}

export function MediumExtendedFloatingActionButton(props: ExtendedFloatingActionButtonProps) {
  return <ExtendedFabImpl {...props} size="medium" />;
}

export function LargeExtendedFloatingActionButton(props: ExtendedFloatingActionButtonProps) {
  return <ExtendedFabImpl {...props} size="large" />;
}
