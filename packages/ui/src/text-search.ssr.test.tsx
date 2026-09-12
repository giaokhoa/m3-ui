import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  AppBarWithSearch,
  ExpandedDockedSearchBar,
  ExpandedDockedSearchBarWithGap,
  ExpandedFullScreenContainedSearchBar,
  ExpandedFullScreenSearchBar,
  OutlinedSecureTextField,
  OutlinedTextField,
  SearchBar,
  SearchBarInput,
  SecureTextField,
  TextField,
  ThemeProvider,
  type SearchBarState,
} from './index';

const collapsedSearchState: SearchBarState = {
  value: 'collapsed',
  isExpanded: false,
  expand() {},
  collapse() {},
  toggle() {},
};

function renderTextSearch(element: ReactElement) {
  return renderToString(
    <ThemeProvider mode="light" portalContainer={null}>
      {element}
    </ThemeProvider>,
  );
}

describe('text and search SSR contracts', () => {
  it('renders filled and outlined TextField native controls from initial props', () => {
    const filled = renderTextSearch(
      <TextField label="Message" defaultValue="Server message" name="message" />,
    );
    expect(filled).toContain('<textarea');
    expect(filled).toContain('name="message"');
    expect(filled).toContain('Server message');

    const outlined = renderTextSearch(
      <OutlinedTextField
        label="Email"
        defaultValue="server@example.com"
        name="email"
        isMultiline={false}
        inputProps={{ type: 'email', autoComplete: 'email' }}
      />,
    );
    expect(outlined).toContain('<fieldset');
    expect(outlined).toContain('role="presentation"');
    expect(outlined).toContain('type="email"');
    expect(outlined).toContain('name="email"');
    expect(outlined).toContain('server@example.com');
  });

  it('renders secure variants without exposing a browser-only reveal dependency', () => {
    const filled = renderTextSearch(
      <SecureTextField label="Password" defaultValue="server-secret" />,
    );
    expect(filled).toContain('type="password"');
    expect(filled).toContain('aria-pressed="false"');
    expect(filled).toContain('Show password');

    const outlined = renderTextSearch(
      <OutlinedSecureTextField
        label="Outlined password"
        defaultValue="outlined-secret"
      />,
    );
    expect(outlined).toContain('text-field--outlined');
    expect(outlined).toContain('type="password"');
  });

  it('renders the collapsed search form while expanded surfaces stay browser-gated', () => {
    const input = (
      <SearchBarInput
        state={collapsedSearchState}
        aria-label="Search"
        defaultValue="Material"
      />
    );
    const html = renderTextSearch(
      <>
        <SearchBar state={collapsedSearchState}>{input}</SearchBar>
        <AppBarWithSearch
          state={collapsedSearchState}
          inputField={input}
          navigationIcon={<span>Back</span>}
          actions={<span>Actions</span>}
          overlappedFraction={1}
          data-testid="app-bar-search"
        />
        <ExpandedDockedSearchBar
          state={collapsedSearchState}
          inputField={input}
        >
          Docked results
        </ExpandedDockedSearchBar>
        <ExpandedDockedSearchBarWithGap
          state={collapsedSearchState}
          inputField={input}
        >
          Gap results
        </ExpandedDockedSearchBarWithGap>
        <ExpandedFullScreenSearchBar
          state={collapsedSearchState}
          inputField={input}
        >
          Fullscreen results
        </ExpandedFullScreenSearchBar>
        <ExpandedFullScreenContainedSearchBar
          state={collapsedSearchState}
          inputField={input}
        >
          Contained results
        </ExpandedFullScreenContainedSearchBar>
      </>,
    );

    expect(html).toContain('role="search"');
    expect(html).toContain('type="search"');
    expect(html).toContain('data-state="collapsed"');
    expect(html).toContain('app-bar-with-search');
    expect(html).toContain('data-scrolled="true"');
    expect(html).not.toContain('search-view--docked');
    expect(html).not.toContain('search-view--docked-gap');
    expect(html).not.toContain('search-view--fullscreen');
    expect(html).not.toContain('search-view--fullscreen-contained');
  });
});
