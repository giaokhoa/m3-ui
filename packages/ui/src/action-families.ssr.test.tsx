import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Button,
  ButtonGroup,
  ExtendedFloatingActionButton,
  FilledIconToggleButton,
  FloatingActionButton,
  FloatingActionButtonMenu,
  FloatingActionButtonMenuItem,
  SplitButton,
  ThemeProvider,
  ToggleButton,
  ToggleFloatingActionButton,
} from './index';

const icon = (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M5 11h14v2H5z" />
  </svg>
);

function expectServerMarkup(element: ReactElement, text: string) {
  // Action controls render shared Material effects that consume the package theme
  // context. SSR conformance therefore exercises the supported public composition
  // boundary rather than bypassing ThemeProvider in the test harness.
  const html = renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
  expect(html).toContain(text);
  expect(html).not.toContain('data-reactroot');
  return html;
}

describe('action-family SSR contracts', () => {
  it('renders Button and IconButton families from props only', () => {
    expectServerMarkup(<Button>Save</Button>, 'Save');
    const toggle = expectServerMarkup(
      <FilledIconToggleButton
        aria-label="Favorite"
        isSelected={false}
        onChange={() => {}}
      >
        {icon}
      </FilledIconToggleButton>,
      'Favorite',
    );
    expect(toggle).toContain('aria-pressed="false"');
  });

  it('renders FAB and Extended FAB without browser measurement', () => {
    expectServerMarkup(
      <FloatingActionButton aria-label="Create">{icon}</FloatingActionButton>,
      'Create',
    );
    const extended = expectServerMarkup(
      <ExtendedFloatingActionButton icon={icon}>
        Compose
      </ExtendedFloatingActionButton>,
      'Compose',
    );
    expect(extended).toContain('data-expanded="true"');
  });

  it('renders controlled ToggleButton and SplitButton state deterministically', () => {
    const toggle = expectServerMarkup(
      <ToggleButton isSelected onChange={() => {}}>
        Pinned
      </ToggleButton>,
      'Pinned',
    );
    expect(toggle).toContain('aria-pressed="true"');

    const split = expectServerMarkup(
      <SplitButton
        leading="Run"
        trailing={icon}
        trailingAriaLabel="Run options"
        trailingExpanded
      />,
      'Run',
    );
    expect(split).toContain('aria-expanded="true"');
  });

  it('renders standard and connected ButtonGroup before measurement effects run', () => {
    const standard = expectServerMarkup(
      <ButtonGroup
        aria-label="Actions"
        items={[
          { id: 'one', label: 'One', onAction: () => {} },
          { id: 'two', label: 'Two', onAction: () => {} },
        ]}
      />,
      'One',
    );
    expect(standard).toContain('Two');

    const connected = expectServerMarkup(
      <ButtonGroup
        aria-label="Choices"
        defaultSelectedKey="one"
        items={[
          { id: 'one', label: 'One' },
          { id: 'two', label: 'Two' },
        ]}
        selectionMode="single"
        variant="connected"
      />,
      'Choices',
    );
    expect(connected).toContain('role="radiogroup"');
  });

  it('renders FAB Menu ids and controlled expansion without document access', () => {
    const html = expectServerMarkup(
      <FloatingActionButtonMenu
        aria-label="Create actions"
        expanded
        trigger={
          <ToggleFloatingActionButton
            aria-label="More actions"
            checked
            icon={icon}
            onCheckedChange={() => {}}
          />
        }
      >
        <FloatingActionButtonMenuItem icon={icon} onPress={() => {}}>
          Edit
        </FloatingActionButtonMenuItem>
      </FloatingActionButtonMenu>,
      'Edit',
    );
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('role="group"');
  });
});
