import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(scriptDir, '..');
const page = await readFile(resolve(docsRoot, 'content/docs/components/button.mdx'), 'utf8');
const liveExamples = await readFile(resolve(docsRoot, 'src/liveExamples.tsx'), 'utf8');

test('Button guide links both official Material overview and specs pages', () => {
  assert.match(page, /https:\/\/m3\.material\.io\/components\/buttons\/overview/);
  assert.match(page, /https:\/\/m3\.material\.io\/components\/buttons\/specs/);
  assert.match(page, /## Material 3 specification/);
});

test('Button guide renders canonical spec tables instead of handwritten measurements', () => {
  assert.match(
    page,
    /<MaterialSpecTable family="button" groups=\{\['size', 'shape', 'icon', 'color', 'elevation'\]\} \/>/,
  );
});

test('Button guide includes usage plus explicit Material and web do/don\'t guidance', () => {
  assert.match(page, /## Usage and variant hierarchy/);
  assert.match(page, /## Do and don't/);
  assert.match(page, /Material — Do/);
  assert.match(page, /Material — Don't/);
  assert.match(page, /m3-ui \/ web — Do/);
  assert.match(page, /m3-ui \/ web — Don't/);
});

test('Button guide uses copyable live examples for all major developer-facing capabilities', () => {
  for (const id of [
    'button-basic',
    'button-variants',
    'button-icons',
    'button-sizes',
    'button-shapes',
    'button-states',
  ]) {
    assert.match(page, new RegExp(`<LiveExample example="${id}"[^>]*sourceInitiallyOpen`));
    assert.match(liveExamples, new RegExp(`'${id}'`));
  }
});
