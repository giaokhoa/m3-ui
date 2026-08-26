import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  MultiChoiceSegmentedButton,
  MultiChoiceSegmentedButtonRow,
  SingleChoiceSegmentedButton,
  SingleChoiceSegmentedButtonRow,
  ThemeProvider,
} from '@m3/ui';

const meta = {
  title: 'Components/SegmentedButton',
  component: SingleChoiceSegmentedButton,
  parameters: { layout: 'fullscreen' },
  args: { children: 'Segment', value: 'segment' },
} satisfies Meta<typeof SingleChoiceSegmentedButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const rowStyle = { width: 360 } as const;

function Rows() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <SingleChoiceSegmentedButtonRow aria-label="Two segments" defaultValue="one" style={rowStyle}>
        <SingleChoiceSegmentedButton value="one">One</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="two">Two</SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
      <SingleChoiceSegmentedButtonRow aria-label="Three segments" defaultValue="one" style={rowStyle}>
        <SingleChoiceSegmentedButton value="one">One</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="two">Two</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="three">Three</SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
      <SingleChoiceSegmentedButtonRow aria-label="Four segments" defaultValue="one" style={rowStyle}>
        <SingleChoiceSegmentedButton value="one">One</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="two">Two</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="three">Three</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="four">Four</SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
    </div>
  );
}

export const Geometry: Story = {
  args: {},
  render: () => <div className="storybook-center"><Rows /></div>,
};

export const SingleChoice: Story = {
  args: {},
  render: () => (
    <div className="storybook-center">
      <SingleChoiceSegmentedButtonRow
        aria-label="Sort order"
        defaultValue="recent"
        style={rowStyle}
      >
        <SingleChoiceSegmentedButton value="recent">Recent</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="popular">Popular</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="saved">Saved</SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
    </div>
  ),
};

export const MultiChoice: Story = {
  args: {},
  render: () => (
    <div className="storybook-center">
      <MultiChoiceSegmentedButtonRow aria-label="Filters" style={rowStyle}>
        <MultiChoiceSegmentedButton defaultSelected>Photos</MultiChoiceSegmentedButton>
        <MultiChoiceSegmentedButton>Videos</MultiChoiceSegmentedButton>
        <MultiChoiceSegmentedButton defaultSelected>Files</MultiChoiceSegmentedButton>
      </MultiChoiceSegmentedButtonRow>
    </div>
  ),
};

export const Disabled: Story = {
  args: {},
  render: () => (
    <div className="storybook-center">
      <MultiChoiceSegmentedButtonRow aria-label="Disabled filters" style={rowStyle}>
        <MultiChoiceSegmentedButton isDisabled defaultSelected>Selected disabled</MultiChoiceSegmentedButton>
        <MultiChoiceSegmentedButton isDisabled>Disabled</MultiChoiceSegmentedButton>
        <MultiChoiceSegmentedButton>Enabled</MultiChoiceSegmentedButton>
      </MultiChoiceSegmentedButtonRow>
    </div>
  ),
};

export const IconMotion: Story = {
  args: {},
  render: () => (
    <div className="storybook-center" style={{ display: 'grid', gap: 24 }}>
      <SingleChoiceSegmentedButtonRow
        aria-label="Default selected icon motion"
        defaultValue="list"
        style={rowStyle}
      >
        <SingleChoiceSegmentedButton value="list">List</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="grid">Grid</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="map">Map</SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
      <SingleChoiceSegmentedButtonRow
        aria-label="Crossfade icon motion"
        defaultValue="day"
        style={rowStyle}
      >
        <SingleChoiceSegmentedButton icon={<span>○</span>} selectedIcon={<span>●</span>} value="day">
          Day
        </SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton icon={<span>□</span>} selectedIcon={<span>■</span>} value="week">
          Week
        </SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
    </div>
  ),
};

export const Rtl: Story = {
  args: {},
  render: () => (
    <div className="storybook-center" dir="rtl">
      <SingleChoiceSegmentedButtonRow
        aria-label="RTL segments"
        defaultValue="start"
        style={rowStyle}
      >
        <SingleChoiceSegmentedButton value="start">Start</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="middle">Middle</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="end">End</SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
    </div>
  ),
};

export const FocusAndRipple: Story = {
  args: {},
  render: () => (
    <div className="storybook-center">
      <SingleChoiceSegmentedButtonRow
        aria-label="Focus and ripple"
        defaultValue="alpha"
        style={rowStyle}
      >
        <SingleChoiceSegmentedButton value="alpha">Alpha</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="beta">Beta</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="gamma">Gamma</SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
    </div>
  ),
};

export const ThemeMatrix: Story = {
  args: {},
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light"><h3>Baseline · Light</h3><Rows /></ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark"><h3>Baseline · Dark</h3><Rows /></ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="light" sourceColor="#006a60"><h3>Dynamic · Light</h3><Rows /></ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark" sourceColor="#b3261e"><h3>Dynamic · Dark</h3><Rows /></ThemeProvider>
    </div>
  ),
};
