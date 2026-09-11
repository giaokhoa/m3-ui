import { useState, type ReactNode } from 'react';
import {
  AssistChip,
  Card,
  ElevatedCard,
  ExtendedFloatingActionButton,
  FilledIconButton,
  FilledTonalIconButton,
  FilledTonalIconToggleButton,
  FilterChip,
  FloatingActionButton,
  InputChip,
  OutlinedCard,
  OutlinedIconButton,
  SuggestionChip,
  getMaterialTypeCssProperties,
} from '@m3-ui/ui';
import './action-surface-demos.css';

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      {children}
    </svg>
  );
}

function AddGlyph() {
  return (
    <Glyph>
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" fill="currentColor" />
    </Glyph>
  );
}

function StarGlyph() {
  return (
    <Glyph>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" fill="currentColor" />
    </Glyph>
  );
}

function FavoriteGlyph() {
  return (
    <Glyph>
      <path d="M12 20.5 10.6 19C5.4 14.3 2 11.2 2 7.4 2 4.3 4.4 2 7.5 2c1.7 0 3.4.8 4.5 2.1A6 6 0 0 1 16.5 2C19.6 2 22 4.3 22 7.4c0 3.8-3.4 6.9-8.6 11.6L12 20.5Z" fill="currentColor" />
    </Glyph>
  );
}

function CardContent({ title, body }: { title: string; body: string }) {
  return (
    <div className="docs-card-demo__content">
      <div style={getMaterialTypeCssProperties('titleMedium')}>{title}</div>
      <div
        className="docs-card-demo__body"
        style={getMaterialTypeCssProperties('bodyMedium')}
      >
        {body}
      </div>
    </div>
  );
}

export function CardPreview() {
  return (
    <div className="docs-card-demo">
      <Card>
        <CardContent title="Filled" body="A static Material card surface." />
      </Card>
      <ElevatedCard>
        <CardContent title="Elevated" body="Elevation separates this surface." />
      </ElevatedCard>
      <OutlinedCard
        aria-label="Open outlined card example"
        onPress={() => undefined}
        role="button"
      >
        <CardContent title="Outlined" body="This example is an interactive card." />
      </OutlinedCard>
    </div>
  );
}

export function ChipPreview() {
  return (
    <div className="docs-chip-demo">
      <AssistChip leadingIcon={<StarGlyph />}>Assist</AssistChip>
      <SuggestionChip icon={<StarGlyph />}>Suggestion</SuggestionChip>
      <FilterChip defaultSelected>Filter</FilterChip>
      <InputChip>Input</InputChip>
    </div>
  );
}

export function IconButtonPreview() {
  const [selected, setSelected] = useState(false);

  return (
    <div className="docs-icon-button-demo">
      <FilledIconButton aria-label="Add item">
        <AddGlyph />
      </FilledIconButton>
      <FilledTonalIconButton aria-label="Favorite item">
        <FavoriteGlyph />
      </FilledTonalIconButton>
      <OutlinedIconButton aria-label="Star item">
        <StarGlyph />
      </OutlinedIconButton>
      <FilledTonalIconToggleButton
        aria-label="Toggle favorite"
        isSelected={selected}
        onChange={setSelected}
      >
        <FavoriteGlyph />
      </FilledTonalIconToggleButton>
    </div>
  );
}

export function FabPreview() {
  return (
    <div className="docs-fab-demo">
      <FloatingActionButton aria-label="Create">
        <AddGlyph />
      </FloatingActionButton>
      <ExtendedFloatingActionButton icon={<AddGlyph />}>
        Create
      </ExtendedFloatingActionButton>
    </div>
  );
}
