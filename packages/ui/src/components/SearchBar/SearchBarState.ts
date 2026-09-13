import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';

export type SearchBarValue = 'collapsed' | 'expanded';

export interface SearchBarState {
  readonly value: SearchBarValue;
  readonly isExpanded: boolean;
  /**
   * Stable SearchBar surface anchor for framework-owned docked overlays.
   * Custom SearchBarState implementations may omit this, but docked search
   * should use useSearchBarState for RAC positioning and focus restoration.
   */
  readonly triggerRef?: RefObject<Element | null>;
  /** Registers the rendered SearchBar anchor and schedules consumers to re-render. */
  readonly registerTrigger?: (element: Element | null) => void;
  expand(): void;
  collapse(): void;
  toggle(): void;
}

export function useSearchBarState(
  initialValue: SearchBarValue = 'collapsed',
): SearchBarState {
  const [value, setValue] = useState<SearchBarValue>(initialValue);
  const triggerRef = useRef<Element | null>(null);
  const [, setTriggerElement] = useState<Element | null>(null);
  const registerTrigger = useCallback((element: Element | null) => {
    triggerRef.current = element;
    setTriggerElement((current) => current === element ? current : element);
  }, []);
  const expand = useCallback(() => setValue('expanded'), []);
  const collapse = useCallback(() => setValue('collapsed'), []);
  const toggle = useCallback(
    () => setValue((current) => (current === 'expanded' ? 'collapsed' : 'expanded')),
    [],
  );
  return useMemo(
    () => ({
      value,
      isExpanded: value === 'expanded',
      triggerRef,
      registerTrigger,
      expand,
      collapse,
      toggle,
    }),
    [value, registerTrigger, expand, collapse, toggle],
  );
}
