import { useState, type ReactNode } from 'react';
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';
import '@m3-ui/tokens/checkbox.css';
import { Ripple, useRipple, type RippleStateInteraction } from '../../internal/ripple';
import { checkboxGeometry } from './Checkbox.geometry';
import './checkbox.css';

export interface CheckboxProps extends AriaCheckboxProps {}

type StateLayerInteraction = 'focus' | 'hover';

function startInteraction(
  active: readonly StateLayerInteraction[],
  interaction: StateLayerInteraction,
): StateLayerInteraction[] {
  return [...active.filter((value) => value !== interaction), interaction];
}

function endInteraction(
  active: readonly StateLayerInteraction[],
  interaction: StateLayerInteraction,
): StateLayerInteraction[] {
  return active.filter((value) => value !== interaction);
}

function latestStateLayerInteraction(
  active: readonly StateLayerInteraction[],
  isFocusVisible: boolean,
): RippleStateInteraction | null {
  for (let index = active.length - 1; index >= 0; index -= 1) {
    const interaction = active[index];
    if (interaction === 'hover') return 'hover';
    if (interaction === 'focus' && isFocusVisible) return 'focus';
  }
  return null;
}

function resolveChildren(
  children: AriaCheckboxProps['children'],
  renderProps: Parameters<Exclude<AriaCheckboxProps['children'], ReactNode>>[0],
) {
  return typeof children === 'function' ? children(renderProps) : children;
}

export function Checkbox({
  children,
  className,
  onBlur,
  onFocus,
  onHoverEnd,
  onHoverStart,
  onPressEnd,
  onPressStart,
  ...props
}: CheckboxProps) {
  const ripple = useRipple({
    origin: 'center',
    radius: checkboxGeometry.stateLayerRadius,
  });
  const [activeInteractions, setActiveInteractions] = useState<StateLayerInteraction[]>([]);

  const handleHoverStart: AriaCheckboxProps['onHoverStart'] = (event) => {
    setActiveInteractions((active) => startInteraction(active, 'hover'));
    onHoverStart?.(event);
  };
  const handleHoverEnd: AriaCheckboxProps['onHoverEnd'] = (event) => {
    setActiveInteractions((active) => endInteraction(active, 'hover'));
    onHoverEnd?.(event);
  };
  const handleFocus: AriaCheckboxProps['onFocus'] = (event) => {
    setActiveInteractions((active) => startInteraction(active, 'focus'));
    onFocus?.(event);
  };
  const handleBlur: AriaCheckboxProps['onBlur'] = (event) => {
    setActiveInteractions((active) => endInteraction(active, 'focus'));
    onBlur?.(event);
  };
  const handlePressStart: AriaCheckboxProps['onPressStart'] = (event) => {
    ripple.onPressStart(event);
    onPressStart?.(event);
  };
  const handlePressEnd: AriaCheckboxProps['onPressEnd'] = (event) => {
    ripple.onPressEnd();
    onPressEnd?.(event);
  };

  return (
    <AriaCheckbox
      {...props}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return userClassName ? `checkbox ${userClassName}` : 'checkbox';
      }}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onHoverEnd={handleHoverEnd}
      onHoverStart={handleHoverStart}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => {
        const state = renderProps.isIndeterminate
          ? 'indeterminate'
          : renderProps.isSelected
            ? 'checked'
            : 'unchecked';
        const label = resolveChildren(children, renderProps);
        return (
          <>
            <span className="checkbox__control-slot" aria-hidden="true">
              <span className="checkbox__state-layer">
                <Ripple
                  controller={ripple}
                  focusRingInset={checkboxGeometry.focusRingInset}
                  focusRingRadius={checkboxGeometry.focusRingRadius}
                  isFocusVisible={renderProps.isFocusVisible}
                  stateInteraction={latestStateLayerInteraction(activeInteractions, renderProps.isFocusVisible)}
                />
              </span>
              <span className="checkbox__box" data-state={state}>
                <svg
                  className="checkbox__mark"
                  viewBox={`0 0 ${checkboxGeometry.containerSize} ${checkboxGeometry.containerSize}`}
                  focusable="false"
                >
                  <path className="checkbox__check-path" pathLength="1" d={checkboxGeometry.checkPath} />
                  <path className="checkbox__indeterminate-path" pathLength="1" d={checkboxGeometry.indeterminatePath} />
                </svg>
              </span>
            </span>
            {label !== undefined && label !== null ? (
              <span className="checkbox__label">{label}</span>
            ) : null}
          </>
        );
      }}
    </AriaCheckbox>
  );
}
