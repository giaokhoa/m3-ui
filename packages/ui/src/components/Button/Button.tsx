import { Button as AriaButton, type ButtonProps as AriaButtonProps } from 'react-aria-components';
import './button.css';

export type ButtonProps = AriaButtonProps;

export function Button(props: ButtonProps) {
  return <AriaButton {...props} className={({ isPressed }) => `m3-button${isPressed ? ' is-pressed' : ''}`} />;
}
