import type { ReactNode } from 'react';
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';
import '@m3-ui/tokens/checkbox.css';
import { Ripple, useRipple } from '../../internal/ripple';
import { checkboxGeometry } from './Checkbox.geometry';
import './checkbox.css';

export interface CheckboxProps extends AriaCheckboxProps {}

function resolveChildren(
  children: AriaCheckboxProps['children'],
  renderProps: Parameters<Exclude<AriaCheckboxProps['children'], ReactNode>>[0],
) {
  return typeof children === 'function' ? children(renderProps) : children;
}

export function Checkbox({
  children,
  className,
  onPressEnd,
  onPressStart,
  ...props
}: CheckboxProps) {
  const ripple = useRipple({
    origin: 'center',
    radius: checkboxGeometry.stateLayerRadius,
  });
  const ripplePressProps = ripple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaCheckbox
      {...props}
      {...ripplePressProps}
      className={(renderProps) => {
        const userClassName = typeof className === 'function' ? className(renderProps) : className;
        return userClassName ? `checkbox ${userClassName}` : 'checkbox';
      }}
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
                  state={{
                    isHovered: renderProps.isHovered,
                    isFocusVisible: renderProps.isFocusVisible,
                  }}
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
