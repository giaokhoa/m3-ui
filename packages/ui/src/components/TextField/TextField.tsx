import type {
  ComponentProps,
  HTMLInputTypeAttribute,
  ReactNode,
  Ref,
} from 'react';
import {
  FieldError,
  Input,
  Label,
  Text,
  TextArea,
  TextField as AriaTextField,
  type FieldErrorProps,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import '@m3-ui/tokens/text-field.css';
import './text-field.css';

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'children'> {
  label?: ReactNode;
  description?: ReactNode;
  supportingText?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
  placeholder?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  isMultiline?: boolean;
  rows?: number;
  /** Props forwarded to the native input when `isMultiline` is false. */
  inputProps?: Omit<ComponentProps<typeof Input>, 'className'>;
  /** Ref to the native input when `isMultiline` is false. */
  inputRef?: Ref<HTMLInputElement>;
}

export type OutlinedTextFieldProps = TextFieldProps;
type TextFieldVariant = 'filled' | 'outlined';

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export interface TextFieldImplProps extends TextFieldProps {
  variant: TextFieldVariant;
  inputType?: HTMLInputTypeAttribute;
}

export function TextFieldImpl({
  variant,
  label,
  description,
  supportingText,
  errorMessage,
  placeholder,
  leadingIcon,
  trailingIcon,
  prefix,
  suffix,
  isMultiline = true,
  rows,
  className,
  inputType,
  inputProps,
  inputRef,
  ...props
}: TextFieldImplProps) {
  const resolvedSupportingText = supportingText ?? description;
  const controlPlaceholder = placeholder ?? (label ? ' ' : undefined);

  const staticClasses = joinClassNames(
    'text-field',
    `text-field--${variant}`,
    label ? 'text-field--with-label' : null,
    leadingIcon ? 'text-field--with-leading' : null,
    trailingIcon ? 'text-field--with-trailing' : null,
    isMultiline ? 'text-field--multiline' : null,
  );

  const inputRow = (
    <div className="text-field__input-row">
      {prefix ? <span className="text-field__prefix">{prefix}</span> : null}
      {isMultiline ? (
        <TextArea
          className="text-field__control text-field__textarea"
          placeholder={controlPlaceholder}
          rows={rows ?? 1}
        />
      ) : (
        <Input
          {...inputProps}
          ref={inputRef}
          className="text-field__control text-field__input"
          placeholder={inputProps?.placeholder ?? controlPlaceholder}
          type={inputProps?.type ?? inputType}
        />
      )}
      {suffix ? <span className="text-field__suffix">{suffix}</span> : null}
    </div>
  );

  const leading = leadingIcon ? (
    <span className="text-field__icon text-field__icon--leading">{leadingIcon}</span>
  ) : null;
  const trailing = trailingIcon ? (
    <span className="text-field__icon text-field__icon--trailing">{trailingIcon}</span>
  ) : null;

  return (
    <AriaTextField
      {...props}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames(staticClasses, userClassName);
      }}
    >
      {variant === 'filled' ? (
        <div className="text-field__container">
          {leading}
          <div className="text-field__content">
            {label ? <Label className="text-field__label">{label}</Label> : null}
            {inputRow}
          </div>
          {trailing}
          <span className="text-field__indicator" aria-hidden="true" />
        </div>
      ) : (
        <fieldset className="text-field__container text-field__outlined-container" role="presentation">
          {label ? (
            <legend className="text-field__outline-legend" role="presentation">
              <Label className="text-field__label">{label}</Label>
            </legend>
          ) : null}
          <div className="text-field__outlined-body">
            {leading}
            <div className="text-field__content">{inputRow}</div>
            {trailing}
          </div>
        </fieldset>
      )}
      {resolvedSupportingText != null ? (
        <Text slot="description" className="text-field__supporting">
          {resolvedSupportingText}
        </Text>
      ) : null}
      <FieldError className="text-field__error">{errorMessage}</FieldError>
    </AriaTextField>
  );
}

export function TextField(props: TextFieldProps) {
  return <TextFieldImpl {...props} variant="filled" />;
}

export function OutlinedTextField(props: OutlinedTextFieldProps) {
  return <TextFieldImpl {...props} variant="outlined" />;
}
