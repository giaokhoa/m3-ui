import { readdirSync } from 'node:fs';

const adaptersDirectory = new URL('./adapters/', import.meta.url);
const adapterFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mjs$/;

export function listCssAdapterNames() {
  return readdirSync(adaptersDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && adapterFilePattern.test(entry.name))
    .map((entry) => entry.name.slice(0, -'.mjs'.length))
    .sort();
}

export async function loadCssAdapters() {
  return Promise.all(
    listCssAdapterNames().map(async (name) => {
      const module = await import(new URL(`./adapters/${name}.mjs`, import.meta.url));
      const adapter = module.default;
      if (!adapter || adapter.name !== name) {
        throw new Error(`CSS adapter module ${name}.mjs must default-export adapter ${name}`);
      }
      if (adapter.destination !== `${name}.css`) {
        throw new Error(`CSS adapter ${name} must emit ${name}.css`);
      }
      return adapter;
    }),
  );
}
