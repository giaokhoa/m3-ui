import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const require = createRequire(import.meta.url);
const preview = args.includes('--host');

function run(script, cwd) {
  const result = spawnSync(process.execPath, [script], { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

let command;
let cwd = root;
if (preview) {
  // Preview runners commonly pass Vite-style flags. Adapt them to the docs'
  // existing Next.js server; Next already fails if the requested port is busy.
  let hostname = '0.0.0.0';
  let port = '4173';
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--host' || arg === '--port') {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      if (arg === '--host') hostname = value;
      else port = value;
    } else if (arg !== '--strictPort') {
      throw new Error(`Unsupported preview argument: ${arg}`);
    }
  }
  cwd = resolve(root, 'apps/docs');
  for (const script of ['build-api-reference', 'build-material-spec', 'build-live-examples', 'build-docs-data']) {
    run(`scripts/${script}.mjs`, cwd);
  }
  const docsRequire = createRequire(resolve(cwd, 'package.json'));
  command = [docsRequire.resolve('next/dist/bin/next'), 'dev', '--hostname', hostname, '--port', port];
} else {
  command = [require.resolve('turbo/bin/turbo'), 'dev', ...args];
}

const child = spawn(process.execPath, command, { cwd, stdio: 'inherit' });
child.on('error', (error) => { throw error; });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', (code, signal) => {
  process.exit(code ?? (signal === 'SIGINT' ? 130 : 143));
});
