import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(path) {
  return JSON.parse(await readFile(join(repoRoot, path), 'utf8'));
}

async function exists(path) {
  try {
    await access(join(repoRoot, path));
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

const policy = await readJson('release/package-policy.json');
const root = await readJson('package.json');
const ui = await readJson('packages/ui/package.json');
const tokens = await readJson('packages/tokens/package.json');
const changesetsConfig = await readJson('.changeset/config.json');
const packages = [ui, tokens];

assert.equal(policy.schemaVersion, 1);
assert.equal(policy.status, 'pre-publication');
assert.deepEqual(policy.packages, ['@m3-ui/ui', '@m3-ui/tokens']);
assert.equal(policy.publication.enabled, false);
assert.equal(policy.publication.private, true);
assert.equal(policy.versioning.mode, 'lockstep');
assert.equal(policy.versioning.firstPublicVersion, null);
assert.equal(policy.changeRecords.mechanism, 'changesets');
assert.equal(policy.changeRecords.implementationStatus, 'configured-for-dry-run');
assert.equal(policy.dryRun.command, 'pnpm release:dry-run');
assert.equal(policy.dryRun.changesetsCli, '@changesets/cli@3.0.2');
assert.equal(policy.dryRun.usesRegistryCredentials, false);
assert.equal(policy.dryRun.publishes, false);
assert.equal(root.scripts?.changeset, 'pnpm dlx @changesets/cli@3.0.2');
assert.equal(root.scripts?.['changeset:status'], 'pnpm dlx @changesets/cli@3.0.2 status');

assert.deepEqual(changesetsConfig.fixed, [['@m3-ui/ui', '@m3-ui/tokens']]);
assert.equal(changesetsConfig.baseBranch, 'main');
assert.equal(changesetsConfig.access, 'restricted');
assert.equal(changesetsConfig.privatePackages?.version, true);
assert.equal(changesetsConfig.privatePackages?.tag, false);
assert.equal(changesetsConfig.commit, false);
assert.deepEqual(changesetsConfig.ignore, ['@m3-ui/docs', '@m3-ui/storybook']);

for (const manifest of packages) {
  assert.equal(manifest.private, true, `${manifest.name} must remain private before explicit publish authorization`);
  assert.equal(manifest.version, policy.versioning.sourceVersionPlaceholder, `${manifest.name} must keep the pre-publication placeholder version`);
  assert.ok(manifest.description?.trim(), `${manifest.name} requires a distribution description`);
  assert.ok(Array.isArray(manifest.keywords) && manifest.keywords.length > 0, `${manifest.name} requires discovery keywords`);
  assert.equal(manifest.homepage, policy.metadata.homepage);
  assert.equal(manifest.bugs?.url, policy.metadata.bugs);
  assert.equal(manifest.repository?.type, 'git');
  assert.equal(manifest.repository?.url, policy.metadata.repository);
  assert.equal('publishConfig' in manifest, false, `${manifest.name} must not define publishConfig before registry/access authorization`);
  assert.equal('engines' in manifest, false, `${manifest.name} must not claim a minimum Node version before that support floor is decided`);
}

assert.equal(ui.repository.directory, 'packages/ui');
assert.equal(tokens.repository.directory, 'packages/tokens');
assert.equal(ui.version, tokens.version, 'UI and tokens must version in lockstep');
assert.equal(ui.dependencies?.['@m3-ui/tokens'], policy.versioning.workspaceDependencySource);
assert.equal(ui.peerDependencies?.react, policy.consumer.reactPeer);
assert.equal(ui.peerDependencies?.['react-dom'], policy.consumer.reactPeer);

if (policy.license.spdx === null) {
  for (const manifest of packages) {
    assert.equal('license' in manifest, false, `${manifest.name} must not invent a license before maintainer selection`);
  }
  assert.equal(await exists('LICENSE'), false, 'release policy must be updated when a root LICENSE is introduced');
}

const allScripts = [root, ui, tokens].flatMap((manifest) => Object.entries(manifest.scripts ?? {}));
for (const [name, command] of allScripts) {
  assert.doesNotMatch(name, /^(pre)?publish(?:Only)?$/i, `publish lifecycle script ${name} is not authorized`);
  assert.doesNotMatch(command, /\b(?:npm|pnpm)\s+publish\b/i, `publish command is not authorized in script ${name}`);
  assert.doesNotMatch(command, /\bchangesets?\s+publish\b/i, `Changesets publish command is not authorized in script ${name}`);
}

const workflowDir = join(repoRoot, '.github/workflows');
for (const filename of await readdir(workflowDir)) {
  if (!/\.ya?ml$/i.test(filename)) continue;
  const workflow = await readFile(join(workflowDir, filename), 'utf8');
  assert.doesNotMatch(workflow, /\b(?:npm|pnpm)\s+publish\b/i, `${filename} must not execute a registry publish command`);
  assert.doesNotMatch(workflow, /\bchangesets?\s+publish\b/i, `${filename} must not execute Changesets publication`);
  assert.doesNotMatch(
    workflow,
    /\b(?:NODE_AUTH_TOKEN|NPM_TOKEN|NPM_AUTH_TOKEN)\b/,
    `${filename} must not request npm registry credentials while publication is disabled`,
  );
  assert.doesNotMatch(workflow, /registry-url\s*:/i, `${filename} must not configure a publish registry while publication is disabled`);
}

const dryRunWorkflow = await readFile(join(repoRoot, policy.dryRun.workflow), 'utf8');
assert.match(dryRunWorkflow, /permissions:\s*\n\s+contents:\s*read\b/);
assert.doesNotMatch(dryRunWorkflow, /\bcontents:\s*write\b/);
assert.match(dryRunWorkflow, /pnpm release:dry-run/);

console.log('Package distribution policy guard passed.');
