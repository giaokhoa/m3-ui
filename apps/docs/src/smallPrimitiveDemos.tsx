import { useRef, useState } from 'react';
import {
  Button,
  NonInteractiveScrollbar,
  Scrim,
  Surface,
  VerticalDragHandle,
  getMaterialTypeCssProperties,
} from '@m3-ui/ui';
import './small-primitive-demos.css';

export function SurfacePreview() {
  const [presses, setPresses] = useState(0);
  const [selected, setSelected] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div className="docs-small-primitive-grid">
      <Surface
        className="docs-small-primitive-card"
        color="var(--surface-container)"
        shape="var(--shape-corner-large)"
        tonalElevation="level1"
      >
        <strong style={getMaterialTypeCssProperties('titleMedium')}>Passive</strong>
        <span style={getMaterialTypeCssProperties('bodyMedium')}>
          Container only; no inferred interaction semantics.
        </span>
      </Surface>

      <Surface
        aria-label="Clickable surface"
        className="docs-small-primitive-card"
        interaction={{ kind: 'clickable', onPress: () => setPresses((value) => value + 1) }}
        shape="var(--shape-corner-large)"
      >
        <strong style={getMaterialTypeCssProperties('titleMedium')}>Clickable</strong>
        <span style={getMaterialTypeCssProperties('bodyMedium')}>Presses: {presses}</span>
        <Button onPress={() => setPresses(0)}>Nested reset</Button>
      </Surface>

      <Surface
        aria-label="Selectable surface"
        className="docs-small-primitive-card"
        interaction={{
          kind: 'selectable',
          selected,
          onSelect: () => setSelected((value) => !value),
        }}
        shape="var(--shape-corner-large)"
      >
        <strong style={getMaterialTypeCssProperties('titleMedium')}>Selectable</strong>
        <span style={getMaterialTypeCssProperties('bodyMedium')}>
          {selected ? 'Selected' : 'Not selected'}
        </span>
      </Surface>

      <Surface
        aria-label="Toggleable surface"
        className="docs-small-primitive-card"
        interaction={{
          kind: 'toggleable',
          checked,
          onCheckedChange: setChecked,
          role: 'switch',
        }}
        shape="var(--shape-corner-large)"
      >
        <strong style={getMaterialTypeCssProperties('titleMedium')}>Toggleable</strong>
        <span style={getMaterialTypeCssProperties('bodyMedium')}>
          {checked ? 'On' : 'Off'}
        </span>
      </Surface>
    </div>
  );
}

export function ScrimPreview() {
  const [dismissals, setDismissals] = useState(0);

  return (
    <div className="docs-scrim-demo">
      <Surface
        className="docs-scrim-demo__stage"
        color="var(--surface-container-low)"
        contentColor="var(--on-surface)"
        shape="var(--shape-corner-large)"
      >
        <div className="docs-scrim-demo__content">
          <strong style={getMaterialTypeCssProperties('titleMedium')}>Underlying content</strong>
          <span style={getMaterialTypeCssProperties('bodyMedium')}>
            The surrounding composition owns modal state and focus behavior.
          </span>
        </div>
        <Scrim aria-label="Dismiss demo overlay" onDismiss={() => setDismissals((value) => value + 1)} />
      </Surface>
      <output style={getMaterialTypeCssProperties('bodyMedium')}>
        Scrim dismiss actions: {dismissals}
      </output>
    </div>
  );
}

export function VerticalDragHandlePreview() {
  const [isDragged, setDragged] = useState(false);

  return (
    <div className="docs-drag-handle-demo">
      <div className="docs-drag-handle-demo__stage">
        <Surface
          className="docs-drag-handle-demo__pane"
          color="var(--surface-container)"
          contentColor="var(--on-surface)"
        >
          Pane A
        </Surface>
        <VerticalDragHandle
          aria-label="Resize panes"
          aria-orientation="vertical"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={50}
          isDragged={isDragged}
          role="separator"
          tabIndex={0}
        />
        <Surface
          className="docs-drag-handle-demo__pane"
          color="var(--surface-container-low)"
          contentColor="var(--on-surface)"
        >
          Pane B
        </Surface>
      </div>
      <Button onPress={() => setDragged((value) => !value)}>
        {isDragged ? 'Show resting state' : 'Show dragged state'}
      </Button>
    </div>
  );
}

export function NonInteractiveScrollbarPreview() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="docs-scrollbar-demo">
      <div className="docs-scrollbar-demo__host">
        <div className="docs-scrollbar-demo__scroller" ref={scrollRef}>
          <div className="docs-scrollbar-demo__content">
            {Array.from({ length: 12 }, (_, index) => (
              <Surface
                key={index}
                className="docs-scrollbar-demo__row"
                color="var(--surface-container)"
                contentColor="var(--on-surface)"
                shape="var(--shape-corner-medium)"
              >
                <span style={getMaterialTypeCssProperties('bodyMedium')}>
                  Scroll row {index + 1}
                </span>
              </Surface>
            ))}
          </div>
        </div>
        <NonInteractiveScrollbar
          isFadeEnabled={false}
          scrollRef={scrollRef}
          trackStyle={{
            background: 'color-mix(in srgb, var(--outline) 16%, transparent)',
          }}
        />
      </div>
      <span style={getMaterialTypeCssProperties('bodyMedium')}>
        Scroll the native container; the overlay itself never accepts pointer input.
      </span>
    </div>
  );
}
