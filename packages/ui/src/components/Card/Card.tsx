import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getCardElevationLevel,
  getCardElevationMotion,
  getCardStyle,
} from './Card.defaults';
import {
  endCardInteraction,
  latestCardInteraction,
  latestCardStateLayerInteraction,
  startCardInteraction,
  type CardInteraction,
} from './Card.interactions';
import type { CardVariant } from './Card.tokens';
import './card.css';

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  children?: ReactNode;
  onPress?: () => void;
  isDisabled?: boolean;
  shape?: CSSProperties['borderRadius'];
}

interface CardImplProps extends CardProps { variant: CardVariant; }
const nestedInteractiveSelector =
  'a[href],button,input,select,textarea,summary,[contenteditable="true"],[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"]';

function isNestedInteractive(target: EventTarget | null, root: HTMLElement): boolean {
  if (!(target instanceof Element)) return false;
  const interactive = target.closest(nestedInteractiveSelector);
  return interactive !== null && interactive !== root && root.contains(interactive);
}
function variantClassName(variant: CardVariant): string { return `m3-card--${variant}`; }

function CardImpl({
  variant, children, className, style, onPress, isDisabled = false, shape, role, tabIndex,
  onBlur, onFocus, onKeyDown, onKeyUp, onPointerCancel, onPointerDown, onPointerEnter,
  onPointerLeave, onPointerUp, ...props
}: CardImplProps) {
  const interactive = onPress !== undefined;
  const disabled = interactive && isDisabled;
  const ripple = useRipple();
  const [activeInteractions, setActiveInteractions] = useState<CardInteraction[]>([]);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const pointerPressRef = useRef(false);
  const keyboardPressRef = useRef<'Enter' | ' ' | null>(null);
  const startInteraction = (interaction: CardInteraction) => setActiveInteractions((active) => startCardInteraction(active, interaction));
  const endInteraction = (interaction: CardInteraction) => setActiveInteractions((active) => endCardInteraction(active, interaction));
  const endPress = () => { endInteraction('press'); ripple.onPressEnd(); };
  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => { if (interactive && !disabled) startInteraction('hover'); onPointerEnter?.(event); };
  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => { if (interactive && !disabled) { endInteraction('hover'); if (pointerPressRef.current) { pointerPressRef.current = false; endPress(); } } onPointerLeave?.(event); };
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (interactive && !disabled && event.button === 0 && !isNestedInteractive(event.target, event.currentTarget)) {
      pointerPressRef.current = true;
      startInteraction('press');
      const bounds = event.currentTarget.getBoundingClientRect();
      ripple.onPressStart({ pointerType: event.pointerType === 'touch' || event.pointerType === 'pen' ? event.pointerType : 'mouse', target: event.currentTarget, x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    }
    onPointerDown?.(event);
  };
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => { if (pointerPressRef.current) { pointerPressRef.current = false; endPress(); } onPointerUp?.(event); };
  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => { if (pointerPressRef.current) { pointerPressRef.current = false; endPress(); } onPointerCancel?.(event); };
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => { if (interactive && !disabled && event.target === event.currentTarget) { startInteraction('focus'); setIsFocusVisible(event.currentTarget.matches(':focus-visible')); } onFocus?.(event); };
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) { endInteraction('focus'); setIsFocusVisible(false); keyboardPressRef.current = null; endPress(); } onBlur?.(event); };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (interactive && !disabled && event.target === event.currentTarget && !event.repeat && (event.key === 'Enter' || event.key === ' ')) {
      if (event.key === ' ') event.preventDefault();
      keyboardPressRef.current = event.key;
      startInteraction('press');
      ripple.onPressStart({ pointerType: 'keyboard', target: event.currentTarget, x: 0, y: 0 });
      if (event.key === 'Enter') onPress?.();
    }
    onKeyDown?.(event);
  };
  const handleKeyUp = (event: KeyboardEvent<HTMLDivElement>) => { if (keyboardPressRef.current === event.key) { if (event.key === ' ') { event.preventDefault(); onPress?.(); } keyboardPressRef.current = null; endPress(); } onKeyUp?.(event); };
  const interaction = latestCardInteraction(activeInteractions);
  const previousInteractionRef = useRef<CardInteraction | null>(null);
  const previousInteraction = previousInteractionRef.current;
  useEffect(() => { previousInteractionRef.current = interaction; }, [interaction]);
  useEffect(() => {
    if (disabled) {
      setActiveInteractions([]);
      setIsFocusVisible(false);
      pointerPressRef.current = false;
      keyboardPressRef.current = null;
      ripple.onPressEnd();
    }
  }, [disabled, ripple.onPressEnd]);
  const elevationLevel = getCardElevationLevel(variant, disabled, interaction);
  const elevationMotion = getCardElevationMotion(disabled, interaction, previousInteraction);
  const tokenStyle = getCardStyle(variant, { isDisabled: disabled, shape });
  const baseClassName = `m3-card ${variantClassName(variant)}`;
  const resolvedClassName = className ? `${baseClassName} ${className}` : baseClassName;

  return (
    <div
      {...props}
      aria-disabled={disabled || undefined}
      className={resolvedClassName}
      data-disabled={disabled || undefined}
      data-focused={activeInteractions.includes('focus') || undefined}
      data-hovered={activeInteractions.includes('hover') || undefined}
      data-interactive={interactive || undefined}
      data-pressed={activeInteractions.includes('press') || undefined}
      onBlur={handleBlur}
      onClick={(event) => {
        if (interactive && !disabled && !isNestedInteractive(event.target, event.currentTarget)) {
          if (!pointerPressRef.current && event.detail === 0) {
            ripple.onPressStart({ pointerType: 'virtual', target: event.currentTarget, x: 0, y: 0 });
            ripple.onPressEnd();
          }
          onPress?.();
        }
      }}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      role={role}
      style={{ ...tokenStyle, ...style }}
      tabIndex={tabIndex ?? (interactive ? (disabled ? -1 : 0) : undefined)}
    >
      <Elevation className="m3-card__elevation" level={elevationLevel} style={{ transitionDuration: `${elevationMotion.durationMs}ms`, transitionProperty: 'box-shadow', transitionTimingFunction: elevationMotion.easing }} />
      <div className="m3-card__surface">
        {interactive ? (
          <Ripple controller={ripple} focusRingRadius="var(--_card-container-radius)" isFocusVisible={isFocusVisible} stateInteraction={latestCardStateLayerInteraction(activeInteractions, isFocusVisible)} />
        ) : null}
        <div className="m3-card__content">{children}</div>
      </div>
    </div>
  );
}

export function Card(props: CardProps) { return <CardImpl {...props} variant="filled" />; }
export function ElevatedCard(props: CardProps) { return <CardImpl {...props} variant="elevated" />; }
export function OutlinedCard(props: CardProps) { return <CardImpl {...props} variant="outlined" />; }
