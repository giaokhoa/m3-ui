import {
  allComponentDocs,
  type AllComponentDocId,
} from './allComponentDocs';
import {
  resolveComponentProvenance,
  type ComponentProvenanceMetadata,
  type ComponentProvenanceOverride,
} from './provenance';

/**
 * Sparse enrichments only. The canonical documented inventory remains
 * allComponentDocs; do not mirror every component ID here.
 */
export const componentProvenanceOverrides: Partial<
  Record<AllComponentDocId, ComponentProvenanceOverride>
> = {
  chip: {
    knownGaps: [
      'InputChip does not currently expose an independent trailing remove action; trailing visuals remain presentational rather than a second interactive target.',
    ],
  },
  menu: {
    fidelity: {
      visual: {
        status: 'aligned',
        summary:
          'Reviewed action, selectable/checkable, segmented/vibrant group, submenu, and exposed-menu surfaces use audited Material geometry, roles, states, elevation, and color treatment.',
      },
    },
  },
  'list-item': {
    fidelity: {
      visual: {
        status: 'aligned',
        summary:
          'Reviewed standard and segmented ListItem geometry, positional shapes, state shapes, spacing, and Material roles are covered by canonical tokens and browser evidence.',
      },
    },
  },
  tooltip: {
    fidelity: {
      visual: {
        status: 'aligned',
        summary:
          'Reviewed plain/rich tooltip surfaces and the canonical 16×8 optional caret are covered across placement, theme, and collision-flip presentation.',
      },
    },
  },
  'search-bar': {
    fidelity: {
      visual: {
        status: 'aligned',
        summary:
          'Reviewed collapsed, docked, split docked, full-screen contained, and app-bar search surfaces use the audited Material hierarchy, geometry, roles, and color states.',
      },
    },
  },
  'time-picker': {
    fidelity: {
      visual: {
        status: 'aligned',
        summary:
          'Reviewed dial, numeric input, and expressive scroll presentations use audited Material geometry, roles, theme paint, and 12/24-hour presentation.',
      },
    },
  },
};

export const allComponentProvenance = Object.fromEntries(
  (Object.entries(allComponentDocs) as Array<
    [AllComponentDocId, (typeof allComponentDocs)[AllComponentDocId]]
  >).map(([id, metadata]) => [
    id,
    resolveComponentProvenance(metadata, componentProvenanceOverrides[id]),
  ]),
) as Record<AllComponentDocId, ComponentProvenanceMetadata>;
