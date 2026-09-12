import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const basePath = process.env.M3_UI_DOCS_BASE_PATH ?? '/m3-ui';
const pagesRoot = resolve(repoRoot, 'pages-dist');
const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

if (!/^\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/.test(basePath)) {
  throw new Error('M3_UI_DOCS_BASE_PATH must be a non-empty root-relative path without a trailing slash.');
}

function run(args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, ...extraEnv },
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

await rm(pagesRoot, { recursive: true, force: true });
run(['--filter', '@m3-ui/tokens', 'build']);
run(['--filter', '@m3-ui/ui', 'build']);
run(['--filter', '@m3-ui/docs', 'build'], {
  M3_UI_GITHUB_PAGES: 'true',
  M3_UI_DOCS_BASE_PATH: basePath,
});
run(['--filter', '@m3-ui/storybook', 'build'], {
  STORYBOOK_BASE_PATH: `${basePath}/storybook/`,
});

await mkdir(pagesRoot, { recursive: true });
await cp(resolve(repoRoot, 'apps/docs/out'), pagesRoot, { recursive: true });
await cp(resolve(repoRoot, 'apps/storybook/dist'), resolve(pagesRoot, 'storybook'), { recursive: true });
await writeFile(resolve(pagesRoot, '.nojekyll'), '', 'utf8');

run(['node', 'scripts/verify-pages-artifact.mjs'], {
  M3_UI_DOCS_BASE_PATH: basePath,
  M3_UI_PAGES_ARTIFACT: 'pages-dist',
});
