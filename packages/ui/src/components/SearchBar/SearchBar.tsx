import '@m3-ui/tokens/elevation.css';
import {
  createContext,
  forwardRef,
  useContext,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import {
  FocusScope,
  Overlay as AriaOverlay,
  mergeProps,
  useOverlay,
  useOverlayPosition,
} from 'react-aria';
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  Input as AriaInput,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  SearchField as AriaSearchField,
} from 'react-aria-components';
import '../../internal/elevation/elevation.css';
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
const SearchBarExpandedDismissContext = createContext<(() => void) | null>(null);
const searchBarFocusRestoreGuard = Symbol('searchBarFocusRestoreGuard');

type SearchBarTriggerRef = NonNullable<SearchBarState['triggerRef']> & {
  [searchBarFocusRestoreGuard]?: boolean;
};

function prepareSearchBarFocusRestore(triggerRef: SearchBarState['triggerRef']) {
  if (!triggerRef) return;
  const guardedRef = triggerRef as SearchBarTriggerRef;
  guardedRef[searchBarFocusRestoreGuard] = true;
  // RAC FocusScope restores focus in requestAnimationFrame after the overlay
  // unmounts. Keep the guard through that frame, then clear it on the next one.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      guardedRef[searchBarFocusRestoreGuard] = false;
    });
  });
}

function consumeSearchBarFocusRestore(triggerRef: SearchBarState['triggerRef']) {
  if (!triggerRef) return false;
  const guardedRef = triggerRef as SearchBarTriggerRef;
  if (!guardedRef[searchBarFocusRestoreGuard]) return false;
  guardedRef[searchBarFocusRestoreGuard] = false;
  return true;
}

