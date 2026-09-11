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
import {
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

// Expanded surfaces own the initial query focus. Keep this internal so an
// inputField may be composed through arbitrary wrappers while the actual
// SearchBarInput still participates in React Aria's modal FocusScope.
const SearchBarInputAutoFocusContext = createContext(false);

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
    // itself. This mirrors React Spectrum's mobile-search pattern: the query
    // field focuses in a passive effect before the parent useDialog fallback
    // decides whether it needs to focus the dialog surface.
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

interface ExpandedSearchBarBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  state: SearchBarState;
  inputField: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
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

  useEffect(() => {
    if (!state.isExpanded) return;
    const onPointerDown = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) {
        state.collapse();
        onDismiss?.();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        state.collapse();
        onDismiss?.();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [state, onDismiss]);

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

export interface ExpandedFullScreenSearchBarProps
  extends ExpandedSearchBarBaseProps {
  isDismissable?: boolean;
}

export function ExpandedFullScreenSearchBar({
  state,
  inputField,
  children,
  className,
  style,
  onDismiss,
  isDismissable = true,
  ...props
}: ExpandedFullScreenSearchBarProps) {
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
            className={join('search-view', 'search-view--fullscreen', 'elevation-host', className)}
            style={{ ...getSearchViewStyle('fullscreen'), ...(style as CSSProperties | undefined) }}
          >
            <div className="search-view__header">
              <ExpandedSearchInput>{inputField}</ExpandedSearchInput>
            </div>
            <div className="search-view__results">{children}</div>
          </div>
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}
