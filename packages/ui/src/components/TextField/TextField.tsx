import type { ReactNode } from 'react';
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
import {
  filledTextFieldBaseStyle,
  outlinedTextFieldBaseStyle,
} from './TextField.defaults';
import './text-field.css';

export interface TextFieldProps extends Omit<AriaTextFieldProps, 'children'> {
  /** Material label slot. */
  label?: ReactNode;
  /** Existing API alias for Material supporting text. */
  description?: ReactNode;
  supportingText?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
  placeholder?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /**
   * Compose text fields default to MultiLine(minHeightInLines = 1). Set false
   * to opt into single-line input semantics.
   */
  isMultiline?: boolean;
  /** Native textarea fallback row count. Modern browsers auto-size to content. */
  rows?: number;
}

export type OutlinedTextFieldProps = TextFieldProps;

type TextFieldVariant = 'filled' | 'outlined';

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

interface TextFieldImplProps extends TextFieldProps {
  variant: TextFieldVariant;
}

function TextFieldImpl({
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
  style,
  ...props
}: TextFieldImplProps) {
  const resolvedSupportingText = supportingText ?? description;
  // :placeholder-shown gives us the browser's actual controlled/uncontrolled empty
  // state without duplicating RAC value state in React. A blank placeholder keeps
  // that state observable when a floating label exists but no visible placeholder does.
  const controlPlaceholder = placeholder ?? (label ? ' ' : undefined);

  const staticClasses = joinClassNames(
    'm3-text-field',
    `m3-text-field--${variant}`,
    label ? 'm3-text-field--with-label' : null,
    leadingIcon ? 'm3-text-field--with-leading' : null,
    trailingIcon ? 'm3-text-field--with-trailing' : null,
    isMultiline ? 'm3-text-field--multiline' : null,
  );

  const inputRow = (
    <div className="m3-text-field__input-row">
      {prefix ? <span className="m3-text-field__prefix">{prefix}</span> : null}

      {isMultiline ? (
        <TextArea
          className="m3-text-field__control m3-text-field__textarea"
          placeholder={controlPlaceholder}
          rows={rows ?? 1}
        />
      ) : (
        <Input
          className="m3-text-field__control m3-text-field__input"
          placeholder={controlPlaceholder}
        />
      )}

      {suffix ? <span className="m3-text-field__suffix">{suffix}</span> : null}
    </div>
  );

  const leading = leadingIcon ? (
    <span className="m3-text-field__icon m3-text-field__icon--leading">
      {leadingIcon}
    </span>
  ) : null;

  const trailing = trailingIcon ? (
    <span className="m3-text-field__icon m3-text-field__icon--trailing">
      {trailingIcon}
    </span>
  ) : null;

  return (
    <AriaTextField
      {...props}
      className={(renderProps) => {
        const userClassName =
          typeof className === 'function' ? className(renderProps) : className;
        return joinClassNames(staticClasses, userClassName);
      }}
      style={(renderProps) => {
        const userStyle = typeof style === 'function' ? style(renderProps) : style;
        const baseStyle =
          variant === 'filled'
            ? filledTextFieldBaseStyle
            : outlinedTextFieldBaseStyle;
        return { ...baseStyle, ...userStyle };
      }}
    >
      {variant === 'filled' ? (
        <div className="m3-text-field__container">
          {leading}

          <div className="m3-text-field__content">
            {label ? <Label className="m3-text-field__label">{label}</Label> : null}
            {inputRow}
          </div>

          {trailing}
          <span className="m3-text-field__indicator" aria-hidden="true" />
        </div>
      ) : (
        <fieldset
          className="m3-text-field__container m3-text-field__outlined-container"
          role="presentation"
        >
          {label ? (
            <legend className="m3-text-field__outline-legend" role="presentation">
              <Label className="m3-text-field__label">{label}</Label>
            </legend>
          ) : null}

          <div className="m3-text-field__outlined-body">
            {leading}
            <div className="m3-text-field__content">{inputRow}</div>
            {trailing}
          </div>
        </fieldset>
      )}

      {resolvedSupportingText != null ? (
        <Text slot="description" className="m3-text-field__supporting">
          {resolvedSupportingText}
        </Text>
      ) : null}

      <FieldError className="m3-text-field__error">{errorMessage}</FieldError>
    </AriaTextField>
  );
}

export function TextField(props: TextFieldProps) {
  return <TextFieldImpl {...props} variant="filled" />;
}

export function OutlinedTextField(props: OutlinedTextFieldProps) {
  return <TextFieldImpl {...props} variant="outlined" />;
}
