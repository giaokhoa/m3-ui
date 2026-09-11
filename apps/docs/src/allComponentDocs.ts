import {
  componentDocs,
  type ComponentDocMetadata,
} from './componentDocs';
import { actionOverflowDocs } from './actionOverflowDocs';
import { appBarToolbarDocs } from './appBarToolbarDocs';
import { smallPrimitiveDocs } from './smallPrimitiveDocs';

export const allComponentDocs = {
  ...componentDocs,
  ...smallPrimitiveDocs,
  ...appBarToolbarDocs,
  ...actionOverflowDocs,
} as const satisfies Record<string, ComponentDocMetadata>;

export type AllComponentDocId = keyof typeof allComponentDocs;
