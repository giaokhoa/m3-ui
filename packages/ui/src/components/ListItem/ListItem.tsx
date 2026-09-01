import '@m3-ui/tokens/elevation.css';
import clsx from 'clsx';
import {
  createContext,
  useContext,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import '../../internal/elevation/elevation.css';
import { Ripple, useRipple } from '../../internal/ripple';
import {
  getListItemElevationLevel,
  getListItemStyle,
  type ListItemInteractionState,
} from './ListItem.defaults';
import './list-item.css';

type ListItemLineCount = 1 | 2 | 3;
type ListItemSelectionMode = 'single' | 'multiple';

interface CommonListItemProps {
  children: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  overline?: ReactNode;
  supportingText?: ReactNode;
  lineCount?: ListItemLineCount;
  isDisabled?: boolean;
  isDragged?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
  'data-testid'?: string;
}

export interface PassiveListItemProps extends CommonListItemProps {
  onPress?: never;
  selectionMode?: never;
  selected?: never;
  onSelectionChange?: never;
}

export interface ActionListItemProps extends CommonListItemProps {
  onPress: NonNullable<AriaButtonProps['onPress']>;
  selectionMode?: never;
  selected?: never;
  onSelectionChange?: never;
}

export interface SingleSelectionListItemProps extends CommonListItemProps {
  selectionMode: 'single';
  selected: boolean;
  onPress: NonNullable<AriaButtonProps['onPress']>;
  onSelectionChange?: never;
}

export interface MultipleSelectionListItemProps extends CommonListItemProps {
  selectionMode: 'multiple';
  selected: boolean;
  onSelectionChange: (selected: boolean) => void;
  onPress?: never;
}

export type ListItemProps =
  | PassiveListItemProps
  | ActionListItemProps
  | SingleSelectionListItemProps
  | MultipleSelectionListItemProps;

export interface ListItemSelectionGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  children: ReactNode;
}

const SingleSelectionGroupContext = createContext(false);

export function ListItemSelectionGroup({
  children,
  className,
  onKeyDown,
  ...props
}: ListItemSelectionGroupProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (
      ![
        'ArrowDown',
        'ArrowUp',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
      ].includes(event.key)
    ) {
      return;
    }

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]:not([disabled])',
      ),
    );
    if (items.length === 0) return;
    const current = document.activeElement as HTMLButtonElement | null;
    const currentIndex = current ? items.indexOf(current) : -1;
    let nextIndex = currentIndex;

    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    } else {
      nextIndex =
        currentIndex < 0
          ? items.length - 1
          : (currentIndex - 1 + items.length) % items.length;
    }

    event.preventDefault();
    const next = items[nextIndex];
    next?.focus();
    next?.click();
  };

  return (
    <SingleSelectionGroupContext.Provider value>
      <div
        {...props}
        className={clsx('list-item-selection-group', className)}
        role="radiogroup"
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </SingleSelectionGroupContext.Provider>
  );
}

function inferLineCount(
  lineCount: ListItemLineCount | undefined,
  overline: ReactNode,
  supportingText: ReactNode,
): ListItemLineCount {
  if (lineCount) return lineCount;
  if (overline != null && supportingText != null) return 3;
  if (overline != null || supportingText != null) return 2;
  return 1;
}

function ListItemContent({
  children,
  leading,
  trailing,
  overline,
  supportingText,
  ripple,
  isFocusVisible,
  isHovered,
}: Pick<
  CommonListItemProps,
  'children' | 'leading' | 'trailing' | 'overline' | 'supportingText'
> & {
  ripple?: ReturnType<typeof useRipple>;
  isFocusVisible?: boolean;
  isHovered?: boolean;
}) {
  return (
    <>
      {ripple ? (
        <Ripple
          controller={ripple}
          state={{ isFocusVisible, isHovered }}
        />
      ) : null}
      {leading != null ? (
        <span className="list-item__leading" aria-hidden="true">
          {leading}
        </span>
      ) : null}
      <span className="list-item__text">
        {overline != null ? (
          <span className="list-item__overline">{overline}</span>
        ) : null}
        <span className="list-item__headline">{children}</span>
        {supportingText != null ? (
          <span className="list-item__supporting">{supportingText}</span>
        ) : null}
      </span>
      {trailing != null ? (
        <span className="list-item__trailing">{trailing}</span>
      ) : null}
    </>
  );
}

