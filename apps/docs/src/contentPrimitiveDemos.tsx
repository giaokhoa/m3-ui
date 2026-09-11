import { useState } from 'react';
import {
  Badge,
  BadgedBox,
  Button,
  ExposedMenu,
  HorizontalDivider,
  IconButton,
  ListItem,
  ListItemSelectionGroup,
  Menu,
  MenuItem,
  MenuSection,
  VerticalDivider,
  getMaterialTypeCssProperties,
} from '@m3-ui/ui';
import './content-primitive-demos.css';

function BellGlyph() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M12 22a2.5 2.5 0 0 0 2.35-1.67h-4.7A2.5 2.5 0 0 0 12 22Zm7-5v-1l-2-2v-3a5 5 0 0 0-4-4.9V5a1 1 0 0 0-2 0v1.1A5 5 0 0 0 7 11v3l-2 2v1h14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ListItemPreview() {
  const [destination, setDestination] = useState('inbox');
  const [pinned, setPinned] = useState(false);

  return (
    <div className="docs-list-item-demo">
      <div>
        <ListItem overline="Workspace" supportingText="Passive three-line content">
          Material library
        </ListItem>
        <ListItem onPress={() => {}} supportingText="React Aria button semantics">
          Open changelog
        </ListItem>
      </div>
      <ListItemSelectionGroup aria-label="Mailbox destination">
        <ListItem
          onPress={() => setDestination('inbox')}
          selected={destination === 'inbox'}
          selectionMode="single"
        >
          Inbox
        </ListItem>
        <ListItem
          onPress={() => setDestination('archive')}
          selected={destination === 'archive'}
          selectionMode="single"
        >
          Archive
        </ListItem>
      </ListItemSelectionGroup>
      <ListItem
        onSelectionChange={setPinned}
        selected={pinned}
        selectionMode="multiple"
        supportingText="Independent checkbox-style selection"
      >
        Pin for offline use
      </ListItem>
    </div>
  );
}

export function MenuPreview() {
  const [density, setDensity] = useState('Standard');

  return (
    <div className="docs-menu-demo">
      <Menu
        aria-label="Document actions"
        onAction={() => {}}
        trigger={<Button>Actions</Button>}
      >
        <MenuSection label="Edit">
          <MenuItem id="rename">Rename</MenuItem>
          <MenuItem id="duplicate" supportingText="Create an independent copy">
            Duplicate
          </MenuItem>
        </MenuSection>
        <MenuSection label="Danger" variant="segmented">
          <MenuItem id="archive">Archive</MenuItem>
        </MenuSection>
      </Menu>

      <ExposedMenu
        aria-label="Density options"
        label="Density"
        value={density}
        onAction={(key) => {
          const values: Record<string, string> = {
            compact: 'Compact',
            standard: 'Standard',
            comfortable: 'Comfortable',
          };
          setDensity(values[String(key)] ?? 'Standard');
        }}
      >
        <MenuItem id="compact">Compact</MenuItem>
        <MenuItem id="standard">Standard</MenuItem>
        <MenuItem id="comfortable">Comfortable</MenuItem>
      </ExposedMenu>
    </div>
  );
}

export function BadgePreview() {
  return (
    <div className="docs-badge-demo">
      <BadgedBox badge={<Badge aria-hidden="true" />}>
        <IconButton aria-label="Notifications">
          <BellGlyph />
        </IconButton>
      </BadgedBox>
      <BadgedBox badge={<Badge aria-hidden="true">3</Badge>}>
        <IconButton aria-label="Notifications, 3 unread">
          <BellGlyph />
        </IconButton>
      </BadgedBox>
      <Badge aria-label="99 or more unread items">99+</Badge>
    </div>
  );
}

export function DividerPreview() {
  return (
    <div className="docs-divider-demo">
      <div className="docs-divider-demo__horizontal">
        <div style={getMaterialTypeCssProperties('bodyMedium')}>Account</div>
        <HorizontalDivider />
        <div style={getMaterialTypeCssProperties('bodyMedium')}>Security</div>
      </div>
      <div className="docs-divider-demo__vertical">
        <span style={getMaterialTypeCssProperties('bodyMedium')}>Day</span>
        <VerticalDivider />
        <span style={getMaterialTypeCssProperties('bodyMedium')}>Week</span>
        <VerticalDivider />
        <span style={getMaterialTypeCssProperties('bodyMedium')}>Month</span>
      </div>
    </div>
  );
}
