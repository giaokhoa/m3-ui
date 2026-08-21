import {
  FieldError,
  Input,
  Label,
  Text,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import './text-field.css';

export interface TextFieldProps extends AriaTextFieldProps {
  label: string;
  description?: string;
  placeholder?: string;
}

export function TextField({ label, description, placeholder, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className="m3-text-field">
      <Label className="m3-text-field__label">{label}</Label>
      <Input className="m3-text-field__input" placeholder={placeholder} />
      {description ? <Text slot="description" className="m3-text-field__description">{description}</Text> : null}
      <FieldError className="m3-text-field__error" />
    </AriaTextField>
  );
}
