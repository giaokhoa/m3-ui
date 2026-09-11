import { useState, type ReactNode } from 'react';
import {
  BottomAppBar,
  Button,
  FloatingActionButton,
  FlexibleBottomAppBar,
  HorizontalFloatingToolbar,
  IconButton,
  TopAppBar,
  VerticalFloatingToolbar,
  createFloatingToolbarState,
  getMaterialTypeCssProperties,
} from '@m3-ui/ui';
import './app-bar-toolbar-demos.css';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

const menuIcon = (
  <Icon><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" /></Icon>
);
const searchIcon = (
  <Icon><path d="m20.3 19-4.6-4.6a7 7 0 1 0-1.4 1.4l4.6 4.6 1.4-1.4ZM5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z" /></Icon>
);
const editIcon = (
  <Icon><path d="m4 17.25 9.8-9.8 2.75 2.75-9.8 9.8H4v-2.75Zm14.7-9.2-2.75-2.75 1.1-1.1a1.4 1.4 0 0 1 2 0l.75.75a1.4 1.4 0 0 1 0 2l-1.1 1.1Z" /></Icon>
);
const addIcon = (
  <Icon><path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" /></Icon>
);
const moreIcon = (
  <Icon><path d="M5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></Icon>
);

const navigation = <IconButton aria-label="Open navigation">{menuIcon}</IconButton>;
const topActions = (
  <>
    <IconButton aria-label="Search">{searchIcon}</IconButton>
    <IconButton aria-label="More options">{moreIcon}</IconButton>
  </>
);

export function TopAppBarPreview() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="docs-app-bar-demo">
      <div className="docs-app-bar-demo__controls">
        <Button onPress={() => setCollapsed(false)}>Expanded</Button>
        <Button onPress={() => setCollapsed(true)}>Collapsed</Button>
      </div>
      <div className="docs-top-app-bar-demo__stage">
        <TopAppBar
          actions={topActions}
          navigationIcon={navigation}
          scrollFraction={collapsed ? 1 : 0}
          subtitle="Supporting context"
          title="Large flexible title"
          variant="large-flexible"
        />
        <div className="docs-app-bar-demo__body">
          <span style={getMaterialTypeCssProperties('bodyMedium')}>
            The demo drives scrollFraction explicitly; the app bar does not listen to page scroll by itself.
          </span>
        </div>
      </div>
    </div>
  );
}

const bottomActions = (
  <>
    <IconButton aria-label="Search">{searchIcon}</IconButton>
    <IconButton aria-label="Edit">{editIcon}</IconButton>
    <IconButton aria-label="More options">{moreIcon}</IconButton>
  </>
);

function DemoFab() {
  return (
    <FloatingActionButton aria-label="Create" variant="secondaryContainer">
      {addIcon}
    </FloatingActionButton>
  );
}

export function BottomAppBarPreview() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="docs-app-bar-demo">
      <div className="docs-app-bar-demo__controls">
        <Button onPress={() => setCollapsed(false)}>Shown</Button>
        <Button onPress={() => setCollapsed(true)}>Exit state</Button>
      </div>
      <div className="docs-bottom-app-bar-demo__stage">
        <div className="docs-app-bar-demo__body">
          <span style={getMaterialTypeCssProperties('bodyMedium')}>
            Application content remains separate from the bar and its actions.
          </span>
        </div>
        <BottomAppBar
          actions={bottomActions}
          collapsedFraction={collapsed ? 1 : 0}
          floatingActionButton={<DemoFab />}
        />
      </div>
      <FlexibleBottomAppBar horizontalArrangement="center">
        {bottomActions}
      </FlexibleBottomAppBar>
    </div>
  );
}

export function FloatingToolbarPreview() {
  const [expanded, setExpanded] = useState(true);
  const [offset, setOffset] = useState(0);
  const toolbarState = createFloatingToolbarState(-64, offset, 0);

  return (
    <div className="docs-floating-toolbar-demo">
      <div className="docs-app-bar-demo__controls">
        <Button onPress={() => setExpanded((value) => !value)}>
          {expanded ? 'Collapse content' : 'Expand content'}
        </Button>
        <Button onPress={() => setOffset(0)}>Shown</Button>
        <Button onPress={() => setOffset(-64)}>Exit offset</Button>
      </div>
      <div className="docs-floating-toolbar-demo__stage">
        <HorizontalFloatingToolbar
          aria-label="Editor tools"
          expanded={expanded}
          exitDirection="bottom"
          floatingActionButton={<DemoFab />}
          leadingContent={<IconButton aria-label="Search">{searchIcon}</IconButton>}
          state={toolbarState}
          trailingContent={<IconButton aria-label="More options">{moreIcon}</IconButton>}
        >
          <IconButton aria-label="Edit">{editIcon}</IconButton>
        </HorizontalFloatingToolbar>
        <VerticalFloatingToolbar
          aria-label="Vibrant tools"
          expanded={expanded}
          variant="vibrant"
        >
          <IconButton aria-label="Search">{searchIcon}</IconButton>
          <IconButton aria-label="Edit">{editIcon}</IconButton>
        </VerticalFloatingToolbar>
      </div>
    </div>
  );
}
