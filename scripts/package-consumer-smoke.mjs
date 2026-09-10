import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const node = process.execPath;

function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(' ')}`);
  execFileSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
    ...options,
  });
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function assertNoWorkspaceProtocols(manifest) {
  for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      assert.equal(
        typeof range === 'string' && range.startsWith('workspace:'),
        false,
        `${manifest.name} packed ${field}.${name} must not use ${range}`,
      );
    }
  }
}

async function packPackage(packageDir, packDir) {
  const before = new Set(await readdir(packDir));
  run(pnpm, ['pack', '--pack-destination', packDir], { cwd: packageDir });
  const after = await readdir(packDir);
  const created = after.filter((name) => name.endsWith('.tgz') && !before.has(name));
  assert.equal(created.length, 1, `expected one tarball from ${packageDir}, got ${created.join(', ')}`);
  return join(packDir, created[0]);
}

async function unpackManifest(tarball, unpackRoot) {
  const target = join(unpackRoot, tarball.split('/').at(-1).replace(/\.tgz$/, ''));
  await mkdir(target, { recursive: true });
  run('tar', ['-xzf', tarball, '-C', target]);
  const packageRoot = join(target, 'package');
  const manifest = await readJson(join(packageRoot, 'package.json'));
  return { manifest, packageRoot };
}

async function assertFiles(root, paths) {
  for (const path of paths) {
    await access(join(root, path));
  }
}

const tempRoot = await mkdtemp(join(tmpdir(), 'm3-ui-package-consumer-'));
const packDir = join(tempRoot, 'packs');
const unpackDir = join(tempRoot, 'unpacked');
const consumerDir = join(tempRoot, 'consumer');

try {
  await mkdir(packDir, { recursive: true });
  await mkdir(unpackDir, { recursive: true });
  await mkdir(consumerDir, { recursive: true });

  run(pnpm, ['--filter', '@m3-ui/tokens', 'build']);
  run(pnpm, ['--filter', '@m3-ui/ui', 'build']);

  const tokensTarball = await packPackage(join(repoRoot, 'packages/tokens'), packDir);
  const uiTarball = await packPackage(join(repoRoot, 'packages/ui'), packDir);

  const tokensPacked = await unpackManifest(tokensTarball, unpackDir);
  const uiPacked = await unpackManifest(uiTarball, unpackDir);

  assert.equal(tokensPacked.manifest.name, '@m3-ui/tokens');
  assert.equal(uiPacked.manifest.name, '@m3-ui/ui');
  assert.equal(tokensPacked.manifest.private, true, 'tokens must remain private in this readiness child');
  assert.equal(uiPacked.manifest.private, true, 'ui must remain private in this readiness child');
  assertNoWorkspaceProtocols(tokensPacked.manifest);
  assertNoWorkspaceProtocols(uiPacked.manifest);
  assert.equal(
    uiPacked.manifest.dependencies?.['@m3-ui/tokens'],
    tokensPacked.manifest.version,
    'packed UI must depend on the packed tokens version rather than a workspace protocol',
  );

  await assertFiles(tokensPacked.packageRoot, [
    'dist/generated/tokens.js',
    'dist/generated/tokens.d.ts',
    'dist/generated/theme.css',
  ]);
  await assertFiles(uiPacked.packageRoot, [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/layout.js',
    'dist/layout/index.d.ts',
    'dist/styles.css',
    'dist/styles/button.css',
  ]);

  const react = await readJson(join(repoRoot, 'packages/ui/node_modules/react/package.json'));
  const reactDom = await readJson(join(repoRoot, 'packages/ui/node_modules/react-dom/package.json'));
  const reactTypes = await readJson(join(repoRoot, 'packages/ui/node_modules/@types/react/package.json'));
  const reactDomTypes = await readJson(join(repoRoot, 'packages/ui/node_modules/@types/react-dom/package.json'));

  await writeFile(
    join(consumerDir, 'package.json'),
    `${JSON.stringify({
      name: 'm3-ui-external-consumer-smoke',
      private: true,
      type: 'module',
      dependencies: {
        '@m3-ui/tokens': `file:${tokensTarball}`,
        '@m3-ui/ui': `file:${uiTarball}`,
        react: react.version,
        'react-dom': reactDom.version,
      },
      devDependencies: {
        '@types/react': reactTypes.version,
        '@types/react-dom': reactDomTypes.version,
      },
    }, null, 2)}\n`,
  );

  run(npm, ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false'], {
    cwd: consumerDir,
  });

  await writeFile(
    join(consumerDir, 'runtime.mjs'),
    `import { access } from 'node:fs/promises';\nimport { fileURLToPath } from 'node:url';\nimport * as Tokens from '@m3-ui/tokens';\nimport * as UI from '@m3-ui/ui';\nimport * as Layout from '@m3-ui/ui/layout';\n\nif (Object.keys(Tokens).length === 0) throw new Error('tokens root export is empty');\nif (Object.keys(UI).length === 0) throw new Error('ui root export is empty');\nif (Object.keys(Layout).length === 0) throw new Error('ui layout export is empty');\n\nfor (const specifier of ['@m3-ui/tokens/theme.css', '@m3-ui/ui/styles.css', '@m3-ui/ui/styles/button.css']) {\n  const resolved = import.meta.resolve(specifier);\n  await access(fileURLToPath(resolved));\n  console.log(specifier, '->', resolved);\n}\n`,
  );
  run(node, ['runtime.mjs'], { cwd: consumerDir });

  await writeFile(
    join(consumerDir, 'consumer.ts'),
    `import * as Tokens from '@m3-ui/tokens';\nimport * as UI from '@m3-ui/ui';\nimport * as Layout from '@m3-ui/ui/layout';\n\nvoid Tokens;\nvoid UI;\nvoid Layout;\n`,
  );
  await writeFile(
    join(consumerDir, 'tsconfig.json'),
    `${JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        noEmit: true,
        jsx: 'react-jsx',
        skipLibCheck: false,
      },
      include: ['consumer.ts'],
    }, null, 2)}\n`,
  );
  run(pnpm, ['exec', 'tsc', '-p', join(consumerDir, 'tsconfig.json')]);

  console.log('Packed external consumer smoke passed.');
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
