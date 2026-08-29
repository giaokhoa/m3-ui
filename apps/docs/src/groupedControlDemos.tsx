import { useState } from 'react';
import {
  ButtonGroup,
  MultiChoiceSegmentedButton,
  MultiChoiceSegmentedButtonRow,
  SingleChoiceSegmentedButton,
  SingleChoiceSegmentedButtonRow,
  SplitButton,
  Tabs,
  getMaterialTypeCssProperties,
} from '@m3-ui/ui';
import './grouped-control-demos.css';

function ChevronDownGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m7 9.5 5 5 5-5 1.4 1.4-6.4 6.4-6.4-6.4L7 9.5Z" fill="currentColor" />
    </svg>
  );
}

export function TabsPreview() {
  return (
    <div className="docs-tabs-demo">
      <Tabs
        aria-label="Project sections"
        defaultSelectedKey="overview"
        items={[
          { id: 'overview', label: 'Overview' },
          { id: 'activity', label: 'Activity' },
          { id: 'settings', label: 'Settings' },
        ]}
      />
      <Tabs
        aria-label="Reports"
        defaultSelectedKey="daily"
        mode="scrollable"
        variant="secondary"
        items={[
          { id: 'daily', label: 'Daily' },
          { id: 'weekly', label: 'Weekly' },
          { id: 'monthly', label: 'Monthly' },
          { id: 'quarterly', label: 'Quarterly' },
          { id: 'yearly', label: 'Yearly' },
        ]}
      />
    </div>
  );
}

export function SegmentedButtonPreview() {
  return (
    <div className="docs-segmented-demo">
      <SingleChoiceSegmentedButtonRow aria-label="Density" defaultValue="standard">
        <SingleChoiceSegmentedButton value="compact">Compact</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="standard">Standard</SingleChoiceSegmentedButton>
        <SingleChoiceSegmentedButton value="comfortable">Comfortable</SingleChoiceSegmentedButton>
      </SingleChoiceSegmentedButtonRow>
      <MultiChoiceSegmentedButtonRow aria-label="Text formatting">
        <MultiChoiceSegmentedButton defaultSelected>Bold</MultiChoiceSegmentedButton>
        <MultiChoiceSegmentedButton>Italic</MultiChoiceSegmentedButton>
        <MultiChoiceSegmentedButton>Underline</MultiChoiceSegmentedButton>
      </MultiChoiceSegmentedButtonRow>
    </div>
  );
}

export function SplitButtonPreview() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="docs-split-button-demo">
      <SplitButton
        leading="Create"
        leadingAriaLabel="Create item"
        onLeadingPress={() => {}}
        onTrailingPress={() => setExpanded((value) => !value)}
        trailing={<ChevronDownGlyph />}
        trailingAriaLabel={expanded ? 'Hide create options' : 'Show create options'}
        trailingExpanded={expanded}
      />
      <div
        className="docs-split-button-demo__state"
        style={getMaterialTypeCssProperties('bodyMedium')}
      >
        Menu state owned by the app: {expanded ? 'expanded' : 'collapsed'}
      </div>
    </div>
  );
}

const standardActions = [
  { id: 'share', label: 'Share', onAction: () => {} },
  { id: 'export', label: 'Export', onAction: () => {} },
  { id: 'duplicate', label: 'Duplicate', onAction: () => {} },
  { id: 'archive', label: 'Archive', onAction: () => {} },
] as const;

const connectedRanges = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
] as const;

export function ButtonGroupPreview() {
  return (
    <div className="docs-button-group-demo">
      <div className="docs-button-group-demo__standard">
        <ButtonGroup
          aria-label="Document actions"
          items={standardActions}
          overflowLabel="More document actions"
        />
      </div>
      <ButtonGroup
        aria-label="Time range"
        defaultSelectedKey="week"
        items={connectedRanges}
        selectionMode="single"
        variant="connected"
      />
    </div>
  );
}
