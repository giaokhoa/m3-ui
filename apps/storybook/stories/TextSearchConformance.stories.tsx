import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ExpandedFullScreenSearchBar,
  SearchBar,
  SearchBarInput,
  TextField,
  ThemeProvider,
  useSearchBarState,
} from '@m3-ui/ui';

const meta = {
  title: 'Conformance/TextSearch',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FormContract: Story = {
  render: () => (
    <div className="storybook-center">
      <form data-testid="text-field-form" style={{ display: 'grid', gap: 16 }}>
        <TextField
          label="Email"
          name="email"
          defaultValue="person@example.com"
          isMultiline={false}
          isRequired
          inputProps={{ autoComplete: 'email', type: 'email' }}
        />
        <TextField
          label="Read only"
          name="readonly"
          defaultValue="locked"
          isMultiline={false}
          isReadOnly
        />
        <TextField
          label="Disabled"
          name="disabled"
          defaultValue="omitted"
          isMultiline={false}
          isDisabled
        />
        <TextField
          label="Invalid"
          name="invalid"
          defaultValue="bad"
          isMultiline={false}
          isInvalid
          errorMessage="Invalid value"
        />
      </form>
    </div>
  ),
};

function SearchSubmitDemo() {
  const state = useSearchBarState();
  const [query, setQuery] = useState('Material');
  const [submitted, setSubmitted] = useState('');

  return (
    <div className="storybook-center">
      <SearchBar state={state} data-testid="submit-search-bar">
        <SearchBarInput
          state={state}
          aria-label="Submit search"
          value={query}
          onValueChange={setQuery}
          onSearch={setSubmitted}
        />
      </SearchBar>
      <output data-testid="submitted-query">{submitted}</output>
    </div>
  );
}

export const SearchSubmitContract: Story = {
  render: () => <SearchSubmitDemo />,
};

function DynamicSearchPortalDemo() {
  const state = useSearchBarState();
  const [query, setQuery] = useState('Material');
  const input = (
    <SearchBarInput
      state={state}
      aria-label="Themed search"
      placeholder="Search"
      value={query}
      onValueChange={setQuery}
      clearable
    />
  );

  return (
    <ThemeProvider
      className="text-search-dynamic-theme"
      mode="light"
      sourceColor="#006a60"
    >
      <div
        style={{
          minHeight: '100vh',
          boxSizing: 'border-box',
          padding: 32,
          background: 'var(--surface)',
        }}
      >
        <SearchBar state={state} data-testid="themed-search-bar">
          {input}
        </SearchBar>
        <button
          type="button"
          data-testid="open-themed-search"
          onClick={state.expand}
        >
          Open themed search
        </button>
        <ExpandedFullScreenSearchBar
          state={state}
          inputField={
            <SearchBarInput
              state={state}
              aria-label="Themed search"
              placeholder="Search"
              value={query}
              onValueChange={setQuery}
              clearable
            />
          }
          data-testid="themed-search-view"
        >
          <div style={{ padding: 16 }}>Dynamic search result</div>
        </ExpandedFullScreenSearchBar>
      </div>
    </ThemeProvider>
  );
}

export const SearchDynamicPortal: Story = {
  render: () => <DynamicSearchPortalDemo />,
};
