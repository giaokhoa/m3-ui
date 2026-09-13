import '@m3-ui/tokens/menu.css';
import clsx from 'clsx';
import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  ComboBoxStateContext,
  Group as AriaGroup,
  InputContext,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  useContextProps,
  type InputProps as AriaInputProps,
} from 'react-aria-components';
import { Elevation } from '../../internal/elevation';
import { menuContainerElevation, menuRuntime } from '../Menu/Menu.defaults';
import '../Menu/menu.css';
import {
  getTextFieldStaticClassName,
  TextFieldContent,
} from '../TextField/TextField';
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

interface DefaultAnchorProps {
  description?: ReactNode;
  errorMessage?: ReactNode;
  inputRef: Ref<HTMLInputElement>;
  isReadOnly: boolean;
  label?: ReactNode;
  placeholder?: string;
  secondaryTrigger?: ReactNode;
  secondaryTriggerLabel: string;
  supportingText?: ReactNode;
  variant: 'filled' | 'outlined';
}

function DefaultAnchor({
  description,
  errorMessage,
  inputRef,
  isReadOnly,
  label,
  placeholder,
  secondaryTrigger,
  secondaryTriggerLabel,
  supportingText,
  variant,
}: DefaultAnchorProps) {
  const state = useContext(ComboBoxStateContext);
  const trailing = secondaryTrigger != null ? (
    <span aria-hidden="true" className="exposed-dropdown-menu__secondary-trigger-slot" />
  ) : (
    <span aria-hidden="true" className="exposed-dropdown-menu__chevron">
      ▾
    </span>
  );

  const anchorClassName = clsx(
    'exposed-dropdown-menu__anchor',
    getTextFieldStaticClassName({
      variant,
      label,
      trailingIcon: trailing,
      isMultiline: false,
    }),
  );

  return (
    <AriaGroup className={anchorClassName}>
      <TextFieldContent
        variant={variant}
        label={label}
        description={description}
        supportingText={supportingText}
        errorMessage={errorMessage as never}
        placeholder={placeholder}
        isMultiline={false}
        trailingIcon={trailing}
        inputRef={inputRef}
        inputProps={{
          readOnly: isReadOnly,
          onClick: () => {
            if (isReadOnly) {
              state?.toggle(null, 'manual');
            } else if (!state?.isOpen) {
              state?.open(null, 'manual');
            }
          },
        }}
      />
      {secondaryTrigger != null ? (
        <AriaButton
          aria-label={secondaryTriggerLabel}
          className="exposed-dropdown-menu__secondary-trigger"
        >
          {secondaryTrigger}
        </AriaButton>
      ) : null}
    </AriaGroup>
  );
}

interface CustomAnchorProps {
  isDisabled: boolean;
  isReadOnly: boolean;
  renderAnchor: (props: ExposedDropdownMenuAnchorRenderProps) => ReactNode;
}

function CustomAnchor({ isDisabled, isReadOnly, renderAnchor }: CustomAnchorProps) {
  const state = useContext(ComboBoxStateContext);
  const localRef = useRef<HTMLInputElement>(null);
  const [contextInputProps, inputRef] = useContextProps(
    {} as AriaInputProps,
    localRef,
    InputContext,
  );
  const contextOnClick = contextInputProps.onClick;
  const inputProps = {
    ...contextInputProps,
    readOnly: isReadOnly || contextInputProps.readOnly,
    onClick: (event: React.MouseEvent<HTMLInputElement>) => {
      contextOnClick?.(event);
      if (event.defaultPrevented) return;
      if (isReadOnly) {
        state?.toggle(null, 'manual');
      } else if (!state?.isOpen) {
        state?.open(null, 'manual');
      }
    },
  } as unknown as ComponentProps<'input'>;

  return (
    <AriaGroup className="exposed-dropdown-menu__anchor">
      {renderAnchor({
        inputRef,
        value: state?.inputValue ?? '',
        isOpen: state?.isOpen ?? false,
        isDisabled,
        isReadOnly,
        inputProps,
        onPress: () => state?.toggle(null, 'manual'),
      })}
    </AriaGroup>
  );
}

interface ControlledOpenBridgeProps {
  isOpen: boolean;
  syncingRef: MutableRefObject<boolean>;
}

