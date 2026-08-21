import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from '@m3/ui';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    label: 'Label',
    description: 'Supporting text',
    placeholder: 'Placeholder',
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    isInvalid: true,
    description: 'This value needs attention',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <TextField {...args} />
    </div>
  ),
};