function interactiveStyle(
  lineCount: ListItemLineCount,
  selected: boolean,
  isDragged: boolean,
  renderProps: {
    isHovered: boolean;
    isPressed: boolean;
    isFocusVisible: boolean;
    isDisabled: boolean;
  },
  style?: CSSProperties,
) {
  const state: ListItemInteractionState = {
    isHovered: renderProps.isHovered,
    isPressed: renderProps.isPressed,
    isFocusVisible: renderProps.isFocusVisible,
    isDisabled: renderProps.isDisabled,
    isSelected: selected,
    isDragged,
  };
  return { ...getListItemStyle(lineCount, state), ...style };
}

export function ListItem(props: ListItemProps) {
  const {
    children,
    leading,
    trailing,
    overline,
    supportingText,
    lineCount: explicitLineCount,
    isDisabled = false,
    isDragged = false,
    className,
    style,
    'aria-label': ariaLabel,
    'data-testid': testId,
  } = props;
  const lineCount = inferLineCount(
    explicitLineCount,
    overline,
    supportingText,
  );
  const selected = 'selected' in props ? Boolean(props.selected) : false;
  const selectionMode: ListItemSelectionMode | undefined =
    'selectionMode' in props ? props.selectionMode : undefined;
  const inSingleSelectionGroup = useContext(SingleSelectionGroupContext);
  const interactive = 'onPress' in props || selectionMode === 'multiple';
  const elevationLevel = getListItemElevationLevel({ isDragged });

  if (!interactive) {
    return (
      <div
        aria-disabled={isDisabled || undefined}
        aria-label={ariaLabel}
        className={clsx('list-item', 'elevation-host', className)}
        data-dragged={isDragged || undefined}
        data-elevation={elevationLevel}
        data-lines={lineCount}
        data-testid={testId}
        style={{
          ...getListItemStyle(lineCount, { isDisabled, isDragged }),
          ...style,
        }}
      >
        <ListItemContent
          children={children}
          leading={leading}
          trailing={trailing}
          overline={overline}
          supportingText={supportingText}
        />
      </div>
    );
  }

  const ripple = useRipple({ origin: 'press' });
  const ripplePressProps = ripple.getPressProps();
  const suppliedOnPress = 'onPress' in props ? props.onPress : undefined;
  const handlePress: AriaButtonProps['onPress'] = (event) => {
    if (
      selectionMode === 'multiple' &&
      typeof props.onSelectionChange === 'function'
    ) {
      props.onSelectionChange(!props.selected);
      return;
    }
    suppliedOnPress?.(event);
  };

  return (
    <AriaButton
      {...ripplePressProps}
      aria-label={ariaLabel}
      className={clsx(
        'list-item',
        'list-item--interactive',
        'elevation-host',
        className,
      )}
      data-dragged={isDragged || undefined}
      data-elevation={elevationLevel}
      data-lines={lineCount}
      data-selected={selected || undefined}
      data-testid={testId}
      isDisabled={isDisabled}
      onPress={handlePress}
      render={(domProps) => {
        const semantics =
          selectionMode === 'single'
            ? {
                role: 'radio' as const,
                'aria-checked': selected,
                tabIndex: inSingleSelectionGroup
                  ? selected
                    ? 0
                    : -1
                  : domProps.tabIndex,
              }
            : selectionMode === 'multiple'
              ? { role: 'checkbox' as const, 'aria-checked': selected }
              : {};
        return <button {...domProps} {...semantics} />;
      }}
      style={(renderProps) =>
        interactiveStyle(lineCount, selected, isDragged, renderProps, style)
      }
    >
      {(renderProps) => (
        <ListItemContent
          children={children}
          leading={leading}
          trailing={trailing}
          overline={overline}
          supportingText={supportingText}
          ripple={ripple}
          isFocusVisible={renderProps.isFocusVisible}
          isHovered={renderProps.isHovered}
        />
      )}
    </AriaButton>
  );
}
