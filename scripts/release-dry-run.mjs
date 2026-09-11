import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const node = process.execPath;
const git = process.platform === 'win32' ? 'git.exe' : 'git';

function outputPathFromArgs(args) {
  const index = args.indexOf('--output');
  if (index >= 0) return args[index + 1] ? resolve(args[index + 1]) : null;
  const inline = args.find((arg) => arg.startsWith('--output='));
  return inline ? resolve(inline.slice('--output='.length)) : undefined;
}

function run(command, args, env) {
  console.log(`> ${command} ${args.join(' ')}`);
  execFileSync(command, args, { cwd: repoRoot, stdio: 'inherit', env });
}

function succeeds(command, args, env) {
  try {
    execFileSync(command, args, { cwd: repoRoot, stdio: 'ignore', env });
    return true;
  } catch {
    return false;
  }
}

function ensureChangesetsBaseRef(env) {
  if (succeeds(git, ['show-ref', '--verify', '--quiet', 'refs/heads/main'], env)) return;
  assert.equal(
    succeeds(git, ['show-ref', '--verify', '--quiet', 'refs/remotes/origin/main'], env),
    true,
    'Changesets dry run requires refs/heads/main or refs/remotes/origin/main in the checkout',
  );
  run(git, ['update-ref', 'refs/heads/main', 'refs/remotes/origin/main'], env);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

const outputPath = outputPathFromArgs(process.argv.slice(2));
assert.notEqual(outputPath, null, '--output requires a file path');
const tempRoot = await mkdtemp(join(tmpdir(), 'm3-ui-release-dry-run-'));

try {
  const npmUserConfig = join(tempRoot, 'empty-user.npmrc');
  const npmGlobalConfig = join(tempRoot, 'empty-global.npmrc');
  const artifactReportPath = join(tempRoot, 'packed-artifacts.json');
  const changesetStatusPath = join(tempRoot, 'changeset-status.json');
  await writeFile(npmUserConfig, '');
  await writeFile(npmGlobalConfig, '');

  const safeEnv = {
    ...process.env,
    NPM_CONFIG_USERCONFIG: npmUserConfig,
    NPM_CONFIG_GLOBALCONFIG: npmGlobalConfig,
  };
  for (const key of Object.keys(safeEnv)) {
    if (
      /^(?:NODE_AUTH_TOKEN|NPM_TOKEN|NPM_AUTH_TOKEN|GITHUB_TOKEN|GH_TOKEN|GITHUB_PAT)$/i.test(key)
      || /^npm_config_(?:registry|.*(?:auth|token))/i.test(key)
    ) {
      delete safeEnv[key];
    }
  }

  run(node, ['scripts/package-policy-check.mjs'], safeEnv);
  ensureChangesetsBaseRef(safeEnv);
  run(pnpm, ['dlx', '@changesets/cli@3.0.2', 'status', '--output', changesetStatusPath], safeEnv);
  run(node, ['scripts/package-consumer-smoke.mjs'], {
    ...safeEnv,
    M3_UI_PACKAGE_REPORT: artifactReportPath,
  });

  const policy = await readJson(join(repoRoot, 'release/package-policy.json'));
  const changesets = await readJson(changesetStatusPath);
  const artifacts = await readJson(artifactReportPath);
  const releases = changesets.releases ?? [];
  const activeReleases = releases.filter((release) => release.type !== 'none');
  const releaseNames = new Set(activeReleases.map((release) => release.name));
  if (releaseNames.size > 0) {
    assert.deepEqual(releaseNames, new Set(policy.packages), 'lockstep Changesets plan must include both public packages');
    assert.equal(new Set(activeReleases.map((release) => release.newVersion)).size, 1, 'lockstep Changesets plan must produce one version');
  }

  const blockers = [
    policy.license.spdx === null && 'legal-license',
    policy.versioning.firstPublicVersion === null && 'first-public-version',
    policy.consumer.minimumNode === null && 'minimum-consumer-node',
    policy.publication.scopeOwnership !== 'verified' && 'npm-scope-ownership',
    policy.publication.registry === null && 'registry',
    policy.publication.access === null && 'registry-access',
  ].filter(Boolean);

  const report = {
    schemaVersion: 1,
    result: 'validated-publication-blocked',
    publicationEnabled: policy.publication.enabled,
    credentials: 'stripped',
    changesets,
    artifacts,
    blockers,
  };
  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (outputPath) await writeFile(outputPath, json);
  else process.stdout.write(json);

  if (process.env.GITHUB_STEP_SUMMARY) {
    const packageLines = artifacts.packages.map(
      (pkg) => `- \`${pkg.name}@${pkg.version}\` — \`${pkg.tarball}\` — SHA-256 \`${pkg.sha256}\``,
    );
    await appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      `## Release dry run\n\nValidated actual packed artifacts without registry credentials or publication.\n\n${packageLines.join('\n')}\n\nPublication remains blocked by: ${blockers.map((item) => `\`${item}\``).join(', ')}.\n`,
    );
  }

  console.log(`Release dry run passed; publication remains blocked (${blockers.join(', ')}).`);
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
