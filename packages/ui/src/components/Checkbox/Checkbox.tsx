import { Checkbox as AriaCheckbox, type CheckboxProps as AriaCheckboxProps } from 'react-aria-components';
import './checkbox.css';

export type CheckboxProps = AriaCheckboxProps;

export function Checkbox({ children, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox {...props} className="m3-checkbox">
      {({ isSelected }) => (
        <>
          <span className="m3-checkbox__box" aria-hidden="true">{isSelected ? '✓' : ''}</span>
          <span>{children}</span>
        </>
      )}
    </AriaCheckbox>
  );
}
