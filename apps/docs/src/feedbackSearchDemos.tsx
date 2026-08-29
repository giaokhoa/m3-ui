import { useState } from 'react';
import {
  Button,
  CircularProgressIndicator,
  CircularWavyProgressIndicator,
  ContainedLoadingIndicator,
  ExpandedDockedSearchBar,
  LinearProgressIndicator,
  LinearWavyProgressIndicator,
  ListItem,
  LoadingIndicator,
  PlainTooltip,
  RichTooltip,
  RichTooltipTrigger,
  SearchBar,
  SearchBarInput,
  Snackbar,
  SnackbarAction,
  SnackbarDismissAction,
  TextButton,
  TooltipTrigger,
  getMaterialTypeCssProperties,
  useSearchBarState,
} from '@m3-ui/ui';
import './feedback-search-demos.css';

function SearchGlyph() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M9.5 4a5.5 5.5 0 1 0 3.46 9.78L17.17 18 18.6 16.59l-4.22-4.21A5.5 5.5 0 0 0 9.5 4Zm0 2a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SearchBarPreview() {
  const state = useSearchBarState();
  const [query, setQuery] = useState('');
  const input = (
    <SearchBarInput
      aria-label="Search components"
      clearable
      leadingIcon={<SearchGlyph />}
      placeholder="Search components"
      state={state}
      value={query}
      onValueChange={setQuery}
    />
  );

  return (
    <div className="docs-search-bar-demo">
      <SearchBar state={state}>{input}</SearchBar>
      <ExpandedDockedSearchBar state={state} inputField={input}>
        <div className="docs-search-bar-demo__results">
          <ListItem supportingText="Actions and variants">Buttons</ListItem>
          <ListItem supportingText="Selection and range input">Sliders</ListItem>
          <ListItem supportingText="Transient feedback">Snackbar</ListItem>
        </div>
      </ExpandedDockedSearchBar>
    </div>
  );
}

export function ProgressIndicatorPreview() {
  return (
    <div className="docs-indicator-demo">
      <div className="docs-indicator-demo__linear">
        <LinearProgressIndicator aria-label="Upload progress" value={0.64} />
        <LinearWavyProgressIndicator aria-label="Expressive upload progress" value={0.64} />
        <LinearProgressIndicator aria-label="Loading progress" isIndeterminate />
      </div>
      <div className="docs-indicator-demo__circular">
        <CircularProgressIndicator aria-label="Circular progress" value={0.64} />
        <CircularWavyProgressIndicator aria-label="Expressive circular progress" value={0.64} />
        <CircularProgressIndicator aria-label="Circular loading progress" isIndeterminate />
      </div>
    </div>
  );
}

export function LoadingIndicatorPreview() {
  return (
    <div className="docs-loading-indicator-demo">
      <div>
        <LoadingIndicator aria-label="Loading" />
        <div style={getMaterialTypeCssProperties('labelMedium')}>Indeterminate</div>
      </div>
      <div>
        <ContainedLoadingIndicator aria-label="Contained loading" />
        <div style={getMaterialTypeCssProperties('labelMedium')}>Contained</div>
      </div>
      <div>
        <LoadingIndicator aria-label="Loading progress" value={0.72} />
        <div style={getMaterialTypeCssProperties('labelMedium')}>Determinate</div>
      </div>
    </div>
  );
}

export function SnackbarPreview() {
  return (
    <div className="docs-snackbar-demo">
      <Snackbar
        action={<SnackbarAction onPress={() => {}}>Undo</SnackbarAction>}
        dismissAction={
          <SnackbarDismissAction aria-label="Dismiss message" onPress={() => {}}>
            <CloseGlyph />
          </SnackbarDismissAction>
        }
      >
        Message archived
      </Snackbar>
      <Snackbar
        action={<SnackbarAction onPress={() => {}}>Retry</SnackbarAction>}
        actionOnNewLine
      >
        Could not sync changes. Check your connection and try again.
      </Snackbar>
    </div>
  );
}

export function TooltipPreview() {
  return (
    <div className="docs-tooltip-demo">
      <TooltipTrigger>
        <Button>Plain tooltip</Button>
        <PlainTooltip>Short supporting context</PlainTooltip>
      </TooltipTrigger>
      <RichTooltipTrigger>
        <Button>Rich tooltip</Button>
        <RichTooltip
          title="Keyboard shortcuts"
          action={(close) => <TextButton onPress={close}>Got it</TextButton>}
        >
          Use Command K to open documentation search from anywhere in the app.
        </RichTooltip>
      </RichTooltipTrigger>
    </div>
  );
}
