import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMaterialWebCoverage } from './material-web-coverage-model.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(await readFile(resolve(scriptDir, '../package.json'), 'utf8'));
const coverage = await loadMaterialWebCoverage();
const expected = new Set(coverage.reconciled.flatMap((group) => group.sources));

const completeAuditEntries = Object.entries(packageJson.scripts ?? {}).filter(
  ([name]) =>
    name.startsWith('audit:material-web-') &&
    name.endsWith(':complete') &&
    name !== 'audit:material-web-declaration-module-coverage:complete',
);

const auditedByModule = new Map();
const referencedScripts = new Set();
const scriptPattern = /node\s+(scripts\/audit-material-web-[a-z0-9-]+\.mjs)\s+--require-complete/g;

function modulesReferencedBy(sourceText) {
  const modules = new Set();
  const literals = [...sourceText.matchAll(/(["'`])([\s\S]*?)\1/g)].map((match) => match[2]);
  for (const literal of literals) {
    for (const match of literal.matchAll(/md-comp-[a-z0-9-]+/g)) {
      if (!match[0].endsWith('-')) modules.add(match[0]);
    }
    for (const match of literal.matchAll(/(md-comp-[a-z0-9-]*-)\$\{/g)) {
      for (const expectedModule of expected) {
        if (expectedModule.startsWith(match[1])) modules.add(expectedModule);
      }
    }
  }
  return modules;
}

for (const [commandName, command] of completeAuditEntries) {
  for (const match of command.matchAll(scriptPattern)) {
    referencedScripts.add(match[1]);
    const sourceText = await readFile(resolve(scriptDir, '..', match[1]), 'utf8');
    for (const module of modulesReferencedBy(sourceText)) {
      const owners = auditedByModule.get(module) ?? [];
      owners.push({ command: commandName, script: match[1] });
      auditedByModule.set(module, owners);
    }
  }
}

const audited = new Set(auditedByModule.keys());
const missing = [...expected].filter((module) => !audited.has(module)).sort();
const unexpected = [...audited].filter((module) => !expected.has(module)).sort();
const multiplyAudited = [...auditedByModule.entries()]
  .filter(([, owners]) => owners.length > 1)
  .map(([module, owners]) => ({ module, owners }))
  .sort((a, b) => a.module.localeCompare(b.module));

console.log(
  `Material Web strict declaration module union: audited=${audited.size} expected=${expected.size} ` +
    `missing=${missing.length} unexpected=${unexpected.length} scripts=${referencedScripts.size} ` +
    `multiplyAudited=${multiplyAudited.length}`,
);

if (missing.length || unexpected.length) {
  console.error(JSON.stringify({ missing, unexpected }, null, 2));
}

if (process.argv.includes('--require-complete') && (missing.length || unexpected.length)) {
  process.exitCode = 1;
}
