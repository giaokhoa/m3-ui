import type { ReactNode } from 'react';
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from 'react-aria-components';
import { Ripple, useRipple } from '../../internal/ripple';
import { useTheme } from '../../theme/ThemeProvider';
import {
  switchBaseStyle,
  switchStateLayerRadius,
  switchTrackFocusRingRadius,
} from './Switch.defaults';
import './switch.css';

export interface SwitchProps extends AriaSwitchProps {
  /** Content rendered inside the Material thumb. Compose expects a 16dp icon-sized child. */
  thumbContent?: ReactNode;
}

function resolveChildren(
  children: AriaSwitchProps['children'],
  renderProps: Parameters<Exclude<AriaSwitchProps['children'], ReactNode>>[0],
) {
  return typeof children === 'function' ? children(renderProps) : children;
}

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function Switch({
  children,
  thumbContent,
  className,
  style,
  onPressEnd,
  onPressStart,
  ...props
}: SwitchProps) {
  const { rippleFocus } = useTheme();
  const thumbRipple = useRipple({
    origin: 'center',
    radius: switchStateLayerRadius,
  });
  const trackRipple = useRipple();
  const thumbRipplePressProps = thumbRipple.getPressProps({ onPressStart, onPressEnd });

  return (
    <AriaSwitch
      {...props}
      {...thumbRipplePressProps}
      data-has-thumb-content={thumbContent != null ? true : undefined}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames('switch', userClassName);
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        return { ...switchBaseStyle, ...userStyle };
      }}
    >
      {(renderProps) => {
        const label = resolveChildren(children, renderProps);

        return (
          <>
            <span className="switch__control-slot" aria-hidden="true">
              <span className="switch__track">
                <Ripple
                  controller={trackRipple}
                  focusRingRadius={switchTrackFocusRingRadius}
                  state={{
                    isFocusVisible:
                      rippleFocus === 'inset-ring' && renderProps.isFocusVisible,
                  }}
                />
                <span className="switch__thumb-shell">
                  <span className="switch__state-layer">
                    <Ripple
                      controller={thumbRipple}
                      state={{
                        isHovered: renderProps.isHovered,
                        isFocusVisible:
                          rippleFocus === 'opacity' && renderProps.isFocusVisible,
                      }}
                    />
                  </span>
                  <span className="switch__thumb">
                    {thumbContent != null ? (
                      <span className="switch__icon">{thumbContent}</span>
                    ) : null}
                  </span>
                </span>
              </span>
            </span>
            {label != null ? <span className="switch__label">{label}</span> : null}
          </>
        );
      }}
    </AriaSwitch>
  );
}
