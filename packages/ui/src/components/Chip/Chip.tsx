import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Checkbox as AriaCheckbox,
  type ButtonProps as AriaButtonProps,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';
import '@m3-ui/tokens/chip.css';
import { Elevation } from '../../internal/elevation';
import { Ripple, useRipple } from '../../internal/ripple';
import { getChipElevationMotion, getChipRootStyle, getChipStyle, resolveChipElevation, type ChipShapeValue, type ChipShapes } from './Chip.defaults';
import { endChipInteraction, latestChipInteraction, latestChipStateLayerInteraction, startChipInteraction, type ChipInteraction } from './Chip.interactions';
import type { ChipVariant } from './Chip.tokens';
import './chip.css';

interface VisualSlots { readonly leadingIcon?: ReactNode; readonly trailingIcon?: ReactNode; readonly avatar?: ReactNode; }
export interface ActionChipProps extends Omit<AriaButtonProps, 'children'>, VisualSlots { children?: AriaButtonProps['children']; shape?: ChipShapeValue; }
export interface SuggestionChipProps extends Omit<ActionChipProps, 'leadingIcon' | 'trailingIcon'> { icon?: ReactNode; }
export interface SelectableChipProps extends Omit<AriaCheckboxProps, 'children'>, VisualSlots { children?: AriaCheckboxProps['children']; shape?: ChipShapeValue; shapes?: ChipShapes; }
export interface InputChipProps extends SelectableChipProps {}
interface ActionChipImplProps extends ActionChipProps { variant: 'assist' | 'elevatedAssist' | 'suggestion' | 'elevatedSuggestion'; }
interface SelectableChipImplProps extends SelectableChipProps { variant: 'filter' | 'elevatedFilter' | 'input'; }

function variantClassName(variant: ChipVariant): string { return `chip--${variant.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`; }
function resolveButtonChildren(children: AriaButtonProps['children'], renderProps: Parameters<Exclude<AriaButtonProps['children'], ReactNode>>[0]) { return typeof children === 'function' ? children(renderProps) : children; }
function resolveCheckboxChildren(children: AriaCheckboxProps['children'], renderProps: Parameters<Exclude<AriaCheckboxProps['children'], ReactNode>>[0]) { return typeof children === 'function' ? children(renderProps) : children; }

function ChipVisual({ variant, label, slots, controller, activeInteractions, previousInteraction, isDisabled, isSelected, isFocusVisible, shape, shapes }: { variant: ChipVariant; label: ReactNode; slots: VisualSlots; controller: ReturnType<typeof useRipple>; activeInteractions: readonly ChipInteraction[]; previousInteraction: ChipInteraction | null; isDisabled: boolean; isSelected: boolean; isFocusVisible: boolean; shape?: ChipShapeValue; shapes?: ChipShapes; }) {
  const interaction = latestChipInteraction(activeInteractions);
  const state = { isDisabled, isSelected, interaction, previousInteraction };
  const motion = getChipElevationMotion(state);
  const style = getChipStyle(variant, state, { shape, shapes, hasLeadingIcon: slots.leadingIcon != null, hasTrailingIcon: slots.trailingIcon != null, hasAvatar: slots.avatar != null });
  return (
    <span className="chip__visual" data-selected={isSelected || undefined} data-expressive-shapes={shapes ? true : undefined} style={style}>
      <Elevation level={resolveChipElevation(variant, state)} style={{ transitionDuration: `${motion.durationMs}ms`, transitionProperty: 'box-shadow', transitionTimingFunction: motion.easing }} />
      <span className="chip__surface">
        <Ripple controller={controller} focusRingRadius="var(--_chip-container-radius)" isFocusVisible={isFocusVisible} stateInteraction={latestChipStateLayerInteraction(activeInteractions, isFocusVisible)} />
        <span className="chip__content">
          {slots.avatar != null ? <span aria-hidden="true" className="chip__avatar">{slots.avatar}</span> : slots.leadingIcon != null ? <span aria-hidden="true" className="chip__leading-icon">{slots.leadingIcon}</span> : null}
          <span className="chip__label">{label}</span>
          {slots.trailingIcon != null ? <span aria-hidden="true" className="chip__trailing-icon">{slots.trailingIcon}</span> : null}
        </span>
      </span>
    </span>
  );
}

function useChipInteractions() {
  const ripple = useRipple();
  const [activeInteractions, setActiveInteractions] = useState<ChipInteraction[]>([]);
  const interaction = latestChipInteraction(activeInteractions);
  const previousInteractionRef = useRef<ChipInteraction | null>(null);
  const previousInteraction = previousInteractionRef.current;
  useEffect(() => { previousInteractionRef.current = interaction; }, [interaction]);
  const start = (value: ChipInteraction) => setActiveInteractions((active) => startChipInteraction(active, value));
  const end = (value: ChipInteraction) => setActiveInteractions((active) => endChipInteraction(active, value));
  return { ripple, activeInteractions, previousInteraction, start, end };
}

