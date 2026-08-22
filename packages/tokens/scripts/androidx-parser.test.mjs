import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeTokenExpression, parseAndroidXTokenFile } from './androidx/parser.mjs';

test('normalizes supported AndroidX audit expressions', () => {
  assert.equal(normalizeTokenExpression('0.38f'), 0.38);
  assert.equal(normalizeTokenExpression('18.0.dp'), 18);
  assert.deepEqual(normalizeTokenExpression('ColorSchemeKeyTokens.Primary'), { kind: 'color', value: 'primary' });
  assert.deepEqual(normalizeTokenExpression('ElevationTokens.Level3'), { kind: 'elevation', value: 'level3' });
  assert.deepEqual(normalizeTokenExpression('ShapeKeyTokens.CornerFull'), { kind: 'shape', value: 'full' });
  assert.deepEqual(normalizeTokenExpression('TypographyKeyTokens.LabelLarge'), { kind: 'typography', value: 'labelLarge' });
});

test('parses AndroidX token declarations without generating files', () => {
  const parsed = parseAndroidXTokenFile(`
// VERSION: v0_test
internal object DemoTokens {
    const val DisabledOpacity = 0.38f
    inline val ContainerColor: ColorToken
        get() = ColorSchemeKeyTokens.Primary
    inline val ContainerHeight: androidx.compose.ui.unit.Dp
        get() = 40.0.dp
}
`, 'DemoTokens.kt');
  assert.equal(parsed.version, 'v0_test');
  assert.equal(parsed.objectName, 'DemoTokens');
  assert.deepEqual(parsed.tokens, { disabledOpacity: 0.38, containerColor: { kind: 'color', value: 'primary' }, containerHeight: 40 });
});

test('fails loudly instead of guessing unsupported expressions', () => {
  assert.throws(() => normalizeTokenExpression('someFunction()'), /Unsupported AndroidX token expression/);
});
