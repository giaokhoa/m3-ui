import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeTokenExpression,
  parseAndroidXTokenFile,
  renderGeneratedTokenModule,
} from './parser.mjs';

test('normalizes numeric, dp, sp and scalar literals', () => {
  assert.equal(normalizeTokenExpression('0.38f'), 0.38);
  assert.equal(normalizeTokenExpression('-2.5'), -2.5);
  assert.equal(normalizeTokenExpression('18.0.dp'), 18);
  assert.deepEqual(normalizeTokenExpression('-0.2.sp'), {
    kind: 'sp',
    value: -0.2,
  });
  assert.equal(normalizeTokenExpression('true'), true);
  assert.equal(normalizeTokenExpression('null'), null);
  assert.equal(normalizeTokenExpression('"Roboto"'), 'Roboto');
});

test('normalizes semantic Material token references', () => {
  assert.deepEqual(normalizeTokenExpression('ColorSchemeKeyTokens.Primary'), {
    kind: 'color',
    value: 'primary',
  });
  assert.deepEqual(normalizeTokenExpression('ElevationTokens.Level3'), {
    kind: 'elevation',
    value: 'level3',
  });
  assert.deepEqual(
    normalizeTokenExpression('ShapeKeyTokens.CornerExtraLargeTop'),
    { kind: 'shape', value: 'extraLargeTop' },
  );
  assert.deepEqual(normalizeTokenExpression('TypographyKeyTokens.LabelLarge'), {
    kind: 'typography',
    value: 'labelLarge',
  });
  assert.deepEqual(normalizeTokenExpression('ButtonSmallTokens.IconSize'), {
    kind: 'ref',
    set: 'buttonSmall',
    token: 'iconSize',
  });
});

test('normalizes typography platform terminals without losing semantics', () => {
  assert.deepEqual(normalizeTokenExpression('FontFamily.SansSerif'), {
    kind: 'fontFamily',
    value: 'sansSerif',
  });
  assert.deepEqual(normalizeTokenExpression('FontWeight.Normal'), {
    kind: 'fontWeight',
    value: 'regular',
  });
  assert.deepEqual(normalizeTokenExpression('FontWeight.Bold'), {
    kind: 'fontWeight',
    value: 'bold',
  });
  assert.deepEqual(
    normalizeTokenExpression('fontFamily ?: TypeScaleTokens.BodyLargeFont'),
    {
      kind: 'fallback',
      primary: { kind: 'symbol', value: 'fontFamily' },
      fallback: { kind: 'ref', set: 'typeScale', token: 'bodyLargeFont' },
    },
  );
});

test('normalizes constructor and named-argument expressions as data', () => {
  assert.deepEqual(
    normalizeTokenExpression(
      'RoundedCornerShape(topStart = 4.0.dp, topEnd = 4.0.dp, bottomEnd = 0.0.dp, bottomStart = 0.0.dp)',
    ),
    {
      kind: 'call',
      callee: 'RoundedCornerShape',
      named: { topStart: 4, topEnd: 4, bottomEnd: 0, bottomStart: 0 },
    },
  );
  assert.deepEqual(
    normalizeTokenExpression('CubicBezierEasing(0.2f, 0.0f, 0.0f, 1.0f)'),
    { kind: 'call', callee: 'CubicBezierEasing', args: [0.2, 0, 0, 1] },
  );
  assert.deepEqual(normalizeTokenExpression('MotionSchemeToken(2)'), {
    kind: 'call',
    callee: 'MotionSchemeToken',
    args: [2],
  });
});

test('parses const and inline getter declarations in source order', () => {
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
  assert.equal(parsed.declarationKind, 'object');
  assert.equal(parsed.objectName, 'DemoTokens');
  assert.deepEqual(parsed.tokens, {
    disabledOpacity: 0.38,
    containerColor: { kind: 'color', value: 'primary' },
    containerHeight: 40,
  });
});

test('parses plain val and multiline shape initializers', () => {
  const parsed = parseAndroidXTokenFile(`
// VERSION: 14_1_0
internal object ShapeTokens {
    val CornerExtraSmallTop =
        RoundedCornerShape(
            topStart = 4.0.dp,
            topEnd = 4.0.dp,
            bottomEnd = 0.0.dp,
            bottomStart = 0.0.dp,
        )
    val CornerFull = CircleShape
}
`, 'ShapeTokens.kt');

  assert.deepEqual(parsed.tokens.cornerExtraSmallTop, {
    kind: 'call',
    callee: 'RoundedCornerShape',
    named: { topStart: 4, topEnd: 4, bottomEnd: 0, bottomStart: 0 },
  });
  assert.deepEqual(parsed.tokens.cornerFull, {
    kind: 'symbol',
    value: 'CircleShape',
  });
});

test('parses generated class properties and inline getters', () => {
  const parsed = parseAndroidXTokenFile(`
// VERSION: 31.0.11
internal class TypographyTokens(val fontFamily: FontFamily? = null) {
    val BodyLarge: TextStyle
        inline get() =
            DefaultTextStyle.copy(
                fontFamily = fontFamily ?: TypeScaleTokens.BodyLargeFont,
                fontWeight = TypeScaleTokens.BodyLargeWeight,
                fontSize = TypeScaleTokens.BodyLargeSize,
            )
}
`, 'TypographyTokens.kt');

  assert.equal(parsed.declarationKind, 'class');
  assert.deepEqual(parsed.tokens.bodyLarge, {
    kind: 'call',
    callee: 'DefaultTextStyle.copy',
    named: {
      fontFamily: {
        kind: 'fallback',
        primary: { kind: 'symbol', value: 'fontFamily' },
        fallback: { kind: 'ref', set: 'typeScale', token: 'bodyLargeFont' },
      },
      fontWeight: { kind: 'ref', set: 'typeScale', token: 'bodyLargeWeight' },
      fontSize: { kind: 'ref', set: 'typeScale', token: 'bodyLargeSize' },
    },
  });
});

test('accepts token files without VERSION and records null provenance', () => {
  const parsed = parseAndroidXTokenFile(`
internal object MotionSchemeKeyTokens {
    val FastSpatial = MotionSchemeToken(1)
}
`, 'MotionSchemeKeyTokens.kt');

  assert.equal(parsed.version, null);
  assert.deepEqual(parsed.tokens.fastSpatial, {
    kind: 'call',
    callee: 'MotionSchemeToken',
    args: [1],
  });
});

test('fails loudly on unsupported Kotlin expressions and incomplete declarations', () => {
  assert.throws(
    () => normalizeTokenExpression('1 + 2'),
    /Unsupported AndroidX token expression/,
  );
  assert.throws(
    () =>
      parseAndroidXTokenFile(
        `// VERSION: 1
internal object BrokenTokens {
    val Broken: Int
}
`,
        'BrokenTokens.kt',
      ),
    /has no initializer\/getter/,
  );
});

test('renders deterministic provenance including declaration kind', () => {
  const output = renderGeneratedTokenModule({
    revision: 'abc123',
    sourcePath: 'tokens/MotionSchemeKeyTokens.kt',
    blobSha: 'deadbeef',
    exportName: 'motionSchemeKeyTokensGenerated',
    parsed: {
      version: null,
      declarationKind: 'object',
      objectName: 'MotionSchemeKeyTokens',
      tokens: {
        fastSpatial: { kind: 'call', callee: 'MotionSchemeToken', args: [1] },
      },
    },
  });

  assert.match(output, /version: null/);
  assert.match(output, /declaration: 'object'/);
  assert.match(
    output,
    /fastSpatial: \{ kind: "call", callee: "MotionSchemeToken", args: \[1\] \}/,
  );
});
