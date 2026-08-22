import { material3Sources } from './sources.mjs';

const source = material3Sources.compose;
const url = `https://api.github.com/repos/${source.repository}/contents/${source.tokenRoot}?ref=${source.revision}`;
const response = await fetch(url, {
  headers: {
    accept: 'application/vnd.github+json',
    'user-agent': 'm3-ui-token-inventory',
  },
});
if (!response.ok) throw new Error(`Failed to inventory Compose tokens: ${response.status}`);

const entries = await response.json();
const files = entries
  .filter((entry) => entry.type === 'file' && /Tokens\.kt$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

const foundation = new Set([
  'ColorDarkTokens.kt',
  'ColorLightTokens.kt',
  'ColorSchemeKeyTokens.kt',
  'ElevationTokens.kt',
  'ExpressiveMotionTokens.kt',
  'MotionSchemeKeyTokens.kt',
  'MotionTokens.kt',
  'PaletteTokens.kt',
  'ScrimTokens.kt',
  'ShapeKeyTokens.kt',
  'ShapeTokens.kt',
  'StandardMotionTokens.kt',
  'StateTokens.kt',
  'TypeScaleTokens.kt',
  'TypefaceTokens.kt',
  'TypographyKeyTokens.kt',
  'TypographyTokens.kt',
]);

const foundationFiles = files.filter((file) => foundation.has(file));
const componentFiles = files.filter((file) => !foundation.has(file));
const unknownFoundation = [...foundation].filter((file) => !files.includes(file));

const report = {
  source: {
    repository: source.repository,
    revision: source.revision,
    revisionAt: source.revisionAt,
  },
  counts: {
    all: files.length,
    foundation: foundationFiles.length,
    component: componentFiles.length,
  },
  foundation: foundationFiles,
  components: componentFiles,
  missingExpectedFoundationFiles: unknownFoundation,
};

console.log(JSON.stringify(report, null, 2));
if (unknownFoundation.length > 0) process.exitCode = 1;
