import { useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { TextFieldImpl, type TextFieldProps } from './TextField';

export interface SecureTextFieldProps
  extends Omit<TextFieldProps, 'isMultiline' | 'rows' | 'trailingIcon'> {
  trailingIcon?: ReactNode;
  /** Shows a keyboard-accessible reveal control after any custom trailing icon. */
  isRevealable?: boolean;
  /** Controlled reveal state. */
  isRevealed?: boolean;
  /** Initial reveal state when uncontrolled. */
  defaultRevealed?: boolean;
  onRevealChange?: (isRevealed: boolean) => void;
  revealLabel?: string;
  hideLabel?: string;
}

export type OutlinedSecureTextFieldProps = SecureTextFieldProps;

type Variant = 'filled' | 'outlined';

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {crossed ? (
        <path
          d="m3.3 2 18.7 18.7-1.3 1.3-3.1-3.1A11.5 11.5 0 0 1 12 20C5 20 1.7 13.8 1.6 13.5L1.3 13l.3-.5a18 18 0 0 1 4.2-4.8L2 3.3 3.3 2Zm4 7.2A14.7 14.7 0 0 0 3.7 13c.9 1.3 3.7 5 8.3 5 1.5 0 2.8-.4 4-.9l-1.7-1.7A4 4 0 0 1 8.6 9.7L7.3 9.2Zm4.9-.2a4 4 0 0 1 2.8 2.8l-2.8-2.8ZM12 6c-1 0-2 .2-2.9.5L7.6 5A12 12 0 0 1 12 4c7 0 10.3 6.2 10.4 6.5l.3.5-.3.5a17 17 0 0 1-2.9 3.7L18 13.8c1.1-1 1.8-2 2.3-2.8-.9-1.3-3.7-5-8.3-5Z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M12 4c7 0 10.3 6.2 10.4 6.5l.3.5-.3.5C22.3 11.8 19 18 12 18S1.7 11.8 1.6 11.5l-.3-.5.3-.5C1.7 10.2 5 4 12 4Zm0 2c-4.6 0-7.4 3.7-8.3 5 .9 1.3 3.7 5 8.3 5s7.4-3.7 8.3-5c-.9-1.3-3.7-5-8.3-5Zm0 1a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
          fill="currentColor"
        />
      )}
    </svg>
  );
}

function SecureTextFieldImpl({
  variant,
  isRevealable = true,
  isRevealed,
  defaultRevealed = false,
  onRevealChange,
  revealLabel = 'Show password',
  hideLabel = 'Hide password',
  trailingIcon,
  isDisabled,
  ...props
}: SecureTextFieldProps & { variant: Variant }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledRevealed, setUncontrolledRevealed] = useState(defaultRevealed);
  const revealed = isRevealed ?? uncontrolledRevealed;

  const setRevealed = (next: boolean) => {
    if (isRevealed === undefined) setUncontrolledRevealed(next);
    onRevealChange?.(next);
  };

  const keepInputFocused = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const toggleReveal = () => {
    const input = inputRef.current;
    const selection = input
      ? [input.selectionStart, input.selectionEnd, input.selectionDirection] as const
      : null;
    setRevealed(!revealed);

    requestAnimationFrame(() => {
      const current = inputRef.current;
      if (!current) return;
      current.focus({ preventScroll: true });
      if (selection?.[0] != null && selection[1] != null) {
        try {
          current.setSelectionRange(selection[0], selection[1], selection[2] ?? undefined);
        } catch {
          // Some browsers/input modes do not expose selection APIs. Focus/value remain intact.
        }
      }
    });
  };

  const secureTrailing =
    trailingIcon || isRevealable ? (
      <span className="secure-text-field__trailing">
        {trailingIcon}
        {isRevealable ? (
          <button
            type="button"
            className="secure-text-field__reveal"
            aria-label={revealed ? hideLabel : revealLabel}
            aria-pressed={revealed}
            disabled={isDisabled}
            onMouseDown={keepInputFocused}
            onClick={toggleReveal}
          >
            <EyeIcon crossed={revealed} />
          </button>
        ) : null}
      </span>
    ) : undefined;

  return (
    <TextFieldImpl
      {...props}
      variant={variant}
      isDisabled={isDisabled}
      isMultiline={false}
      inputType={revealed ? 'text' : 'password'}
      inputRef={inputRef}
      trailingIcon={secureTrailing}
    />
  );
}

export function SecureTextField(props: SecureTextFieldProps) {
  return <SecureTextFieldImpl {...props} variant="filled" />;
}

export function OutlinedSecureTextField(props: OutlinedSecureTextFieldProps) {
  return <SecureTextFieldImpl {...props} variant="outlined" />;
}
