import { Surface, getMaterialTypeCssProperties } from '@m3-ui/ui';
import apiReferenceData from './generated/api-reference.generated.json';
import './api-reference.css';

interface ApiReferenceOrigin {
  kind: string;
  label: string;
  path: string | null;
}

interface ApiReferenceProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
  origin: ApiReferenceOrigin;
}

interface ApiReferenceAnnotation {
  kind: string;
  value: string;
}

interface ApiReferenceEntry {
  name: string;
  kind: string;
  description: string;
  signatures: string[];
  props: ApiReferenceProp[];
  annotations: ApiReferenceAnnotation[];
  source: {
    path: string | null;
    line: number | null;
  };
}

interface ApiReferenceData {
  schemaVersion: number;
  packageName: string;
  entrypoint: string;
  exports: Record<string, ApiReferenceEntry>;
}

const data = apiReferenceData as ApiReferenceData;

export type PublicApiName = keyof typeof apiReferenceData.exports;

export interface ApiReferenceProps {
  /** Public export name from `@m3-ui/ui`. */
  name: PublicApiName;
  /** Expand the inherited React/web props section initially. */
  showInherited?: boolean;
}

function PropertyTable({
  label,
  properties,
}: {
  label: string;
  properties: ApiReferenceProp[];
}) {
  return (
    <div className="docs-api-reference__table-scroll">
      <table className="docs-api-reference__table" aria-label={label}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
            <th>Origin</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.name}>
              <td>
                <code>{property.name}</code>
                {property.required ? (
                  <span className="docs-api-reference__required" aria-label="required">
                    *
                  </span>
                ) : null}
              </td>
              <td>
                <code>{property.type}</code>
              </td>
              <td>
                {property.defaultValue === null ? (
                  <span aria-label="No static default">—</span>
                ) : (
                  <code>{property.defaultValue}</code>
                )}
              </td>
              <td>{property.description || '—'}</td>
              <td>
                <code>{property.origin.label}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApiReference({ name, showInherited = false }: ApiReferenceProps) {
  const entry = data.exports[name];
  if (!entry) {
    throw new Error(
      `Unknown public ${data.packageName} export "${String(name)}". ` +
        'Run the API generator and update the MDX page to use a current public export.',
    );
  }

  const localProps = entry.props.filter((property) => property.origin.kind === 'm3-ui');
  const inheritedProps = entry.props.filter((property) => property.origin.kind !== 'm3-ui');
  const headingId = `api-reference-${entry.name.replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase()}`;

  return (
    <Surface
      className="docs-api-reference"
      color="var(--surface-container-low)"
      contentColor="var(--on-surface)"
    >
      <section className="docs-api-reference__content" aria-labelledby={headingId}>
        <div
          className="docs-api-reference__eyebrow"
          style={getMaterialTypeCssProperties('labelLarge')}
        >
          Generated public API
        </div>
        <h3 id={headingId} style={getMaterialTypeCssProperties('titleLarge')}>
          {entry.name}
        </h3>
        {entry.description ? (
          <p style={getMaterialTypeCssProperties('bodyMedium')}>{entry.description}</p>
        ) : null}

        <div className="docs-api-reference__signatures" aria-label={`${entry.name} signatures`}>
          {entry.signatures.map((signature) => (
            <pre key={signature}>
              <code>{signature}</code>
            </pre>
          ))}
        </div>

        {entry.annotations.length > 0 ? (
          <dl className="docs-api-reference__annotations">
            {entry.annotations.map((annotation) => (
              <div key={`${annotation.kind}:${annotation.value}`}>
                <dt>{annotation.kind}</dt>
                <dd>{annotation.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {localProps.length > 0 ? (
          <div className="docs-api-reference__props">
            <h4 style={getMaterialTypeCssProperties('titleMedium')}>Props</h4>
            <PropertyTable label={`${entry.name} props`} properties={localProps} />
          </div>
        ) : null}

        {inheritedProps.length > 0 ? (
          <details className="docs-api-reference__inherited" open={showInherited}>
            <summary style={getMaterialTypeCssProperties('titleSmall')}>
              Inherited React / web props ({inheritedProps.length})
            </summary>
            <PropertyTable
              label={`${entry.name} inherited React and web props`}
              properties={inheritedProps}
            />
          </details>
        ) : null}

        {entry.source.path ? (
          <p
            className="docs-api-reference__source"
            style={getMaterialTypeCssProperties('bodySmall')}
          >
            Source:{' '}
            <code>
              {entry.source.path}
              {entry.source.line ? `:${entry.source.line}` : ''}
            </code>
          </p>
        ) : null}
      </section>
    </Surface>
  );
}
