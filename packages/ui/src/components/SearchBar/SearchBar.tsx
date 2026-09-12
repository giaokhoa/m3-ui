import '@m3-ui/tokens/elevation.css';
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
  type FormEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Dialog as AriaDialog,
  Input as AriaInput,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from 'react-aria-components';
import '../../internal/elevation/elevation.css';
import { useThemePortalContainer } from '../../theme/ThemePortalContext';
import { clampScrollFraction } from '../TopAppBar/TopAppBar.defaults';
import {
  appBarWithSearchTokens,
  getSearchBarStyle,
  getSearchViewStyle,
  searchBarTokens,
  searchViewTokens,
} from './SearchBar.defaults';
import type { SearchBarState } from './SearchBarState';
import './search-bar.css';

function join(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

function cssLength(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

// Expanded surfaces own the initial query focus. Keep this internal so an
// inputField may be composed through arbitrary wrappers while the actual
// SearchBarInput still participates in React Aria's modal FocusScope.
const SearchBarInputAutoFocusContext = createContext(false);
const searchBarFocusReturnTargets = new WeakMap<() => void, HTMLElement>();

function ExpandedSearchInput({ children }: { children: ReactNode }) {
  return (
    <SearchBarInputAutoFocusContext.Provider value>
      {children}
    </SearchBarInputAutoFocusContext.Provider>
  );
}

export interface SearchBarInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'size'> {
  state?: SearchBarState;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  clearable?: boolean;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
}

export const SearchBarInput = forwardRef<HTMLInputElement, SearchBarInputProps>(
  function SearchBarInput(
    {
      state,
      leadingIcon,
      trailingIcon,
      clearable = false,
      value,
      defaultValue,
      onValueChange,
      onSearch,
      className,
      disabled,
      ...props
    },
    forwardedRef,
  ) {
    const localRef = useRef<HTMLInputElement | null>(null);
    const expandedAutoFocus = useContext(SearchBarInputAutoFocusContext);
    const shouldAutoFocus = props.autoFocus ?? expandedAutoFocus;
    const setRef = (node: HTMLInputElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    // ModalOverlay is SSR-gated, so the expanded input may mount after its
    // wrapper effects have already run. Own initial focus at the input mount
    // itself before the dialog fallback decides whether it needs focus.
    useEffect(() => {
      if (!shouldAutoFocus || disabled) return;
      localRef.current?.focus({ preventScroll: true });
    }, [shouldAutoFocus, disabled]);

    const submit = (event: FormEvent) => {
      event.preventDefault();
      onSearch?.(localRef.current?.value ?? '');
    };

    return (
      <form
        role="search"
        className={join('search-bar__input-shell', className)}
        onSubmit={submit}
        data-disabled={disabled || undefined}
      >
        {leadingIcon ? (
          <span className="search-bar__icon search-bar__icon--leading" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}
        <AriaInput
          {...props}
          ref={setRef}
          type="search"
          className="search-bar__input"
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          autoFocus={shouldAutoFocus}
          onFocus={(event) => {
            props.onFocus?.(event);
            if (state && !expandedAutoFocus) {
              searchBarFocusReturnTargets.set(state.collapse, event.currentTarget);
            }
            state?.expand();
          }}
          onChange={(event) => onValueChange?.(event.currentTarget.value)}
        />
        {clearable && !disabled ? (
          <button
            type="button"
            className="search-bar__clear"
            aria-label="Clear search"
            onClick={() => {
              if (value !== undefined) onValueChange?.('');
              else if (localRef.current) {
                localRef.current.value = '';
                onValueChange?.('');
              }
              localRef.current?.focus();
            }}
          >
            ×
          </button>
        ) : null}
        {trailingIcon ? (
          <span className="search-bar__icon search-bar__icon--trailing" aria-hidden="true">
            {trailingIcon}
          </span>
        ) : null}
      </form>
    );
  },
);

export interface SearchBarProps extends HTMLAttributes<HTMLDivElement> {
  state: SearchBarState;
  children: ReactNode;
}

export function SearchBar({ state, children, className, style, ...props }: SearchBarProps) {
  return (
    <div
      {...props}
      data-elevation={searchBarTokens.containerElevation}
      data-state={state.value}
      className={join('search-bar', 'elevation-host', className)}
      style={{ ...getSearchBarStyle(), ...(style as CSSProperties | undefined) }}
    >
      {children}
    </div>
  );
}

export interface AppBarWithSearchProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  state: SearchBarState;
  inputField: ReactNode;
  navigationIcon?: ReactNode;
  actions?: ReactNode;
  /** Application-owned overlap signal. No scroll listener is installed. */
  overlappedFraction?: number;
}

export function AppBarWithSearch({
  state,
  inputField,
  navigationIcon,
  actions,
  overlappedFraction = 0,
  className,
  ...props
}: AppBarWithSearchProps) {
  const overlap = clampScrollFraction(overlappedFraction);
  const scrolled = overlap > 0.01;

  return (
    <header
      {...props}
      data-elevation={appBarWithSearchTokens.containerElevation}
      data-overlapped-fraction={overlap}
      data-scrolled={scrolled || undefined}
      className={join('app-bar-with-search', 'elevation-host', className)}
    >
      <div className="app-bar-with-search__navigation">{navigationIcon}</div>
      <div className="app-bar-with-search__search-slot">
        <SearchBar state={state}>{inputField}</SearchBar>
      </div>
      <div className="app-bar-with-search__actions">{actions}</div>
    </header>
  );
}

interface ExpandedSearchBarBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  state: SearchBarState;
  inputField: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
}

function useDockedSearchDismiss(
  root: React.RefObject<HTMLDivElement | null>,
  state: SearchBarState,
  onDismiss?: () => void,
) {
  useEffect(() => {
    if (!state.isExpanded) return;

    const dismiss = (restore: boolean) => {
      const target = searchBarFocusReturnTargets.get(state.collapse);
      if (restore && target?.isConnected) target.focus({ preventScroll: true });
      searchBarFocusReturnTargets.delete(state.collapse);
      state.collapse();
      onDismiss?.();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        dismiss(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss(true);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [root, state, onDismiss]);
}

export type ExpandedDockedSearchBarProps = ExpandedSearchBarBaseProps;

export function ExpandedDockedSearchBar({
  state,
  inputField,
  children,
  className,
  style,
  onDismiss,
  ...props
}: ExpandedDockedSearchBarProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useDockedSearchDismiss(root, state, onDismiss);

  if (!state.isExpanded) return null;
  return (
    <div
      {...props}
      ref={root}
      data-elevation={searchViewTokens.containerElevation}
      data-state="expanded"
      className={join('search-view', 'search-view--docked', 'elevation-host', className)}
      style={{ ...getSearchViewStyle('docked'), ...(style as CSSProperties | undefined) }}
    >
      <div className="search-view__header">
        <ExpandedSearchInput>{inputField}</ExpandedSearchInput>
      </div>
      <div className="search-view__results">{children}</div>
    </div>
  );
}

export interface ExpandedDockedSearchBarWithGapProps
  extends ExpandedSearchBarBaseProps {
  /** Gap between the search bar and results dropdown. Defaults to canonical 2px. */
  dropdownGap?: string | number;
  /** Override the canonical dropdown scrim paint. Use transparent to remove it. */
  dropdownScrimColor?: CSSProperties['backgroundColor'];
}

export function ExpandedDockedSearchBarWithGap({
  state,
  inputField,
  children,
  className,
  style,
  onDismiss,
  dropdownGap,
  dropdownScrimColor,
  ...props
}: ExpandedDockedSearchBarWithGapProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useDockedSearchDismiss(root, state, onDismiss);

  if (!state.isExpanded) return null;
  const overrides = {
    ...(dropdownGap === undefined ? {} : { '--_search-view-gap': cssLength(dropdownGap) }),
  } as CSSProperties & Record<`--${string}`, string | number>;
  const scrimStyle = dropdownScrimColor === undefined
    ? undefined
    : ({ '--_search-view-scrim-color': dropdownScrimColor } as CSSProperties & Record<`--${string}`, string | number>);

  return (
    <>
      <div
        className="search-view__docked-gap-scrim"
        aria-hidden="true"
        style={scrimStyle}
      />
      <div
        {...props}
        ref={root}
        data-state="expanded"
        className={join('search-view', 'search-view--docked-gap', className)}
        style={{
          ...getSearchViewStyle('docked'),
          ...overrides,
          ...(style as CSSProperties | undefined),
        }}
      >
        <div
          className="search-view__header elevation-host"
          data-elevation={searchViewTokens.containerElevation}
        >
          <ExpandedSearchInput>{inputField}</ExpandedSearchInput>
        </div>
        <div
          className="search-view__docked-dropdown elevation-host"
          data-elevation={searchViewTokens.containerElevation}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export interface ExpandedFullScreenSearchBarProps
  extends ExpandedSearchBarBaseProps {
  isDismissable?: boolean;
}

interface FullScreenSearchSurfaceProps extends ExpandedFullScreenSearchBarProps {
  contained?: boolean;
}

function FullScreenSearchSurface({
  state,
  inputField,
  children,
  className,
  style,
  onDismiss,
  isDismissable = true,
  contained = false,
  ...props
}: FullScreenSearchSurfaceProps) {
  const themePortalContainer = useThemePortalContainer();

  return (
    <AriaModalOverlay
      isOpen={state.isExpanded}
      isDismissable={isDismissable}
      UNSTABLE_portalContainer={themePortalContainer ?? undefined}
      onOpenChange={(open) => {
        if (!open) {
          state.collapse();
          onDismiss?.();
        }
      }}
      className="search-view-overlay"
    >
      <AriaModal className="search-view-modal">
        <AriaDialog aria-label="Search" className="search-view-dialog">
          <div
            {...props}
            data-elevation={searchViewTokens.containerElevation}
            data-state="expanded"
            data-contained={contained || undefined}
            className={join(
              'search-view',
              contained
                ? 'search-view--fullscreen-contained'
                : 'search-view--fullscreen',
              'elevation-host',
              className,
            )}
            style={{ ...getSearchViewStyle('fullscreen'), ...(style as CSSProperties | undefined) }}
          >
            <div className="search-view__header">
              {contained ? (
                <div className="search-view__contained-bar">
                  <ExpandedSearchInput>{inputField}</ExpandedSearchInput>
                </div>
              ) : (
                <ExpandedSearchInput>{inputField}</ExpandedSearchInput>
              )}
            </div>
            <div className="search-view__results">{children}</div>
          </div>
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

export function ExpandedFullScreenSearchBar(props: ExpandedFullScreenSearchBarProps) {
  return <FullScreenSearchSurface {...props} />;
}

export type ExpandedFullScreenContainedSearchBarProps = ExpandedFullScreenSearchBarProps;

export function ExpandedFullScreenContainedSearchBar(
  props: ExpandedFullScreenContainedSearchBarProps,
) {
  return <FullScreenSearchSurface {...props} contained />;
}
