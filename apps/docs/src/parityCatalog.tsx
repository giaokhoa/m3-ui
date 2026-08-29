import {
  Surface,
  getMaterialTypeCssProperties,
} from '@m3-ui/ui';
import {
  allComponentDocs,
  type AllComponentDocId,
} from './allComponentDocs';
import type { ComponentDocMetadata } from './componentDocs';
import './parity-catalog.css';

type CatalogEntry = readonly [AllComponentDocId, ComponentDocMetadata];

const entries = (Object.entries(allComponentDocs) as CatalogEntry[]).sort(
  ([leftId, left], [rightId, right]) =>
    left.family.localeCompare(right.family) || leftId.localeCompare(rightId),
);

function sourceUrl(metadata: ComponentDocMetadata): string | undefined {
  return metadata.referenceUrl ?? metadata.materialUrl;
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
        {entries.map(([id, metadata]) => {
          const source = sourceUrl(metadata);
          return (
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
                    {metadata.contractLabel ?? 'Material contract'}
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
                    {source ? (
                      <a
                        className="docs-link"
                        href={source}
                        style={getMaterialTypeCssProperties('labelLarge')}
                      >
                        Contract source
                      </a>
                    ) : null}
                  </div>
                  <dl className="docs-parity-catalog__details">
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Compose mapping
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {metadata.composeMapping.join(' · ')}
                      </dd>
                    </div>
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Implementation
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {metadata.implementation}
                      </dd>
                    </div>
                    <div>
                      <dt style={getMaterialTypeCssProperties('labelLarge')}>
                        Web adaptation
                      </dt>
                      <dd style={getMaterialTypeCssProperties('bodyMedium')}>
                        {metadata.webAdaptation}
                      </dd>
                    </div>
                  </dl>
                </div>
              </details>
            </Surface>
          );
        })}
      </div>
    </div>
  );
}
