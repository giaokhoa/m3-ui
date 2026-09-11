import { useCallback, useMemo, useState } from 'react';

export type SearchBarValue = 'collapsed' | 'expanded';

export interface SearchBarState {
  readonly value: SearchBarValue;
  readonly isExpanded: boolean;
  expand(): void;
  collapse(): void;
  toggle(): void;
}

export function useSearchBarState(
  initialValue: SearchBarValue = 'collapsed',
): SearchBarState {
  const [value, setValue] = useState<SearchBarValue>(initialValue);
  const expand = useCallback(() => setValue('expanded'), []);
  const collapse = useCallback(() => setValue('collapsed'), []);
  const toggle = useCallback(
    () => setValue((current) => (current === 'expanded' ? 'collapsed' : 'expanded')),
    [],
  );
  return useMemo(
    () => ({ value, isExpanded: value === 'expanded', expand, collapse, toggle }),
    [value, expand, collapse, toggle],
  );
}
