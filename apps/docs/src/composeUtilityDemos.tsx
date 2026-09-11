import { useState } from 'react';
import {
  Button,
  PullToRefresh,
  ScrollField,
  Surface,
  SwipeToDismissBox,
  getMaterialTypeCssProperties,
  type SwipeToDismissBoxValue,
} from '@m3-ui/ui';
import './compose-utility-demos.css';

const refreshItems = ['Inbox', 'Activity', 'Tasks', 'Updates', 'Archive'] as const;
const minuteValues = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export function PullToRefreshPreview() {
  const [isRefreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <div className="docs-compose-utility-demo">
      <div className="docs-compose-utility-demo__controls">
        <Button onPress={() => setRefreshing(true)}>Show refreshing</Button>
        <Button isDisabled={!isRefreshing} onPress={() => setRefreshing(false)}>
          Complete refresh
        </Button>
        <output style={getMaterialTypeCssProperties('bodyMedium')}>
          Gesture refreshes: {refreshCount}
        </output>
      </div>
      <PullToRefresh
        className="docs-pull-to-refresh-demo"
        isRefreshing={isRefreshing}
        onRefresh={() => {
          setRefreshCount((count) => count + 1);
          setRefreshing(true);
        }}
      >
        <div className="docs-pull-to-refresh-demo__content">
          {refreshItems.map((item) => (
            <Surface
              key={item}
              className="docs-pull-to-refresh-demo__item"
              color="var(--surface-container)"
              contentColor="var(--on-surface)"
            >
              <span style={getMaterialTypeCssProperties('bodyLarge')}>{item}</span>
            </Surface>
          ))}
        </div>
      </PullToRefresh>
    </div>
  );
}

function DismissBackground() {
  return (
    <Surface
      className="docs-swipe-demo__background"
      color="var(--error-container)"
      contentColor="var(--on-error-container)"
    >
      <span style={getMaterialTypeCssProperties('labelLarge')}>Archive</span>
      <span style={getMaterialTypeCssProperties('labelLarge')}>Delete</span>
    </Surface>
  );
}

export function SwipeToDismissPreview() {
  const [value, setValue] = useState<SwipeToDismissBoxValue>('settled');
  const [lastDismiss, setLastDismiss] = useState<string>('none');

  return (
    <div className="docs-compose-utility-demo">
      <div className="docs-compose-utility-demo__controls">
        <Button onPress={() => setValue('settled')}>Reset</Button>
        <output style={getMaterialTypeCssProperties('bodyMedium')}>
          Last dismiss: {lastDismiss}
        </output>
      </div>
      <SwipeToDismissBox
        aria-label="Dismissible task"
        backgroundContent={<DismissBackground />}
        onDismiss={(direction) => setLastDismiss(direction)}
        onValueChange={setValue}
        value={value}
      >
        <Surface
          className="docs-swipe-demo__foreground"
          color="var(--surface-container)"
          contentColor="var(--on-surface)"
        >
          <span style={getMaterialTypeCssProperties('bodyLarge')}>
            Swipe this task horizontally
          </span>
          <Button>Open</Button>
        </Surface>
      </SwipeToDismissBox>
    </div>
  );
}

export function ScrollFieldPreview() {
  const [selectedIndex, setSelectedIndex] = useState(3);
  const selected = minuteValues[selectedIndex] ?? minuteValues[0];

  return (
    <div className="docs-scroll-field-demo">
      <ScrollField
        aria-label="Minutes"
        getItemText={(index) => `${minuteValues[index] ?? ''} minutes`}
        items={minuteValues}
        onSelectionChange={setSelectedIndex}
        selectedIndex={selectedIndex}
      />
      <output style={getMaterialTypeCssProperties('bodyMedium')}>
        Selected: {selected} minutes
      </output>
    </div>
  );
}
