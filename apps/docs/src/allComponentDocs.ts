import {
  componentDocs,
  type ComponentDocMetadata,
} from './componentDocs';
import { appBarToolbarDocs } from './appBarToolbarDocs';
import { smallPrimitiveDocs } from './smallPrimitiveDocs';

export const allComponentDocs = {
  ...componentDocs,
  ...smallPrimitiveDocs,
  ...appBarToolbarDocs,
} as const satisfies Record<string, ComponentDocMetadata>;

export type AllComponentDocId = keyof typeof allComponentDocs;
