import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  CircularProgressIndicator,
  CircularWavyProgressIndicator,
  LinearProgressIndicator,
  LinearWavyProgressIndicator,
  ThemeProvider,
} from '@m3/ui';

const meta = {
  title: 'Components/ProgressIndicator',
  component: LinearProgressIndicator,
  parameters: { layout: 'fullscreen' },
  args: { 'aria-label': 'Loading progress', value: 0.45 },
} satisfies Meta<typeof LinearProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ children }: { children: ReactNode }) {
  return <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 32 }}>{children}</div>;
}

export const Default: Story = {
  render: () => <div className="storybook-center"><LinearProgressIndicator aria-label="Loading progress" value={0.45} /></div>,
};

export const StandardTypes: Story = {
  name: 'Standard types',
  render: () => (
    <div className="storybook-center"><Row>
      <LinearProgressIndicator aria-label="Linear 65 percent" value={0.65} />
      <LinearProgressIndicator aria-label="Linear loading" isIndeterminate />
      <CircularProgressIndicator aria-label="Circular 65 percent" value={0.65} />
      <CircularProgressIndicator aria-label="Circular loading" isIndeterminate />
    </Row></div>
  ),
};

export const ExpressiveWavy: Story = {
  name: 'Expressive wavy',
  render: () => (
    <div className="storybook-center"><Row>
      <LinearWavyProgressIndicator aria-label="Wavy linear 60 percent" value={0.6} />
      <LinearWavyProgressIndicator aria-label="Wavy linear loading" isIndeterminate />
      <CircularWavyProgressIndicator aria-label="Wavy circular 60 percent" value={0.6} />
      <CircularWavyProgressIndicator aria-label="Wavy circular loading" isIndeterminate />
    </Row></div>
  ),
};

export const WavyDeterminateMatrix: Story = {
  name: 'Wavy determinate matrix',
  render: () => (
    <div className="storybook-center"><div style={{ display: 'grid', gap: 24 }}>
      {[0, 0.25, 0.5, 1].map((value) => (
        <Row key={value}>
          <LinearWavyProgressIndicator aria-label={`Linear wavy ${value}`} value={value} />
          <CircularWavyProgressIndicator aria-label={`Circular wavy ${value}`} value={value} />
        </Row>
      ))}
    </div></div>
  ),
};

export const WavyControls: Story = {
  name: 'Wavy controls',
  render: () => (
    <div className="storybook-center"><div style={{ display: 'grid', gap: 28 }}>
      <Row>
        <LinearWavyProgressIndicator amplitude={0} aria-label="Linear amplitude zero" value={0.5} />
        <LinearWavyProgressIndicator amplitude={0.5} aria-label="Linear amplitude half" value={0.5} />
        <LinearWavyProgressIndicator amplitude={1} aria-label="Linear amplitude max" value={0.5} />
      </Row>
      <Row>
        <CircularWavyProgressIndicator amplitude={0} aria-label="Circular amplitude zero" value={0.5} />
        <CircularWavyProgressIndicator amplitude={0.5} aria-label="Circular amplitude half" value={0.5} />
        <CircularWavyProgressIndicator amplitude={1} aria-label="Circular amplitude max" value={0.5} />
      </Row>
      <Row>
        <LinearWavyProgressIndicator aria-label="Linear custom wave" thickness={8} trackThickness={6} value={0.5} wavelength={28} waveSpeed={0} />
        <CircularWavyProgressIndicator aria-label="Circular custom wave" thickness={8} trackThickness={6} value={0.5} wavelength={22} waveSpeed={11} />
      </Row>
    </div></div>
  ),
};

export const WavyGuards: Story = {
  name: 'Wavy guards',
  render: () => (
    <div className="storybook-center"><Row>
      <LinearWavyProgressIndicator aria-label="Wavy below range" value={-10} />
      <LinearWavyProgressIndicator aria-label="Wavy above range" value={10} />
      <CircularWavyProgressIndicator aria-label="Wavy NaN" value={Number.NaN} />
      <CircularWavyProgressIndicator aria-label="Wavy indeterminate semantics" isIndeterminate />
    </Row></div>
  ),
};

export const WavyResize: Story = {
  name: 'Wavy resize',
  render: () => (
    <div className="storybook-center"><div style={{ display: 'grid', gap: 24, width: 480 }}>
      <LinearWavyProgressIndicator aria-label="Wavy resized linear" style={{ width: '100%' }} value={0.5} />
      <CircularWavyProgressIndicator aria-label="Wavy resized circular" style={{ height: 96, width: 96 }} value={0.5} />
    </div></div>
  ),
};

export const WavyAmplitudeLifecycle: Story = {
  name: 'Wavy amplitude lifecycle',
  render: () => (
    <div className="storybook-center"><div style={{ display: 'grid', gap: 24 }}>
      {[0.05, 0.1, 0.5, 0.94, 0.95, 1].map((value) => (
        <div key={value} style={{ alignItems: 'center', display: 'flex', gap: 16 }}>
          <span style={{ width: 48 }}>{Math.round(value * 100)}%</span>
          <LinearWavyProgressIndicator aria-label={`${Math.round(value * 100)} percent`} value={value} />
        </div>
      ))}
    </div></div>
  ),
};

export const FourColor: Story = {
  render: () => <div className="storybook-center"><Row><LinearProgressIndicator aria-label="Four color linear loading" fourColor isIndeterminate /><CircularProgressIndicator aria-label="Four color circular loading" fourColor isIndeterminate /></Row></div>,
};

export const Buffer: Story = {
  render: () => <div className="storybook-center"><LinearProgressIndicator aria-label="Buffered download" bufferValue={0.8} value={0.45} /></div>,
};

function ThemeSet() {
  return <div style={{ display: 'grid', gap: 24 }}><LinearProgressIndicator aria-label="Theme linear" value={0.62} /><LinearWavyProgressIndicator aria-label="Theme wavy linear" value={0.62} /><Row><CircularProgressIndicator aria-label="Theme circular" value={0.62} /><CircularWavyProgressIndicator aria-label="Theme wavy circular" value={0.62} /></Row></div>;
}

export const ThemeMatrix: Story = {
  render: () => (
    <div className="storybook-theme-grid">
      <ThemeProvider className="storybook-theme-card" mode="light"><h3>Baseline · Light</h3><ThemeSet /></ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark"><h3>Baseline · Dark</h3><ThemeSet /></ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="light" sourceColor="#006a60"><h3>Dynamic · #006A60</h3><ThemeSet /></ThemeProvider>
      <ThemeProvider className="storybook-theme-card" mode="dark" sourceColor="#b3261e"><h3>Dynamic dark · #B3261E</h3><ThemeSet /></ThemeProvider>
    </div>
  ),
};
