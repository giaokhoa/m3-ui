import { Surface, getMaterialTypeCssProperties } from '@m3-ui/ui';
import materialSpecData from './generated/material-spec.generated.json';
import './material-spec-table.css';

export type MaterialSpecGroup =
  | 'size'
  | 'shape'
  | 'typography'
  | 'icon'
  | 'spacing'
  | 'elevation'
  | 'color'
  | 'state'
  | 'motion'
  | 'other';

interface MaterialSpecEntry {
  path: string;
  tokenPath: string;
  type: string;
  group: MaterialSpecGroup;
  value: string;
  alias: string | null;
  resolvedValue: string;
}

interface MaterialSpecFamily {
  name: string;
  tokenPath: string;
  availableGroups: MaterialSpecGroup[];
  entries: MaterialSpecEntry[];
}

interface MaterialSpecData {
  schemaVersion: number;
  source: string;
  families: Record<string, MaterialSpecFamily>;
}

const data = materialSpecData as MaterialSpecData;

export type MaterialSpecFamilyName = keyof typeof materialSpecData.families;

export interface MaterialSpecTableProps {
  /** Canonical foundation or component family from packages/tokens/tokens. */
  family: MaterialSpecFamilyName;
  /** Optional spec groups to show. Omit to render every token in the family. */
  groups?: readonly MaterialSpecGroup[];
}

function requireFamily(family: MaterialSpecFamilyName): MaterialSpecFamily {
  const entry = data.families[family];
  if (!entry) {
    throw new Error(
      `Unknown Material spec family "${String(family)}". ` +
        `Use a canonical foundation or component token family from ${data.source}.`,
    );
  }
  return entry;
}

function selectedEntries(
  family: MaterialSpecFamilyName,
  groups: readonly MaterialSpecGroup[] | undefined,
): MaterialSpecEntry[] {
  const entry = requireFamily(family);
  if (!groups || groups.length === 0) return entry.entries;
  const requested = [...new Set(groups)];
  for (const group of requested) {
    if (!entry.availableGroups.includes(group)) {
      throw new Error(
        `Material spec family "${String(family)}" has no "${group}" group. ` +
          `Available groups: ${entry.availableGroups.join(', ')}.`,
      );
    }
  }
  return entry.entries.filter((token) => requested.includes(token.group));
}

export function MaterialSpecTable({ family, groups }: MaterialSpecTableProps) {
  const familyEntry = requireFamily(family);
  const entries = selectedEntries(family, groups);
  const headingId = `material-spec-${String(family).replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase()}`;

  return (
    <Surface
      className="docs-material-spec"
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <section className="docs-material-spec__content" aria-labelledby={headingId}>
        <div
          className="docs-material-spec__eyebrow"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          Generated canonical tokens
        </div>
        <h3 id={headingId} style={getMaterialTypeCssProperties('titleLarge')}>
          {String(family)} specification
        </h3>
        <p style={getMaterialTypeCssProperties('bodyMedium')}>
          Generated from <code>{data.source}</code> at <code>{familyEntry.tokenPath}</code>.
          Aliases stay visible so semantic roles are not flattened into copied literals.
        </p>

        <div className="docs-material-spec__table-scroll">
          <table className="docs-material-spec__table" aria-label={`${String(family)} Material specification`}>
            <thead>
              <tr>
                <th>Token</th>
                <th>Group</th>
                <th>Type</th>
                <th>Canonical value</th>
                <th>Resolved value</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.tokenPath}>
                  <td>
                    <code>{entry.path}</code>
                  </td>
                  <td>{entry.group}</td>
                  <td>
                    <code>{entry.type}</code>
                  </td>
                  <td>
                    <code>{entry.alias ? `{${entry.alias}}` : entry.value}</code>
                  </td>
                  <td>
                    <code>{entry.resolvedValue}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Surface>
  );
}
