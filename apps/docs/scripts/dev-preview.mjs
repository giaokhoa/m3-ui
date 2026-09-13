import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
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

const require = createRequire(resolve(process.cwd(), 'package.json'));
const command = [
  require.resolve('next/dist/bin/next'),
  'dev',
  '--hostname',
  hostname,
  '--port',
  port,
];

const child = spawn(process.execPath, command, { stdio: 'inherit' });
child.on('error', (error) => {
  throw error;
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('exit', (code, signal) => {
  process.exit(code ?? (signal === 'SIGINT' ? 130 : 143));
});