function ActionChipImpl({ variant, children, className, style, leadingIcon, trailingIcon, shape, onBlur, onFocus, onHoverEnd, onHoverStart, onPressEnd, onPressStart, ...props }: ActionChipImplProps) {
  const interactions = useChipInteractions();
  const baseClassName = `chip ${variantClassName(variant)}`;
  const handleHoverStart: AriaButtonProps['onHoverStart'] = (event) => { interactions.start('hover'); onHoverStart?.(event); };
  const handleHoverEnd: AriaButtonProps['onHoverEnd'] = (event) => { interactions.end('hover'); onHoverEnd?.(event); };
  const handleFocus: AriaButtonProps['onFocus'] = (event) => { interactions.start('focus'); onFocus?.(event); };
  const handleBlur: AriaButtonProps['onBlur'] = (event) => { interactions.end('focus'); onBlur?.(event); };
  const handlePressStart: AriaButtonProps['onPressStart'] = (event) => { interactions.start('press'); interactions.ripple.onPressStart(event); onPressStart?.(event); };
  const handlePressEnd: AriaButtonProps['onPressEnd'] = (event) => { interactions.end('press'); interactions.ripple.onPressEnd(); onPressEnd?.(event); };
  return (
    <AriaButton {...props} className={(renderProps) => { const userClassName = typeof className === 'function' ? className(renderProps) : className; return userClassName ? `${baseClassName} ${userClassName}` : baseClassName; }} data-has-leading={leadingIcon != null || undefined} data-has-trailing={trailingIcon != null || undefined} data-variant={variant} style={(renderProps) => { const userStyle = typeof style === 'function' ? style(renderProps) : style; return { ...getChipRootStyle(variant), ...userStyle }; }} onBlur={handleBlur} onFocus={handleFocus} onHoverEnd={handleHoverEnd} onHoverStart={handleHoverStart} onPressEnd={handlePressEnd} onPressStart={handlePressStart}>
      {(renderProps) => <ChipVisual variant={variant} label={resolveButtonChildren(children, renderProps)} slots={{ leadingIcon, trailingIcon }} controller={interactions.ripple} activeInteractions={interactions.activeInteractions} previousInteraction={interactions.previousInteraction} isDisabled={renderProps.isDisabled} isSelected={false} isFocusVisible={renderProps.isFocusVisible} shape={shape} />}
    </AriaButton>
  );
}

function SelectableChipImpl({ variant, children, className, style, leadingIcon, trailingIcon, avatar, shape, shapes, onBlur, onFocus, onHoverEnd, onHoverStart, onPressEnd, onPressStart, ...props }: SelectableChipImplProps) {
  const interactions = useChipInteractions();
  const baseClassName = `chip ${variantClassName(variant)}`;
  const handleHoverStart: AriaCheckboxProps['onHoverStart'] = (event) => { interactions.start('hover'); onHoverStart?.(event); };
  const handleHoverEnd: AriaCheckboxProps['onHoverEnd'] = (event) => { interactions.end('hover'); onHoverEnd?.(event); };
  const handleFocus: AriaCheckboxProps['onFocus'] = (event) => { interactions.start('focus'); onFocus?.(event); };
  const handleBlur: AriaCheckboxProps['onBlur'] = (event) => { interactions.end('focus'); onBlur?.(event); };
  const handlePressStart: AriaCheckboxProps['onPressStart'] = (event) => { interactions.start('press'); interactions.ripple.onPressStart(event); onPressStart?.(event); };
  const handlePressEnd: AriaCheckboxProps['onPressEnd'] = (event) => { interactions.end('press'); interactions.ripple.onPressEnd(); onPressEnd?.(event); };
  return (
    <AriaCheckbox {...props} className={(renderProps) => { const userClassName = typeof className === 'function' ? className(renderProps) : className; return userClassName ? `${baseClassName} ${userClassName}` : baseClassName; }} data-has-avatar={avatar != null || undefined} data-has-leading={leadingIcon != null || undefined} data-has-trailing={trailingIcon != null || undefined} data-variant={variant} style={(renderProps) => { const userStyle = typeof style === 'function' ? style(renderProps) : style; return { ...getChipRootStyle(variant), ...userStyle }; }} onBlur={handleBlur} onFocus={handleFocus} onHoverEnd={handleHoverEnd} onHoverStart={handleHoverStart} onPressEnd={handlePressEnd} onPressStart={handlePressStart}>
      {(renderProps) => <ChipVisual variant={variant} label={resolveCheckboxChildren(children, renderProps)} slots={{ avatar, leadingIcon, trailingIcon }} controller={interactions.ripple} activeInteractions={interactions.activeInteractions} previousInteraction={interactions.previousInteraction} isDisabled={renderProps.isDisabled} isSelected={renderProps.isSelected} isFocusVisible={renderProps.isFocusVisible} shape={shape} shapes={shapes} />}
    </AriaCheckbox>
  );
}

export function AssistChip(props: ActionChipProps) { return <ActionChipImpl {...props} variant="assist" />; }
export function ElevatedAssistChip(props: ActionChipProps) { return <ActionChipImpl {...props} variant="elevatedAssist" />; }
export function SuggestionChip({ icon, ...props }: SuggestionChipProps) { return <ActionChipImpl {...props} leadingIcon={icon} variant="suggestion" />; }
export function ElevatedSuggestionChip({ icon, ...props }: SuggestionChipProps) { return <ActionChipImpl {...props} leadingIcon={icon} variant="elevatedSuggestion" />; }
export function FilterChip(props: SelectableChipProps) { return <SelectableChipImpl {...props} variant="filter" />; }
export function ElevatedFilterChip(props: SelectableChipProps) { return <SelectableChipImpl {...props} variant="elevatedFilter" />; }
export function InputChip(props: InputChipProps) { return <SelectableChipImpl {...props} variant="input" />; }
export type { ChipShapeValue, ChipShapes } from './Chip.defaults';
