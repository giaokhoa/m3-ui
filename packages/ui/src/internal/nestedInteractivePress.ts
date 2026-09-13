import type { PressResult } from 'react-aria/usePress';

type PressProps = PressResult['pressProps'];

const nestedInteractiveSelector =
  'a[href],button,input,select,textarea,summary,[contenteditable="true"],[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"],[role="option"]';

function isNestedInteractive(target: EventTarget | null, root: Element): boolean {
  if (!(target instanceof Element)) return false;
  const interactive = target.closest(nestedInteractiveSelector);
  return interactive !== null && interactive !== root && root.contains(interactive);
}

/**
 * React Aria owns the generic press state machine. Rich Card/Surface hosts
 * only filter events that originate from nested interactive descendants so
 * child controls remain independent from the parent press target.
 */
export function suppressNestedInteractivePresses(
  pressProps: PressProps,
): PressProps {
  return {
    ...pressProps,
    onKeyDown(event) {
      if (!isNestedInteractive(event.target, event.currentTarget)) {
        pressProps.onKeyDown?.(event);
      }
    },
    onPointerDown(event) {
      if (!isNestedInteractive(event.target, event.currentTarget)) {
        pressProps.onPointerDown?.(event);
      }
    },
    onMouseDown(event) {
      if (!isNestedInteractive(event.target, event.currentTarget)) {
        pressProps.onMouseDown?.(event);
      }
    },
    onTouchStart(event) {
      if (!isNestedInteractive(event.target, event.currentTarget)) {
        pressProps.onTouchStart?.(event);
      }
    },
    onClick(event) {
      if (!isNestedInteractive(event.target, event.currentTarget)) {
        pressProps.onClick?.(event);
      }
    },
  };
}