function ExpandedSearchInput({
  children,
  onDismiss,
}: {
  children: ReactNode;
  onDismiss: () => void;
}) {
  return (
    <SearchBarExpandedDismissContext.Provider value={onDismiss}>
      <SearchBarInputAutoFocusContext.Provider value>
        {children}
      </SearchBarInputAutoFocusContext.Provider>
    </SearchBarExpandedDismissContext.Provider>
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
      readOnly,
      required,
      onKeyDownCapture,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    forwardedRef,
  ) {
    const expandedAutoFocus = useContext(SearchBarInputAutoFocusContext);
    const expandedDismiss = useContext(SearchBarExpandedDismissContext);
    const shouldAutoFocus = props.autoFocus ?? expandedAutoFocus;
    const setRef = (node: HTMLInputElement | null) => {
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };
    const searchValue = value == null ? undefined : String(value);
    const initialSearchValue = defaultValue == null ? undefined : String(defaultValue);

    return (
      <form
        role="search"
        className={join('search-bar__input-shell', className)}
        data-disabled={disabled || undefined}
      >
        <AriaSearchField
          className="search-bar__field"
          value={searchValue}
          defaultValue={initialSearchValue}
          onChange={onValueChange}
          onSubmit={onSearch}
          isDisabled={disabled}
          isReadOnly={readOnly}
          isRequired={required}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
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
            autoFocus={shouldAutoFocus}
            onKeyDownCapture={(event) => {
              onKeyDownCapture?.(event);
              if (
                event.key === 'Escape'
                && expandedDismiss
                && !event.defaultPrevented
              ) {
                // RAC SearchField intentionally consumes Escape to clear a
                // non-empty query. Material expanded search dismisses the
                // search view instead, so intercept Escape locally before the
                // SearchField shortcut without restoring document listeners.
                event.preventDefault();
                event.stopPropagation();
                expandedDismiss();
              }
            }}
            onFocus={(event) => {
              props.onFocus?.(event);
              if (!consumeSearchBarFocusRestore(state?.triggerRef)) {
                state?.expand();
              }
            }}
          />
          {clearable && !disabled && !readOnly ? (
            <AriaButton className="search-bar__clear">×</AriaButton>
          ) : null}
          {trailingIcon ? (
            <span className="search-bar__icon search-bar__icon--trailing" aria-hidden="true">
              {trailingIcon}
            </span>
          ) : null}
        </AriaSearchField>
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
      ref={(node) => {
        if (state.triggerRef) state.triggerRef.current = node;
      }}
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

function useDockedSearchTriggerRef(state: SearchBarState) {
  const fallbackTriggerRef = useRef<Element | null>(null);
  return state.triggerRef ?? fallbackTriggerRef;
}

interface DockedSearchOverlayOptions {
  state: SearchBarState;
  offset: number;
  onDismiss?: () => void;
}

function useDockedSearchOverlay({
  state,
  offset,
  onDismiss,
}: DockedSearchOverlayOptions) {
  const triggerRef = useDockedSearchTriggerRef(state);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dismiss = () => {
    prepareSearchBarFocusRestore(triggerRef);
    state.collapse();
    onDismiss?.();
  };
  const { overlayProps: dismissalProps } = useOverlay(
    {
      isOpen: state.isExpanded,
      onClose: dismiss,
      isDismissable: true,
    },
    overlayRef,
  );
  const { overlayProps: positionProps } = useOverlayPosition({
    targetRef: triggerRef,
    overlayRef,
    placement: 'bottom start',
    offset,
    isOpen: state.isExpanded,
    onClose: dismiss,
  });

  return {
    dismiss,
    overlayRef,
    overlayProps: mergeProps(dismissalProps, positionProps),
  };
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
  const {
    dismiss,
    overlayRef,
    overlayProps,
  } = useDockedSearchOverlay({ state, offset: 8, onDismiss });
  const mergedProps = mergeProps(props, overlayProps) as HTMLAttributes<HTMLDivElement>;

  if (!state.isExpanded) return null;

  return (
    <AriaOverlay>
      <FocusScope autoFocus restoreFocus>
        <div
          {...mergedProps}
          ref={overlayRef}
          role="dialog"
          aria-label={props['aria-label'] ?? 'Search'}
          data-elevation={searchViewTokens.containerElevation}
          data-state="expanded"
          className={join('search-view', 'search-view--docked', 'elevation-host', className)}
          style={{
            ...(mergedProps.style as CSSProperties | undefined),
            ...getSearchViewStyle('docked'),
            ...(style as CSSProperties | undefined),
          }}
        >
          <div className="search-view__header">
            <ExpandedSearchInput onDismiss={dismiss}>{inputField}</ExpandedSearchInput>
          </div>
          <div className="search-view__results">{children}</div>
        </div>
      </FocusScope>
    </AriaOverlay>
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
  const {
    dismiss,
    overlayRef,
    overlayProps,
  } = useDockedSearchOverlay({ state, offset: 0, onDismiss });
  const mergedProps = mergeProps(props, overlayProps) as HTMLAttributes<HTMLDivElement>;
  const overrides = {
    ...(dropdownGap === undefined ? {} : { '--_search-view-gap': cssLength(dropdownGap) }),
  } as CSSProperties & Record<string, string | number>;
  const scrimStyle = dropdownScrimColor === undefined
    ? undefined
    : ({ '--_search-view-scrim-color': dropdownScrimColor } as CSSProperties & Record<string, string | number>);

  if (!state.isExpanded) return null;

  return (
    <AriaOverlay>
      <div
        className="search-view__docked-gap-scrim"
        aria-hidden="true"
        style={scrimStyle}
      />
      <FocusScope autoFocus restoreFocus>
        <div
          {...mergedProps}
          ref={overlayRef}
          role="dialog"
          aria-label={props['aria-label'] ?? 'Search'}
          data-state="expanded"
          className={join('search-view', 'search-view--docked-gap', className)}
          style={{
            ...(mergedProps.style as CSSProperties | undefined),
            ...getSearchViewStyle('docked'),
            ...overrides,
            ...(style as CSSProperties | undefined),
          }}
        >
          <div
            className="search-view__header elevation-host"
            data-elevation={searchViewTokens.containerElevation}
          >
            <ExpandedSearchInput onDismiss={dismiss}>{inputField}</ExpandedSearchInput>
          </div>
          <div
            className="search-view__docked-dropdown elevation-host"
            data-elevation={searchViewTokens.containerElevation}
          >
            {children}
          </div>
        </div>
      </FocusScope>
    </AriaOverlay>
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
  const dismiss = () => {
    state.collapse();
    onDismiss?.();
  };

  return (
    <AriaModalOverlay
      isOpen={state.isExpanded}
      isDismissable={isDismissable}
      UNSTABLE_portalContainer={themePortalContainer ?? undefined}
      onOpenChange={(open) => {
        if (!open) dismiss();
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
                  <ExpandedSearchInput onDismiss={dismiss}>{inputField}</ExpandedSearchInput>
                </div>
              ) : (
                <ExpandedSearchInput onDismiss={dismiss}>{inputField}</ExpandedSearchInput>
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
