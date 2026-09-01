import { useEffect, useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Surface, VerticalDragHandle } from '@m3-ui/ui';
import {
  AnimatedPane,
  DockedEdge,
  DragToResizeState,
  LevitatedPaneScrim,
  ListDetailPaneScaffold,
  ListDetailPaneScaffoldRole,
  MutableThreePaneScaffoldState,
  PaneAdaptStrategy,
  PaneAlignment,
  PaneExpansionAnchor,
  PaneExpansionState,
  calculatePaneScaffoldDirective,
  calculateThreePaneScaffoldValueFromDirective,
  calculateWindowAdaptiveInfo,
  listDetailPaneScaffoldAdaptStrategies,
} from '@m3-ui/ui/layout';

const meta = {
  title: 'Layout/ListDetailPaneScaffold',
  component: ListDetailPaneScaffold,
  parameters: { layout: 'fullscreen' },
  args: {
    directive: calculatePaneScaffoldDirective(
      calculateWindowAdaptiveInfo({ width: 1000, height: 720 }),
    ),
    value: calculateThreePaneScaffoldValueFromDirective(
      calculatePaneScaffoldDirective(
        calculateWindowAdaptiveInfo({ width: 1000, height: 720 }),
      ),
      {
        adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
        destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Detail }],
      },
    ),
    listPane: null,
    detailPane: null,
  },
} satisfies Meta<typeof ListDetailPaneScaffold>;

export default meta;
type Story = StoryObj<typeof meta>;

function Pane({
  title,
  children,
  shape,
}: {
  title: string;
  children: string;
  shape?: CSSProperties['borderRadius'];
}) {
  return (
    <AnimatedPane shape={shape}>
      <Surface style={{ height: '100%', padding: 24, boxSizing: 'border-box' }}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <p>{children}</p>
      </Surface>
    </AnimatedPane>
  );
}

function StatefulDetailPane() {
  const [count, setCount] = useState(0);
  return (
    <AnimatedPane>
      <Surface style={{ height: '100%', padding: 24, boxSizing: 'border-box' }}>
        <h2 style={{ marginTop: 0 }}>Detail state</h2>
        <p data-testid="detail-count">Count: {count}</p>
        <button type="button" onClick={() => setCount((current) => current + 1)}>
          Increment detail
        </button>
      </Surface>
    </AnimatedPane>
  );
}

function Fixture({
  width,
  height = 640,
  resizable = false,
}: {
  width: number;
  height?: number;
  resizable?: boolean;
}) {
  const [paneExpansionState] = useState(
    () =>
      new PaneExpansionState({
        anchors: [
          PaneExpansionAnchor.proportion(0.3),
          PaneExpansionAnchor.proportion(0.5),
          PaneExpansionAnchor.proportion(0.7),
        ],
        initialAnchoredIndex: 1,
      }),
  );
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const value = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Detail }],
  });

  return (
    <div style={{ width, maxWidth: '100%', height, margin: '0 auto' }}>
      <ListDetailPaneScaffold
        directive={directive}
        value={value}
        listPane={<Pane title="List">Inbox conversations</Pane>}
        detailPane={<Pane title="Detail">Selected conversation</Pane>}
        extraPane={<Pane title="Extra">Context and metadata</Pane>}
        paneExpansionState={resizable ? paneExpansionState : undefined}
        paneExpansionDragHandle={
          resizable
            ? (state) => <VerticalDragHandle isDragged={state.isDragging} />
            : undefined
        }
      />
    </div>
  );
}

function StateRetentionFixture() {
  const width = 480;
  const height = 560;
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const detailValue = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Detail }],
  });
  const listValue = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.List }],
  });
  const [value, setValue] = useState(detailValue);

  return (
    <div style={{ width, maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: 8, padding: 8 }}>
        <button type="button" onClick={() => setValue(detailValue)}>
          Show detail
        </button>
        <button type="button" onClick={() => setValue(listValue)}>
          Show list
        </button>
      </div>
      <div style={{ height }}>
        <ListDetailPaneScaffold
          directive={directive}
          value={value}
          listPane={<Pane title="List">Inbox conversations</Pane>}
          detailPane={<StatefulDetailPane />}
        />
      </div>
    </div>
  );
}

function MotionHalfwayFixture({ predictiveBack = false }: { predictiveBack?: boolean }) {
  const width = 480;
  const height = 640;
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const detailValue = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Detail }],
  });
  const listValue = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.List }],
  });
  const [scaffoldState] = useState(() => new MutableThreePaneScaffoldState(detailValue));

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scaffoldState.seekTo(0.5, listValue, predictiveBack);
    });
    return () => cancelAnimationFrame(frame);
  }, [listValue, predictiveBack, scaffoldState]);

  return (
    <div style={{ width, maxWidth: '100%', height, margin: '0 auto' }}>
      <ListDetailPaneScaffold
        directive={directive}
        scaffoldState={scaffoldState}
        listPane={<Pane title="List">Inbox conversations</Pane>}
        detailPane={<Pane title="Detail">Selected conversation</Pane>}
        extraPane={<Pane title="Extra">Context and metadata</Pane>}
      />
    </div>
  );
}

