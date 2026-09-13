import '@m3-ui/tokens/elevation.css';
import '@m3-ui/tokens/list-item.css';
import clsx from 'clsx';
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  Button as AriaButton,
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type ButtonProps as AriaButtonProps,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from 'react-aria-components';
import '../../internal/elevation/elevation.css';
import { Ripple, useRipple } from '../../internal/ripple';
import { getListItemElevationLevel } from './ListItem.elevation';
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
  value: string;
  onPress?: AriaRadioProps['onPress'];
  selected?: never;
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

export interface SegmentedListItemGroupProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function SegmentedListItemGroup({
  children,
  className,
  ...props
}: SegmentedListItemGroupProps) {
  return (
    <div
      {...props}
      className={clsx('segmented-list-item-group', className)}
    >
      {children}
    </div>
  );
}

export interface ListItemSelectionGroupProps
  extends Omit<AriaRadioGroupProps, 'children' | 'className'> {
  children: ReactNode;
  variant?: 'standard' | 'segmented';
  className?: string;
}

export function ListItemSelectionGroup({
  children,
  variant = 'standard',
  className,
  ...props
}: ListItemSelectionGroupProps) {
  return (
    <AriaRadioGroup
      {...props}
      className={clsx(
        'list-item-selection-group',
        variant === 'segmented' && 'list-item-selection-group--segmented',
        className,
      )}
    >
      {children}
    </AriaRadioGroup>
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
  const selectionMode: ListItemSelectionMode | undefined =
    'selectionMode' in props ? props.selectionMode : undefined;
  const selected =
    selectionMode === 'multiple' ? Boolean(props.selected) : false;
  const interactive = 'onPress' in props || selectionMode != null;
  const elevationLevel = getListItemElevationLevel(isDragged);

  if (!interactive) {
    return (
      <div
        aria-disabled={isDisabled || undefined}
        aria-label={ariaLabel}
        className={clsx('list-item', 'elevation-host', className)}
        data-disabled={isDisabled || undefined}
        data-dragged={isDragged || undefined}
        data-elevation={elevationLevel}
        data-lines={lineCount}
        data-testid={testId}
        style={style}
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

  if ('selectionMode' in props && props.selectionMode === 'single') {
    return (
      <AriaRadio
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
        data-testid={testId}
        isDisabled={isDisabled}
        onPress={props.onPress}
        style={style}
        value={props.value}
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
      </AriaRadio>
    );
  }

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
          selectionMode === 'multiple'
            ? { role: 'checkbox' as const, 'aria-checked': selected }
            : {};
        return <button {...domProps} {...semantics} />;
      }}
      style={style}
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