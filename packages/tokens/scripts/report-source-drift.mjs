import { readFile } from 'node:fs/promises';

const shapes = JSON.parse(await readFile(new URL('../audit/expressive-shapes.json', import.meta.url), 'utf8'));
console.log(JSON.stringify({
  expressiveShapes: {
    normativeCount: shapes.spec.expectedCount,
    figmaCount: shapes.figma.count,
    composeCount: shapes.compose.count,
    figmaOnly: shapes.drift.figmaOnly,
    composeOnly: shapes.drift.composeOnly,
    classification: shapes.drift.classification,
    preferredReference: shapes.drift.preferredReference,
    materialWeb: shapes.materialWeb.classification,
  },
}, null, 2));
