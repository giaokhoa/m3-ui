import { useState, type ReactNode } from 'react';
import {
  Switch as AriaSwitch,
  type SwitchProps as AriaSwitchProps,
} from 'react-aria-components';
import { Ripple, useRipple, type RippleStateInteraction } from '../../internal/ripple';
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
  allowFocus: boolean,
): RippleStateInteraction | null {
  for (let index = active.length - 1; index >= 0; index -= 1) {
    const interaction = active[index];
    if (interaction === 'hover') {
      return 'hover';
    }
    if (interaction === 'focus' && allowFocus && isFocusVisible) {
      return 'focus';
    }
  }
  return null;
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
  onBlur,
  onFocus,
  onHoverEnd,
  onHoverStart,
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
  const [activeInteractions, setActiveInteractions] = useState<
    StateLayerInteraction[]
  >([]);

  const handleHoverStart: AriaSwitchProps['onHoverStart'] = (event) => {
    setActiveInteractions((active) => startInteraction(active, 'hover'));
    onHoverStart?.(event);
  };

  const handleHoverEnd: AriaSwitchProps['onHoverEnd'] = (event) => {
    setActiveInteractions((active) => endInteraction(active, 'hover'));
    onHoverEnd?.(event);
  };

  const handleFocus: AriaSwitchProps['onFocus'] = (event) => {
    setActiveInteractions((active) => startInteraction(active, 'focus'));
    onFocus?.(event);
  };

  const handleBlur: AriaSwitchProps['onBlur'] = (event) => {
    setActiveInteractions((active) => endInteraction(active, 'focus'));
    onBlur?.(event);
  };

  const handlePressStart: AriaSwitchProps['onPressStart'] = (event) => {
    thumbRipple.onPressStart(event);
    onPressStart?.(event);
  };

  const handlePressEnd: AriaSwitchProps['onPressEnd'] = (event) => {
    thumbRipple.onPressEnd();
    onPressEnd?.(event);
  };

  return (
    <AriaSwitch
      {...props}
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
      onBlur={handleBlur}
      onFocus={handleFocus}
      onHoverEnd={handleHoverEnd}
      onHoverStart={handleHoverStart}
      onPressEnd={handlePressEnd}
      onPressStart={handlePressStart}
    >
      {(renderProps) => {
        const label = resolveChildren(children, renderProps);
        const thumbStateInteraction = latestStateLayerInteraction(
          activeInteractions,
          renderProps.isFocusVisible,
          rippleFocus === 'opacity',
        );

        return (
          <>
            <span className="switch__control-slot" aria-hidden="true">
              <span className="switch__track">
                <Ripple
                  controller={trackRipple}
                  focusRingRadius={switchTrackFocusRingRadius}
                  isFocusVisible={
                    rippleFocus === 'inset-ring' && renderProps.isFocusVisible
                  }
                />
                <span className="switch__thumb-shell">
                  <span className="switch__state-layer">
                    <Ripple
                      controller={thumbRipple}
                      isFocusVisible={
                        rippleFocus === 'opacity' && renderProps.isFocusVisible
                      }
                      stateInteraction={thumbStateInteraction}
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
