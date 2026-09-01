import '@m3-ui/tokens/menu.css';
import clsx from 'clsx';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { Popover as AriaPopover } from 'react-aria-components';
import { menuRuntime } from '../Menu/Menu.defaults';
import { OutlinedTextField, TextField } from '../TextField';
import { calculateExposedDropdownMaxHeight } from './ExposedDropdownMenu.utils';
import './exposed-dropdown-menu.css';

export interface ExposedDropdownMenuItem<T = unknown> {
  value: string;
  label: string;
  isDisabled?: boolean;
  data?: T;
}

export interface ExposedDropdownMenuItemRenderState {
  isActive: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

interface DropdownMenuItemProps<T> {
  item: ExposedDropdownMenuItem<T>;
  index: number;
  isSelected: boolean;
  isActive: boolean;
  disabled: boolean;
  optionIdPrefix: string;
  setActiveIndex: (index: number) => void;
  selectIndex: (index: number) => void;
  renderItem?: (
    item: ExposedDropdownMenuItem<T>,
    state: ExposedDropdownMenuItemRenderState,
  ) => ReactNode;
}

function DropdownMenuItem<T>({
  item,
  index,
  isSelected,
  isActive,
  disabled,
  optionIdPrefix,
  setActiveIndex,
  selectIndex,
  renderItem,
}: DropdownMenuItemProps<T>) {
  return (
    <div
      id={`${optionIdPrefix}-${index}`}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      data-selected={isSelected || undefined}
      data-focused={isActive || undefined}
      data-disabled={disabled || undefined}
      className="menu-item exposed-dropdown-menu__option"
      onMouseEnter={() => {
        if (!disabled) setActiveIndex(index);
      }}
      onClick={() => selectIndex(index)}
    >
      <span className="menu-item__body">
        <span className="menu-item__label">
          {renderItem
            ? renderItem(item, {
                isActive,
                isSelected,
                isDisabled: disabled,
              })
            : item.label}
        </span>
      </span>
    </div>
  );
}

export interface ExposedDropdownMenuAnchorRenderProps {
  inputRef: Ref<HTMLInputElement>;
  value: string;
  isOpen: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  inputProps: ComponentProps<'input'>;
  onPress: () => void;
}

export interface ExposedDropdownMenuProps<T = unknown> {
  items: readonly ExposedDropdownMenuItem<T>[];
  value: string;
  onSelectionChange: (value: string, item: ExposedDropdownMenuItem<T>) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  matchAnchorWidth?: boolean;
  variant?: 'filled' | 'outlined';
  label?: ReactNode;
  description?: ReactNode;
  supportingText?: ReactNode;
  errorMessage?: ReactNode;
  placeholder?: string;
  name?: string;
  isRequired?: boolean;
  className?: string;
  style?: CSSProperties;
  secondaryTrigger?: ReactNode;
  secondaryTriggerLabel?: string;
  renderItem?: (
    item: ExposedDropdownMenuItem<T>,
    state: ExposedDropdownMenuItemRenderState,
  ) => ReactNode;
  renderAnchor?: (props: ExposedDropdownMenuAnchorRenderProps) => ReactNode;
  'aria-label'?: string;
}

function firstEnabledIndex<T>(items: readonly ExposedDropdownMenuItem<T>[]) {
  return items.findIndex((item) => !item.isDisabled);
}

function nextEnabledIndex<T>(
  items: readonly ExposedDropdownMenuItem<T>[],
  current: number,
  delta: 1 | -1,
) {
  if (items.length === 0) return -1;
  let index = current;
  for (let count = 0; count < items.length; count += 1) {
    index = (index + delta + items.length) % items.length;
    if (!items[index]?.isDisabled) return index;
  }
  return -1;
}

export function ExposedDropdownMenu<T = unknown>({
  items,
  value,
  onSelectionChange,
  isOpen,
  onOpenChange,
  inputValue,
  onInputChange,
  isDisabled = false,
  isReadOnly: readOnlyProp,
  matchAnchorWidth = menuRuntime.exposedMatchAnchorWidth,
  variant = 'filled',
  label,
  description,
  supportingText,
  errorMessage,
  placeholder,
  name,
  isRequired,
  className,
  style,
  secondaryTrigger,
  secondaryTriggerLabel = 'Toggle options',
  renderItem,
  renderAnchor,
  'aria-label': ariaLabel,
}: ExposedDropdownMenuProps<T>) {
  const popupId = useId();
  const optionIdPrefix = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalInputValue, setInternalInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [maxHeight, setMaxHeight] = useState<number>();

  const selectedIndex = useMemo(
    () => items.findIndex((item) => item.value === value),
    [items, value],
  );
  const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : undefined;
  const isReadOnly = readOnlyProp ?? (inputValue === undefined && onInputChange === undefined);
  const editableValue = inputValue ?? internalInputValue;
  const displayValue = isReadOnly ? (selectedItem?.label ?? '') : editableValue;
  const effectiveOpen = isOpen && !isDisabled;

  const setInput = useCallback(
    (next: string) => {
      if (inputValue === undefined) setInternalInputValue(next);
      onInputChange?.(next);
    },
    [inputValue, onInputChange],
  );

  const open = useCallback(() => {
    if (isDisabled) return;
    const initial = selectedIndex >= 0 && !items[selectedIndex]?.isDisabled
      ? selectedIndex
      : firstEnabledIndex(items);
    setActiveIndex(initial);
    onOpenChange(true);
  }, [isDisabled, items, onOpenChange, selectedIndex]);

  const close = useCallback(() => {
    onOpenChange(false);
    setActiveIndex(-1);
  }, [onOpenChange]);

  const selectIndex = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item || item.isDisabled) return;
      onSelectionChange(item.value, item);
      if (!isReadOnly) setInput(item.label);
      close();
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [close, isReadOnly, items, onSelectionChange, setInput],
  );

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (isDisabled) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        if (!effectiveOpen) {
          open();
          return;
        }
        setActiveIndex((current) =>
          nextEnabledIndex(items, current < 0 ? selectedIndex : current, delta),
        );
        return;
      }
      if (event.key === 'Home' && effectiveOpen) {
        event.preventDefault();
        setActiveIndex(firstEnabledIndex(items));
        return;
      }
      if (event.key === 'End' && effectiveOpen) {
        event.preventDefault();
        for (let index = items.length - 1; index >= 0; index -= 1) {
          if (!items[index]?.isDisabled) {
            setActiveIndex(index);
            break;
          }
        }
        return;
      }
      if (event.key === 'Enter') {
        if (effectiveOpen && activeIndex >= 0) {
          event.preventDefault();
          selectIndex(activeIndex);
        } else if (isReadOnly) {
          event.preventDefault();
          open();
        }
        return;
      }
      if (event.key === ' ' && isReadOnly && !effectiveOpen) {
        event.preventDefault();
        open();
        return;
      }
      if (event.key === 'Escape' && effectiveOpen) {
        event.preventDefault();
        close();
      }
    }, [
      activeIndex,
      close,
      effectiveOpen,
      isDisabled,
      isReadOnly,
      items,
      open,
      selectIndex,
      selectedIndex,
    ],
  );

  useEffect(() => {
    if (!effectiveOpen) return;
    const update = () => {
      const bounds = anchorRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const bottom = top + (viewport?.height ?? window.innerHeight);
      setMaxHeight(
        calculateExposedDropdownMaxHeight(
          { top, bottom },
          { top: bounds.top, bottom: bounds.bottom },
          menuRuntime.viewportMargin,
        ),
      );
    };
    update();
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const observer = new ResizeObserver(update);
    if (anchorRef.current) observer.observe(anchorRef.current);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer.disconnect();
    };
  }, [effectiveOpen]);

  useEffect(() => {
    if (!effectiveOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const path = event.composedPath();
      const anchor = anchorRef.current;
      const popup = document.getElementById(popupId);
      if ((anchor && path.includes(anchor)) || (popup && path.includes(popup))) return;
      close();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [close, effectiveOpen, popupId]);

  useEffect(() => {
    if (!isReadOnly && inputValue === undefined && internalInputValue === '' && selectedItem) {
      setInternalInputValue(selectedItem.label);
    }
  }, [inputValue, internalInputValue, isReadOnly, selectedItem]);

  const activeDescendant =
    effectiveOpen && activeIndex >= 0 ? `${optionIdPrefix}-${activeIndex}` : undefined;
  const inputProps: ComponentProps<'input'> = {
    role: 'combobox',
    'aria-autocomplete': isReadOnly ? 'none' : 'list',
    'aria-expanded': effectiveOpen,
    'aria-controls': popupId,
    'aria-activedescendant': activeDescendant,
    'aria-haspopup': 'listbox',
    onKeyDown: onInputKeyDown,
    onFocus: () => {
      if (!isReadOnly && !effectiveOpen) open();
    },
    onClick: () => {
      if (isReadOnly) {
        if (effectiveOpen) close();
        else open();
      } else if (!effectiveOpen) {
        open();
      }
    },
  };

  const secondary = secondaryTrigger != null ? (
    <button
      type="button"
      className="exposed-dropdown-menu__secondary-trigger"
      aria-label={secondaryTriggerLabel}
      aria-haspopup="listbox"
      aria-expanded={effectiveOpen}
      aria-controls={popupId}
      disabled={isDisabled}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (effectiveOpen) close();
        else open();
        requestAnimationFrame(() => inputRef.current?.focus());
      }}
    >
      {secondaryTrigger}
    </button>
  ) : (
    <span aria-hidden="true" className="exposed-dropdown-menu__chevron">
      ▾
    </span>
  );

  const defaultAnchor = (() => {
    const Field = variant === 'outlined' ? OutlinedTextField : TextField;
    return (
      <Field
        aria-label={ariaLabel}
        label={label}
        description={description}
        supportingText={supportingText}
        errorMessage={errorMessage as never}
        placeholder={placeholder}
        value={displayValue}
        onChange={(next) => {
          if (isReadOnly) return;
          setInput(next);
          if (!effectiveOpen) open();
        }}
        isReadOnly={isReadOnly}
        isDisabled={isDisabled}
        isRequired={isRequired}
        isMultiline={false}
        trailingIcon={secondary}
        inputRef={inputRef}
        inputProps={inputProps}
      />
    );
  })();

  return (
    <div
      ref={anchorRef}
      className={clsx('exposed-dropdown-menu', className)}
      style={style}
      data-open={effectiveOpen || undefined}
      data-readonly={isReadOnly || undefined}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {renderAnchor
        ? renderAnchor({
            inputRef,
            value: displayValue,
            isOpen: effectiveOpen,
            isDisabled,
            isReadOnly,
            inputProps,
            onPress: effectiveOpen ? close : open,
          })
        : defaultAnchor}
      <AriaPopover
        isNonModal
        isOpen={effectiveOpen}
        onOpenChange={(next) => {
          if (next) open();
          else close();
        }}
        triggerRef={anchorRef}
        placement="bottom start"
        offset={4}
        containerPadding={menuRuntime.viewportMargin}
        shouldFlip
        className="menu-popover exposed-dropdown-menu__popover"
        style={{
          ...(matchAnchorWidth ? { inlineSize: 'var(--trigger-width)' } : null),
          ...(maxHeight != null ? { maxHeight } : null),
        }}
      >
        <div
          id={popupId}
          role="listbox"
          aria-label={ariaLabel ?? (typeof label === 'string' ? label : 'Options')}
          className="menu exposed-dropdown-menu__listbox"
          onMouseDown={(event) => {
            if (!isReadOnly) event.preventDefault();
          }}
        >
          {items.map((item, index) => {
            const isSelected = item.value === value;
            const isActive = index === activeIndex;
            const disabled = Boolean(item.isDisabled);
            return (
              <DropdownMenuItem
                key={item.value}
                item={item}
                index={index}
                isSelected={isSelected}
                isActive={isActive}
                disabled={disabled}
                optionIdPrefix={optionIdPrefix}
                setActiveIndex={setActiveIndex}
                selectIndex={selectIndex}
                renderItem={renderItem}
              />
            );
          })}
        </div>
      </AriaPopover>
    </div>
  );
}
