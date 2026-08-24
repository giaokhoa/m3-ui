export const material3Sources = Object.freeze({
  spec: Object.freeze({
    kind: 'normative-text',
    name: 'Material Design 3',
    origin: 'https://m3.material.io',
    retrievedAt: '2026-08-22',
    pages: Object.freeze({
      colorOverview: 'https://m3.material.io/styles/color/overview',
      colorRoles: 'https://m3.material.io/styles/color/the-color-system/color-roles',
      typographyOverview: 'https://m3.material.io/styles/typography/overview',
      typographyTokens: 'https://m3.material.io/styles/typography/type-scale-tokens',
      shapeOverview: 'https://m3.material.io/styles/shape/overview',
      motionOverview: 'https://m3.material.io/styles/motion/overview',
      elevationOverview: 'https://m3.material.io/styles/elevation/overview',
      statesOverview: 'https://m3.material.io/foundations/interaction/states/overview',
    }),
  }),
  figma: Object.freeze({
    kind: 'design-reference',
    name: 'Material 3 Design Kit',
    libraryKey: 'lk-5a31d104cabc6a74d4edf6425e7bc6575e9c0f18cda7efb746193aef4d915b077d115c985e6cf49d36d97d455a17d5127a2cbbfbc618b8a70a38669dccb61462',
    version: '1.25',
    releasedAt: '2026-05-19',
  }),
  compose: Object.freeze({
    kind: 'implementation-reference',
    name: 'AndroidX Compose Material3',
    repository: 'androidx/androidx',
    revision: 'ff9a7111302243197384c499d5e3461c1804cd6e',
    revisionAt: '2026-08-22T05:52:17Z',
    tokenRoot: 'compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens',
  }),
  materialWeb: Object.freeze({
    kind: 'implementation-reference',
    name: 'Material Web',
    repository: 'material-components/material-web',
    revision: 'cac97678831d48d4eb4a606ca50f92673a1dc20c',
    revisionAt: '2026-08-21T19:30:42Z',
    tokenRoot: 'tokens',
    latestGeneratedRoot: 'tokens/versions/latest/sass',
    latestGeneratedVersion: '34.0.21',
    publicAdapterVersion: 'v0.192',
  }),
  materialComponentsAndroid: Object.freeze({
    kind: 'implementation-reference',
    name: 'Material Components Android',
    repository: 'material-components/material-components-android',
    revision: 'ac7e18efeefb331850c561faf9ab8bf81d27ba68',
    revisionAt: '2026-06-22T20:08:47Z',
    tokenFile: 'lib/java/com/google/android/material/typography/res/values/tokens.xml',
    generatedVersion: '34.0.0',
  }),
  flutter: Object.freeze({
    kind: 'implementation-reference',
    name: 'Flutter Material',
    repository: 'flutter/flutter',
    revision: '4ebf37fe7df0a130ba5bee17315b98f905c10b34',
    revisionAt: '2026-08-22T20:55:48Z',
    tokenFile: 'packages/flutter/lib/src/material/typography.dart',
    generatedFrom: 'Material Design token database',
  }),
});

export function sourceFreshness(source) {
  const raw = source.revisionAt ?? source.releasedAt ?? source.retrievedAt;
  return raw == null ? null : Date.parse(raw);
}
