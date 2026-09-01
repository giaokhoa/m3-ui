import assert from 'node:assert/strict';
import test from 'node:test';
import config from '../style-dictionary.config.mjs';
import { tokenReader } from '../style-dictionary/adapter-helpers.mjs';
import {
  listCssAdapterNames,
  loadCssAdapters,
} from '../style-dictionary/adapter-registry.mjs';

const expectedAdapters = [
  'button',
  'card',
  'checkbox',
  'chip',
  'elevation',
  'ripple',
  'text-field',
];

test('CSS adapter registry is deterministic and convention based', async () => {
  assert.deepEqual(listCssAdapterNames(), expectedAdapters);
  const adapters = await loadCssAdapters();
  assert.deepEqual(
    adapters.map(({ name, destination, format }) => ({ name, destination, format })),
    expectedAdapters.map((name) => ({
      name,
      destination: `${name}.css`,
      format: `m3/${name}-css`,
    })),
  );
});

test('Style Dictionary config registers every discovered adapter', () => {
  const formats = config.hooks.formats;
  const files = config.platforms.css.files;
  for (const name of expectedAdapters) {
    assert.equal(typeof formats[`m3/${name}-css`], 'function');
    assert.ok(
      files.some(
        (file) =>
          file.destination === `${name}.css` && file.format === `m3/${name}-css`,
      ),
      `${name} adapter must be emitted`,
    );
  }
});

test('formatter token reader consumes dictionary.tokenMap directly', () => {
  const dictionary = {
    tokenMap: new Map([
      ['{component.test.value}', { $value: 'ok', value: 'legacy' }],
    ]),
  };
  Object.defineProperty(dictionary, 'allTokens', {
    get() {
      throw new Error('allTokens must not be read');
    },
  });

  const get = tokenReader(
    { dictionary, options: { usesDtcg: true } },
    'adapter test',
  );
  assert.equal(get('component.test.value'), 'ok');
});
