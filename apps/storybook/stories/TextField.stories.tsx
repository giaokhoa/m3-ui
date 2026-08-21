import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField, ThemeProvider } from '@m3/ui';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    label: 'Label',
    supportingText: 'Supporting text',
    placeholder: 'Placeholder',
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M4 5h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2Zm8 7 8-5H4l8 5Zm0 2.3L4 9.3V17h16V9.3l-8 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m7.4 18-1.4-1.4 4.6-4.6L6 7.4 7.4 6l4.6 4.6L16.6 6 18 7.4 13.4 12l4.6 4.6-1.4 1.4-4.6-4.6L7.4 18Z" fill="currentColor" />
    </svg>
  );
}

function FieldStack() {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <TextField label="Empty" placeholder="Placeholder" />
      <TextField label="Filled" defaultValue="Input text" />
      <TextField
        label="Invalid"
        defaultValue="Bad value"
        isInvalid
        errorMessage="This value needs attention"
      />
      <TextField label="Disabled" defaultValue="Input text" isDisabled supportingText="Supporting text" />
    </div>
  );
}

export const Default: Story = {
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Input text',
    placeholder: undefined,
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    defaultValue: 'Invalid value',
    isInvalid: true,
    supportingText: undefined,
    description: undefined,
    errorMessage: 'This value needs attention',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: 'Input text',
    isDisabled: true,
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const ReadOnly: Story = {
  args: {
    defaultValue: 'Read-only value',
    isReadOnly: true,
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    'aria-label': 'Search',
    placeholder: 'Search',
    supportingText: undefined,
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const AffixesAndIcons: Story = {
  args: {
    label: 'Email',
    defaultValue: 'hello',
    placeholder: undefined,
    leadingIcon: <MailIcon />,
    trailingIcon: <ClearIcon />,
    prefix: 'mailto:',
    suffix: '@example.com',
    supportingText: 'Leading/trailing icons and prefix/suffix slots',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const Multiline: Story = {
  args: {
    label: 'Message',
    defaultValue: 'A multiline Material 3 text field\nwith native textarea semantics.',
    placeholder: undefined,
    isMultiline: true,
    rows: 3,
    supportingText: 'Supporting text',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="m3-storybook-center">
      <FieldStack />
    </div>
  ),
};

export const ThemeMatrix: Story = {
  render: () => (
    <div className="m3-storybook-theme-grid m3-storybook-theme-grid--text-field">
      <ThemeProvider className="m3-storybook-theme-card" mode="light">
        <h3>Baseline · Light</h3>
        <FieldStack />
      </ThemeProvider>

      <ThemeProvider className="m3-storybook-theme-card" mode="dark">
        <h3>Baseline · Dark</h3>
        <FieldStack />
      </ThemeProvider>

      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="light"
        sourceColor="#006a60"
      >
        <h3>Dynamic · #006A60</h3>
        <FieldStack />
      </ThemeProvider>

      <ThemeProvider
        className="m3-storybook-theme-card"
        mode="dark"
        sourceColor="#b3261e"
      >
        <h3>Dynamic dark · #B3261E</h3>
        <FieldStack />
      </ThemeProvider>
    </div>
  ),
};
