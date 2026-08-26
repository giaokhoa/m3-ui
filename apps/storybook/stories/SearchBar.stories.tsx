import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ExpandedDockedSearchBar,
  ExpandedFullScreenSearchBar,
  SearchBar,
  SearchBarInput,
  useSearchBarState,
} from '@m3/ui';

const meta = {
  title: 'Components/SearchBar',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function SearchIcon() {
  return <svg viewBox="0 0 24 24"><path d="m21 20-5.6-5.6a7 7 0 1 0-1 1L20 21l1-1ZM4 10a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" /></svg>;
}
function TuneIcon() {
  return <svg viewBox="0 0 24 24"><path d="M4 7h10v2H4V7Zm0 8h16v2H4v-2Zm12-9h4v4h-4V6ZM4 14h4v4H4v-4Z" /></svg>;
}

function Results() {
  return (
    <div data-testid="search-results" style={{ padding: 16 }}>
      <div tabIndex={0}>Recent: Material 3</div>
      <div tabIndex={0}>Result: Components</div>
      <div tabIndex={0}>Result: Tokens</div>
    </div>
  );
}

function Input({ state, query, setQuery }: { state: ReturnType<typeof useSearchBarState>; query: string; setQuery: (value: string) => void }) {
  return (
    <SearchBarInput
      state={state}
      aria-label="Search"
      placeholder="Search"
      value={query}
      onValueChange={setQuery}
      leadingIcon={<SearchIcon />}
      trailingIcon={<TuneIcon />}
      clearable
    />
  );
}

function Stage({ children, dir }: { children: ReactNode; dir?: 'ltr' | 'rtl' }) {
  return <div dir={dir} style={{ minHeight: '100vh', padding: 32, boxSizing: 'border-box', background: 'var(--surface)' }}>{children}</div>;
}

function CollapsedDemo({ dir }: { dir?: 'ltr' | 'rtl' }) {
  const state = useSearchBarState();
  const [query, setQuery] = useState('');
  return (
    <Stage dir={dir}>
      <SearchBar state={state} data-testid="search-bar">
        <Input state={state} query={query} setQuery={setQuery} />
      </SearchBar>
      <output data-testid="query-value">{query}</output>
    </Stage>
  );
}

function DockedDemo() {
  const state = useSearchBarState('expanded');
  const [query, setQuery] = useState('Material');
  const input = <Input state={state} query={query} setQuery={setQuery} />;
  return (
    <Stage>
      <div data-testid="outside" style={{ width: 760, minHeight: 500 }}>
        <SearchBar state={state} data-testid="search-bar">{input}</SearchBar>
        <div style={{ height: 8 }} />
        <ExpandedDockedSearchBar state={state} inputField={<Input state={state} query={query} setQuery={setQuery} />} data-testid="search-view-docked">
          <Results />
        </ExpandedDockedSearchBar>
      </div>
      <output data-testid="state-value">{state.value}</output>
    </Stage>
  );
}

function FullScreenDemo() {
  const state = useSearchBarState();
  const [query, setQuery] = useState('Material');
  return (
    <Stage>
      <button data-testid="background-button" onClick={state.expand}>Open search</button>
      <ExpandedFullScreenSearchBar state={state} inputField={<Input state={state} query={query} setQuery={setQuery} />} data-testid="search-view-fullscreen">
        <Results />
      </ExpandedFullScreenSearchBar>
      <output data-testid="state-value">{state.value}</output>
    </Stage>
  );
}

export const Default: Story = { render: () => <CollapsedDemo /> };
export const Rtl: Story = { render: () => <CollapsedDemo dir="rtl" /> };
export const DockedExpanded: Story = { render: () => <DockedDemo /> };
export const FullScreenExpanded: Story = { render: () => <FullScreenDemo /> };
