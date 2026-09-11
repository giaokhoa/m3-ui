import { useState, useSyncExternalStore } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Surface } from '@m3-ui/ui';
import {
  AnimatedPane,
  BackNavigationBehavior,
  ListDetailPaneScaffoldRole,
  NavigableListDetailPaneScaffold,
  NavigableSupportingPaneScaffold,
  SupportingPaneScaffoldRole,
  calculatePaneScaffoldDirective,
  calculateWindowAdaptiveInfo,
  createListDetailPaneScaffoldNavigator,
  createSupportingPaneScaffoldNavigator,
  type ThreePaneScaffoldNavigator,
} from '@m3-ui/ui/layout';

const meta = {
  title: 'Layout/NavigablePaneScaffolds',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const directive = calculatePaneScaffoldDirective(
  calculateWindowAdaptiveInfo({ width: 720, height: 640 }),
);

function Pane({ title, children }: { title: string; children: string }) {
  return (
    <AnimatedPane>
      <Surface style={{ height: '100%', padding: 24, boxSizing: 'border-box' }}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <p>{children}</p>
      </Surface>
    </AnimatedPane>
  );
}

function Toolbar<T>({
  navigator,
  onPrimary,
  primaryLabel,
  onExtra,
}: {
  navigator: ThreePaneScaffoldNavigator<T>;
  onPrimary: () => void;
  primaryLabel: string;
  onExtra: () => void;
}) {
  useSyncExternalStore(navigator.subscribe, navigator.getSnapshot, navigator.getSnapshot);
  return (
    <div style={{ display: 'flex', gap: 8, padding: 12 }}>
      <button type="button" onClick={onPrimary}>
        {primaryLabel}
      </button>
      <button type="button" onClick={onExtra}>
        Open extra
      </button>
      <button
        type="button"
        disabled={!navigator.canNavigateBack(BackNavigationBehavior.PopLatest)}
        onClick={() => navigator.navigateBack(BackNavigationBehavior.PopLatest)}
      >
        Back
      </button>
      <span style={{ alignSelf: 'center' }}>
        History: {navigator.destinationHistory.length}
      </span>
    </div>
  );
}

function ListDetailFixture() {
  const [navigator] = useState(() =>
    createListDetailPaneScaffoldNavigator<string>({ directive }),
  );
  return (
    <div style={{ height: 640 }}>
      <Toolbar
        navigator={navigator}
        primaryLabel="Open detail"
        onPrimary={() => navigator.navigateTo(ListDetailPaneScaffoldRole.Detail, 'message-42')}
        onExtra={() => navigator.navigateTo(ListDetailPaneScaffoldRole.Extra, 'metadata')}
      />
      <div style={{ height: 580 }}>
        <NavigableListDetailPaneScaffold
          directive={directive}
          navigator={navigator}
          listPane={<Pane title="List">Inbox conversations</Pane>}
          detailPane={<Pane title="Detail">Selected conversation</Pane>}
          extraPane={<Pane title="Extra">Context and metadata</Pane>}
        />
      </div>
    </div>
  );
}

function SupportingFixture() {
  const [navigator] = useState(() =>
    createSupportingPaneScaffoldNavigator<string>({ directive }),
  );
  return (
    <div style={{ height: 640 }}>
      <Toolbar
        navigator={navigator}
        primaryLabel="Open supporting"
        onPrimary={() => navigator.navigateTo(SupportingPaneScaffoldRole.Supporting, 'inspector')}
        onExtra={() => navigator.navigateTo(SupportingPaneScaffoldRole.Extra, 'actions')}
      />
      <div style={{ height: 580 }}>
        <NavigableSupportingPaneScaffold
          directive={directive}
          navigator={navigator}
          mainPane={<Pane title="Main">Primary workspace</Pane>}
          supportingPane={<Pane title="Supporting">Inspector and contextual tools</Pane>}
          extraPane={<Pane title="Extra">Secondary actions</Pane>}
        />
      </div>
    </div>
  );
}

export const ListDetail: Story = { render: () => <ListDetailFixture /> };
export const Supporting: Story = { render: () => <SupportingFixture /> };