function CustomTransitionsHalfwayFixture() {
  const width = 480;
  const height = 640;
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const detailValue = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Detail }],
  });
  const listValue = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: listDetailPaneScaffoldAdaptStrategies,
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.List }],
  });
  const [scaffoldState] = useState(() => new MutableThreePaneScaffoldState(detailValue));

  useEffect(() => {
    const frame = requestAnimationFrame(() => scaffoldState.seekTo(0.5, listValue));
    return () => cancelAnimationFrame(frame);
  }, [listValue, scaffoldState]);

  return (
    <div style={{ width, maxWidth: '100%', height, margin: '0 auto' }}>
      <ListDetailPaneScaffold
        directive={directive}
        scaffoldState={scaffoldState}
        paneTransitions={{
          primary: {
            exit: {
              durationMs: 420,
              from: { opacity: 1, translateInline: 0 },
              to: { opacity: 0, translateInline: -48 },
              easing: (progress) => progress * progress,
            },
          },
          secondary: {
            enter: {
              durationMs: 420,
              from: { opacity: 0, translateInline: 48 },
              to: { opacity: 1, translateInline: 0 },
              easing: (progress) => 1 - (1 - progress) * (1 - progress),
            },
          },
        }}
        listPane={<Pane title="List">Custom enter transition</Pane>}
        detailPane={<Pane title="Detail">Custom exit transition</Pane>}
      />
    </div>
  );
}

function LevitatedDialogFixture() {
  const width = 720;
  const height = 640;
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const extraPaneStrategy = PaneAdaptStrategy.Levitate({
    alignment: PaneAlignment.Center,
    scrim: <LevitatedPaneScrim aria-label="Scrim" />,
  }).onlyIfSinglePane(directive);
  const value = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: {
      ...listDetailPaneScaffoldAdaptStrategies,
      tertiary: extraPaneStrategy,
    },
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Extra }],
  });

  return (
    <div style={{ width, maxWidth: '100%', height, margin: '0 auto' }}>
      <ListDetailPaneScaffold
        directive={directive}
        value={value}
        listPane={<Pane title="List">Inbox conversations</Pane>}
        detailPane={<Pane title="Detail">Selected conversation</Pane>}
        extraPane={
          <Pane title="Extra dialog" shape={16}>
            Context and metadata
          </Pane>
        }
      />
    </div>
  );
}

function LevitatedBottomSheetFixture() {
  const width = 720;
  const height = 640;
  const [dragToResizeState] = useState(
    () => new DragToResizeState({ dockedEdge: DockedEdge.Bottom }),
  );
  const directive = calculatePaneScaffoldDirective(
    calculateWindowAdaptiveInfo({ width, height }),
  );
  const extraPaneStrategy = PaneAdaptStrategy.Levitate({
    alignment: PaneAlignment.BottomCenter,
    scrim: <LevitatedPaneScrim aria-label="Scrim" />,
    dragToResizeState,
  }).onlyIfSinglePane(directive);
  const value = calculateThreePaneScaffoldValueFromDirective(directive, {
    adaptStrategies: {
      ...listDetailPaneScaffoldAdaptStrategies,
      tertiary: extraPaneStrategy,
    },
    destinationHistory: [{ pane: ListDetailPaneScaffoldRole.Extra }],
  });

  return (
    <div style={{ width, maxWidth: '100%', height, margin: '0 auto' }}>
      <ListDetailPaneScaffold
        directive={directive}
        value={value}
        preferredWidths={{ tertiary: width }}
        preferredHeights={{ tertiary: height / 2 }}
        listPane={<Pane title="List">Inbox conversations</Pane>}
        detailPane={<Pane title="Detail">Selected conversation</Pane>}
        extraPane={<Pane title="Extra sheet">Drag or click the handle to resize</Pane>}
        levitatedPaneDragHandles={{
          tertiary: (
            <span
              aria-hidden="true"
              style={{
                display: 'block',
                width: 32,
                height: 4,
                margin: 8,
                borderRadius: 999,
                background: 'currentColor',
                opacity: 0.6,
              }}
            />
          ),
        }}
      />
    </div>
  );
}

export const Compact: Story = {
  render: () => <Fixture width={480} />,
};

export const Expanded: Story = {
  render: () => <Fixture width={1000} />,
};

export const Resizable: Story = {
  render: () => <Fixture width={1000} resizable />,
};

export const StateRetention: Story = {
  render: () => <StateRetentionFixture />,
};

export const MotionHalfway: Story = {
  render: () => <MotionHalfwayFixture />,
};

export const MotionHalfwayPredictiveBack: Story = {
  render: () => <MotionHalfwayFixture predictiveBack />,
};

export const CustomTransitionsHalfway: Story = {
  render: () => <CustomTransitionsHalfwayFixture />,
};

export const LevitatedDialog: Story = {
  render: () => <LevitatedDialogFixture />,
};

export const LevitatedBottomSheet: Story = {
  render: () => <LevitatedBottomSheetFixture />,
};

export const ExtraLarge: Story = {
  render: () => <Fixture width={1680} />,
};

export const Rtl: Story = {
  render: () => (
    <div dir="rtl">
      <Fixture width={1000} />
    </div>
  ),
};
