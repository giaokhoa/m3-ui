import { useId, useState } from 'react';
import { Surface, TextButton, getMaterialTypeCssProperties } from '@m3-ui/ui';
import liveExampleData from './generated/live-examples.generated.json';
import { liveExampleRegistry, type LiveExampleId } from './liveExamples';
import './live-example.css';

type GeneratedLiveExampleData = {
  schemaVersion: number;
  examples: Record<string, { component: string; source: string }>;
};

const generated = liveExampleData as GeneratedLiveExampleData;

export interface LiveExampleProps {
  /** Example id registered in `liveExamples.tsx`. */
  example: LiveExampleId;
  /** Optional accessible label for the rendered preview region. */
  title?: string;
  /** Whether the source reveal control is available. */
  showSource?: boolean;
  /** Whether source starts expanded when source reveal is enabled. */
  sourceInitiallyOpen?: boolean;
}

export function LiveExample({
  example,
  title = 'Example preview',
  showSource = true,
  sourceInitiallyOpen = false,
}: LiveExampleProps) {
  const Example = liveExampleRegistry[example];
  const source = generated.examples[example]?.source;
  if (!Example || !source) {
    throw new Error(
      `Missing generated source for live example "${example}". Run pnpm --filter @m3-ui/docs examples:generate.`,
    );
  }

  const sourceId = useId();
  const [sourceOpen, setSourceOpen] = useState(sourceInitiallyOpen);
  const [copyStatus, setCopyStatus] = useState('');

  const copySource = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(source);
      setCopyStatus('Copied source code');
    } catch {
      setCopyStatus('Could not copy source code');
    }
  };

  return (
    <Surface
      className="docs-live-example"
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <div className="docs-live-example__preview" role="region" aria-label={title}>
        <Example />
      </div>
      {showSource ? (
        <>
          <div className="docs-live-example__actions">
            <TextButton
              aria-controls={sourceId}
              aria-expanded={sourceOpen}
              onPress={() => setSourceOpen((open) => !open)}
            >
              {sourceOpen ? 'Hide code' : 'Show code'}
            </TextButton>
            {sourceOpen ? <TextButton onPress={copySource}>Copy code</TextButton> : null}
            <span
              className="docs-live-example__copy-status"
              role="status"
              aria-live="polite"
              style={getMaterialTypeCssProperties('labelMedium')}
            >
              {copyStatus}
            </span>
          </div>
          <div id={sourceId} hidden={!sourceOpen}>
            <pre
              className="docs-live-example__source"
              style={getMaterialTypeCssProperties('bodyMedium')}
            >
              <code>{source}</code>
            </pre>
          </div>
        </>
      ) : null}
    </Surface>
  );
}
