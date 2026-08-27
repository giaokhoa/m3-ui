import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  OutlinedSecureTextField,
  SecureTextField,
  ThemeProvider,
  type SecureTextFieldProps,
} from '@m3-ui/ui';

const meta = {
  title: 'Components/SecureTextField',
  component: SecureTextField,
  parameters: { layout: 'fullscreen' },
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    supportingText: 'Use at least 8 characters',
    autoComplete: 'current-password',
  },
} satisfies Meta<typeof SecureTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledExample(args: SecureTextFieldProps) {
  const [value, setValue] = useState('controlled password');
  return <SecureTextField {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {
  render: (args) => <div className="storybook-center"><SecureTextField {...args} /></div>,
};

export const WithValue: Story = {
  args: { defaultValue: 'correct horse battery staple' },
  render: (args) => <div className="storybook-center"><SecureTextField {...args} /></div>,
};

export const Outlined: Story = {
  render: (args) => <div className="storybook-center"><OutlinedSecureTextField {...args} /></div>,
};

export const Invalid: Story = {
  args: { defaultValue: 'short', isInvalid: true, errorMessage: 'Password is too short' },
  render: (args) => <div className="storybook-center"><SecureTextField {...args} /></div>,
};

export const Disabled: Story = {
  args: { defaultValue: 'disabled password', isDisabled: true },
  render: (args) => <div className="storybook-center"><SecureTextField {...args} /></div>,
};

export const ReadOnly: Story = {
  args: { defaultValue: 'read only password', isReadOnly: true },
  render: (args) => <div className="storybook-center"><SecureTextField {...args} /></div>,
};

export const Controlled: Story = {
  render: (args) => <div className="storybook-center"><ControlledExample {...args} /></div>,
};

export const FormContract: Story = {
  render: (args) => (
    <div className="storybook-center">
      <form data-testid="secure-form">
        <SecureTextField {...args} name="password" defaultValue="submitted-secret" autoComplete="new-password" />
        <button type="submit">Submit</button>
      </form>
    </div>
  ),
};

export const Rtl: Story = {
  render: (args) => (
    <div className="storybook-center" dir="rtl">
      <SecureTextField {...args} label="كلمة المرور" supportingText="نص مساعد" />
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light">
        <SecureTextField label="Filled" defaultValue="secret" />
      </ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark">
        <OutlinedSecureTextField label="Outlined" defaultValue="secret" />
      </ThemeProvider>
    </div>
  ),
};
