import { useMemo } from 'react';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { staticClient } from 'fumadocs-core/search/client/orama-static';
import {
  ExpandedFullScreenSearchBar,
  IconButton,
  ListItem,
  SearchBarInput,
  getMaterialTypeCssProperties,
  useSearchBarState,
} from '@m3-ui/ui';
import './docs-search.css';

const searchClient = staticClient({
  from: `${import.meta.env.BASE_URL}search-index.json`,
});

function SearchGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path
        d="m19.6 21-6.3-6.3a7.5 7.5 0 1 1 1.4-1.4L21 19.6 19.6 21ZM8.5 14A5.5 5.5 0 1 0 8.5 3a5.5 5.5 0 0 0 0 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

function plainSearchText(value: string): string {
  return value.replace(/<\/?mark>/g, '');
}

function SearchStatus({ children }: { children: string }) {
  return (
    <p
      className="docs-search__status"
      style={getMaterialTypeCssProperties('bodyMedium')}
    >
      {children}
    </p>
  );
}

export function DocsSearch() {
  const state = useSearchBarState();
  const { search, setSearch, query } = useDocsSearch({ client: searchClient });
  const results = query.data === 'empty' || query.data == null ? [] : query.data;
  const trimmedSearch = search.trim();
  const inputField = useMemo(
    () => (
      <SearchBarInput
        aria-label="Search documentation"
        clearable
        leadingIcon={<SearchGlyph />}
        placeholder="Search documentation"
        state={state}
        value={search}
        onValueChange={setSearch}
      />
    ),
    [search, setSearch, state],
  );

  return (
    <>
      <IconButton aria-label="Search documentation" onPress={state.expand}>
        <SearchGlyph />
      </IconButton>
      <ExpandedFullScreenSearchBar
        className="docs-search"
        inputField={inputField}
        state={state}
        onDismiss={() => setSearch('')}
      >
        <div className="docs-search__results" aria-live="polite">
          {trimmedSearch.length === 0 ? (
            <SearchStatus>Search the documentation by component, foundation, or API.</SearchStatus>
          ) : query.isLoading ? (
            <SearchStatus>Searching…</SearchStatus>
          ) : query.error ? (
            <SearchStatus>Search is unavailable. Try again after reloading the page.</SearchStatus>
          ) : results.length === 0 ? (
            <SearchStatus>No documentation results found.</SearchStatus>
          ) : (
            results.map((result) => {
              const breadcrumbs = result.breadcrumbs
                ?.map(plainSearchText)
                .filter(Boolean)
                .join(' / ');
              const content = plainSearchText(result.content);

              return (
                <a
                  className="docs-search__result-link"
                  href={result.url}
                  key={result.id}
                  onClick={state.collapse}
                >
                  <ListItem
                    overline={breadcrumbs}
                    supportingText={result.type === 'page' ? undefined : result.type}
                  >
                    {content}
                  </ListItem>
                </a>
              );
            })
          )}
        </div>
      </ExpandedFullScreenSearchBar>
    </>
  );
}
