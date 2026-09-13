import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lifecycleTasks = ['dev', 'build', 'test', 'typecheck', 'clean'];
const violations = [];

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function existingPackageJsons(parent) {
  const root = join(repoRoot, parent);
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, entry.name, 'package.json'));
}

function addViolation(file, message) {
  violations.push(`${relative(repoRoot, file)}: ${message}`);
}

const rootPackagePath = join(repoRoot, 'package.json');
const rootPackage = await readJson(rootPackagePath);

for (const task of lifecycleTasks) {
  const expected = `turbo run ${task}`;
  const actual = rootPackage.scripts?.[task];
  if (actual !== expected) {
    addViolation(
      rootPackagePath,
      `root script "${task}" must delegate exactly as "${expected}", got ${JSON.stringify(actual)}`,
    );
  }
}

const packageJsons = [
  ...(await existingPackageJsons('apps')),
  ...(await existingPackageJsons('packages')),
];

for (const packageJsonPath of packageJsons) {
  const manifest = await readJson(packageJsonPath);
  for (const [name, command] of Object.entries(manifest.scripts ?? {})) {
    if (/\bturbo\b/.test(command)) {
      addViolation(
        packageJsonPath,
        `package script "${name}" invokes Turbo; package scripts must own implementation while the workspace graph owns orchestration`,
      );
    }
    if (/\bpnpm\b[^\n]*(?:\s-w\b|--workspace-root\b|--filter\b)/.test(command)) {
      addViolation(
        packageJsonPath,
        `package script "${name}" performs workspace/cross-package pnpm orchestration`,
      );
    }
  }
}

const sourceFiles = [
  rootPackagePath,
  ...packageJsons,
  ...(await readdir(join(repoRoot, '.github', 'workflows'))).map((name) =>
    join(repoRoot, '.github', 'workflows', name),
  ),
  ...(await readdir(join(repoRoot, 'scripts')))
    .filter((name) => name.endsWith('.mjs') && name !== 'turbo-policy-check.mjs')
    .map((name) => join(repoRoot, 'scripts', name)),
];

const turboShorthand = /\bturbo\s+(?!run\b)([a-z][\w:-]*)/g;
const recursiveLifecycle =
  /\bpnpm\b[^\n;&|]*(?:\s-r\b|--recursive\b)[^\n;&|]*\b(?:dev|build|test|typecheck|clean)\b/g;
const directFilteredLifecycle =
  /\bpnpm\s+--filter(?:=|\s+)[^\s]+\s+(?:--if-present\s+)?(?:dev|build|test|typecheck|clean)\b/g;
const arrayFilteredLifecycle =
  /\[['"]--filter['"],\s*['"][^'"]+['"],\s*['"](?:dev|build|test|typecheck|clean)['"]\]/g;

for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8');

  for (const match of source.matchAll(turboShorthand)) {
    addViolation(file, `uses Turbo shorthand "turbo ${match[1]}"; committed commands must use "turbo run"`);
  }

  for (const match of source.matchAll(recursiveLifecycle)) {
    addViolation(
      file,
      `bypasses the task graph with recursive lifecycle execution: ${JSON.stringify(match[0])}`,
    );
  }

  for (const match of source.matchAll(directFilteredLifecycle)) {
    if (/\bpnpm\s+exec\s+turbo\s+run\b/.test(match[0])) continue;
    addViolation(
      file,
      `manually orchestrates a filtered lifecycle task instead of using Turbo: ${JSON.stringify(match[0])}`,
    );
  }

  for (const match of source.matchAll(arrayFilteredLifecycle)) {
    addViolation(
      file,
      `contains manual filtered lifecycle orchestration instead of a graph-native Turbo invocation: ${JSON.stringify(match[0])}`,
    );
  }
}

if (violations.length > 0) {
  console.error('Turborepo task-graph policy violations:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(
  `Turborepo task-graph policy OK: ${packageJsons.length + 1} package manifests and ${sourceFiles.length} committed command surfaces checked.`,
);
