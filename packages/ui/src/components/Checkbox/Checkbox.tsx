import { useState, type ReactNode } from 'react';
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';
import { Ripple, useRipple, type RippleStateInteraction } from '../../internal/ripple';
import { checkboxBaseStyle } from './Checkbox.defaults';
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
    if (interaction === 'hover') {
      return 'hover';
    }
    if (interaction === 'focus' && isFocusVisible) {
      return 'focus';
    }
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
  style,
  onBlur,
  onFocus,
  onHoverEnd,
  onHoverStart,
  onPressEnd,
  onPressStart,
  ...props
}: CheckboxProps) {
  const ripple = useRipple({ origin: 'center' });
  const [activeInteractions, setActiveInteractions] = useState<
    StateLayerInteraction[]
  >([]);

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
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return userClassName ? `m3-checkbox ${userClassName}` : 'm3-checkbox';
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...checkboxBaseStyle, ...userStyle };
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
            <span className="m3-checkbox__control-slot" aria-hidden="true">
              <span className="m3-checkbox__state-layer">
                <Ripple
                  controller={ripple}
                  stateInteraction={latestStateLayerInteraction(
                    activeInteractions,
                    renderProps.isFocusVisible,
                  )}
                />
              </span>
              <span className="m3-checkbox__box" data-state={state}>
                <svg
                  className="m3-checkbox__mark"
                  viewBox="0 0 18 18"
                  focusable="false"
                >
                  <path
                    className="m3-checkbox__check-path"
                    pathLength="1"
                    d="M 4.5 9 L 7.2 11.7 L 13.5 5.4"
                  />
                  <path
                    className="m3-checkbox__indeterminate-path"
                    pathLength="1"
                    d="M 4.5 9 L 13.5 9"
                  />
                </svg>
              </span>
            </span>
            {label !== undefined && label !== null ? (
              <span className="m3-checkbox__label">{label}</span>
            ) : null}
          </>
        );
      }}
    </AriaCheckbox>
  );
}
