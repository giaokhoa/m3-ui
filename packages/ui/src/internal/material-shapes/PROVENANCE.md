# Material shapes provenance

This internal subtree is a focused TypeScript port of AndroidX Graphics Shapes used by Material 3 expressive components.

Primary algorithm reference:

- `ruanspies/material-shapes-ts@9ed10551be53e737110b9b6a10f6231345e7a9c4` (Apache-2.0), itself ported from AndroidX Graphics Shapes.

Material shape definitions are not taken from that package's catalog. Components project the definitions they need from the pinned AndroidX Material 3 source so shape parameters remain tied to the same source revision as the component implementation.

For the current Loading Indicator checkpoint the pinned Material 3 source is:

- `androidx/androidx@ff9a7111302243197384c499d5e3461c1804cd6e`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt`
- `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt`

AOSP copyright and Apache-2.0 headers are retained in derived algorithm files.
