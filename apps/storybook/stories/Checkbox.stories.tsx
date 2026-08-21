import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '@m3/ui';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children: 'Checkbox label',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="m3-storybook-center">
      <Checkbox {...args} />
    </div>
  ),
};

export const Selected: Story = {
  args: {
    defaultSelected: true,
    children: 'Selected checkbox',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <Checkbox {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    children: 'Disabled checkbox',
  },
  render: (args) => (
    <div className="m3-storybook-center">
      <Checkbox {...args} />
    </div>
  ),
};