function ControlledOpenBridge({ isOpen, syncingRef }: ControlledOpenBridgeProps) {
  const state = useContext(ComboBoxStateContext);

  useEffect(() => {
    if (!state || state.isOpen === isOpen) return;
    syncingRef.current = true;
    state.setOpen(isOpen);
    syncingRef.current = false;
  }, [isOpen, state, syncingRef]);

  return null;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const syncingOpenRef = useRef(false);
  const selectedItem = useMemo(
    () => items.find((item) => item.value === value),
    [items, value],
  );
  const itemByValue = useMemo(
    () => new Map(items.map((item) => [item.value, item] as const)),
    [items],
  );
  const disabledKeys = useMemo(
    () => items.filter((item) => item.isDisabled).map((item) => item.value),
    [items],
  );
  const isReadOnly = readOnlyProp ?? (inputValue === undefined && onInputChange === undefined);
  const effectiveOpen = isOpen && !isDisabled;
  const accessibleLabel = ariaLabel ?? (typeof label === 'string' ? label : undefined);
  const comboAriaLabel = renderAnchor == null && label != null ? undefined : accessibleLabel;

  const controlledInputValue = isReadOnly ? (selectedItem?.label ?? '') : inputValue;
  const defaultInputValue =
    !isReadOnly && inputValue === undefined ? (selectedItem?.label ?? '') : undefined;
  const comboValue =
    !isReadOnly &&
    inputValue !== undefined &&
    selectedItem != null &&
    inputValue !== selectedItem.label
      ? null
      : value || null;

  return (
    <AriaComboBox
      aria-label={accessibleLabel}
      items={items}
      value={comboValue}
      onChange={(nextValue) => {
        if (typeof nextValue !== 'string') return;
        const item = itemByValue.get(nextValue);
        if (!item) return;
        onSelectionChange(item.value, item);
        if (!isReadOnly) onInputChange?.(item.label);
      }}
      inputValue={controlledInputValue}
      defaultInputValue={defaultInputValue}
      onInputChange={isReadOnly ? undefined : onInputChange}
      disabledKeys={disabledKeys}
      allowsCustomValue={!isReadOnly}
      menuTrigger={isReadOnly ? 'manual' : 'focus'}
      onOpenChange={(nextOpen) => {
        if (!syncingOpenRef.current) onOpenChange(nextOpen);
      }}
      isDisabled={isDisabled}
      isRequired={isRequired}
      className={clsx('exposed-dropdown-menu', className)}
      style={style}
    >
      <ControlledOpenBridge isOpen={effectiveOpen} syncingRef={syncingOpenRef} />
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {renderAnchor ? (
        <CustomAnchor
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          renderAnchor={renderAnchor}
        />
      ) : (
        <DefaultAnchor
          description={description}
          errorMessage={errorMessage}
          inputRef={inputRef}
          isReadOnly={isReadOnly}
          label={label}
          placeholder={placeholder}
          secondaryTrigger={secondaryTrigger}
          secondaryTriggerLabel={secondaryTriggerLabel}
          supportingText={supportingText}
          variant={variant}
        />
      )}
      <AriaPopover
        placement="bottom start"
        offset={4}
        containerPadding={menuRuntime.viewportMargin}
        shouldFlip
        className="menu-popover exposed-dropdown-menu__popover"
        style={matchAnchorWidth ? { inlineSize: 'var(--trigger-width)' } : undefined}
      >
        <div className="menu-surface">
          <Elevation level={menuContainerElevation} />
          <div className="menu-surface__clip">
            <AriaListBox<ExposedDropdownMenuItem<T>>
              aria-label={accessibleLabel ?? 'Options'}
              className="menu exposed-dropdown-menu__listbox"
            >
              {(item) => (
                <AriaListBoxItem
                  id={item.value}
                  textValue={item.label}
                  isDisabled={item.isDisabled}
                  className="menu-item exposed-dropdown-menu__option"
                >
                  {({ isDisabled: itemDisabled, isFocused, isSelected }) => (
                    <span className="menu-item__body">
                      <span className="menu-item__label">
                        {renderItem
                          ? renderItem(item, {
                              isActive: isFocused,
                              isSelected,
                              isDisabled: itemDisabled,
                            })
                          : item.label}
                      </span>
                    </span>
                  )}
                </AriaListBoxItem>
              )}
            </AriaListBox>
          </div>
        </div>
      </AriaPopover>
    </AriaComboBox>
  );
}
