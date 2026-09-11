import { Surface, getMaterialTypeCssProperties } from '@m3-ui/ui';
import { allComponentProvenance } from './allComponentProvenance';
import type { AllComponentDocId } from './allComponentDocs';
import type {
  ComponentProvenanceMetadata,
  FidelityDimension,
} from './provenance';
import './parity-catalog.css';

type CatalogEntry = readonly [AllComponentDocId, ComponentProvenanceMetadata];

const entries = (Object.entries(allComponentProvenance) as CatalogEntry[]).sort(
  ([leftId, left], [rightId, right]) =>
    left.family.localeCompare(right.family) || leftId.localeCompare(rightId),
);

function fidelityLabel(dimension: FidelityDimension): string {
  return `${dimension.status}: ${dimension.summary}`;
}

export function ParityCatalog() {
  return (
    <div className="docs-parity-catalog">
      <p
        className="docs-parity-catalog__count"
        style={getMaterialTypeCssProperties('bodyMedium')}
      >
        {entries.length} documented component contracts
      </p>
      <div className="docs-parity-catalog__entries">
        {entries.map(([id, metadata]) => (
          <Surface
            key={id}
            className="docs-parity-catalog__surface"
            color="var(--surface-container-low)"
            contentColor="var(--on-surface)"
          >
            <details className="docs-parity-catalog__entry">
              <summary
                className="docs-parity-catalog__summary"
                style={getMaterialTypeCssProperties('titleMedium')}
              >
                <span>{metadata.family}</span>
                <span
                  className="docs-parity-catalog__contract"
                  style={getMaterialTypeCssProperties('labelMedium')}
                >
                  Structured fidelity
                </span>
              </summary>
              <div className="docs-parity-catalog__body">
                <div className="docs-parity-catalog__links">
                  <a
                    className="docs-link"
                    href={`/docs/components/${id}`}
                    style={getMaterialTypeCssProperties('labelLarge')}
                  >
                    Open guide
                  </a>
                  {metadata.evidence.map((source) =>
                    source.url ? (
                      <a
                        key={`${source.class}:${source.url}`}
                        className="docs-link"
                        href={source.url}
                        style={getMaterialTypeCssProperties('labelLarge')}
                      >
                        {source.class}: {source.label}
                      </a>
                    ) : null,
                  )}
                </div>
                <dl className="docs-parity-catalog__details">
                  <div>
                    <dt style={getMaterialTypeCssProperties('labelLarge')}>
                      Compose mapping
                    </dt>
                    <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                      {metadata.compose.apis.join(' · ')}
                    </dd>
                  </div>
                  <div>
                    <dt style={getMaterialTypeCssProperties('labelLarge')}>
                      Visual fidelity
                    </dt>
                    <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                      {fidelityLabel(metadata.fidelity.visual)}
                    </dd>
                  </div>
                  <div>
                    <dt style={getMaterialTypeCssProperties('labelLarge')}>
                      Behavior fidelity
                    </dt>
                    <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                      {fidelityLabel(metadata.fidelity.behavior)}
                    </dd>
                  </div>
                  <div>
                    <dt style={getMaterialTypeCssProperties('labelLarge')}>
                      Semantics fidelity
                    </dt>
                    <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                      {fidelityLabel(metadata.fidelity.semantics)}
                    </dd>
                  </div>
                  {metadata.adaptations.length > 0 ? (
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Adaptations
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {metadata.adaptations.join(' · ')}
                      </dd>
                    </div>
                  ) : null}
                  {metadata.knownGaps.length > 0 ? (
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Known gaps
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {metadata.knownGaps.join(' · ')}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </details>
          </Surface>
        ))}
      </div>
    </div>
  );
}
