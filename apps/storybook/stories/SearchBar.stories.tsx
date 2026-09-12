import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AppBarWithSearch,
  ExpandedDockedSearchBar,
  ExpandedDockedSearchBarWithGap,
  ExpandedFullScreenContainedSearchBar,
  ExpandedFullScreenSearchBar,
  SearchBar,
  SearchBarInput,
  useSearchBarState,
} from '@m3-ui/ui';

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

function Input({
  state,
  query,
  setQuery,
  testId,
  label = 'Search',
}: {
  state: ReturnType<typeof useSearchBarState>;
  query: string;
  setQuery: (value: string) => void;
  testId?: string;
  label?: string;
}) {
  return (
    <SearchBarInput
      state={state}
      aria-label={label}
      data-testid={testId}
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

function DockedWithGapDemo() {
  const state = useSearchBarState();
  const [query, setQuery] = useState('Material');
  return (
    <Stage>
      <SearchBar state={state} data-testid="gap-collapsed-bar">
        <Input
          state={state}
          query={query}
          setQuery={setQuery}
          testId="gap-trigger-input"
          label="Gap search"
        />
      </SearchBar>
      <ExpandedDockedSearchBarWithGap
        state={state}
        inputField={
          <Input
            state={state}
            query={query}
            setQuery={setQuery}
            testId="gap-expanded-input"
            label="Gap search"
          />
        }
        data-testid="search-view-docked-gap"
      >
        <Results />
      </ExpandedDockedSearchBarWithGap>
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

function FullScreenContainedDemo() {
  const state = useSearchBarState();
  const [query, setQuery] = useState('Material');
  return (
    <Stage>
      <button data-testid="contained-background-button" onClick={state.expand}>Open contained search</button>
      <ExpandedFullScreenContainedSearchBar
        state={state}
        inputField={
          <Input
            state={state}
            query={query}
            setQuery={setQuery}
            label="Contained search"
            testId="contained-search-input"
          />
        }
        data-testid="search-view-fullscreen-contained"
      >
        <Results />
      </ExpandedFullScreenContainedSearchBar>
      <output data-testid="state-value">{state.value}</output>
    </Stage>
  );
}

function ChromeButton({ label, testId }: { label: string; testId: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      data-testid={testId}
      style={{ width: 40, height: 40, border: 0, background: 'transparent', color: 'inherit' }}
    >
      {label.slice(0, 1)}
    </button>
  );
}

function AppBarSearchDemo({ dir }: { dir?: 'ltr' | 'rtl' }) {
  const state = useSearchBarState();
  const [query, setQuery] = useState('');
  const [overlap, setOverlap] = useState(0);
  return (
    <Stage dir={dir}>
      <button data-testid="toggle-overlap" onClick={() => setOverlap((value) => value ? 0 : 1)}>
        Toggle overlap
      </button>
      <AppBarWithSearch
        state={state}
        inputField={
          <Input
            state={state}
            query={query}
            setQuery={setQuery}
            label="App bar search"
            testId="app-bar-search-input"
          />
        }
        navigationIcon={<ChromeButton label="Back" testId="app-bar-navigation" />}
        actions={<ChromeButton label="Profile" testId="app-bar-action" />}
        overlappedFraction={overlap}
        data-testid="app-bar-with-search"
      />
    </Stage>
  );
}

export const Default: Story = { render: () => <CollapsedDemo /> };
export const Rtl: Story = { render: () => <CollapsedDemo dir="rtl" /> };
export const DockedExpanded: Story = { render: () => <DockedDemo /> };
export const DockedWithGap: Story = { render: () => <DockedWithGapDemo /> };
export const FullScreenExpanded: Story = { render: () => <FullScreenDemo /> };
export const FullScreenContained: Story = { render: () => <FullScreenContainedDemo /> };
export const AppBarSearch: Story = { render: () => <AppBarSearchDemo /> };
export const AppBarSearchRtl: Story = { render: () => <AppBarSearchDemo dir="rtl" /> };
