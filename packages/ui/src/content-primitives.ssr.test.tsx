import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  AssistChip,
  Badge,
  BadgedBox,
  Button,
  ExposedDropdownMenu,
  ExposedMenu,
  FilterChip,
  HorizontalDivider,
  ListItem,
  ListItemSelectionGroup,
  SegmentedListItemGroup,
  Menu,
  MenuItem,
  MenuSubmenu,
  ThemeProvider,
  VerticalDivider,
} from './index';

function renderContentPrimitive(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

describe('Lane 4 content primitive SSR contracts', () => {
  it('renders action and selectable chips with their web-native semantic hosts', () => {
    const html = renderContentPrimitive(
      <>
        <AssistChip>Server action</AssistChip>
        <FilterChip defaultSelected>Server filter</FilterChip>
      </>,
    );

    expect(html).toContain('<button');
    expect(html).toContain('Server action');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('Server filter');
  });

  it('keeps Menu, ExposedMenu, and ExposedDropdownMenu closed on the server', () => {
    const html = renderContentPrimitive(
      <>
        <Menu
          aria-label="Server menu"
          trigger={<Button>Open server menu</Button>}
        >
          <MenuItem id="one">Server menu item</MenuItem>
          <MenuSubmenu
            aria-label="Server submenu"
            trigger={<MenuItem id="more">More</MenuItem>}
          >
            <MenuItem id="nested">Nested server item</MenuItem>
          </MenuSubmenu>
        </Menu>
        <ExposedMenu aria-label="Server exposed menu" value="Read only choice">
          <MenuItem id="choice">Read only choice</MenuItem>
        </ExposedMenu>
        <ExposedDropdownMenu
          aria-label="Server dropdown"
          items={[
            { value: 'one', label: 'One' },
            { value: 'two', label: 'Two' },
          ]}
          value="one"
          inputValue="One"
          onInputChange={() => {}}
          onSelectionChange={() => {}}
          isOpen={false}
          onOpenChange={() => {}}
          name="server-choice"
        />
      </>,
    );

    expect(html).toContain('Open server menu');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('Read only choice');
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-autocomplete="list"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('name="server-choice"');
    expect(html).not.toContain('role="menu"');
    expect(html).not.toContain('role="listbox"');
  });

  it('renders passive, action, and single-selection ListItem semantics deterministically', () => {
    const html = renderContentPrimitive(
      <>
        <ListItem>Passive item</ListItem>
        <ListItem onPress={() => {}}>Action item</ListItem>
        <ListItemSelectionGroup
          aria-label="Server selection"
          value="selected"
          variant="segmented"
        >
          <ListItem selectionMode="single" value="selected">
            Selected item
          </ListItem>
          <ListItem selectionMode="single" value="other">
            Other item
          </ListItem>
        </ListItemSelectionGroup>
        <SegmentedListItemGroup>
          <ListItem>Segmented passive item</ListItem>
          <ListItem onPress={() => {}}>Segmented action item</ListItem>
        </SegmentedListItemGroup>
      </>,
    );

    expect(html).toContain('Passive item');
    expect(html).toContain('<button');
    expect(html).toContain('Action item');
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('type="radio"');
    expect(html).toContain('Segmented passive item');
    expect(html).toContain('Segmented action item');
    expect(html).toContain('checked=""');
    expect(html).toContain('value="selected"');
    expect(html).toContain('value="other"');
  });

  it('renders Badge content and both Divider orientations without interaction semantics', () => {
    const html = renderContentPrimitive(
      <>
        <BadgedBox badge={<Badge aria-label="3 unread">3</Badge>}>
          Inbox
        </BadgedBox>
        <HorizontalDivider data-testid="horizontal" />
        <VerticalDivider data-testid="vertical" />
      </>,
    );

    expect(html).toContain('aria-label="3 unread"');
    expect(html).toContain('>3<');
    expect(html).toContain('role="separator"');
    expect(html).toContain('aria-orientation="horizontal"');
    expect(html).toContain('aria-orientation="vertical"');
    expect(html).not.toContain('role="button"');
  });
});